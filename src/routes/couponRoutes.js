const express = require("express");
const router = express.Router();

const {
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  changeStatus,
  getActiveCoupons,
  getAutoApplyCoupons,
  getExpiredCoupons,
  validateCoupon,
  incrementUsage,
} = require("../controllers/couponController");

const { verifyToken } = require("../middleware/auth");

// CRUD
router.post("/create", verifyToken, createCoupon);

router.get("/all", verifyToken, getAllCoupons);

router.get("/:id", verifyToken, getCouponById);

router.put("/update/:id", verifyToken, updateCoupon);

router.delete("/delete/:id", verifyToken, deleteCoupon);

// Status
router.patch("/:id/status", verifyToken, changeStatus);

// Coupon APIs
router.get("/list/active", verifyToken, getActiveCoupons);

router.get("/list/auto-apply", verifyToken, getAutoApplyCoupons);

router.get("/list/expired", verifyToken, getExpiredCoupons);

router.post("/validate", verifyToken, validateCoupon);

router.patch("/:id/increment", verifyToken, incrementUsage);

module.exports = router;
