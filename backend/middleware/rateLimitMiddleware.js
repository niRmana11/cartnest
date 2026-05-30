import rateLimit from "express-rate-limit";

/**
 * Rate Limiting Middleware
 *
 */

// GENERAL RATE LIMITER
/**
 * General limiter: 100 requests per 15 minutes
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health check
    return req.path === "/health" || req.originalUrl === "/api/health";
  },
});

// AUTH RATE LIMITER
/**
 * Auth limiter: 5 requests per 15 minutes
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 auth attempts per windowMs
  message:
    "Too many authentication attempts. Please try again after 15 minutes.",
  standardHeaders: true,
  legacyHeaders: false,
});

// UPLOAD RATE LIMITER
/**
 * Upload limiter: 10 uploads per 1 hour
 */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 uploads per hour
  message: "Too many uploads. Please try again after 1 hour.",
  standardHeaders: true,
  legacyHeaders: false,
});

// CART RATE LIMITER
/**
 * Cart limiter: 30 requests per 1 minute
 */
export const cartLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: "Too many cart operations. Please slow down.",
  standardHeaders: true,
  legacyHeaders: false,
});

export default {
  generalLimiter,
  authLimiter,
  uploadLimiter,
  cartLimiter,
};
