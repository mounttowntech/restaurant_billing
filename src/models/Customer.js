const mongoose = require("mongoose");
module.exports = mongoose.model(
  "Customer",
  new mongoose.Schema(
    {
      customerCode: { type: String, unique: true },
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: String,
      address: String,
      loyaltyPoints: { type: Number, default: 0 },
      totalSpent: { type: Number, default: 0 },
      dueAmount: { type: Number, default: 0 },
      status: { type: String, enum: ["active", "inactive"], default: "active" },
    },
    { timestamps: true, versionKey: false },
  ),
);
