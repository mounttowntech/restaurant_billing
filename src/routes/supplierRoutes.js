const express = require("express");

const router = express.Router();

const {
  // CRUD
  createSupplier,
  getSuppliers,
  getSupplierById,

  // Update & Status
  updateSupplier,
  deleteSupplier,
  restoreSupplier,
  activateSupplier,
  deactivateSupplier,
  updateSupplierStatus,
  markPreferredSupplier,
  removePreferredSupplier,

  // Reports
  searchSuppliers,
  getActiveSuppliers,
  getInactiveSuppliers,
  getDeletedSuppliers,
  getPreferredSuppliers,
  getSupplierByRestaurant,
  getSupplierByStore,
  getSupplierByType,
  getTopRatedSuppliers,
  getOutstandingSuppliers,
  getPaidSuppliers,
  getCreditLimitSuppliers,
  getPaymentTermSuppliers,
  getSupplierSummary,
  getSupplierAnalytics,

} = require("../controllers/supplierController");

// const { protect } = require("../middleware/auth");

/* ==========================================================
   CRUD
========================================================== */

router.post(
  "/create",
  // protect,
  createSupplier
);

router.get(
  "/all",
  // protect,
  getSuppliers
);

router.get(
  "/:id",
  // protect,
  getSupplierById
);

router.put(
  "/:id",
  // protect,
  updateSupplier
);

/* ==========================================================
   Status
========================================================== */

router.delete(
  "/:id",
  // protect,
  deleteSupplier
);

router.put(
  "/restore/:id",
  // protect,
  restoreSupplier
);

router.put(
  "/activate/:id",
  // protect,
  activateSupplier
);

router.put(
  "/deactivate/:id",
  // protect,
  deactivateSupplier
);

router.put(
  "/status/:id",
  // protect,
  updateSupplierStatus
);

router.put(
  "/preferred/:id",
  // protect,
  markPreferredSupplier
);

router.put(
  "/preferred/remove/:id",
  // protect,
  removePreferredSupplier
);

/* ==========================================================
   Reports
========================================================== */

router.get(
  "/reports/search",
  // protect,
  searchSuppliers
);

router.get(
  "/reports/active",
  // protect,
  getActiveSuppliers
);

router.get(
  "/reports/inactive",
  // protect,
  getInactiveSuppliers
);

router.get(
  "/reports/deleted",
  // protect,
  getDeletedSuppliers
);

router.get(
  "/reports/preferred",
  // protect,
  getPreferredSuppliers
);

router.get(
  "/restaurant/:restaurantId",
  // protect,
  getSupplierByRestaurant
);

router.get(
  "/store/:storeId",
  // protect,
  getSupplierByStore
);

router.get(
  "/type/:type",
  // protect,
  getSupplierByType
);

router.get(
  "/reports/top-rated",
  // protect,
  getTopRatedSuppliers
);

router.get(
  "/reports/outstanding",
  // protect,
  getOutstandingSuppliers
);

router.get(
  "/reports/paid",
  // protect,
  getPaidSuppliers
);

router.get(
  "/reports/credit-limit",
  // protect,
  getCreditLimitSuppliers
);

router.get(
  "/reports/payment-term/:term",
  // protect,
  getPaymentTermSuppliers
);

router.get(
  "/reports/summary",
  // protect,
  getSupplierSummary
);

router.get(
  "/reports/analytics",
  // protect,
  getSupplierAnalytics
);

module.exports = router;