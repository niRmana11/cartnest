import jwt from "jsonwebtoken";

/**
 * Auth Middleware
 * Verifies JWT token from HTTP-only cookie
 * Attaches user info to req.user for use in route handlers
 */

/**
 * verifyToken middleware
 *
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
