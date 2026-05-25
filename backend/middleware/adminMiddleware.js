import User from "../models/User.js";

/**
 * Admin Middleware
 *
 * Verifies user has admin role
 * Used to protect admin-only endpoints
 */

/**
 * requireAdmin middleware
 *
 * Purpose: Verify user is authenticated AND has admin role
 *
 * Usage in routes:
 *   router.post('/admin-endpoint', verifyToken, requireAdmin, controller)
 *
 * Process:
 * 1. verifyToken extracts userId from JWT
 * 2. This middleware checks if user.role === 'admin'
 * 3. If not admin, return 403 Forbidden
 * 4. If admin, proceed to next middleware/controller
 */
export const requireAdmin = async (req, res, next) => {
  try {
    // verifyToken middleware should have already attached req.user.userId
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // Fetch user from DB to verify role
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user has admin role
    if (user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message:
          "Admin access required. Only administrators can perform this action.",
      });
    }

    // Attach full user to request for controller use
    req.user.fullUser = user;

    next();
  } catch (error) {
    console.error("Admin middleware error:", error);
    res.status(500).json({
      success: false,
      message: "Authorization check failed",
    });
  }
};

export default requireAdmin;
