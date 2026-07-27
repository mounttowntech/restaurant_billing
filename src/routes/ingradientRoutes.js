const express = require("express");
const router = express.Router();

const ingredientController = require("../controllers/ingradientController");
const { verifyToken } = require("../middleware/auth");

/* ==========================================================
   CRUD APIs
========================================================== */

// Create Ingredient
router.post(
  "/create",
  verifyToken,
  ingredientController.createIngredient
);

// Get All Ingredients
router.get(
  "/all",
  verifyToken,
  ingredientController.getAllIngredients
);

// Get Available Ingredients
router.get(
  "/available",
  verifyToken,
  ingredientController.getAvailableIngredients
);

// Get Low Stock Ingredients
router.get(
  "/low-stock",
  verifyToken,
  ingredientController.getLowStockIngredients
);

// Get Out Of Stock Ingredients
router.get(
  "/out-of-stock",
  verifyToken,
  ingredientController.getOutOfStockIngredients
);

// Stock Summary
router.get(
  "/stock-summary",
  verifyToken,
  ingredientController.getStockSummary
);

// Category Ingredients
router.get(
  "/category/:categoryId",
  verifyToken,
  ingredientController.getCategoryIngredients
);

// Supplier Ingredients
router.get(
  "/supplier/:supplierId",
  verifyToken,
  ingredientController.getSupplierIngredients
);

// Veg Ingredients
router.get(
  "/veg",
  verifyToken,
  ingredientController.getVegIngredients
);

// Get Ingredient By ID
router.get(
  "/:id",
  verifyToken,
  ingredientController.getIngredientById
);

// Update Ingredient
router.put(
  "/:id",
  verifyToken,
  ingredientController.updateIngredient
);

// Delete Ingredient
router.delete(
  "/:id",
  verifyToken,
  ingredientController.deleteIngredient
);

// Restore Ingredient
router.put(
  "/restore/:id",
  verifyToken,
  ingredientController.restoreIngredient
);

// Activate Ingredient
router.put(
  "/activate/:id",
  verifyToken,
  ingredientController.activateIngredient
);

// Deactivate Ingredient
router.put(
  "/deactivate/:id",
  verifyToken,
  ingredientController.deactivateIngredient
);

module.exports = router;