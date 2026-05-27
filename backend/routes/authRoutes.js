import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { challengeStore } from "../utils/challengeStore.js";

const router = express.Router();

/**
 * Auth Routes
 *
 * This file handles:
 * - Google OAuth login flow
 * - JWT cookie generation
 * - Protected /me endpoint (get current user)
 * - Logout (clear cookie)
 *
 * Passkey routes will be added in Step 7
 */

// ===== HELPER: Generate JWT Token =====

/**
 * Generate JWT token
 * Payload: { userId, iat, exp }
 * Stored in: HTTP-only cookie (not localStorage)
 */
const generateJWT = (userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
  return token;
};

/**
 * Set JWT in HTTP-only cookie
 *
 * HTTP-only: JavaScript cannot read it (XSS protection)
 * sameSite: 'strict' — prevents CSRF attacks
 * secure: true in production only (requires HTTPS)
 */
const setJWTCookie = (res, token) => {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie("token", token, {
    httpOnly: true, // Not readable by JS (XSS protection)
    sameSite: isProd ? "none" : "strict", // Use None for cross-site frontend/API in prod
    secure: isProd, // HTTPS only in production
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
  });
};

// ===== GOOGLE OAUTH ROUTES =====

/**
 * Route: GET /api/auth/google
 * Initiates Google OAuth flow
 *
 * User clicks "Login with Google" button on frontend
 * Frontend navigates to this URL
 * Passport redirects to Google login page
 */
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  }),
);

/**
 * Route: GET /api/auth/google/callback
 * Google redirects back here after user grants permission
 *
 * Process:
 * 1. Passport verifies the auth code
 * 2. Exchanges code for user profile
 * 3. Calls GoogleStrategy verify callback
 * 4. User is found/created in MongoDB
 * 5. req.user is set
 * 6. We generate JWT and set cookie
 * 7. Redirect to frontend home
 */
