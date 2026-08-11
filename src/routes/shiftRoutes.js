
const express = require("express");

const router = express.Router();

const {
  createShift,
  getAllShifts,
  getShiftById,
  updateShift,
  deleteShift,
  restoreShift,
  updateShiftStatus,
  getActiveShifts,
  getShiftWaiters,
} = require("../controllers/shiftController");

// If authentication is available:
//
// const {
//   verifyToken,
//   allowRoles,
// } = require("../middleware/auth");

// ============================================================
// CREATE SHIFT
// ============================================================

router.post(
  "/create",
  // verifyToken,
  // allowRoles("admin", "manager"),
  createShift
);

// ============================================================
// GET ALL SHIFTS
// ============================================================

router.get(
  "/all",
  // verifyToken,
  getAllShifts
);

// ============================================================
// GET ACTIVE SHIFTS
// IMPORTANT: Before /:id
// ============================================================

router.get(
  "/active/:id",
  // verifyToken,
  getActiveShifts
);

// ============================================================
// GET WAITERS OF A SHIFT
// IMPORTANT: Before /:id
// ============================================================

router.get(
  "/waiters/:id",
  // verifyToken,
  getShiftWaiters
);

// ============================================================
// GET SHIFT BY ID
// ============================================================

router.get(
  "/:id",
  // verifyToken,
  getShiftById
);

// ============================================================
// UPDATE SHIFT
// ============================================================

router.put(
  "/update/:id",
  // verifyToken,
  // allowRoles("admin", "manager"),
  updateShift
);

// ============================================================
// DELETE SHIFT
// ============================================================

router.delete(
  "/delete/:id",
  // verifyToken,
  // allowRoles("admin", "manager"),
  deleteShift
);

// ============================================================
// RESTORE SHIFT
// ============================================================

router.patch(
  "/restore/:id",
  // verifyToken,
  // allowRoles("admin", "manager"),
  restoreShift
);

// ============================================================
// UPDATE SHIFT STATUS
// ============================================================

router.patch(
  "/status/:id",
  // verifyToken,
  // allowRoles("admin", "manager"),
  updateShiftStatus
);

module.exports = router;

