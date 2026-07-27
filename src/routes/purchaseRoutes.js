const express = require("express");

const router = express.Router();

const purchaseController = require("../controllers/purchaseController");

const { verifyToken } = require("../middleware/auth");

// Create

router.post("/create", verifyToken, purchaseController.createPurchase);

// Get All

router.get("/all", verifyToken, purchaseController.getPurchases);

// Search

router.get("/search", verifyToken, purchaseController.searchPurchase);

// Today Purchase

router.get("/today", verifyToken, purchaseController.todayPurchases);

// Summary

router.get("/summary", verifyToken, purchaseController.purchaseSummary);

// Supplier Wise

router.get(
  "/supplier/:supplierId",
  verifyToken,
  purchaseController.supplierWisePurchase,
);

// Store Wise

router.get("/store/:storeId", verifyToken, purchaseController.storeWisePurchase);

// Single

router.get("/:id", verifyToken, purchaseController.getPurchaseById);

// Update

router.put("/:id", verifyToken, purchaseController.updatePurchase);

// Delete

router.delete("/:id", verifyToken, purchaseController.deletePurchase);

// Restore

router.put("/restore/:id", verifyToken, purchaseController.restorePurchase);

// Receive

router.put("/receive/:id", verifyToken, purchaseController.receivePurchase);

// Cancel

router.put("/cancel/:id", verifyToken, purchaseController.cancelPurchase);

// Payment Update

router.put("/payment/:id", verifyToken, purchaseController.updatePaymentStatus);

module.exports = router;
