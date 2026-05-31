import dotenv from "dotenv";
import session from "express-session";
import MongoStore from "connect-mongo";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { connectDB } from "./config/db.js";
import passport from "./config/passport.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import {
  generalLimiter,
  cartLimiter,
} from "./middleware/rateLimitMiddleware.js";

// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();
app.set("trust proxy", 1);

// MIDDLEWARE

// Security: Add HTTP security headers
app.use(helmet());

// CORS: Allow frontend to call this API
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);

// Body parser: Parse incoming JSON requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser: Parse cookies from incoming requests
app.use(cookieParser());

//  SESSION MIDDLEWARE
/**
 * express-session with MongoDB store
 */
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({
      mongoUrl: process.env.MONGO_URI,
      touchAfter: 24 * 3600,
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "lax",
    },
  }),
);

// Initialize Passport.js
app.use(passport.initialize());
app.use(passport.session());

// Apply general rate limiter
app.use("/api/", generalLimiter);

// Apply cart limiter
app.use("/api/cart", cartLimiter);

// MOUNT ROUTES
// mount auth routes
app.use("/api/auth", authRoutes);
// mount product routes
app.use("/api/products", productRoutes);
// mount cart routes
app.use("/api/cart", cartRoutes);
// mount category routes
app.use("/api/categories", categoryRoutes);

/**
 * Health check endpoint
 */
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

// ERROR HANDLER MIDDLEWARE

/**
 * Global error handler
 */
app.use((err, req, res, next) => {
  console.error("Error:", err.message);

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    message,
    error: process.env.NODE_ENV === "development" ? err : {},
  });
});

// 404 handler: Route not found
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// START SERVER

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log(`API Health: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

// Start the server
startServer();
