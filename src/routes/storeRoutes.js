const express = require("express");

const router = express.Router();

const {
  // CRUD
  createStore,
  getStores,
  getStoreById,

  // Update & Status
  updateStore,
  deleteStore,
  restoreStore,
  updateStoreStatus,
  activateStore,
  deactivateStore,

  // Reports
  searchStores,
  getActiveStores,
  getInactiveStores,
  getDeletedStores,
  getRestaurantStores,
  getCityWiseStores,
  getStateWiseStores,
  getOnlineOrderStores,
  getDineInStores,
  getDeliveryStores,
  getTakeawayStores,
  getStoreSummary,
  getStoreAnalytics,

} = require("../controllers/storeController");

// const { protect } = require("../middleware/auth");

/* ==========================================================
   CRUD
========================================================== */

router.post(
  "/create",
  // protect,
  createStore
);

router.get(
  "/all",
  // protect,
  getStores
);

router.get(
  "/:id",
  // protect,
  getStoreById
);

router.put(
  "/:id",
  // protect,
  updateStore
);

/* ==========================================================
   Status
========================================================== */

router.delete(
  "/:id",
  // protect,
  deleteStore
);

router.put(
  "/restore/:id",
  // protect,
  restoreStore
);

router.put(
  "/status/:id",
  // protect,
  updateStoreStatus
);

router.put(
  "/activate/:id",
  // protect,
  activateStore
);

router.put(
  "/deactivate/:id",
  // protect,
  deactivateStore
);

/* ==========================================================
   Reports
========================================================== */

router.get(
  "/reports/search",
  // protect,
  searchStores
);

router.get(
  "/reports/active",
  // protect,
  getActiveStores
);

router.get(
  "/reports/inactive",
  // protect,
  getInactiveStores
);

router.get(
  "/reports/deleted",
  // protect,
  getDeletedStores
);

router.get(
  "/reports/city",
  // protect,
  getCityWiseStores
);

router.get(
  "/reports/state",
  // protect,
  getStateWiseStores
);

router.get(
  "/reports/online-order",
  // protect,
  getOnlineOrderStores
);

router.get(
  "/reports/dine-in",
  // protect,
  getDineInStores
);

router.get(
  "/reports/delivery",
  // protect,
  getDeliveryStores
);

router.get(
  "/reports/takeaway",
  // protect,
  getTakeawayStores
);

router.get(
  "/reports/summary",
  // protect,
  getStoreSummary
);

router.get(
  "/reports/analytics",
  // protect,
  getStoreAnalytics
);

router.get(
  "/restaurant/:restaurantId",
  // protect,
  getRestaurantStores
);

module.exports = router;