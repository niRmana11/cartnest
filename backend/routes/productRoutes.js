import express from "express";
import {
  getAllProducts,
  getProductById,
  getProductsByCategory,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import {
  uploadSingle,
  handleUploadError,
} from "../middleware/uploadMiddleware.js";
import requireAdmin from "../middleware/adminMiddleware.js";
import { uploadLimiter } from "../middleware/rateLimitMiddleware.js";

/**
 * Product Routes
 *
 * Public routes: Browse products, view details
 * Protected routes: Admin-only product management
 */

const router = express.Router();

// PUBLIC ROUTES (no auth required)

/**
 * Route: GET /api/products
 * Get all active products (optionally filtered by category)
 */
router.get("/", getAllProducts);

/**
 * Route: GET /api/products/:id
 * Get single product by ID
 */
router.get("/:id", getProductById);

/**
 * Route: GET /api/products/category/:slug
 * Get all products in a category
 */
router.get("/category/:slug", getProductsByCategory);

// PROTECTED ROUTES (admin only)

/**
 * Route: POST /api/products
 * Create new product with image upload
 */
router.post(
  "/",
  verifyToken, 
  requireAdmin, 
  uploadLimiter, 
  uploadSingle, 
  handleUploadError, 
  createProduct,
);

/**
 * Route: PUT /api/products/:id
 * Update existing product
 */
router.put(
  "/:id",
  verifyToken, 
  requireAdmin, 
  uploadLimiter, 
  uploadSingle, 
  handleUploadError, 
  updateProduct,
);

/**
 * Route: DELETE /api/products/:id
 * Delete product (soft delete)
 */
router.delete("/:id", verifyToken, requireAdmin, deleteProduct);

export default router;
