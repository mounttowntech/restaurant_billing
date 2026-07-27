const express = require("express");

const router = express.Router();

const {
  createMenuItem,
  getMenuItems,
  getMenuItemById,
  updateMenuItem,
  deleteMenuItem,
  restoreMenuItem,
  searchMenuItems,
  getCategoryWiseMenu,
  getAvailableMenuItems,
  updateAvailability,
  updateStatus,
} = require("../controllers/menuItemController");

// Create
router.post("/create", createMenuItem);

// Get All
router.get("/all", getMenuItems);

// Search
router.get("/search", searchMenuItems);

// Available Menu
router.get("/available", getAvailableMenuItems);

// Category Wise
router.get("/category/:categoryId", getCategoryWiseMenu);

// Get Single
router.get("/:id", getMenuItemById);

// Update
router.put("/:id", updateMenuItem);

// Delete
router.delete("/:id", deleteMenuItem);

// Restore
router.put("/restore/:id", restoreMenuItem);

// Availability
router.put("/availability/:id", updateAvailability);

// Status
router.put("/status/:id", updateStatus);

module.exports = router;
