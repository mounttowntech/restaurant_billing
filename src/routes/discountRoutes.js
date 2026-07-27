const express = require("express");
const router = express.Router();

const discountController = require("../controllers/discountController");
const { verifyToken } = require("../middleware/auth");

/* ==========================================================
   CRUD
========================================================== */

// Create Discount
router.post(
  "/create",
  verifyToken,
  discountController.createDiscount
);

// Get All Discounts
router.get(
  "/all",
  verifyToken,
  discountController.getAllDiscounts
);

// Get Active Discounts
router.get(
  "/active",
  verifyToken,
  discountController.getActiveDiscounts
);

// Get Applicable Discounts
router.get(
  "/applicable",
  verifyToken,
  discountController.getApplicableDiscounts
);

// Get Today's Discounts
router.get(
  "/today",
  verifyToken,
  discountController.getTodayDiscounts
);

// Category Discounts
router.get(
  "/category/:categoryId",
  verifyToken,
  discountController.getCategoryDiscounts
);

// Menu Item Discounts
router.get(
  "/menu/:menuItemId",
  verifyToken,
  discountController.getMenuDiscounts
);

// Get Discount By ID
router.get(
  "/:id",
  verifyToken,
  discountController.getDiscountById
);

// Update Discount
router.put(
  "/:id",
  verifyToken,
  discountController.updateDiscount
);

// Soft Delete Discount
router.delete(
  "/:id",
  verifyToken,
  discountController.deleteDiscount
);

// Restore Discount
router.put(
  "/restore/:id",
  verifyToken,
  discountController.restoreDiscount
);

// Activate Discount
router.put(
  "/activate/:id",
  verifyToken,
  discountController.activateDiscount
);

// Deactivate Discount
router.put(
  "/deactivate/:id",
  verifyToken,
  discountController.deactivateDiscount
);

// Calculate Discount
router.post(
  "/calculate",
  verifyToken,
  discountController.calculateDiscount
);

module.exports = router;