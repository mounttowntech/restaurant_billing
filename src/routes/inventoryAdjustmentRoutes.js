const express = require("express");

const router = express.Router();


// Middleware
const {verifyToken} = require("../middleware/auth");


// Controller
const inventoryAdjustmentController =
    require("../controllers/inventoryAdjustmentController");



// =================================================
// Inventory Adjustment CRUD APIs
// =================================================


// Create Adjustment
router.post(
    "/create",
    verifyToken,
    inventoryAdjustmentController.createInventoryAdjustment
);


// Get All Adjustments
router.get(
    "/all",
    verifyToken,
    inventoryAdjustmentController.getInventoryAdjustments
);


// Get Single Adjustment
router.get(
    "/:id",
    verifyToken,
    inventoryAdjustmentController.getInventoryAdjustmentById
);


// Update Adjustment
router.put(
    "/:id",
    verifyToken,
    inventoryAdjustmentController.updateInventoryAdjustment
);


// Delete Adjustment
router.delete(
    "/:id",
    verifyToken,
    inventoryAdjustmentController.deleteInventoryAdjustment
);




// =================================================
// Approval Flow APIs
// =================================================


// Approve Adjustment
router.put(
    "/:id/approve",
    verifyToken,
    inventoryAdjustmentController.approveInventoryAdjustment
);


// Reject Adjustment
router.put(
    "/:id/reject",
    verifyToken,
    inventoryAdjustmentController.rejectInventoryAdjustment
);


// Cancel Adjustment
router.put(
    "/:id/cancel",
    verifyToken,
    inventoryAdjustmentController.cancelInventoryAdjustment
);





// =================================================
// Adjustment Reports APIs
// =================================================


// Pending Adjustments
router.get(
    "/reports/pending",
    verifyToken,
    inventoryAdjustmentController.getPendingAdjustments
);



// Approved Adjustments
router.get(
    "/reports/approved",
    verifyToken,
    inventoryAdjustmentController.getApprovedAdjustments
);



// Today Adjustments
router.get(
    "/reports/today",
    verifyToken,
    inventoryAdjustmentController.getTodayAdjustments
);



// Adjustment Summary
router.get(
    "/reports/summary",
    verifyToken,
    inventoryAdjustmentController.getAdjustmentSummary
);



// Reason Wise Report
router.get(
    "/reports/reason-wise",
    verifyToken,
    inventoryAdjustmentController.getReasonWiseAdjustments
);



// Store Wise Report
router.get(
    "/reports/store-wise",
    verifyToken,
    inventoryAdjustmentController.getStoreAdjustments
);



// Search Adjustments
router.get(
    "/reports/search",
    verifyToken,
    inventoryAdjustmentController.searchInventoryAdjustments
);



module.exports = router;