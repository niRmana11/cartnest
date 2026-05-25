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
 * ALL ROUTES PROTECTED: User must be logged in
 * Each user can only access their own cart
 */

const router = express.Router();

// ===== PROTECTED ROUTES (all require authentication) =====

/**
 * Route: GET /api/cart
 * Get current user's cart
 *
 * Protected: Must be authenticated
 *
 * Response: { success, cart: { items, total, itemCount } }
 *
 * Example response:
 * {
 *   "success": true,
 *   "cart": {
 *     "_id": "...",
 *     "user": "...",
 *     "items": [
 *       {
 *         "product": { "_id", "name", "price", "image", ... },
 *         "quantity": 2,
 *         "priceAtTime": 5.99
 *       }
 *     ],
 *     "total": 11.98,
 *     "itemCount": 2,
 *     "updatedAt": "..."
 *   }
 * }
 */
router.get("/", verifyToken, getCart);

/**
 * Route: POST /api/cart
 * Add item to cart
 *
 * Protected: Must be authenticated
 *
 * Request body (JSON):
 * {
 *   "productId": "507f1f77bcf86cd799439011",
 *   "quantity": 2
 * }
 *
 * Response: { success, message, cart: {...} }
 *
 * Business Logic:
 * - Verify product exists and is active
 * - Check stock availability
 * - If product already in cart, increase quantity
 * - If new product, add with price snapshot
 */
router.post("/", verifyToken, addToCart);

/**
 * Route: PUT /api/cart/:itemId
 * Update quantity of item in cart
 *
 * Protected: Must be authenticated
 * URL params: itemId = product ID
 *
 * Request body (JSON):
 * {
 *   "quantity": 5
 * }
 *
 * Response: { success, message, cart: {...} }
 *
 * Notes:
 * - If quantity = 0, item is removed
 * - If quantity > 0, quantity is updated
 * - Stock availability is verified
 */
router.put("/:itemId", verifyToken, updateCartItem);

/**
 * Route: DELETE /api/cart/:itemId
 * Remove single item from cart
 *
 * Protected: Must be authenticated
 * URL params: itemId = product ID
 *
 * Response: { success, message, cart: {...} }
 */
router.delete("/:itemId", verifyToken, removeFromCart);

/**
 * Route: DELETE /api/cart
 * Clear entire cart (remove all items)
 *
 * Protected: Must be authenticated
 *
 * Response: { success, message, cart: {...} }
 */
router.delete("/", verifyToken, clearCart);

export default router;
