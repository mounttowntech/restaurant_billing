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
router.post("/create",verifyToken,createCoupon);

router.get("/all",  getAllCoupons);

router.get("/:id", getCouponById);

router.put("/update/:id",  verifyToken,updateCoupon);

router.delete("/delete/:id", verifyToken, deleteCoupon);

// Status
router.patch("/status/:id",  changeStatus);

// Coupon APIs
router.get("/list/active",  getActiveCoupons);

router.get("/list/auto-apply",  getAutoApplyCoupons);

router.get("/list/expired",  getExpiredCoupons);

router.post("/validate", validateCoupon);

router.patch("/increment/:id",  incrementUsage);

module.exports = router;
