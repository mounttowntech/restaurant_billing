const express = require("express");
const router = express.Router();

const expenseController = require("../controllers/expenseController");
const { verifyToken } = require("../middleware/auth");

/* ==========================================================
   CRUD APIs
========================================================== */

// Create Expense
router.post(
  "/create",
  verifyToken,
  expenseController.createExpense
);

// Get All Expenses
router.get(
  "/all",
  verifyToken,
  expenseController.getAllExpenses
);

// Get Expense By ID
router.get(
  "/:id",
  verifyToken,
  expenseController.getExpenseById
);

// Update Expense
router.put(
  "/:id",
  verifyToken,
  expenseController.updateExpense
);

// Delete Expense (Soft Delete)
router.delete(
  "/:id",
  verifyToken,
  expenseController.deleteExpense
);

// Restore Expense
router.put(
  "/restore/:id",
  verifyToken,
  expenseController.restoreExpense
);

/* ==========================================================
   Payment APIs
========================================================== */

// Mark Paid
router.put(
  "/mark-paid/:id",
  verifyToken,
  expenseController.markPaid
);

// Cancel Expense
router.put(
  "/cancel/:id",
  verifyToken,
  expenseController.cancelExpense
);

/* ==========================================================
   Approval APIs
========================================================== */

// Approve Expense
router.put(
  "/approve/:id",
  verifyToken,
  expenseController.approveExpense
);

// Reject Expense
router.put(
  "/reject/:id",
  verifyToken,
  expenseController.rejectExpense
);

/* ==========================================================
   Reports APIs
========================================================== */

// Today's Expenses
router.get(
  "/reports/today",
  verifyToken,
  expenseController.getTodayExpenses
);

// Expense Summary
router.get(
  "/reports/summary",
  verifyToken,
  expenseController.getExpenseSummary
);

// Store Expenses
router.get(
  "/reports/store/:storeId",
  verifyToken,
  expenseController.getStoreExpenses
);

// Pending Approvals
router.get(
  "/reports/pending-approvals",
  verifyToken,
  expenseController.getPendingApprovals
);

// Category Wise Expense
router.get(
  "/reports/category-wise",
  verifyToken,
  expenseController.getCategoryWiseExpense
);

module.exports = router;