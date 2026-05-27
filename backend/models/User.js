import mongoose from "mongoose";

/**
 * User Schema
 * Supports multiple auth providers: Google OAuth, Passkey (WebAuthn), Facebook (future)
 *
 * Design decision: All auth methods store the same user record with a 'provider' field
 * Example: Same email can exist for google + passkey on same account
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // OAuth provider (google, facebook, passkey, local)
    provider: {
      type: String,
      enum: ["google", "facebook", "passkey", "local"],
      required: true,
    },
    // Provider-specific ID (e.g., Google user ID)
    // Not required for passkey (handled separately in passkeys array)
    providerId: {
      type: String,
      sparse: true, // Allows null values for passkey users
    },
    // User role: 'user' = customer, 'admin' = product manager
    // Added here to support admin dashboard on Day 6
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    // Array of registered WebAuthn passkeys
    // credentialId: base64url string (unique ID from browser)
    // publicKey: base64url string (public key for verification)
    // counter: prevents replay attacks
    passkeys: [
      {
        credentialId: String, // base64url
        publicKey: String, // base64url
        counter: {
          type: Number,
          default: 0,
        },
      },
    ],
  },
  { timestamps: true },
);

// ===== PRE-SAVE HOOKS =====

/**
 * Pre-save hook: Prevent duplicate emails across providers
 * WHY: If user signs up with Google, then tries Passkey with same email,
 * we should find the existing user instead of creating duplicate
 *
 * This is handled at the application level in the auth controller,
 * but schema validation here is an extra safety layer
 */
userSchema.pre("save", async function (next) {
  // Only check for duplicates if email is being modified
  if (!this.isModified("email")) {
    return next();
  }

  try {
    // Check if email already exists
    const existingUser = await mongoose.model("User").findOne({
      email: this.email,
      _id: { $ne: this._id }, // Exclude current user (for updates)
    });

    if (existingUser) {
      const error = new Error(
        `Email ${this.email} is already registered with provider: ${existingUser.provider}`,
      );
      error.statusCode = 400;
      return next(error);
    }

    next();
  } catch (error) {
    next(error);
  }
});

// ===== INSTANCE METHODS =====

/**
 * Convert user document to safe response object
 * WHY: Removes sensitive fields before sending to client
 * (though we don't store passwords, it's good practice)
 */
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  // Remove sensitive fields if they existed
  delete user.passkeys; // Don't send passkey details to client
  return user;
};

// ===== CREATE AND EXPORT MODEL =====

const User = mongoose.model("User", userSchema);

export default User;
