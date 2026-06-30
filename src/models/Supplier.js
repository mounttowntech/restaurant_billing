const mongoose = require("mongoose");
module.exports = mongoose.model(
  "Supplier",
  new mongoose.Schema(
    {
      supplierCode: { type: String, unique: true },
      supplierName: { type: String, required: true },
      phone: { type: String, required: true },
      email: String,
      gstNumber: String,
      address: String,
      outstandingBalance: { type: Number, default: 0 },
      status: { type: String, enum: ["active", "inactive"], default: "active" },
    },
    { timestamps: true, versionKey: false },
  ),
);
