import mongoose from "mongoose";
import slugify from "slugify";

/**
 * Category Schema
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
    slug: {
      type: String,
      unique: true,
      sparse: true,
    },
    // Icon for UI display (emoji or icon name)
    icon: {
      type: String,
      default: "📦",
    },
  },
  {
    timestamps: true,
  },
);

//  PRE-SAVE HOOKS

/**
 * Pre-save hook: Auto-generate slug from category name
 */
categorySchema.pre("save", function (next) {
  // Only generate slug if name is modified or new document
  if (this.isModified("name")) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true,
    });
  }
  next();
});

// STATIC METHODS

/**
 * Find category by slug
 */
categorySchema.statics.findBySlug = function (slug) {
  return this.findOne({ slug });
};

const Category = mongoose.model("Category", categorySchema);

export default Category;
