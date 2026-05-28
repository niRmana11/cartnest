import express from "express";
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from "../controllers/categoryController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import requireAdmin from "../middleware/adminMiddleware.js";

const router = express.Router();

router.get("/", getCategories);
router.post("/", verifyToken, requireAdmin, createCategory);
router.put("/:id", verifyToken, requireAdmin, updateCategory);
router.delete("/:id", verifyToken, requireAdmin, deleteCategory);

export default router;
