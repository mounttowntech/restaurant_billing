const express = require("express");
const router = express.Router();

const {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  changeCategoryStatus,
  getParentCategories,
  getCategoryDropdown,
} = require("../controllers/categoryController");

const { verifyToken } = require("../middleware/auth");

// Create
router.post("/create", verifyToken, createCategory);

// Get All
router.get("/all", verifyToken, getAllCategories);

// Parent Categories
router.get("/parents", verifyToken, getParentCategories);

// Dropdown
router.get("/dropdown/list", verifyToken, getCategoryDropdown);

// Get By Id
router.get("/:id", verifyToken, getCategoryById);

// Update
router.put("/update/:id", verifyToken, updateCategory);

// Delete
router.delete("/delete/:id", verifyToken, deleteCategory);

// Status Change
router.patch("/:id/status", verifyToken, changeCategoryStatus);

module.exports = router;