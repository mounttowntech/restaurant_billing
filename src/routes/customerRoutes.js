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

router.delete("/delete/:id", verifyToken, deleteCustomer);

// Status
router.patch("/status/:id", verifyToken, changeCustomerStatus);

// Loyalty Points
router.patch(
  "/loyalty/:id",
  verifyToken,
  addLoyaltyPoints
);

module.exports = router;