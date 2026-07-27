const express = require("express");
const router = express.Router();
const {
  // ===========================
  // CRUD
  // ===========================
  createRestaurantSetting,
  getRestaurantSettings,
  getRestaurantSettingById,
  getRestaurantSettingByRestaurant,

  // ===========================
  // Update
  // ===========================
  updateRestaurantSetting,
  updateBillingSettings,
  updatePOSSettings,
  updateOrderSettings,
  updatePaymentSettings,
  updatePrinterSettings,
  updateBrandingSettings,
  updateLocalizationSettings,

  // ===========================
  // Status
  // ===========================
  activateRestaurantSetting,
  deactivateRestaurantSetting,
  deleteRestaurantSetting,
  restoreRestaurantSetting,

  // ===========================
  // Reports
  // ===========================
  searchRestaurantSettings,
  getActiveRestaurantSettings,
  getInactiveRestaurantSettings,
  getRestaurantSettingSummary,

} = require("../controllers/restaurantSettingController");

//======================================================
// CRUD
//======================================================

router.post("/create", createRestaurantSetting);

router.get("/all", getRestaurantSettings);

router.get("/search", searchRestaurantSettings);

router.get("/summary", getRestaurantSettingSummary);

router.get("/active", getActiveRestaurantSettings);

router.get("/inactive", getInactiveRestaurantSettings);

router.get("/restaurant/:restaurantId", getRestaurantSettingByRestaurant);

router.get("/:id", getRestaurantSettingById);

//======================================================
// Update
//======================================================

router.put("/:id", updateRestaurantSetting);

router.put("/:id/billing", updateBillingSettings);

router.put("/:id/pos", updatePOSSettings);

router.put("/:id/order", updateOrderSettings);

router.put("/:id/payment", updatePaymentSettings);

router.put("/:id/printer", updatePrinterSettings);

router.put("/:id/branding", updateBrandingSettings);

router.put("/:id/localization", updateLocalizationSettings);

//======================================================
// Status
//======================================================

router.patch("/:id/activate", activateRestaurantSetting);

router.patch("/:id/deactivate", deactivateRestaurantSetting);

router.patch("/:id/restore", restoreRestaurantSetting);

router.delete("/:id", deleteRestaurantSetting);

module.exports = router;