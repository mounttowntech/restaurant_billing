const express = require("express");

const router = express.Router();

const {verifyToken} = require("../middleware/auth");

const controller = require("../controllers/kitchenWasteController");

// ================================
// CRUD
// ================================

router.post("/create", verifyToken, controller.createKitchenWaste);

router.get("/all", verifyToken, controller.getKitchenWaste);

router.get("/:id", verifyToken, controller.getKitchenWasteById);

router.put("/:id", verifyToken, controller.updateKitchenWaste);

router.delete("/:id", verifyToken, controller.deleteKitchenWaste);

router.put("/:id/restore", verifyToken, controller.restoreKitchenWaste);

// ================================
// Approval Flow
// ================================

router.put("/:id/approve", verifyToken, controller.approveWaste);

router.put("/:id/reject", verifyToken, controller.rejectWaste);

router.put("/:id/complete", verifyToken, controller.completeWaste);

router.put("/:id/cancel", verifyToken, controller.cancelWaste);

// ================================
// Reports
// ================================

router.get("/reports/pending", verifyToken, controller.getPendingWaste);

router.get("/reports/approved", verifyToken, controller.getApprovedWaste);

router.get("/reports/today", verifyToken, controller.getTodayWaste);

router.get("/reports/summary", verifyToken, controller.getWasteSummary);

router.get(
  "/reports/category-wise",
  verifyToken,
  controller.getCategoryWiseWaste,
);

router.get("/reports/store-wise", verifyToken, controller.getStoreWaste);

module.exports = router;
