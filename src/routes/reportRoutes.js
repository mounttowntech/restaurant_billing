const express = require("express");

const router = express.Router();

const reportController = require("../controllers/reportController");

const {
  verifyToken,
  allowRoles,
} = require("../middleware/auth");


// ============================================================
// 27 REPORTS
// ============================================================


// ============================================================
// 1. SALES REPORT
// ============================================================

router.get(
  "/sales",
//   verifyToken,
//   allowRoles(
//     "Super Admin",
//     "Admin",
//     "Manager"
//   ),
  reportController.getSalesReport
);


// ============================================================
// 2. PURCHASE REPORT
// ============================================================

router.get(
  "/purchase",
//   verifyToken,
//   allowRoles(
//     "Super Admin",
//     "Admin",
//     "Manager"
//   ),
  reportController.getPurchaseReport
);


// ============================================================
// 3. EXPENSE REPORT
// ============================================================

router.get(
  "/expense",
//   verifyToken,
//   allowRoles(
//     "Super Admin",
//     "Admin",
//     "Manager"
//   ),
  reportController.getExpenseReport
);


// ============================================================
// 4. STOCK REPORT
// ============================================================

router.get(
  "/stock",
//   verifyToken,
//   allowRoles(
//     "Super Admin",
//     "Admin",
//     "Manager"
//   ),
  reportController.getStockReport
);


// ============================================================
// 5. TAX REPORT
// ============================================================

router.get(
  "/tax",
//   verifyToken,
//   allowRoles(
//     "Super Admin",
//     "Admin",
//     "Manager"
//   ),
  reportController.getTaxReport
);


// ============================================================
// 6. PAYMENT REPORT
// ============================================================

router.get(
  "/payment",
//   verifyToken,
//   allowRoles(
//     "Super Admin",
//     "Admin",
//     "Manager"
//   ),
  reportController.getPaymentReport
);


// ============================================================
// 7. PRODUCT REPORT
// ============================================================

router.get(
  "/product",
//   verifyToken,
//   allowRoles(
//     "Super Admin",
//     "Admin",
//     "Manager"
//   ),
  reportController.getProductReport
);


// ============================================================
// 8. PROFIT & LOSS
// ============================================================

router.get(
  "/profit-loss",
//   verifyToken,
//   allowRoles(
//     "Super Admin",
//     "Admin",
//     "Manager"
//   ),
  reportController.getProfitLossReport
);


module.exports = router;