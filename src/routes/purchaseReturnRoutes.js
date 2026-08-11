const express = require("express");

const router = express.Router();

const purchaseReturnController = require("../controllers/purchaseReturnController");

// ==========================================================
// CREATE PURCHASE RETURN
// POST /api/purchase-returns
// ==========================================================

router.post(
  "/create",
  purchaseReturnController.createPurchaseReturn
);

// ==========================================================
// GET ALL PURCHASE RETURNS
// GET /api/purchase-returns
// ==========================================================

router.get(
  "/all",
  purchaseReturnController.getPurchaseReturns
);

// ==========================================================
// GET PURCHASE RETURN BY ID
// GET /api/purchase-returns/:id
// ==========================================================

router.get(
  "/:id",
  purchaseReturnController.getPurchaseReturnById
);

// ==========================================================
// CANCEL PURCHASE RETURN
// PATCH /api/purchase-returns/:id/cancel
// ==========================================================

router.patch(
  "/cancel/:id",
  purchaseReturnController.cancelPurchaseReturn
);

// ==========================================================
// UPDATE PAYMENT STATUS
// PATCH /api/purchase-returns/:id/payment-status
// ==========================================================

router.patch(
  "/payment-status/:id",
  purchaseReturnController.updatePaymentStatus
);

// ==========================================================
// DELETE PURCHASE RETURN
// DELETE /api/purchase-returns/:id
// ==========================================================

router.delete(
  "/delete/:id",
  purchaseReturnController.deletePurchaseReturn
);

module.exports = router;