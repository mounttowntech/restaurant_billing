const express = require("express");
const router = express.Router();

const {
  createChef,
  getAllChefs,
  getChefById,
  updateChef,
  deleteChef,
  changeChefStatus,
  changeAvailability,
  getChefDropdown,
  getAvailableChefs,
} = require("../controllers/chefController");

const { verifyToken } = require("../middleware/auth");

// Create
router.post("/create", verifyToken, createChef);

// Get All
router.get("/all", verifyToken, getAllChefs);

// Dropdown
router.get("/dropdown/list", verifyToken, getChefDropdown);

// Available Chefs
router.get("/available/list", verifyToken, getAvailableChefs);

// Get By ID
router.get("/:id", verifyToken, getChefById);

// Update
router.put("/update/:id", verifyToken, updateChef);

// Delete
router.delete("/delete/:id", verifyToken, deleteChef);

// Change Status
router.patch("/:id/status", verifyToken, changeChefStatus);

// Change Availability
router.patch("/:id/availability", verifyToken, changeAvailability);

module.exports = router;