const express = require("express");

const router = express.Router();

const {
  // CRUD
  createStockAdjustment,
  getStockAdjustments,
  getStockAdjustmentById,

  // Update
  updateStockAdjustment,
  deleteStockAdjustment,

  // Reports
  searchStockAdjustments,
  getIncreaseAdjustments,
  getDecreaseAdjustments,
  getIngredientAdjustments,
  getTodayAdjustments,
  getAdjustmentSummary,
  getAdjustmentAnalytics,

} = require("../controllers/stockAdjustmentController");

// const { protect } = require("../middleware/auth");

/* ==========================================================
   CRUD
========================================================== */

router.post(
  "/create",
  // protect,
  createStockAdjustment
);

router.get(
  "/all",
  // protect,
  getStockAdjustments
);

router.get(
  "/:id",
  // protect,
  getStockAdjustmentById
);

router.put(
  "/update/:id",
  // protect,
  updateStockAdjustment
);

router.delete(
  "/delete/:id",
  // protect,
  deleteStockAdjustment
);

/* ==========================================================
   Reports
========================================================== */

router.get(
  "/reports/search",
  // protect,
  searchStockAdjustments
);

router.get(
  "/reports/increase",
  // protect,
  getIncreaseAdjustments
);

router.get(
  "/reports/decrease",
  // protect,
  getDecreaseAdjustments
);

router.get(
  "/reports/today",
  // protect,
  getTodayAdjustments
);

router.get(
  "/reports/summary",
  // protect,
  getAdjustmentSummary
);

router.get(
  "/reports/analytics",
  // protect,
  getAdjustmentAnalytics
);

router.get(
  "/ingredient/:ingredientId",
  // protect,
  getIngredientAdjustments
);

module.exports = router;