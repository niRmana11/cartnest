import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { challengeStore } from "../utils/challengeStore.js";
import {
  verifyRegistrationResponse,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";

const router = express.Router();

// HELPER: Generate JWT Token
const generateJWT = (userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
  return token;
};

// HELPER: Set JWT Cookie
const setJWTCookie = (res, token) => {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

// HELPER: Base64URL to Buffer
const base64urlToBuffer = (base64url) => {
  const base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  return Buffer.from(padded, "base64");
};

// HELPER: Buffer to Base64URL
const bufferToBase64url = (buffer) => {
  return Buffer.from(buffer)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
};

// GOOGLE OAUTH
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  }),
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    try {
      const token = generateJWT(req.user._id);
      setJWTCookie(res, token);
      console.log(`✅ User logged in via Google: ${req.user.email}`);
      res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/`);
    } catch (error) {
      console.error("Google callback error:", error);
      res.redirect(
        `${process.env.CLIENT_URL || "http://localhost:5173"}/login?error=auth_failed`,
      );
    }
  },
);

// FACEBOOK OAUTH
router.get(
  "/facebook",
  passport.authenticate("facebook", {
    scope: ["email"],
  }),
);

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=auth_failed`,
  }),
  (req, res) => {
    try {
      const token = generateJWT(req.user._id);
      setJWTCookie(res, token);
      console.log(`✅ User logged in via Facebook: ${req.user.email}`);
      res.redirect(`${process.env.CLIENT_URL}/`);
    } catch (error) {
      console.error("Facebook callback error:", error);
      res.redirect(
        `${process.env.CLIENT_URL}/login?error=token_generation_failed`,
      );
    }
  },
);

// PROTECTED ROUTES
router.get("/me", async (req, res) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.json({
        success: true,
        isAuthenticated: false,
        user: null,
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.userId).select("-passkeys");

    if (!user) {
      return res.json({
        success: true,
        isAuthenticated: false,
        user: null,
      });
    }

    res.json({
      success: true,
      isAuthenticated: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        provider: user.provider,
        role: user.role,
      },
    });
  } catch (error) {
    return res.json({
      success: true,
      isAuthenticated: false,
      user: null,
    });
  }
});

// Logout routes
router.post("/logout", (req, res) => {
  const isProd = process.env.NODE_ENV === "production";
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: isProd ? "none" : "lax",
    secure: isProd,
    path: "/",
  });

  res.json({
    success: true,
    message: "Logged out successfully",
  });
});

// PASSKEY ROUTES
import * as webauthn from "../config/webauthn.js";

