import dotenv from "dotenv";
dotenv.config();

import Category from "../models/Category.js";
import { connectDB } from "../config/db.js";

/**
 * Database Seed Script
 *
 * Populates MongoDB with sample categories (Vegetables, Fruits, Cakes, Biscuits)
 *
 * Run with: npm run seed
 */

const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seed...");

    // Connect to MongoDB
    await connectDB();

    // Delete existing categories (always reseed)
    const existingCount = await Category.countDocuments();
    if (existingCount > 0) {
      await Category.deleteMany({});
      console.log(`🗑️ Deleted ${existingCount} existing categories`);
    }

    // Sample categories for CartNest
    const categories = [
      {
        name: "Vegetables",
        icon: "🥬",
      },
      {
        name: "Fruits",
        icon: "🍎",
      },
      {
        name: "Cakes",
        icon: "🎂",
      },
      {
        name: "Biscuits",
        icon: "🍪",
      },
    ];

    // Insert categories (save individually to trigger pre-save hooks)
    const createdCategories = [];
    for (const categoryData of categories) {
      const category = new Category(categoryData);
      await category.save();
      createdCategories.push(category);
    }

    console.log("✅ Seed completed successfully!");
    console.log(`📦 Created ${createdCategories.length} categories:`);
    createdCategories.forEach((cat) => {
      console.log(`   - ${cat.icon} ${cat.name} (slug: ${cat.slug})`);
    });

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error.message);
    process.exit(1);
  }
};

// Run the seed
seedDatabase();
