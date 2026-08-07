const express = require("express");

const router = express.Router();

const {
  createStore,
  getAllStores,
  getStoreById,
  updateStore,
  deleteStore,
  restoreStore,
  toggleStoreStatus,
} = require("../controllers/storeController");

// =====================================================
// STORE ROUTES
// =====================================================

// Create store
// No authentication required for initial setup
router.post(
  "/create",
  createStore
);

// Get all stores
router.get(
  "/all",
  getAllStores
);

// Get store by ID
router.get(
  "/:id",
  getStoreById
);

// Update store
router.put(
  "/update/:id",
  updateStore
);

// Delete store
router.delete(
  "/delete/:id",
  deleteStore
);

// Restore store
router.patch(
  "/restore/:id",
  restoreStore
);

// Toggle status
router.patch(
  "/toggle-status/:id",
  toggleStoreStatus
);

module.exports = router;