const express = require("express");
const router = express.Router();

const {
  // ===============================
  // Part 1
  // ===============================
  createRecipe,
  getRecipes,
  getRecipeById,

  // ===============================
  // Part 2
  // ===============================
  updateRecipe,
  deleteRecipe,
  restoreRecipe,
  updateRecipeStatus,

  // ===============================
  // Part 3
  // ===============================
  searchRecipes,
  getRecipeSummary,
  getRecipeCostAnalysis,
  getRecipesByMenuItem,
  getRecipesByCategory,
  getRestaurantRecipes,
  getStoreRecipes,
  getTopProfitableRecipes,
  getLowestProfitRecipes,
  getRecipesByStatus,

} = require("../controllers/receipeController");

// =====================================================
// CRUD
// =====================================================

router.post("/create", createRecipe);

router.get("/all", getRecipes);

router.get("/:id", getRecipeById);

router.put("/:id", updateRecipe);

router.delete("/:id", deleteRecipe);

// =====================================================
// Restore
// =====================================================

router.patch("/:id/restore", restoreRecipe);

// =====================================================
// Status
// =====================================================

router.patch("/:id/status", updateRecipeStatus);

// =====================================================
// Search
// =====================================================

router.get("/search/list", searchRecipes);

// =====================================================
// Reports
// =====================================================

router.get("/reports/summary", getRecipeSummary);

router.get("/reports/cost-analysis", getRecipeCostAnalysis);

router.get("/reports/top-profit", getTopProfitableRecipes);

router.get("/reports/lowest-profit", getLowestProfitRecipes);

// =====================================================
// Menu Queries
// =====================================================

router.get("/menu/:menuItemId", getRecipesByMenuItem);

router.get("/category/:categoryId", getRecipesByCategory);

router.get("/restaurant/:restaurantId", getRestaurantRecipes);

router.get("/store/:storeId", getStoreRecipes);

router.get("/status/:status", getRecipesByStatus);

module.exports = router;