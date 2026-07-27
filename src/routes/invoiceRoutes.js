const express = require("express");

const router = express.Router();

const {verifyToken} = require("../middleware/auth");

const invoiceController = require("../controllers/invoiceController");

// Create
router.post("/create", verifyToken, invoiceController.createInvoice);

// Get All
router.get("/all", verifyToken, invoiceController.getInvoices);

// Get By ID
router.get("/:id", verifyToken, invoiceController.getInvoiceById);

// Update
router.put("/:id", verifyToken, invoiceController.updateInvoice);

// Delete
router.delete("/:id", verifyToken, invoiceController.deleteInvoice);

// Payment

router.put("/:id/mark-paid", verifyToken, invoiceController.markPaid);

// Cancel

router.put("/:id/cancel", verifyToken, invoiceController.cancelInvoice);

// Refund

router.put("/:id/refund", verifyToken, invoiceController.refundInvoice);

// Restore

router.put("/:id/restore", verifyToken, invoiceController.restoreInvoice);

// Reports

router.get(
  "/reports/today-sales",
  verifyToken,
  invoiceController.getTodaySales,
);

router.get(
  "/reports/pending",
  verifyToken,
  invoiceController.getPendingInvoices,
);

router.get(
  "/reports/daily-collection",
  verifyToken,
  invoiceController.getDailyCollection,
);

router.get(
  "/reports/store/:storeId",
  verifyToken,
  invoiceController.getStoreSales,
);

module.exports = router;
