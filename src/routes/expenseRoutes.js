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
  
  expenseController.createExpense
);

// Get All Expenses
router.get(
  "/all",

  expenseController.getAllExpenses
);

// Get Expense By ID
router.get(
  "/:id",

  expenseController.getExpenseById
);

// Update Expense
router.put(
  "/update/:id",
  
  expenseController.updateExpense
);

// Delete Expense (Soft Delete)
router.delete(
  "/delete/:id",

  expenseController.deleteExpense
);

// Restore Expense
router.put(
  "/restore/:id",
 
  expenseController.restoreExpense
);

/* ==========================================================
   Payment APIs
========================================================== */

// Mark Paid
router.put(
  "/mark-paid/:id",
  
  expenseController.markPaid
);

// Cancel Expense
router.put(
  "/cancel/:id",
  
  expenseController.cancelExpense
);

/* ==========================================================
   Approval APIs
========================================================== */

// Approve Expense
router.put(
  "/approve/:id",
 
  expenseController.approveExpense
);

// Reject Expense
router.put(
  "/reject/:id",

  expenseController.rejectExpense
);

/* ==========================================================
   Reports APIs
========================================================== */

// Today's Expenses
router.get(
  "/reports/today",

  expenseController.getTodayExpenses
);

// Expense Summary
router.get(
  "/reports/summary",

  expenseController.getExpenseSummary
);

// Store Expenses
router.get(
  "/reports/store/:storeId",
 
  expenseController.getStoreExpenses
);

// Pending Approvals
router.get(
  "/reports/pending-approvals",
 
  expenseController.getPendingApprovals
);

// Category Wise Expense
router.get(
  "/reports/category-wise",

  expenseController.getCategoryWiseExpense
);

module.exports = router;