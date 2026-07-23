const express = require("express");

const router = express.Router();

const deliveryPartnerController = require("../controllers/deliveryPartnerController");

const {
  verifyToken,
  allowRoles,
} = require("../middleware/auth");



// Create Delivery Partner
router.post(
  "/create",
  verifyToken,
  allowRoles("Super Admin", "Admin", "Manager"),
  deliveryPartnerController.createDeliveryPartner
);

// Get All Delivery Partners
router.get(
  "/all",
  verifyToken,
  deliveryPartnerController.getDeliveryPartners
);

// Get Delivery Partner By ID
router.get(
  "/:id",
  verifyToken,
  deliveryPartnerController.getDeliveryPartnerById
);

// Update Delivery Partner
router.put(
  "/:id",
  verifyToken,
  allowRoles("Super Admin", "Admin", "Manager"),
  deliveryPartnerController.updateDeliveryPartner
);

// Soft Delete Delivery Partner
router.delete(
  "/:id",
  verifyToken,
  allowRoles("Super Admin", "Admin"),
  deliveryPartnerController.deleteDeliveryPartner
);

// // Restore Delivery Partner
// router.put(
//   "/restore/:id",
//   deliveryPartnerController.restoreDeliveryPartner
// );

router.put(
  "/:id/online",
  deliveryPartnerController.goOnline
);

// Go Offline
router.put(
  "/:id/offline",
  verifyToken,
  deliveryPartnerController.goOffline
);

// Mark Busy
router.put(
  "/:id/busy",
  verifyToken,
  deliveryPartnerController.markBusy
);

// Mark Available
router.put(
  "/:id/available",
  verifyToken,
  deliveryPartnerController.markAvailable
);


// Complete Delivery
router.put(
  "/:id/complete",
  verifyToken,
  deliveryPartnerController.completeDelivery
);

// Cancel Delivery
router.put(
  "/:id/cancel",
  verifyToken,
  deliveryPartnerController.cancelDelivery
);


// Get Available Partners
router.get(
  "/restaurant/:restaurantId/available",
  verifyToken,
  deliveryPartnerController.getAvailablePartners
);

// Get Online Partners
router.get(
  "/restaurant/:restaurantId/online",
  verifyToken,
  deliveryPartnerController.getOnlinePartners
);

// Get Top Rated Partners
router.get(
  "/restaurant/:restaurantId/top-rated",
  verifyToken,
  deliveryPartnerController.getTopRatedPartners
);

// Get Store Partners
router.get(
  "/store/:storeId",
  verifyToken,
  deliveryPartnerController.getStorePartners
);

// Delivery Summary
router.get(
  "/restaurant/:restaurantId/summary",
  verifyToken,
  deliveryPartnerController.getDeliverySummary
);

module.exports = router;