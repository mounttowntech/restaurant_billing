const express = require("express");

const router = express.Router();

const restaurantController =
  require("../controllers/restaurantController");

const {
  verifyToken,
} = require("../middleware/auth");

// =====================================================
// Create Restaurant
// =====================================================

router.post(
  "/create",
  // verifyToken,
  restaurantController.createRestaurant
);

// =====================================================
// Get All Restaurants
// =====================================================

router.get(
  "/all",
  verifyToken,
  restaurantController.getAllRestaurants
);

// =====================================================
// Get Restaurant By ID
// =====================================================

router.get(
  "/:id",
  verifyToken,
  restaurantController.getRestaurantById
);

// =====================================================
// Update Restaurant
// =====================================================

router.put(
  "/update/:id",
  verifyToken,
  restaurantController.updateRestaurant
);

// =====================================================
// Delete Restaurant
// =====================================================

router.delete(
  "/delete/:id",
  verifyToken,
  restaurantController.deleteRestaurant
);

// =====================================================
// Restore Restaurant
// =====================================================

router.patch(
  "/:id/restore",
  verifyToken,
  restaurantController.restoreRestaurant
);

// =====================================================
// Toggle Status
// =====================================================

router.patch(
  "/:id/toggle-status",
  verifyToken,
  restaurantController.toggleRestaurantStatus
);

module.exports = router;