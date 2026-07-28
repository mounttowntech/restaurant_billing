const express = require("express");
<<<<<<< HEAD
const router = express.Router();

const {
  // ===========================
  // CRUD
  // ===========================
  createRestaurant,
  getRestaurants,
  getRestaurantById,

  // ===========================
  // Update
  // ===========================
  updateRestaurant,
  deleteRestaurant,
  restoreRestaurant,
  updateRestaurantStatus,

  // ===========================
  // Search & Reports
  // ===========================
  searchRestaurants,
  getActiveRestaurants,
  getInactiveRestaurants,
  getDeletedRestaurants,
  getRestaurantSummary,
  getRestaurantAnalytics,
  getCityWiseRestaurants,
  getStateWiseRestaurants,

} = require("../controllers/restaurantController");

const { verifyToken } = require("../middleware/auth");

/* ==========================================
   CRUD
========================================== */

router.post("/create", verifyToken, createRestaurant);

router.get("/all", verifyToken, getRestaurants);

router.get("/:id", verifyToken, getRestaurantById);

/* ==========================================
   Update
========================================== */

router.put("/:id", verifyToken, updateRestaurant);

router.delete("/:id", verifyToken, deleteRestaurant);

router.patch("/:id/restore", verifyToken, restoreRestaurant);

router.patch("/:id/status", verifyToken, updateRestaurantStatus);

/* ==========================================
   Search & Reports
========================================== */

router.get("/search/list", verifyToken, searchRestaurants);

router.get("/reports/active", verifyToken, getActiveRestaurants);

router.get("/reports/inactive", verifyToken, getInactiveRestaurants);

router.get("/reports/deleted", verifyToken, getDeletedRestaurants);

router.get("/reports/summary", verifyToken, getRestaurantSummary);

router.get("/reports/analytics", verifyToken, getRestaurantAnalytics);

router.get("/reports/city-wise", verifyToken, getCityWiseRestaurants);

router.get("/reports/state-wise", verifyToken, getStateWiseRestaurants);
=======

const router = express.Router();

const {
  createRestaurant,
  getRestaurants,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant,
  changeRestaurantStatus,
} = require("../controllers/restaurantController");

// middleware
const { verifyToken } = require("../middleware/auth");


// Create
router.post("/create", verifyToken, createRestaurant);

// Get All
router.get("/all", verifyToken, getRestaurants);

// Get By Id
router.get("/:id", verifyToken, getRestaurantById);

// Update
router.put("/update/:id", verifyToken, updateRestaurant);

// Soft Delete
router.delete("/delete/:id", verifyToken, deleteRestaurant);

// Change Status
router.patch("/:id/status", verifyToken, changeRestaurantStatus);
>>>>>>> restuarant_initial_30_06_26

module.exports = router;