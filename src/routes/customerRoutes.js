const express = require("express");
const router = express.Router();

const {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
  changeCustomerStatus,
  customerDropdown,
  searchCustomer,
  addLoyaltyPoints,
} = require("../controllers/customerController");

const {
  verifyToken,
} = require("../middleware/auth");

// CRUD
router.post("/create", verifyToken, createCustomer);

router.get("/all", verifyToken, getAllCustomers);

router.get("/dropdown/list", verifyToken, customerDropdown);

router.get("/search", verifyToken, searchCustomer);

router.get("/:id", verifyToken, getCustomerById);

router.put("/update/:id", verifyToken, updateCustomer);

router.delete("/deletew/:id", verifyToken, deleteCustomer);

// Status
router.patch("/:id/status", verifyToken, changeCustomerStatus);

// Loyalty Points
router.patch(
  "/:id/loyalty",
  verifyToken,
  addLoyaltyPoints
);

module.exports = router;