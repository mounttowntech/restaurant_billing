const express = require("express");

const router = express.Router();

const comboMealController = require("../controllers/comboMealController");

const { verifyToken } = require("../middleware/auth");

// =====================================================
// Create Combo
// =====================================================

router.post(
  "/create",
  verifyToken,
  comboMealController.createCombo
);

// =====================================================
// Get All Combos
// =====================================================

router.get(
  "/all",
  verifyToken,
  comboMealController.getCombos
);

// =====================================================
// Get Single Combo
// =====================================================

router.get(
  "/:id",
  verifyToken,
  comboMealController.getCombo
);

// =====================================================
// Update Combo
// =====================================================

router.put(
  "/update/:id",
  verifyToken,
  comboMealController.updateCombo
);

// =====================================================
// Delete Combo
// =====================================================

router.delete(
  "/delete/:id",
  verifyToken,
  comboMealController.deleteCombo
);

// =====================================================
// Restore Combo
// =====================================================

router.patch(
  "/restore/:id",
  verifyToken,
  comboMealController.restoreCombo
);

// =====================================================
// Toggle Availability
// =====================================================

router.patch(
  "/toggle-availability/:id",
  verifyToken,
  comboMealController.toggleAvailability
);

// =====================================================
// Toggle Active
// =====================================================

router.patch(
  "/:id/toggle-active",
  verifyToken,
  comboMealController.toggleActive
);

module.exports = router;