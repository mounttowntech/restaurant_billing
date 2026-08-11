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
  "/restore/:id",
  // protect,
  addonController.restoreAddon
);

// =============================================
// Toggle Active
// =============================================

router.patch(
  "/toggle-active/:id",
  // protect,
  addonController.toggleActive
);

// =============================================
// Toggle Availability
// =============================================

router.patch(
  "/toggle-availability/:id",
  // protect,
  addonController.toggleAvailability
);

module.exports = router;