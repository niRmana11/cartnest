import mongoose from "mongoose";

/**
 * Cart Schema
 *
 */
const cartSchema = new mongoose.Schema(
  {
    // User who owns this cart
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
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
        priceAtTime: {
          type: Number,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
);

// QUERY HELPERS

/**
 * populate: Auto-populate product details when fetching cart
 */
cartSchema.pre(["find", "findOne"], function () {
  this.populate({
    path: "items.product",
    select: "name price image stock category",
  });
});

// INSTANCE METHODS

/**
 * calculateTotal: Sum up all item costs (quantity * priceAtTime)
 * @returns
 */
cartSchema.methods.calculateTotal = function () {
  return this.items.reduce((total, item) => {
    return total + item.quantity * item.priceAtTime;
  }, 0);
};

/**
 * getItemCount: Total number of items in cart
 * @returns
 */
cartSchema.methods.getItemCount = function () {
  return this.items.reduce((count, item) => count + item.quantity, 0);
};

/**
 * findItem: Find a specific item in cart by product ID
 * @param productId
 * @returns
 */
cartSchema.methods.findItem = function (productId) {
  const targetId = productId?.toString();
  return this.items.find(
    (item) => (item.product?._id ?? item.product).toString() === targetId,
  );
};

/**
 * addItem: Add or increase quantity of item in cart
 * @param productId
 * @param quantity
 * @param priceAtTime
 * @returns
 */
cartSchema.methods.addItem = function (productId, quantity, priceAtTime) {
  const qty = Number(quantity);
  const existingItem = this.findItem(productId);

  if (existingItem) {
    // Item already in cart — increase quantity
    existingItem.quantity += qty;
  } else {
    // New item — add to cart
    this.items.push({
      product: productId,
      quantity: qty,
      priceAtTime,
    });
  }

  return this;
};

/**
 * removeItem: Remove item from cart
 * @param productId
 * @returns
 */
cartSchema.methods.removeItem = function (productId) {
  const targetId = productId?.toString();
  this.items = this.items.filter(
    (item) => (item.product?._id ?? item.product).toString() !== targetId,
  );
  return this;
};

/**
 * updateItemQuantity: Update quantity of existing item
 * @param productId
 * @param newQuantity
 * @returns
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
 * @returns
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

// STATICS (Class Methods)

/**
 * findOrCreateByUser: Get cart for user, create if doesn't exist
 * @param userId
 * @returns
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
