import mongoose from "mongoose";

/**
 * User Schema
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
    providerId: {
      type: String,
      sparse: true,
    },
    // User role: 'user' = customer, 'admin' = product manager
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    // Array of registered WebAuthn passkeys
    passkeys: [
      {
        credentialId: String,
        publicKey: String,
        counter: {
          type: Number,
          default: 0,
        },
      },
    ],
  },
  { timestamps: true },
);

// PRE-SAVE HOOKS

/**
 * Pre-save hook: Prevent duplicate emails across providers
 *
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
      _id: { $ne: this._id },
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

// INSTANCE METHODS

/**
 * Convert user document to safe response object
 */
userSchema.methods.toJSON = function () {
  const user = this.toObject();

  delete user.passkeys;
  return user;
};

const User = mongoose.model("User", userSchema);

export default User;
