import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

/**
 * Cart Controller
 *
 * Handles all cart operations:
 * - Get user's cart
 * - Add item to cart
 * - Update quantity
 * - Remove item
 * - Clear entire cart
 */

// GET CART

/**
 * Get current user's cart
 *
 */
export const getCart = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Find or create cart for user
    let cart = await Cart.findOrCreateByUser(userId);

    // Populate product details
    await cart.populate({
      path: "items.product",
      select: "name price image stock category",
    });

    res.json({
      success: true,
      cart: cart.toJSON(),
    });
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch cart",
    });
  }
};

// ADD TO CART

/**
 * Add item to cart
 *
 */
export const addToCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productId, quantity } = req.body;

    // Validate input
    if (!productId || !quantity) {
      return res.status(400).json({
        success: false,
        message: "Product ID and quantity are required",
      });
    }

    if (quantity < 1 || isNaN(quantity)) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a positive number",
      });
    }

    // Verify product exists and is active
    const product = await Product.findById(productId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: "Product not found or is no longer available",
      });
    }

    // Check stock availability
    if (!product.isInStock(quantity)) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Available: ${product.stock}`,
      });
    }

    // Get or create cart
    let cart = await Cart.findOrCreateByUser(userId);

    // Add item (with price snapshot)
    cart.addItem(productId, quantity, product.price);

    await cart.save();

    // Populate and return
    await cart.populate({
      path: "items.product",
      select: "name price image stock category",
    });

    console.log(`Item added to cart: ${product.name} (qty: ${quantity})`);

    res.status(201).json({
      success: true,
      message: "Item added to cart",
      cart: cart.toJSON(),
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add item to cart",
    });
  }
};

// UPDATE CART ITEM

/**
 * Update quantity of item in cart
 *
 */
export const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { itemId } = req.params;
    const { quantity } = req.body;

    // Validate input
    if (quantity === undefined || isNaN(quantity)) {
      return res.status(400).json({
        success: false,
        message: "Valid quantity is required",
      });
    }

    // Get cart
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    // Find item in cart
    const item = cart.findItem(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
    }

    // If quantity is 0, remove item
    if (quantity <= 0) {
      cart.removeItem(itemId);
      await cart.save();

      console.log(`Item removed from cart`);

      await cart.populate({
        path: "items.product",
        select: "name price image stock category",
      });

      return res.json({
        success: true,
        message: "Item removed from cart",
        cart: cart.toJSON(),
      });
    }

    // Check product availability + stock
    const qty = Number(quantity);
    const product = await Product.findById(itemId);
    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: "Product not found or is no longer available",
      });
    }
    if (!product.isInStock(qty)) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Available: ${product.stock}`,
      });
    }

    // Update quantity
    cart.updateItemQuantity(itemId, qty);
    await cart.save();

    console.log(`Cart item updated: qty = ${quantity}`);

    await cart.populate({
      path: "items.product",
      select: "name price image stock category",
    });

    res.json({
      success: true,
      message: "Item quantity updated",
      cart: cart.toJSON(),
    });
  } catch (error) {
    console.error("Update cart item error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update cart item",
    });
  }
};

// REMOVE FROM CART

/**
 * Remove single item from cart
 *
 */
export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { itemId } = req.params;

    // Get cart
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    // Verify item exists
    const item = cart.findItem(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item not found in cart",
      });
    }

    // Remove item
    cart.removeItem(itemId);
    await cart.save();

    console.log(`Item removed from cart`);

    await cart.populate({
      path: "items.product",
      select: "name price image stock category",
    });

    res.json({
      success: true,
      message: "Item removed from cart",
      cart: cart.toJSON(),
    });
  } catch (error) {
    console.error("Remove from cart error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove item from cart",
    });
  }
};

// CLEAR CART

/**
 * Clear entire cart (remove all items)
 *
 */
export const clearCart = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get cart
    const cart = await Cart.findOne({ user: userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: "Cart not found",
      });
    }

    // Clear items
    cart.clear();
    await cart.save();

    console.log(`Cart cleared`);

    res.json({
      success: true,
      message: "Cart cleared",
      cart: cart.toJSON(),
    });
  } catch (error) {
    console.error("Clear cart error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to clear cart",
    });
  }
};

export default {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
