import express from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../controllers/cartController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

/**
 * Cart Routes
 *
 */

const router = express.Router();

// PROTECTED ROUTES (all require authentication)

/**
 * Route: GET /api/cart
 * Get current user's cart
 */
router.get("/", verifyToken, getCart);

/**
 * Route: POST /api/cart
 * Add item to cart
 */
router.post("/", verifyToken, addToCart);

/**
 * Route: PUT /api/cart/:itemId
 * Update quantity of item in cart
 */
router.put("/:itemId", verifyToken, updateCartItem);

/**
 * Route: DELETE /api/cart/:itemId
 * Remove single item from cart
 */
router.delete("/:itemId", verifyToken, removeFromCart);

/**
 * Route: DELETE /api/cart
 * Clear entire cart (remove all items)
 */
router.delete("/", verifyToken, clearCart);

export default router;
