import mongoose from "mongoose";
import slugify from "slugify";

/**
 * Category Schema
 * Examples: Vegetables, Fruits, Cakes, Biscuits
 *
 * Design: slug field for user-friendly URLs
 * URL: /api/products/category/vegetables (instead of /api/products/category/507f1f77bcf86cd799439011)
 */
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      unique: true,
      trim: true,
      minlength: [2, "Category name must be at least 2 characters"],
      maxlength: [50, "Category name cannot exceed 50 characters"],
    },
    // URL-friendly slug generated from name
    // Example: "Fresh Vegetables" → "fresh-vegetables"
    slug: {
      type: String,
      unique: true,
      sparse: true,
    },
    // Icon for UI display (emoji or icon name)
    // Example: "🥬" or "leaf"
    icon: {
      type: String,
      default: "📦",
    },
  },
  {
    timestamps: true, // Auto-add createdAt, updatedAt
  },
);

// ===== PRE-SAVE HOOKS =====

/**
 * Pre-save hook: Auto-generate slug from category name
 * WHY: Prevents manual slug errors, ensures consistency
 *
 * When saving a new category with name "Fresh Vegetables",
 * automatically sets slug to "fresh-vegetables"
 */
categorySchema.pre("save", function (next) {
  // Only generate slug if name is modified or new document
  if (this.isModified("name")) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true, // Remove special characters
    });
  }
  next();
});

// ===== STATIC METHODS =====

/**
 * Find category by slug
 * WHY: Convenient method for queries like Category.findBySlug('vegetables')
 */
categorySchema.statics.findBySlug = function (slug) {
  return this.findOne({ slug });
};

// ===== CREATE AND EXPORT MODEL =====

const Category = mongoose.model("Category", categorySchema);

export default Category;
