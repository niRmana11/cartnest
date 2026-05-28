import dotenv from "dotenv";
dotenv.config();

import { v2 as cloudinary } from "cloudinary";

// Reconfigure Cloudinary after dotenv loads env vars
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

import mongoose from "mongoose";
import Category from "../models/Category.js";
import Product from "../models/Product.js";
import { uploadImageFromUrl } from "../config/cloudinary.js";

/**
 * Database Seeding Script
 *
 * Populates MongoDB with sample data:
 * - 4 Categories (Vegetables, Fruits, Cakes, Biscuits)
 * - 8 Products (2 per category)
 *
 * Usage:
 *   npm run seed
 *
 * Always deletes existing data before seeding (fresh start)
 */

const SAMPLE_PRODUCTS = [
  // ===== VEGETABLES (2) =====
  {
    name: "Fresh Carrot",
    description:
      "Organic orange carrots, fresh from the farm. Rich in beta-carotene and vitamins.",
    price: 45,
    categorySlug: "vegetables",
    stock: 50,
    imageUrl:
      "https://images.unsplash.com/photo-1633380110125-f6e685676160?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?auto=format&fit=crop&w=400&q=80", // Carrot image placeholder
  },
  {
    name: "Spinach Bunch",
    description:
      "Fresh green spinach leaves. Perfect for salads and cooking. High in iron and nutrients.",
    price: 55,
    categorySlug: "vegetables",
    stock: 35,
    imageUrl:
      "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=400&q=80", // Spinach image placeholder
  },

  // ===== FRUITS (2) =====
  {
    name: "Red Apple",
    description:
      "Crisp and sweet red apples. Great source of fiber and vitamin C.",
    price: 60,
    categorySlug: "fruits",
    stock: 40,
    imageUrl:
      "https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?auto=format&fit=crop&w=400&q=80", // Apple image placeholder
  },
  {
    name: "Yellow Banana",
    description:
      "Ripe yellow bananas. Perfect for eating fresh or baking. Rich in potassium.",
    price: 50,
    categorySlug: "fruits",
    stock: 60,
    imageUrl:
      "https://images.unsplash.com/photo-1603833665858-e61d17a86224?auto=format&fit=crop&w=400&q=80", // Banana image placeholder
  },

  // ===== CAKES (2) =====
  {
    name: "Chocolate Cake",
    description:
      "Rich and moist chocolate cake with chocolate frosting. Serves 8-10 people.",
    price: 750,
    categorySlug: "cakes",
    stock: 12,
    imageUrl:
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&q=80", // Chocolate cake placeholder
  },
  {
    name: "Vanilla Cake",
    description:
      "Classic vanilla cake with smooth vanilla frosting. Light and fluffy. Serves 8-10 people.",
    price: 650,
    categorySlug: "cakes",
    stock: 15,
    imageUrl:
      "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=400&q=80", // Vanilla cake placeholder
  },

  // ===== BISCUITS (2) =====
  {
    name: "Chocolate Chip Cookies",
    description:
      "Delicious homemade chocolate chip cookies. Chewy texture with melted chocolate chips. Pack of 12.",
    price: 280,
    categorySlug: "biscuits",
    stock: 30,
    imageUrl:
      "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=400&q=80", // Chocolate chip cookies placeholder
  },
  {
    name: "Digestive Biscuits",
    description:
      "Traditional digestive biscuits. Perfect for tea time. Pack of 20 biscuits.",
    price: 150,
    categorySlug: "biscuits",
    stock: 50,
    imageUrl:
      "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=400&q=80", // Digestive biscuits placeholder
  },
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB connected");

    // ===== STEP 1: Delete existing data =====
    console.log("\nDeleting existing products...");
    await Product.deleteMany({});
    console.log("Products deleted");

    // ===== STEP 2: Upload images to Cloudinary =====
    console.log("\n Uploading product images to Cloudinary...");
    const productsWithImages = [];

    for (const product of SAMPLE_PRODUCTS) {
      try {
        // Upload image to Cloudinary
        const { url, publicId } = await uploadImageFromUrl(
          product.imageUrl,
          product.name.replace(/\s+/g, "-").toLowerCase(),
        );

        // Add uploaded image to product
        productsWithImages.push({
          ...product,
          image: {
            url,
            publicId,
          },
        });

        console.log(`  Uploaded: ${product.name}`);
      } catch (imageError) {
        console.warn(
          `  Failed to upload ${product.name}, using placeholder URL`,
          imageError.message,
        );
        // If upload fails, still add product with URL (will try to load from URL)
        productsWithImages.push({
          ...product,
          image: {
            url: product.imageUrl,
            publicId: null,
          },
        });
      }
    }

    // ===== STEP 3: Get category references =====
    console.log("\n Linking products to categories...");
    const categorySlugs = [
      ...new Set(SAMPLE_PRODUCTS.map((p) => p.categorySlug)),
    ];

    for (const product of productsWithImages) {
      // Find category by slug
      const category = await Category.findOne({ slug: product.categorySlug });

      if (!category) {
        throw new Error(
          `Category with slug '${product.categorySlug}' not found`,
        );
      }

      // Link category reference
      product.category = category._id;
      delete product.categorySlug; // Remove slug field, use reference instead
    }

    // ===== STEP 4: Create products =====
    console.log("\n🛒 Creating products...");
    for (const product of productsWithImages) {
      const newProduct = new Product(product);
      await newProduct.save();
      console.log(`  Created: ${newProduct.name} (Rs. ${newProduct.price})`);
    }

    // ===== STEP 5: Verify seeding =====
    const productCount = await Product.countDocuments();
    console.log(`\nSeeding complete! ${productCount} products created.`);

    // Show summary by category
    const categories = await Category.find();
    for (const category of categories) {
      const count = await Product.countDocuments({ category: category._id });
      console.log(`   • ${category.name}: ${count} products`);
    }

    await mongoose.connection.close();
    console.log("\nDatabase connection closed");
  } catch (error) {
    console.error("Seeding failed:", error.message);
    process.exit(1);
  }
}

// Run seeding
seedDatabase();
