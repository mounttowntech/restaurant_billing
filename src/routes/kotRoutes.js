const express = require("express");

const router = express.Router();

const kotController = require("../controllers/kotController");

// Create
router.post("/create", kotController.createKOT);

// Get All
router.get("/all", kotController.getAllKOT);

// Search
router.get("/search", kotController.searchKOT);

// Kitchen Queue
router.get("/kitchen-queue", kotController.getKitchenQueue);

// Pending
router.get("/pending", kotController.getPendingKOTs);

// Today
router.get("/today", kotController.getTodayKOTs);

// Chef Orders
router.get("/chef/:chefId", kotController.getChefOrders);

// Get By ID
router.get("/:id", kotController.getKOTById);

// Update
router.put("/:id", kotController.updateKOT);

// Delete
router.delete("/:id", kotController.deleteKOT);

// Restore
router.patch("/restore/:id", kotController.restoreKOT);

// Status Actions

router.patch("/:id/preparing", kotController.markPreparing);

router.patch("/:id/ready", kotController.markReady);

router.patch("/:id/served", kotController.markServed);

router.patch("/:id/printed", kotController.markPrinted);

module.exports = router;
