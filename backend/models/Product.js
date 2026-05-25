import mongoose from "mongoose";

/**
 * Product Schema
 *
 * Represents items in the CartNest store
 * Each product belongs to a category (Vegetables, Fruits, etc.)
 * Images are stored on Cloudinary (URL + publicId for deletion)
 */

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [3, "Product name must be at least 3 characters"],
      maxlength: [100, "Product name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default: "",
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
      max: [999999, "Price too high"],
    },
    // Image stored on Cloudinary
    // url: CDN link to display
    // publicId: Cloudinary identifier for deletion
    image: {
      url: {
        type: String,
        default: null,
      },
      publicId: {
        type: String,
        default: null,
      },
    },
    // Reference to Category
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    // Available quantity
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Stock cannot be negative"],
    },
    // soft delete: isActive = false hides product
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

// ===== QUERY HELPERS =====

/**
 * findActive: Helper to find only active products
 * Usage: Product.find().where('isActive').equals(true)
 * Or: Product.findActive()
 */
productSchema.query.findActive = function () {
  return this.where({ isActive: true });
};

// ===== INSTANCE METHODS =====

/**
 * toJSON: Convert product to safe response object
 * Excludes internal fields before sending to frontend
 */
productSchema.methods.toJSON = function () {
  const product = this.toObject();
  return product;
};

/**
 * isInStock: Check if product has available stock
 */
productSchema.methods.isInStock = function (quantity = 1) {
  return this.stock >= quantity;
};

// ===== STATICS (Class Methods) =====

/**
 * findByCategory: Find all active products in a category
 * @param categoryId - Category ObjectId
 * @returns Array of products
 */
productSchema.statics.findByCategory = function (categoryId) {
  return this.find({
    category: categoryId,
    isActive: true,
  }).populate("category", "name slug icon");
};

/**
 * findByCategorySlug: Find products by category slug
 * @param slug - Category slug (e.g., 'vegetables')
 * @returns Array of products
 */
productSchema.statics.findByCategorySlug = async function (slug) {
  const Category = mongoose.model("Category");
  const category = await Category.findOne({ slug });

  if (!category) {
    return [];
  }

  return this.find({
    category: category._id,
    isActive: true,
  }).populate("category", "name slug icon");
};

const Product = mongoose.model("Product", productSchema);

export default Product;
