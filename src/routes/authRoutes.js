const express = require("express");

const router = express.Router();

const {
  register,
  login,
  changePassword,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");

const {
  verifyToken,
} = require("../middleware/auth");

// Public
router.post("/register", register);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);

// Protected
router.put("/change-password", verifyToken, changePassword);

module.exports = router;