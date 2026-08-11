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
router.post("/create", createChef);

// Get All
router.get("/all",  getAllChefs);

// Dropdown
router.get("/dropdown/list",  getChefDropdown);

// Available Chefs
router.get("/available/list",  getAvailableChefs);

// Get By ID
router.get("/:id", getChefById);

// Update
router.put("/update/:id",  updateChef);

// Delete
router.delete("/delete/:id", deleteChef);

// Change Status
router.patch("/status/:id",  changeChefStatus);

// Change Availability
router.patch("/availability/:id", changeAvailability);

module.exports = router;