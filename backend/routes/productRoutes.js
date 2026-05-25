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

/**
 * Product Routes
 *
 * Public routes: Browse products, view details
 * Protected routes: Admin-only product management
 */

const router = express.Router();

// ===== PUBLIC ROUTES (no auth required) =====

/**
 * Route: GET /api/products
 * Get all active products (optionally filtered by category)
 *
 * Query params:
 * - ?category=vegetables (optional category filter)
 *
 * Response: { success, count, products: [...] }
 */
router.get("/", getAllProducts);

/**
 * Route: GET /api/products/:id
 * Get single product by ID
 *
 * Response: { success, product: {...} }
 */
router.get("/:id", getProductById);

/**
 * Route: GET /api/products/category/:slug
 * Get all products in a category
 *
 * URL params:
 * - slug: Category slug (e.g., "vegetables")
 *
 * Response: { success, count, products: [...] }
 */
router.get("/category/:slug", getProductsByCategory);

// ===== PROTECTED ROUTES (admin only) =====

/**
 * Route: POST /api/products
 * Create new product with image upload
 *
 * Protected: Must be authenticated + admin
 *
 * Request body (multipart/form-data):
 * - name (required): Product name
 * - description (optional): Product description
 * - price (required): Product price
 * - category (required): Category ObjectId
 * - stock (optional): Available stock
 * - image (optional): Image file (JPEG, PNG, GIF, WebP, max 5MB)
 *
 * Response: { success, message, product: {...} }
 */
router.post(
  "/",
  verifyToken, // Must be logged in
  uploadSingle, // Handle file upload
  handleUploadError, // Handle upload errors
  createProduct,
);

/**
 * Route: PUT /api/products/:id
 * Update existing product
 *
 * Protected: Must be authenticated + admin
 *
 * Request body (multipart/form-data):
 * - name (optional): New product name
 * - description (optional): New description
 * - price (optional): New price
 * - category (optional): New category
 * - stock (optional): New stock
 * - image (optional): New image file (replaces old)
 *
 * Response: { success, message, product: {...} }
 */
router.put(
  "/:id",
  verifyToken, // Must be logged in
  uploadSingle, // Handle file upload
  handleUploadError, // Handle upload errors
  updateProduct,
);

/**
 * Route: DELETE /api/products/:id
 * Delete product (soft delete)
 *
 * Protected: Must be authenticated + admin
 *
 * Response: { success, message }
 */
router.delete("/:id", verifyToken, deleteProduct);

export default router;
