const express = require("express");
const router = express.Router();

const ingredientStockLedgerController = require("../controllers/ingredientStockController");
const { verifyToken } = require("../middleware/auth");

/* ==========================================================
   CRUD APIs
========================================================== */

// Create Ledger
router.post(
  "/create",
  verifyToken,  ingredientStockLedgerController.createIngredientStockLedger,
);

// Get All Ledgers
router.get(
  "/all",
  verifyToken,  ingredientStockLedgerController.getAllIngredientStockLedgers,
);

/* ==========================================================
   History APIs
========================================================== */

// Ingredient History
router.get(
  "/ingredient/:ingredientId",
  verifyToken,
  ingredientStockLedgerController.getIngredientLedgerHistory,
);

// Store Ledger
router.get(
  "/store/:storeId",
  verifyToken,
  ingredientStockLedgerController.getStoreLedger,
);

// Warehouse Ledger
router.get(
  "/warehouse/:warehouseId",
  verifyToken,
  ingredientStockLedgerController.getWarehouseLedger,
);

// Transaction Type
router.get(
  "/transaction/:transactionType",
  verifyToken,
  ingredientStockLedgerController.getTransactionTypeLedger,
);

/* ==========================================================
   Reports
========================================================== */

// Stock In Report
router.get(
  "/reports/stock-in",
  verifyToken,
  ingredientStockLedgerController.getStockInReport,
);

// Stock Out Report
router.get(
  "/reports/stock-out",
  verifyToken,
  ingredientStockLedgerController.getStockOutReport,
);

// Today's Transactions
router.get(
  "/reports/today",
  verifyToken,
  ingredientStockLedgerController.getTodayTransactions,
);

// Stock Summary
router.get(
  "/reports/summary",
  verifyToken,
  ingredientStockLedgerController.getStockSummary,
);

// Get Ledger By ID
router.get(
  "/:id",
  verifyToken,
  ingredientStockLedgerController.getIngredientStockLedgerById,
);

// Update Ledger
router.put(
  "/:id",
  verifyToken,
  ingredientStockLedgerController.updateIngredientStockLedger,
);

// Soft Delete
router.delete(
  "/:id",
  verifyToken,
  ingredientStockLedgerController.deleteIngredientStockLedger,
);

// Restore
router.put(
  "/restore/:id",
  verifyToken,
  ingredientStockLedgerController.restoreIngredientStockLedger,
);

module.exports = router;
