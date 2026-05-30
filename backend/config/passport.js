import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

/**
 * Passport.js Configuration
 *
 */

// GOOGLE OAUTH STRATEGY
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
     * @param accessToken
     * @param refreshToken
     * @param profile
     * @param done
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
            role: "user",
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

// FACEBOOK OAUTH STRATEGY
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: process.env.FACEBOOK_CALLBACK_URL,
      profileFields: ["id", "displayName", "email", "picture"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;

        // Check by Facebook providerId
        // Check if this exact Facebook account is already linked
        let user = await User.findOne({
          providerId: profile.id,
          provider: "facebook",
        });

        if (user) {
          // Facebook account already linked to this user
          console.log(`Existing Facebook user found: ${user.email}`);
          return done(null, user);
        }

        // Check by email (cross-provider login)
        // If email available, check if user exists with any provider
        if (email) {
          user = await User.findOne({ email });

          if (user) {
            // User exists with different provider (Google, Passkey, etc.)
            // Link Facebook to existing account
            console.log(
              `Cross-provider login: Linking Facebook to existing user ${email}`,
            );

            // Add Facebook as additional provider option
            user.providerId = profile.id;
            user.provider = "facebook";

            await user.save();
            return done(null, user);
          }
        }

        // Create new user
        // No existing user found, create new account
        user = new User({
          name: profile.displayName,
          email: email || `facebook-${profile.id}@cartnest.local`,
          provider: "facebook",
          providerId: profile.id,
          role: "user",
        });

        await user.save();
        console.log(`New user created via Facebook: ${user.email}`);
        return done(null, user);
      } catch (error) {
        console.error("Facebook authentication error:", error.message);
        return done(error);
      }
    },
  ),
);

// SERIALIZE & DESERIALIZE

passport.serializeUser((user, done) => {
  done(null, user._id);
});

/**
 * deserializeUser: How to retrieve full user from the stored ID?
 *
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
