import Product from "../models/Product.js";
import Category from "../models/Category.js";
import {
  uploadImageToCloudinary,
  deleteImageFromCloudinary,
} from "../config/cloudinary.js";

/**
 * Product Controller
 *
 * Handles all product-related business logic:
 * - Fetching products (public)
 * - Creating products (admin only)
 * - Updating products (admin only)
 * - Deleting products (admin only)
 */

// PUBLIC: GET PRODUCTS

/**
 * Get all active products
 */
export const getAllProducts = async (req, res) => {
  try {
    const { category } = req.query;

    let query = Product.find({ isActive: true }).populate(
      "category",
      "name slug icon",
    );

    // Filter by category if provided
    if (category) {
      const categoryDoc = await Category.findOne({ slug: category });
      if (categoryDoc) {
        query = query.where("category").equals(categoryDoc._id);
      } else {
        return res.status(404).json({
          success: false,
          message: `Category "${category}" not found`,
        });
      }
    }

    const products = await query.sort({ createdAt: -1 });

    res.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get all products error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};

/**
 * Get single product by ID
 */
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id).populate(
      "category",
      "name slug icon",
    );

    if (!product || !product.isActive) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Get product by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
    });
  }
};

/**
 * Get products by category slug
 */
export const getProductsByCategory = async (req, res) => {
  try {
    const { slug } = req.params;

    const products = await Product.findByCategorySlug(slug);

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No products found in category "${slug}"`,
      });
    }

    res.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Get products by category error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
    });
  }
};

// ADMIN: CREATE PRODUCT

/**
 * Create new product with image upload
 *
 */
export const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, stock } = req.body;

    // Validate required fields
    if (!name || price == null || price === "" || !category) {
      return res.status(400).json({
        success: false,
        message: "Name, price, and category are required",
      });
    }

    // Validate price is positive
    if (isNaN(price) || price < 0) {
      return res.status(400).json({
        success: false,
        message: "Price must be a positive number",
      });
    }

    // Verify category exists
    const categoryDoc = await Category.findById(category);
    if (!categoryDoc) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Upload image to Cloudinary if provided
    let imageData = { url: null, publicId: null };
    if (req.file) {
      try {
        imageData = await uploadImageToCloudinary(
          req.file.buffer,
          req.file.originalname,
        );
        console.log(`Image uploaded: ${imageData.url}`);
      } catch (uploadError) {
        return res.status(400).json({
          success: false,
          message: uploadError.message,
        });
      }
    }

    // Create product
    const product = new Product({
      name,
      description: description || "",
      price: parseFloat(price),
      category,
      stock: stock ? parseInt(stock) : 0,
      image: imageData,
      isActive: true,
    });

    await product.save();

    // Populate category before response
    await product.populate("category", "name slug icon");

    console.log(`Product created: ${product.name}`);

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      product,
    });
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create product",
    });
  }
};

// ADMIN: UPDATE PRODUCT

/**
 * Update existing product
 *
 */
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, category, stock } = req.body;

    // Find product
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Update basic fields
    if (name) product.name = name;
    if (description !== undefined) product.description = description;
    if (price !== undefined) {
      if (isNaN(price) || price < 0) {
        return res.status(400).json({
          success: false,
          message: "Price must be a positive number",
        });
      }
      product.price = parseFloat(price);
    }
    if (stock !== undefined) {
      const parsedStock = Number(stock);
      if (!Number.isInteger(parsedStock) || parsedStock < 0) {
        return res.status(400).json({
          success: false,
          message: "Stock must be a non-negative integer",
        });
      }
      product.stock = parsedStock;
    }

    // Verify category if provided
    if (category) {
      const categoryDoc = await Category.findById(category);
      if (!categoryDoc) {
        return res.status(404).json({
          success: false,
          message: "Category not found",
        });
      }
      product.category = category;
    }

    // Handle image update
    if (req.file) {
      try {
        // Delete old image from Cloudinary
        if (product.image.publicId) {
          await deleteImageFromCloudinary(product.image.publicId);
        }

        // Upload new image
        const newImageData = await uploadImageToCloudinary(
          req.file.buffer,
          req.file.originalname,
        );
        product.image = newImageData;
        console.log(`Product image updated: ${newImageData.url}`);
      } catch (uploadError) {
        return res.status(400).json({
          success: false,
          message: uploadError.message,
        });
      }
    }

    await product.save();
    await product.populate("category", "name slug icon");

    console.log(`Product updated: ${product.name}`);

    res.json({
      success: true,
      message: "Product updated successfully",
      product,
    });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update product",
    });
  }
};

// ADMIN: DELETE PRODUCT

/**
 * Delete product (soft delete + image removal)
 *
 */
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Delete image from Cloudinary
    if (product.image.publicId) {
      try {
        await deleteImageFromCloudinary(product.image.publicId);
      } catch (deleteError) {
        console.warn(`Failed to delete image: ${deleteError.message}`);
        // Don't fail product deletion if image deletion fails
      }
    }

    // Soft delete: set isActive to false
    product.isActive = false;
    await product.save();

    console.log(`Product deleted: ${product.name}`);

    res.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete product",
    });
  }
};

export default {
  getAllProducts,
  getProductById,
  getProductsByCategory,
  createProduct,
  updateProduct,
  deleteProduct,
};
