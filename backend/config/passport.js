import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.js";
import dotenv from "dotenv";

// Fallback: Ensure env vars are loaded in this file too
dotenv.config();

/**
 * Passport.js Configuration
 *
 * OAuth2 Flow:
 * 1. User clicks "Login with Google"
 * 2. Redirects to Google login (GET /api/auth/google)
 * 3. User enters credentials + grants permission
 * 4. Google redirects back to GOOGLE_CALLBACK_URL with auth code
 * 5. We exchange code for user profile (accessToken, refreshToken)
 * 6. Find or create user in MongoDB
 * 7. Generate JWT and set HTTP-only cookie
 * 8. Redirect to frontend home
 */

// ===== GOOGLE OAUTH STRATEGY =====
passport.use(
  "google",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    /**
     * Verify callback: Called when user returns from Google with auth code
     *
     * @param accessToken - Token to access Google API (we don't use it)
     * @param refreshToken - Unused for OAuth (Google doesn't return it for web apps)
     * @param profile - User profile from Google
     * @param done - Callback to pass user to serializeUser
     */
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Log the profile for debugging
        console.log("Google OAuth Profile receieved:", {
          googleId: profile.id,
          email: profile.emails[0].value,
          name: profile.displayName,
        });

        const email = profile.emails[0].value;
        const name = profile.displayName;

        /**
         * Find or create user
         *
         * WHY "findOrCreate"?
         * - If user logs in again: find existing user
         * - If first time: create new user with Google provider
         * - If user previously signed up with Passkey: find and return existing
         */
        let user = await User.findOne({ email });

        if (user) {
          // User exists - return existing user
          console.log(`Existing user found: ${user.email}`);
        } else {
          // First time Google login - create new user
          user = new User({
            name,
            email,
            provider: "google",
            providerId: profile.id,
            role: "user", // Default to regular user
          });

          await user.save();
          console.log(`New User created via Google: ${user.email}`);
        }

        // Pass user to serializeUser
        return done(null, user);
      } catch (error) {
        console.log("Google OAuth verification error:", error);
        return done(error, null);
      }
    },
  ),
);

// ===== SERIALIZE & DESERIALIZE =====

/**
 * serializeUser: What to store in session/JWT payload?
 * Stores: user ID (smallest data)
 *
 * When user logs in: serializeUser extracts user._id
 * This ID is stored in JWT token or session
 */
passport.serializeUser((user, done) => {
  // Store only user ID in the token
  done(null, user._id);
});

/**
 * deserializeUser: How to retrieve full user from the stored ID?
 *
 * When user makes request with JWT token:
 * 1. Extract user ID from token
 * 2. Call deserializeUser with that ID
 * 3. Fetch user from MongoDB
 * 4. Attach user to req.user
 */
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
