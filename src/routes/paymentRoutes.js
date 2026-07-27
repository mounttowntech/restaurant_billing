const express = require("express");

const router = express.Router();

const paymentController = require("../controllers/paymentController");

// Authentication middleware
const { verifyToken } = require("../middleware/auth");

// Create Payment

router.post("/create", verifyToken, paymentController.createPayment);

// Get Payments

router.get("/all", verifyToken, paymentController.getPayments);

// Get Single Payment

router.get("/:id", verifyToken, paymentController.getPaymentById);

// Update

router.put("/:id", verifyToken, paymentController.updatePayment);

// Delete

router.delete("/:id", verifyToken, paymentController.deletePayment);

// Restore

router.put("/restore/:id", verifyToken, paymentController.restorePayment);

// Mark Paid

router.put("/mark-paid/:id", verifyToken, paymentController.markPaymentPaid);

// Refund

router.put("/refund/:id", verifyToken, paymentController.refundPayment);

// Cancel

router.put("/cancel/:id", verifyToken, paymentController.cancelPayment);

// Reports

router.get("/reports/today", verifyToken, paymentController.todayCollection);

router.get("/reports/pending", verifyToken, paymentController.pendingPayments);

router.get("/reports/summary", verifyToken, paymentController.paymentSummary);

router.get(
  "/reports/store/:storeId",
  verifyToken,
  paymentController.storeCollection,
);

// Cashfree

router.post(
  "/cashfree/create-order",
  verifyToken,
  paymentController.createCashfreeOrder,
);

router.get(
  "/cashfree/verify/:orderId",
  verifyToken,
  paymentController.verifyCashfreePayment,
);

// Webhook (No auth)

router.post("/cashfree/webhook", paymentController.cashfreeWebhook);

module.exports = router;
