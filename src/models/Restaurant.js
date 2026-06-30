const mongoose = require("mongoose");
module.exports = mongoose.model(
  "Restaurant",
  new mongoose.Schema(
    {
      restaurantCode: { type: String, unique: true },
      name: { type: String, required: true },
      ownerName: String,
      email: String,
      phone: String,
      gstNumber: String,
      fssaiNumber: String,
      address: String,
      city: String,
      state: String,
      pincode: String,
      currencySymbol: { type: String, default: "₹" },
      invoicePrefix: { type: String, default: "INV" },
      kotPrefix: { type: String, default: "KOT" },
      serviceChargePercent: { type: Number, default: 0 },
      status: { type: String, enum: ["active", "inactive"], default: "active" },
    },
    { timestamps: true, versionKey: false },
  ),
);
