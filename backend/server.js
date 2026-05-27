import dotenv from "dotenv";
import session from "express-session";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.js";
import passport from "./config/passport.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import {
  generalLimiter,
  cartLimiter,
} from "./middleware/rateLimitMiddleware.js";

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();

// ===== MIDDLEWARE =====

// Security: Add HTTP security headers
app.use(helmet());

// CORS: Allow frontend to call this API
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true, // Allow cookies to be sent with requests
  }),
);

// Body parser: Parse incoming JSON requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser: Parse cookies from incoming requests
app.use(cookieParser());

// ===== SESSION MIDDLEWARE =====
/**
 * express-session configuration
 *
 * Required for Passport OAuth flows (Google, Facebook)
 * Stores user session data during OAuth redirect
 *
 * Process:
 * 1. User clicks "Login with Facebook"
 * 2. Redirects to Facebook consent page
 * 3. Session stores user data temporarily
 * 4. Facebook redirects back to callback
 * 5. Passport retrieves user from session
 * 6. Sets JWT cookie
 */
app.use(
  session({
    secret:
      process.env.SESSION_SECRET ||
      "your-session-secret-key-change-in-production",
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: process.env.NODE_ENV === "production", // Only send over HTTPS in production
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: "lax", // Allow OAuth redirect
    },
  }),
);

// Initialize Passport.js
app.use(passport.initialize());

// ===== RATE LIMITING =====
// Apply general rate limiter to all API routes
app.use("/api/", generalLimiter);

// Apply cart limiter to cart routes
app.use("/api/cart", cartLimiter);

// ===== MOUNT ROUTES =====
// mount auth routes
app.use("/api/auth", authRoutes);
// mount product routes
app.use("/api/products", productRoutes);
// mount cart routes
app.use("/api/cart", cartRoutes);

/**
 * Health check endpoint
 * Returns: { status: 'OK' }
 */
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

// ===== ERROR HANDLER MIDDLEWARE =====

/**
 * Global error handler
 * Catches all errors thrown by routes and returns standardized error response
 */
app.use((err, req, res, next) => {
  console.error("Error:", err.message);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === "development" ? err : {}, // Show stack trace only in dev
  });
});

// 404 handler: Route not found
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ===== START SERVER =====

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to MongoDB first
    await connectDB();

    // Then start Express server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📚 API Health: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Start the server
startServer();
