import mongoose from "mongoose";

/**
 * Cart Schema
 *
 * Represents a shopping cart for a user
 * Contains items with quantity + price snapshot (to prevent surprises if product price changes)
 *
 * Design: One cart per user (stored server-side, not in browser)
 * This survives browser refresh + logout/login
 */
const cartSchema = new mongoose.Schema(
  {
    // User who owns this cart
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // One cart per user
    },
    // Array of items in the cart
    items: [
      {
        // Reference to product
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        // Quantity user wants
        quantity: {
          type: Number,
          required: true,
          min: [1, "Quantity must be at least 1"],
          default: 1,
        },
        // IMPORTANT: Snapshot of product price when added to cart
        // WHY: If admin changes product price later, user still sees old price
        // This prevents: "I added at $5, now it's $50 in checkout!" surprise
        priceAtTime: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true, // Auto-add createdAt, updatedAt
  },
);

// ===== QUERY HELPERS =====

/**
 * populate: Auto-populate product details when fetching cart
 * Usage: const cart = await Cart.findById(id).populate('product')
 */
cartSchema.pre(["find", "findOne"], function () {
  this.populate({
    path: "items.product",
    select: "name price image stock category",
  });
});

// ===== INSTANCE METHODS =====

/**
 * calculateTotal: Sum up all item costs (quantity * priceAtTime)
 * @returns total price
 */
cartSchema.methods.calculateTotal = function () {
  return this.items.reduce((total, item) => {
    return total + item.quantity * item.priceAtTime;
  }, 0);
};

/**
 * getItemCount: Total number of items in cart
 * @returns item count
 */
cartSchema.methods.getItemCount = function () {
  return this.items.reduce((count, item) => count + item.quantity, 0);
};

/**
 * findItem: Find a specific item in cart by product ID
 * @param productId - Product ObjectId
 * @returns item or null
 */
cartSchema.methods.findItem = function (productId) {
  return this.items.find(
    (item) => item.product.toString() === productId.toString(),
  );
};

/**
 * addItem: Add or increase quantity of item in cart
 * @param productId - Product ObjectId
 * @param quantity - Quantity to add
 * @param priceAtTime - Current product price (snapshot)
 * @returns modified cart
 */
cartSchema.methods.addItem = function (productId, quantity, priceAtTime) {
  const existingItem = this.findItem(productId);

  if (existingItem) {
    // Item already in cart — increase quantity
    existingItem.quantity += quantity;
  } else {
    // New item — add to cart
    this.items.push({
      product: productId,
      quantity,
      priceAtTime,
    });
  }

  return this;
};

/**
 * removeItem: Remove item from cart
 * @param productId - Product ObjectId
 * @returns modified cart
 */
cartSchema.methods.removeItem = function (productId) {
  this.items = this.items.filter(
    (item) => item.product.toString() !== productId.toString(),
  );
  return this;
};

/**
 * updateItemQuantity: Update quantity of existing item
 * @param productId - Product ObjectId
 * @param newQuantity - New quantity (0 = remove)
 * @returns modified cart
 */
cartSchema.methods.updateItemQuantity = function (productId, newQuantity) {
  if (newQuantity <= 0) {
    // Remove if quantity is 0 or negative
    return this.removeItem(productId);
  }

  const item = this.findItem(productId);
  if (item) {
    item.quantity = newQuantity;
  }

  return this;
};

/**
 * clear: Empty the cart
 * @returns empty cart
 */
cartSchema.methods.clear = function () {
  this.items = [];
  return this;
};

/**
 * toJSON: Convert to safe response object
 * Excludes internal Mongoose fields
 */
cartSchema.methods.toJSON = function () {
  const cart = this.toObject();
  const total = this.calculateTotal();
  const itemCount = this.getItemCount();

  return {
    _id: cart._id,
    user: cart.user,
    items: cart.items,
    total,
    itemCount,
    updatedAt: cart.updatedAt,
  };
};

// ===== STATICS (Class Methods) =====

/**
 * findOrCreateByUser: Get cart for user, create if doesn't exist
 * @param userId - User ObjectId
 * @returns cart
 */
cartSchema.statics.findOrCreateByUser = async function (userId) {
  let cart = await this.findOne({ user: userId });

  if (!cart) {
    cart = await this.create({ user: userId, items: [] });
  }

  return cart;
};

const Cart = mongoose.model("Cart", cartSchema);

export default Cart;
