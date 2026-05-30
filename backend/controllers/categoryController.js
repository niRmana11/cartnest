import Category from "../models/Category.js";
import Product from "../models/Product.js";

const ALLOWED_CATEGORY_ICONS = [
  "package",
  "grid",
  "carrot",
  "leaf",
  "apple",

  "cake",
  "cookie",
  "candy",
  "ice-cream",
  "drink",
  "coffee",
  "wheat",
  "chef",
  "sandwich",
  "pizza",
  "soup",
  "meat",

  "fish",
  "egg",
  "milk",
  "fresh",
  "shopping",
];

// get all categories
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });

    res.json({
      success: true,
      count: categories.length,
      categories,
    });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
    });
  }
};

// create a category
export const createCategory = async (req, res) => {
  try {
    const { name, icon } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }

    if (icon && !ALLOWED_CATEGORY_ICONS.includes(icon)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category icon",
      });
    }

    const category = await Category.create({
      name,
      icon: icon || "package",
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      category,
    });
  } catch (error) {
    console.error("Create category error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Category already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "Failed to create category",
    });
  }
};

// update a category
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, icon } = req.body;

    if (icon && !ALLOWED_CATEGORY_ICONS.includes(icon)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category icon",
      });
    }

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    if (name) category.name = name;
    if (icon) category.icon = icon;

    await category.save();

    res.json({
      success: true,
      message: "Category updated successfully",
      category,
    });
  } catch (error) {
    console.error("Update category error:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Category name already exists",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "Failed to update category",
    });
  }
};

// delete a category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const productCount = await Product.countDocuments({ category: id });

    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete a category that still has products",
      });
    }

    await category.deleteOne();

    res.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    console.error("Delete category error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete category",
    });
  }
};