router.get(
  "/google/callback",
  passport.authenticate("google", { session: false }),
  (req, res) => {
    try {
      // req.user is set by Passport (from serializeUser)
      const token = generateJWT(req.user._id);
      setJWTCookie(res, token);

      console.log(`User logged in: ${req.user.email}`);

      // Redirect to frontend home page
      // Frontend can then make API calls with the cookie
      res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/home`);
    } catch (error) {
      console.error("Google callback error:", error);
      res.redirect(
        `${process.env.CLIENT_URL || "http://localhost:5173"}/login?error=auth_failed`,
      );
    }
  },
);

// ===== FACEBOOK OAUTH ROUTES =====

/**
 * GET /api/auth/facebook
 *
 * Initiates Facebook OAuth flow
 * Redirects to Facebook login consent screen
 *
 * Scope explains what data we're asking for:
 * - email: User's email address
 * - public_profile: Name, picture
 */
router.get(
  "/facebook",
  passport.authenticate("facebook", {
    scope: ["email"],
  }),
);

/**
 * GET /api/auth/facebook/callback
 *
 * Facebook redirects back here after user logs in
 * Passport validates the response
 * We generate JWT and set cookie
 */
router.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    failureRedirect: `${process.env.CLIENT_URL}/login?error=auth_failed`,
  }),
  (req, res) => {
    try {
      // User authenticated by Passport
      const user = req.user;

      // Generate JWT token
      const token = generateJWT(user._id);

      // Set JWT in HTTP-only cookie
      setJWTCookie(res, token);

      // Redirect to frontend home page (user is now logged in)
      res.redirect(`${process.env.CLIENT_URL}/?authenticated=true`);
    } catch (error) {
      console.error("Facebook callback error:", error);
      res.redirect(
        `${process.env.CLIENT_URL}/login?error=token_generation_failed`,
      );
    }
  },
);

// ===== PROTECTED ROUTES =====

/**
 * Route: GET /api/auth/me
 * Protected endpoint — requires valid JWT cookie
 *
 * Returns current logged-in user
 * Frontend calls this on app load to check if user is logged in
 *
 * Usage:
 * - Frontend app loads → calls /api/auth/me
 * - If authenticated: returns user object
 * - If not authenticated: returns 401 Unauthorized
 */
router.get("/me", verifyToken, async (req, res) => {
  try {
    // verifyToken middleware extracts userId from JWT and attaches to req.user
    const user = await User.findById(req.user.userId).select(
      "-passkeys", // Exclude passkeys for security
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        provider: user.provider,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("/me endpoint error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

/**
 * Route: POST /api/auth/logout
 * Clears JWT cookie
 *
 * Frontend calls this when user clicks "Logout"
 * We clear the HTTP-only cookie (frontend cannot access it directly)
 */
router.post("/logout", (req, res) => {
  const isProd = process.env.NODE_ENV === "production";
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: isProd ? "none" : "strict",
    secure: isProd,
    path: "/",
  });

  res.json({
    success: true,
    message: "Logged out successfully",
  });
});

// ===== PASSKEY (WebAuthn) ROUTES =====

import * as webauthn from "../config/webauthn.js";

/**
 * Route: POST /api/auth/passkey/register/options
 * Generate registration challenge for passkey signup
 *
 * Request body: { email }
 * Response: { challenge, user, rp, ... }
 *
 * Security: Challenge is stored server-side with 5-minute TTL
 */
router.post("/passkey/register/options", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Check if user already exists with passkey
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.passkeys?.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Passkey already registered for this email",
      });
    }

    // Generate challenge
    const options = await webauthn.generatePasskeyRegistrationOptions(email);

    // Store challenge server-side with TTL
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

/**
 * Route: POST /api/auth/passkey/register/verify
 * Verify passkey credential and create user
 *
 * Request body: { email, response }
 *
 * Security: Challenge is retrieved from server-side store (not client-supplied)
 */
router.post("/passkey/register/verify", async (req, res) => {
  try {
    const { email, response } = req.body;

    if (!email || !response) {
      return res.status(400).json({
        success: false,
        message: "Email and response are required",
      });
    }

    // Retrieve challenge from server-side store (not client-supplied!)
    const storedChallenge = challengeStore.get(email, "registration");
    if (!storedChallenge) {
      return res.status(400).json({
        success: false,
        message: "No valid challenge found. Please start registration again.",
      });
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user && user.passkeys.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Passkey already registered for this email",
      });
    }

    // Verify the passkey credential (using STORED challenge, not client-supplied)
    const credential = await webauthn.verifyPasskeyRegistration(
      response,
      storedChallenge, // ← Server-side stored challenge, not from client
    );

    // Remove challenge (one-time use)
    challengeStore.remove(email, "registration");

    if (!user) {
      // Create new user with passkey
      user = new User({
        name: email.split("@")[0],
        email,
        provider: "passkey",
        passkeys: [credential],
      });
    } else {
      // Add passkey to existing user
      user.passkeys.push(credential);
    }

    await user.save();

    console.log(`✅ Passkey registered for: ${user.email}`);

    res.json({
      success: true,
      message: "Passkey registered successfully",
      user: {
        id: user._id,
        email: user.email,
        provider: user.provider,
      },
    });
  } catch (error) {
    console.error("Passkey registration verify error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * Route: POST /api/auth/passkey/login/options
 * Generate login challenge for passkey login
 *
 * Request body: { email }
 * Response: { challenge, allowCredentials, ... }
 *
 * Security: Challenge is stored server-side with 5-minute TTL
 */
router.post("/passkey/login/options", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Find user and check if they have passkeys
    const user = await User.findOne({ email });
    if (!user || user.passkeys.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No passkey found for this email",
      });
    }

    // Generate login challenge
    const allowedCredentialIDs = user.passkeys.map((pk) => pk.credentialId);
    const options =
      await webauthn.generatePasskeyLoginOptions(allowedCredentialIDs);

    // Store challenge server-side with TTL
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

/**
 * Route: POST /api/auth/passkey/login/verify
 * Verify passkey login and issue JWT
 *
 * Request body: { email, response }
 *
 * Security: Challenge is retrieved from server-side store (not client-supplied)
 */
router.post("/passkey/login/verify", async (req, res) => {
  try {
    const { email, response } = req.body;

    if (!email || !response) {
      return res.status(400).json({
        success: false,
        message: "Email and response are required",
      });
    }

    // Retrieve challenge from server-side store (not client-supplied!)
    const storedChallenge = challengeStore.get(email, "login");
    if (!storedChallenge) {
      return res.status(400).json({
        success: false,
        message: "No valid challenge found. Please start login again.",
      });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user || user.passkeys.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Passkey not found",
      });
    }

    // Find the matching passkey credential
    const responseCredentialId = Buffer.from(response.id, "base64url").toString(
      "base64",
    );
    const passkey = user.passkeys.find(
      (pk) => pk.credentialId === responseCredentialId,
    );
    if (!passkey) {
      return res.status(404).json({
        success: false,
        message: "Credential not found",
      });
    }

    // Verify the passkey login (using STORED challenge, not client-supplied)
    const verification = await webauthn.verifyPasskeyLogin(
      response,
      storedChallenge, // ← Server-side stored challenge, not from client
      passkey.publicKey,
      passkey.counter,
      passkey.credentialId,
    );

    // Remove challenge (one-time use)
    challengeStore.remove(email, "login");

    // Update counter to prevent replay attacks
    passkey.counter = verification.newCounter;
    await user.save();

    // Generate JWT
    const token = generateJWT(user._id);
    setJWTCookie(res, token);

    console.log(`✅ Passkey login successful: ${user.email}`);

    res.json({
      success: true,
      message: "Logged in successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        provider: user.provider,
      },
    });
  } catch (error) {
    console.error("Passkey login verify error:", error);
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
