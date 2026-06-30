const Coupon = require("../models/Coupon");
const asyncHandler = require("../utils/asyncHandler");
exports.createCoupon = asyncHandler(async (req, res) => {
  const data = await Coupon.create(req.body);
  res.status(201).json({ success: true, message: "Created", data });
});
exports.getCoupons = asyncHandler(async (req, res) => {
  const data = await Coupon.find().sort({ createdAt: -1 });
  res.json({ success: true, data });
});
exports.getCouponById = asyncHandler(async (req, res) => {
  const data = await Coupon.findById(req.params.id);
  if (!data)
    return res.status(404).json({ success: false, message: "Not found" });
  res.json({ success: true, data });
});
exports.updateCoupon = asyncHandler(async (req, res) => {
  const data = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.json({ success: true, message: "Updated", data });
});
exports.deleteCoupon = asyncHandler(async (req, res) => {
  await Coupon.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Deleted" });
});
