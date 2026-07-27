const express = require("express");

const router = express.Router();

const controller = require("../controllers/menuCategoryController");

// Create
router.post("/create", controller.createMenuCategory);

// Get All
router.get("/all", controller.getAllMenuCategories);

// Search
router.get("/search", controller.searchMenuCategory);

// Popular
router.get("/popular", controller.getPopularCategories);

// Parent Categories
router.get("/parent", controller.getParentCategories);

// Store Wise
router.get("/store/:storeId", controller.getStoreCategories);

// Kitchen Section
router.get("/kitchen/:section", controller.getKitchenSectionCategories);

// Get By ID
router.get("/:id", controller.getMenuCategoryById);

// Update
router.put("/:id", controller.updateMenuCategory);

// Delete
router.delete("/:id", controller.deleteMenuCategory);

// Restore
router.patch("/restore/:id", controller.restoreMenuCategory);

// Toggle Availability
router.patch("/:id/toggle-availability", controller.toggleAvailability);

// Toggle Active
router.patch("/:id/toggle-active", controller.toggleActiveStatus);

module.exports = router;