router.post("/passkey/register/options", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser?.passkeys?.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Passkey already registered for this email",
      });
    }

    const options = await webauthn.generatePasskeyRegistrationOptions(email);
    challengeStore.store(email, "registration", options.challenge);

    res.json({
      success: true,
      options,
    });
  } catch (error) {
    console.error("Passkey registration options error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.post("/passkey/register/verify", async (req, res) => {
  try {
    const { email, id, rawId, response, type } = req.body;

    if (!email || !id || !rawId || !response || !type) {
      return res.status(400).json({
        success: false,
        message: "Missing required credential fields",
      });
    }

    const challenge = challengeStore.get(email, "registration");
    if (!challenge) {
      return res.status(400).json({
        success: false,
        message: "No registration challenge found. Please start fresh.",
      });
    }

    try {
      // SimpleWebAuthn v8 expects browser response fields as base64url strings.
      const verification = await verifyRegistrationResponse({
        response: {
          id,
          rawId,
          response: {
            clientDataJSON: response.clientDataJSON,
            attestationObject: response.attestationObject,
          },
          type,
        },
        expectedChallenge: challenge,
        expectedOrigin: process.env.ORIGIN || "http://localhost:5173",
        expectedRPID: process.env.RP_ID || "localhost",
        requireUserVerification: false,
      });

      if (!verification.verified) {
        throw new Error("Passkey verification failed");
      }

      const { credentialPublicKey, credentialID, counter } =
        verification.registrationInfo;

      // Store credentialId and publicKey as base64url strings
      const credentialIdBase64url = bufferToBase64url(credentialID);
      const publicKeyBase64url = bufferToBase64url(credentialPublicKey);

      let user = await User.findOne({ email });

      if (!user) {
        user = new User({
          name: email.split("@")[0],
          email,
          provider: "passkey",
          providerId: id,
          role: "user",
          passkeys: [
            {
              credentialId: credentialIdBase64url,
              publicKey: publicKeyBase64url,
              counter: counter,
            },
          ],
        });
      } else {
        user.passkeys.push({
          credentialId: credentialIdBase64url,
          publicKey: publicKeyBase64url,
          counter: counter,
        });
      }

      await user.save();
      challengeStore.remove(email, "registration");

      const token = generateJWT(user._id);
      setJWTCookie(res, token);

      console.log(`✅ Passkey registered for: ${email}`);

      res.json({
        success: true,
        message: "Passkey registered successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (verifyError) {
      console.error("SimpleWebAuthn error:", verifyError.message);
      return res.status(400).json({
        success: false,
        message: `Passkey verification failed: ${verifyError.message}`,
      });
    }
  } catch (error) {
    console.error("Passkey registration error:", error.message);
    res.status(400).json({
      success: false,
      message: `Failed to verify registration: ${error.message}`,
    });
  }
});

router.post("/passkey/login/options", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email });
    if (!user?.passkeys?.length) {
      return res.status(404).json({
        success: false,
        message: "No passkey found for this email",
      });
    }

    // Convert base64url credential IDs back to buffers for allowCredentials
    const allowedCredentialIDs = user.passkeys.map((pk) =>
      base64urlToBuffer(pk.credentialId),
    );

    const options =
      await webauthn.generatePasskeyLoginOptions(allowedCredentialIDs);

    challengeStore.store(email, "login", options.challenge);

    res.json({
      success: true,
      options,
    });
  } catch (error) {
    console.error("Passkey login options error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.post("/passkey/login/verify", async (req, res) => {
  try {
    const { id, rawId, response, type } = req.body;

    if (!id || !rawId || !response || !type) {
      return res.status(400).json({
        success: false,
        message: "Missing required credential fields",
      });
    }

    // Find user by credentialId
    const user = await User.findOne({
      "passkeys.credentialId": id,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Credential not found",
      });
    }

    const passkey = user.passkeys.find((pk) => pk.credentialId === id);

    if (!passkey) {
      return res.status(401).json({
        success: false,
        message: "Credential not found for user",
      });
    }

    const challenge = challengeStore.get(user.email, "login");
    if (!challenge) {
      return res.status(400).json({
        success: false,
        message: "No login challenge found. Please start fresh.",
      });
    }

    try {
      // SimpleWebAuthn v8 expects browser response fields as base64url strings.
      const verification = await verifyAuthenticationResponse({
        response: {
          id,
          rawId,
          response: {
            clientDataJSON: response.clientDataJSON,
            authenticatorData: response.authenticatorData,
            signature: response.signature,
          },
          type,
        },
        expectedChallenge: challenge,
        expectedOrigin: process.env.ORIGIN || "http://localhost:5173",
        expectedRPID: process.env.RP_ID || "localhost",
        authenticator: {
          credentialID: base64urlToBuffer(passkey.credentialId),
          credentialPublicKey: base64urlToBuffer(passkey.publicKey),
          counter: passkey.counter,
        },
        requireUserVerification: false,
      });

      if (!verification.verified) {
        throw new Error("Passkey verification failed");
      }

      passkey.counter = verification.authenticationInfo.newCounter;
      await user.save();

      challengeStore.remove(user.email, "login");

      const token = generateJWT(user._id);
      setJWTCookie(res, token);

      console.log(`✅ User logged in via Passkey: ${user.email}`);

      res.json({
        success: true,
        message: "Login successful",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (verifyError) {
      console.error("SimpleWebAuthn error:", verifyError.message);
      return res.status(401).json({
        success: false,
        message: `Passkey verification failed: ${verifyError.message}`,
      });
    }
  } catch (error) {
    console.error("Passkey login error:", error.message);
    res.status(401).json({
      success: false,
      message: `Failed to verify login: ${error.message}`,
    });
  }
});

export default router;
