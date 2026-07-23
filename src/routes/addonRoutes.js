const express = require("express");

const router = express.Router();

const addonController = require("../controllers/addonController");

// Authentication middleware (if available)
// const { protect } = require("../middleware/authMiddleware");

// =============================================
// Create Addon
// =============================================

router.post(
  "/create",
  // protect,
  addonController.createAddon
);

// =============================================
// Get All Addons
// =============================================

router.get(
  "/all",
  // protect,
  addonController.getAllAddons
);

// =============================================
// Get Single Addon
// =============================================

router.get(
  "/:id",
  // protect,
  addonController.getAddonById
);

// =============================================
// Update Addon
// =============================================

router.put(
  "/update/:id",
  // protect,
  addonController.updateAddon
);

// =============================================
// Soft Delete
// =============================================

router.delete(
  "/delete/:id",
  // protect,
  addonController.deleteAddon
);

// =============================================
// Restore
// =============================================

router.patch(
  "/:id/restore",
  // protect,
  addonController.restoreAddon
);

// =============================================
// Toggle Active
// =============================================

router.patch(
  "/:id/toggle-active",
  // protect,
  addonController.toggleActive
);

// =============================================
// Toggle Availability
// =============================================

router.patch(
  "/:id/toggle-availability",
  // protect,
  addonController.toggleAvailability
);

module.exports = router;