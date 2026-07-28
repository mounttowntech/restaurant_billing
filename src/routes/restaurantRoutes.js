const express = require("express");

const router = express.Router();

const {
  createRestaurant,
  getRestaurants,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant,
  updateRestaurantStatus
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
router.patch("/:id/status", verifyToken, updateRestaurantStatus);

module.exports = router;