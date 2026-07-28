const express = require("express");

const router = express.Router();

const {
  // CRUD
  createStockLedger,
  getStockLedgers,
  getStockLedgerById,
  updateStockLedger,
  deleteStockLedger,

  // Reports
  searchStockLedgers,
  getPurchaseMovements,
  getUsageMovements,
  getWastageMovements,
  getAdjustmentInMovements,
  getAdjustmentOutMovements,
  getIngredientLedger,
  getTodayMovements,
  getReferenceLedger,
  getStockLedgerSummary,
  getStockLedgerAnalytics,

} = require("../controllers/stockLedgerController");

// const { protect } = require("../middleware/auth");

/* ==========================================================
   CRUD
========================================================== */

router.post(
  "/create",
  // protect,
  createStockLedger
);

router.get(
  "/all",
  // protect,
  getStockLedgers
);

router.get(
  "/:id",
  // protect,
  getStockLedgerById
);

// router.put(
//   "/:id",
//   // protect,
//   updateStockLedger
// );

// router.delete(
//   "/:id",
//   // protect,
//   deleteStockLedger
// );

/* ==========================================================
   Search & Reports
========================================================== */

router.get(
  "/reports/search",
  // protect,
  searchStockLedgers
);

router.get(
  "/reports/purchase",
  // protect,
  getPurchaseMovements
);

router.get(
  "/reports/usage",
  // protect,
  getUsageMovements
);

router.get(
  "/reports/wastage",
  // protect,
  getWastageMovements
);

router.get(
  "/reports/adjustment-in",
  // protect,
  getAdjustmentInMovements
);

router.get(
  "/reports/adjustment-out",
  // protect,
  getAdjustmentOutMovements
);

router.get(
  "/reports/today",
  // protect,
  getTodayMovements
);

router.get(
  "/reports/summary",
  // protect,
  getStockLedgerSummary
);

router.get(
  "/reports/analytics",
  // protect,
  getStockLedgerAnalytics
);

router.get(
  "/ingredient/:ingredientId",
  // protect,
  getIngredientLedger
);

router.get(
  "/reference/:referenceId",
  // protect,
  getReferenceLedger
);

module.exports = router;