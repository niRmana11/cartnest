import jwt from "jsonwebtoken";

/**
 * Auth Middleware
 * Verifies JWT token from HTTP-only cookie
 * Attaches user info to req.user for use in route handlers
 */

/**
 * verifyToken middleware
 *
 * Purpose: Protect routes that require authentication
 *
 * Usage in routes:
 *   router.get('/protected-route', verifyToken, (req, res) => {
 *     console.log(req.user.userId); // User is authenticated
 *   });
 *
 * Process:
 * 1. Extract token from HTTP-only cookie
 * 2. Verify token with JWT_SECRET
 * 3. Extract userId from token payload
 * 4. Attach userId to req.user
 * 5. Call next() to proceed to route handler
 *
 * If token is missing or invalid: Return 401 Unauthorized
 */
export const verifyToken = (req, res, next) => {
  try {
    // Extract token from HTTP-only cookie
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided. Please login first.",
      });
    }

    // Verify token signature and expiration
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to request object
    // Now route handlers can access req.user.userId
    req.user = {
      userId: decoded.userId,
    };

    // Proceed to next middleware/route handler
    next();
  } catch (error) {
    // Token invalid or expired
    console.error("Token verification failed:", error.message);

    // Determine error type
    let message = "Invalid token";
    if (error.name === "TokenExpiredError") {
      message = "Token has expired. Please login again.";
    }

    res.status(401).json({
      success: false,
      message,
    });
  }
};
