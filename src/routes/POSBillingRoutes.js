const express = require("express");

const router = express.Router();

const {
  createPOSBill,
  getPOSBills,
  getPOSBillById,

  holdBill,
  resumeBill,

  applyDiscount,
  applyCoupon,

  calculateTax,

  makePayment,

  printBill,

  cancelBill,
} = require("../controllers/posBillingController");

// ==================================================
// POS BILLING
// ==================================================

// Create POS Bill
router.post("/create", createPOSBill);

// Get all bills
router.get("/all", getPOSBills);

// Get bill by ID
router.get("/:id", getPOSBillById);

// Hold bill
router.patch("/hold/:id", holdBill);

// Resume bill
router.patch("/resume/:id", resumeBill);

// Apply discount
router.patch("/discount/:id", applyDiscount);

// Apply coupon
router.patch("/coupon/:id", applyCoupon);

// Calculate tax
router.patch("/tax/:id", calculateTax);

// Payment
router.post("/payment/:id", makePayment);

// Print bill
router.get("/print/:id", printBill);

// Cancel bill
router.patch("/cancel/:id", cancelBill);

module.exports = router;