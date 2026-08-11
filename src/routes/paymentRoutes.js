const express = require("express");

const router =
  express.Router();

const paymentController =
  require("../controllers/paymentController");

const {
  verifyToken,
} = require("../middleware/auth");

/* ==========================================================
   NORMAL PAYMENT CRUD
========================================================== */

/*
   Create Payment
   POST /api/payment/create
*/

router.post(
  "/create",
  verifyToken,
  paymentController.createPayment
);

/*
   Get All Payments
   GET /api/payment/all
*/

router.get(
  "/all",
  verifyToken,
  paymentController.getPayments
);

/*
   Get Payment By ID
   GET /api/payment/:id
*/

router.get(
  "/:id",
  verifyToken,
  paymentController.getPaymentById
);

/*
   Update Payment
   PUT /api/payment/:id
*/

router.put(
  "/update/:id",
  verifyToken,
  paymentController.updatePayment
);

/*
   Delete Payment
   DELETE /api/payment/:id
*/

router.delete(
  "/delete/:id",
  verifyToken,
  paymentController.deletePayment
);

/* ==========================================================
   RESTORE
========================================================== */

/*
   PUT /api/payment/restore/:id
*/

router.put(
  "/restore/:id",
  verifyToken,
  paymentController.restorePayment
);

/* ==========================================================
   PAYMENT ACTIONS
========================================================== */

/*
   Mark Paid

   PUT /api/payment/mark-paid/:id
*/

router.put(
  "/mark-paid/:id",
  verifyToken,
  paymentController.markPaymentPaid
);

/*
   Refund

   PUT /api/payment/refund/:id
*/

router.put(
  "/refund/:id",
  verifyToken,
  paymentController.refundPayment
);

/*
   Cancel

   PUT /api/payment/cancel/:id
*/

router.put(
  "/cancel/:id",
  verifyToken,
  paymentController.cancelPayment
);

/* ==========================================================
   REPORTS
========================================================== */

/*
   Today's Collection

   GET /api/payment/reports/today
*/

router.get(
  "/reports/today",
  verifyToken,
  paymentController.todayCollection
);

/*
   Pending Payments

   GET /api/payment/reports/pending
*/

router.get(
  "/reports/pending",
  verifyToken,
  paymentController.pendingPayments
);

/*
   Payment Summary

   GET /api/payment/reports/summary
*/

router.get(
  "/reports/summary",
  verifyToken,
  paymentController.paymentSummary
);

/*
   Store Collection

   GET /api/payment/reports/store/:storeId
*/

router.get(
  "/reports/store/:storeId",
  verifyToken,
  paymentController.storeCollection
);

/* ==========================================================
   CASHFREE
========================================================== */

/*
   Create Cashfree Order

   POST /api/payment/cashfree/create-order
*/

router.post(
  "/cashfree/create-order",
  verifyToken,
  paymentController.createCashfreeOrder
);

/*
   Verify Cashfree Payment

   GET /api/payment/cashfree/verify/:orderId
*/

router.get(
  "/cashfree/verify/:orderId",
  verifyToken,
  paymentController.verifyCashfreePayment
);

/*
   Get Cashfree Order

   GET /api/payment/cashfree/order/:orderId
*/

router.get(
  "/cashfree/order/:orderId",
  verifyToken,
  paymentController.getCashfreeOrder
);

/*
   Get Cashfree Transactions

   GET /api/payment/cashfree/payments/:orderId
*/

router.get(
  "/cashfree/payments/:orderId",
  verifyToken,
  paymentController.getCashfreePayments
);

/* ==========================================================
   CASHFREE WEBHOOK
========================================================== */

/*
   IMPORTANT:
   No verifyToken here.

   Cashfree calls this endpoint directly.
*/

router.post(
  "/cashfree/webhook",
  paymentController.cashfreeWebhook
);

/* ==========================================================
   EXPORT
========================================================== */

module.exports = router;