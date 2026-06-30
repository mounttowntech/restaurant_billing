const mongoose = require("mongoose");
module.exports = mongoose.model(
  "Coupon",
  new mongoose.Schema(
    {
      couponCode: { type: String, unique: true, required: true },
      discountType: {
        type: String,
        enum: ["percentage", "flat"],
        required: true,
      },
      discountValue: { type: Number, required: true },
      minBillAmount: { type: Number, default: 0 },
      maxDiscountAmount: { type: Number, default: 0 },
      startDate: Date,
      endDate: Date,
      usageLimit: { type: Number, default: 0 },
      usedCount: { type: Number, default: 0 },
      status: { type: Boolean, default: true },
    },
    { timestamps: true, versionKey: false },
  ),
);
