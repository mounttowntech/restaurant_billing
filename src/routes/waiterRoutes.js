const express = require("express");

const router = express.Router();

const {
  createWaiter,
  getAllWaiters,
  getWaiterById,
  updateWaiter,
  deleteWaiter,
  restoreWaiter,
  updateWaiterStatus,
  updateWaiterAvailability,
  assignTablesToWaiter,
  getAvailableWaiters,
  getWaiterStatistics,
  getWaiterOrders,
} = require("../controllers/waiterController");

// If you have authentication middleware:
// const { verifyToken, allowRoles } = require("../middleware/auth");

// ============================================================
// WAITER CRUD
// ============================================================

// Create waiter
router.post(
  "/create",
  // verifyToken,
  // allowRoles("admin", "manager"),
  createWaiter
);

// Get all waiters
router.get(
  "/all",
  // verifyToken,
  getAllWaiters
);

// Get available waiters
// IMPORTANT: Keep this BEFORE /:id
router.get(
  "/available",
  // verifyToken,
  getAvailableWaiters
);

// Get waiter statistics
// IMPORTANT: Keep this BEFORE /:id
router.get(
  "/statistics/:id",
  // verifyToken,
  getWaiterStatistics
);

// Get waiter orders
// IMPORTANT: Keep this BEFORE generic /:id
router.get(
  "/orders/:id",
  // verifyToken,
  getWaiterOrders
);

// Get waiter by ID
router.get(
  "/:id",
  // verifyToken,
  getWaiterById
);

// Update waiter
router.put(
  "/update/:id",
  // verifyToken,
  // allowRoles("admin", "manager"),
  updateWaiter
);

// Soft delete waiter
router.delete(
  "/delete/:id",
  // verifyToken,
  // allowRoles("admin", "manager"),
  deleteWaiter
);

// Restore waiter
router.patch(
  "/restore/:id",
  // verifyToken,
  // allowRoles("admin", "manager"),
  restoreWaiter
);

// Update waiter status
router.patch(
  "/status/:id",
  // verifyToken,
  // allowRoles("admin", "manager"),
  updateWaiterStatus
);

// Update availability
router.patch(
  "/availability/:id",
  // verifyToken,
  updateWaiterAvailability
);

// Assign tables
router.patch(
  "/tables/:id",
  // verifyToken,
  // allowRoles("admin", "manager"),
  assignTablesToWaiter
);

module.exports = router;

