import express from "express";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../controllers/categoryController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import requireAdmin from "../middleware/adminMiddleware.js";

/**
 * Category Routes
 *
 * Public routes: Browse categories
 * Protected routes: Admin-only category management
 */

const router = express.Router();

// PUBLIC ROUTES (no auth required)

/**
 * Route: GET /api/categories
 * Get all active categories
 */
router.get("/", getCategories);

// PROTECTED ROUTES (admin only)

/**
 * Route: POST /api/categories
 * Create new category
 */
router.post("/", verifyToken, requireAdmin, createCategory);

/**
 * Route: PUT /api/categories/:id
 * Update existing category
 */
router.put("/:id", verifyToken, requireAdmin, updateCategory);

/**
 * Route: DELETE /api/categories/:id
 * Delete category
 */
router.delete("/:id", verifyToken, requireAdmin, deleteCategory);

export default router;
