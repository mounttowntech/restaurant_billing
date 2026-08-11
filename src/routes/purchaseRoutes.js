const express = require("express");

const router = express.Router();

const purchaseController = require("../controllers/purchaseController");

const {
  verifyToken,
} = require("../middleware/auth");

/* ==========================================================
   CREATE
========================================================== */

router.post(
  "/create",
  verifyToken,
  purchaseController.createPurchase
);

/* ==========================================================
   GET ALL
========================================================== */

router.get(
  "/all",
  verifyToken,
  purchaseController.getPurchases
);

/* ==========================================================
   SEARCH
========================================================== */

router.get(
  "/search",
  verifyToken,
  purchaseController.searchPurchase
);

/* ==========================================================
   TODAY
========================================================== */

router.get(
  "/today",
  verifyToken,
  purchaseController.todayPurchases
);

/* ==========================================================
   SUMMARY
========================================================== */

router.get(
  "/summary",
  verifyToken,
  purchaseController.purchaseSummary
);

/* ==========================================================
   SUPPLIER WISE
========================================================== */

router.get(
  "/supplier/:supplierId",
  verifyToken,
  purchaseController.supplierWisePurchase
);

/* ==========================================================
   STORE WISE
========================================================== */

router.get(
  "/store/:storeId",
  verifyToken,
  purchaseController.storeWisePurchase
);

/* ==========================================================
   RESTORE
========================================================== */

router.put(
  "/restore/:id",
  verifyToken,
  purchaseController.restorePurchase
);

/* ==========================================================
   RECEIVE
========================================================== */

router.put(
  "/receive/:id",
  verifyToken,
  purchaseController.receivePurchase
);

/* ==========================================================
   CANCEL
========================================================== */

router.put(
  "/cancel/:id",
  verifyToken,
  purchaseController.cancelPurchase
);

/* ==========================================================
   PAYMENT
========================================================== */

router.put(
  "/payment/:id",
  verifyToken,
  purchaseController.updatePaymentStatus
);

/* ==========================================================
   SINGLE
========================================================== */

router.get(
  "/:id",
  verifyToken,
  purchaseController.getPurchaseById
);

/* ==========================================================
   UPDATE
========================================================== */

router.put(
  "/update/:id",
  verifyToken,
  purchaseController.updatePurchase
);

/* ==========================================================
   DELETE
========================================================== */

router.delete(
  "/delete/:id",
  verifyToken,
  purchaseController.deletePurchase
);

module.exports = router;