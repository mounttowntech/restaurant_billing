const express = require("express");

const router = express.Router();

const {
  createPurchaseReturn,

  getPurchaseReturns,

  getPurchaseReturnById,

  updatePurchaseReturn,

  deletePurchaseReturn,

  restorePurchaseReturn,

  updateReturnStatus,

  getSupplierReturns,

  getStoreReturns,

  getPurchaseReturnSummary,
} = require("../controllers/purchaseReturnController");

const { verifyToken} = require("../middleware/auth");

// Create

router.post("/create", verifyToken, createPurchaseReturn);

// Get All

router.get("/all", verifyToken, getPurchaseReturns);

// Summary

router.get("/summary", verifyToken, getPurchaseReturnSummary);

// Supplier Wise

router.get("/supplier/:supplierId", verifyToken, getSupplierReturns);

// Store Wise

router.get("/store/:storeId", verifyToken, getStoreReturns);

// Single

router.get("/:id", verifyToken, getPurchaseReturnById);

// Update

router.put("/:id", verifyToken, updatePurchaseReturn);

// Update Status

router.patch("/:id/status", verifyToken, updateReturnStatus);

// Delete

router.delete("/:id", verifyToken, deletePurchaseReturn);

// Restore

router.patch("/:id/restore", verifyToken, restorePurchaseReturn);

module.exports = router;
