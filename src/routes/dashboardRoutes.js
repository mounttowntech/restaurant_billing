const express = require("express");

const router = express.Router();

const dashboardController = require("../controllers/dashboardController");

const {
  verifyToken,
} = require("../middleware/auth");

// ============================================================
// DASHBOARD
// ============================================================

// Complete Dashboard
router.get(
  "/all",
  
  dashboardController.getDashboard
);

// ============================================================
// SALES
// ============================================================

// Sales Summary
router.get(
  "/sales-summary",
//   verifyToken,
  dashboardController.getSalesSummary
);

// Today's Sales
router.get(
  "/today-sales",
//   verifyToken,
  dashboardController.getTodaySales
);

// Today's Orders
router.get(
  "/today-orders",
//   verifyToken,
  dashboardController.getTodayOrders
);

// ============================================================
// PURCHASE
// ============================================================

// Today's Purchases
router.get(
  "/today-purchases",
//   verifyToken,
  dashboardController.getTodayPurchases
);

// ============================================================
// EXPENSE
// ============================================================

// Today's Expenses
router.get(
  "/today-expenses",
//   verifyToken,
  dashboardController.getTodayExpenses
);

// ============================================================
// INVENTORY
// ============================================================

// Low Stock
router.get(
  "/low-stock",
//   verifyToken,
  dashboardController.getLowStock
);

// ============================================================
// PRODUCTS
// ============================================================

// Top Products
router.get(
  "/top-products",
//   verifyToken,
  dashboardController.getTopProducts
);

// ============================================================
// ORDERS
// ============================================================

// Recent Orders
router.get(
  "/recent-orders",
//   verifyToken,
  dashboardController.getRecentOrders
);

// ============================================================
// CHARTS
// ============================================================

// Sales Trend
router.get(
  "/sales-trend",
//   verifyToken,
  dashboardController.getSalesTrend
);

module.exports = router;