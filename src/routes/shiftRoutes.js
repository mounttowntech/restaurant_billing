const express = require("express");

const router = express.Router();

const {
  // CRUD
  createShift,
  getShifts,
  getShiftById,

  // Update
  updateShift,
  deleteShift,
  restoreShift,
  updateShiftStatus,
  activateShift,
  deactivateShift,

  // Reports
  searchShifts,
  getActiveShifts,
  getInactiveShifts,
  getDeletedShifts,
  getNightShifts,
  getStoreShifts,
  getRoleShifts,
  getTodayShifts,
  getShiftSummary,
  getShiftAnalytics,

} = require("../controllers/shiftController");

// const { protect, authorize } = require("../middleware/auth");

/* ==========================================================
   CRUD
========================================================== */

router.post(
  "/create",
  // protect,
  createShift
);

router.get(
  "/all",
  // protect,
  getShifts
);

router.get(
  "/:id",
  // protect,
  getShiftById
);

/* ==========================================================
   Update
========================================================== */

router.put(
  "/:id",
  // protect,
  updateShift
);

router.delete(
  "/:id",
  // protect,
  deleteShift
);

router.put(
  "/restore/:id",
  // protect,
  restoreShift
);

router.patch(
  "/status/:id",
  // protect,
  updateShiftStatus
);

router.patch(
  "/activate/:id",
  // protect,
  activateShift
);

router.patch(
  "/deactivate/:id",
  // protect,
  deactivateShift
);

/* ==========================================================
   Search & Reports
========================================================== */

router.get(
  "/reports/search",
  // protect,
  searchShifts
);

router.get(
  "/reports/active",
  // protect,
  getActiveShifts
);

router.get(
  "/reports/inactive",
  // protect,
  getInactiveShifts
);

router.get(
  "/reports/deleted",
  // protect,
  getDeletedShifts
);

router.get(
  "/reports/night",
  // protect,
  getNightShifts
);

router.get(
  "/reports/today",
  // protect,
  getTodayShifts
);

router.get(
  "/reports/summary",
  // protect,
  getShiftSummary
);

router.get(
  "/reports/analytics",
  // protect,
  getShiftAnalytics
);

router.get(
  "/store/:storeId",
  // protect,
  getStoreShifts
);

router.get(
  "/role/:roleId",
  // protect,
  getRoleShifts
);

module.exports = router;