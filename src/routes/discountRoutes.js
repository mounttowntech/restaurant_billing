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

  discountController.createDiscount
);

// Get All Discounts
router.get(
  "/all",
  
  discountController.getAllDiscounts
);

// Get Active Discounts
router.get(
  "/active",
  
  discountController.getActiveDiscounts
);

// Get Applicable Discounts
router.get(
  "/applicable",
 
  discountController.getApplicableDiscounts
);

// Get Today's Discounts
router.get(
  "/today",

  discountController.getTodayDiscounts
);

// Category Discounts
router.get(
  "/category/:categoryId",

  discountController.getCategoryDiscounts
);

// Menu Item Discounts
router.get(
  "/menu/:menuItemId",

  discountController.getMenuDiscounts
);

// Get Discount By ID
router.get(
  "/:id",
  
  discountController.getDiscountById
);

// Update Discount
router.put(
  "/update/:id",
  
  discountController.updateDiscount
);

// Soft Delete Discount
router.delete(
  "/delete/:id",
   discountController.deleteDiscount
);

// Restore Discount
router.put(
  "/restore/:id",

  discountController.restoreDiscount
);

// Activate Discount
router.put(
  "/activate/:id",
  
  discountController.activateDiscount
);

// Deactivate Discount
router.put(
  "/deactivate/:id",

  discountController.deactivateDiscount
);

// Calculate Discount
router.post(
  "/calculate",
 
  discountController.calculateDiscount
);

module.exports = router;