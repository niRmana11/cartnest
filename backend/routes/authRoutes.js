import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { verifyToken } from "../middleware/authMiddleware.js";

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
  res.cookie("token", token, {
    httpOnly: true, // Not readable by JS (XSS protection)
    sameSite: "strict", // CSRF protection
    secure: process.env.NODE_ENV === "production", // HTTPS only in production
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
      res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
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
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
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

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Generate challenge
    const options = await webauthn.generatePasskeyRegistrationOptions(email);

    // Store challenge in session (we'll verify it in the next step)
    // For now, we'll send it back to frontend and they'll send it back
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
 * Request body: { email, response, challenge }
 */
router.post("/passkey/register/verify", async (req, res) => {
  try {
    const { email, response, challenge } = req.body;

    if (!email || !response || !challenge) {
      return res.status(400).json({
        success: false,
        message: "Email, response, and challenge are required",
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

    // Verify the passkey credential
    const credential = await webauthn.verifyPasskeyRegistration(
      response,
      challenge,
    );

    if (!user) {
      // Create new user with passkey
      user = new User({
        name: email.split("@")[0], // Use email prefix as default name
        email,
        provider: "passkey",
        passkeys: [credential],
      });
    } else {
      // Add passkey to existing user
      user.passkeys.push(credential);
    }

    await user.save();

    console.log(`Passkey registered for: ${user.email}`);

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
 * Request body: { email, response, challenge }
 */
router.post("/passkey/login/verify", async (req, res) => {
  try {
    const { email, response, challenge } = req.body;

    if (!email || !response || !challenge) {
      return res.status(400).json({
        success: false,
        message: "Email, response, and challenge are required",
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
    const passkey = user.passkeys.find((pk) => pk.credentialId === response.id);
    if (!passkey) {
      return res.status(404).json({
        success: false,
        message: "Credential not found",
      });
    }

    // Verify the passkey login
    const verification = await webauthn.verifyPasskeyLogin(
      response,
      challenge,
      passkey.publicKey,
      passkey.counter,
    );

    // Update counter to prevent replay attacks
    passkey.counter = verification.newCounter;
    await user.save();

    // Generate JWT
    const token = generateJWT(user._id);
    setJWTCookie(res, token);

    console.log(`Passkey login successful: ${user.email}`);

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
