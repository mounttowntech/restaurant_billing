const mongoose = require("mongoose");
module.exports = mongoose.model(
  "Tax",
  new mongoose.Schema(
    {
      taxName: String,
      taxPercent: Number,
      isDefault: { type: Boolean, default: false },
      status: { type: String, enum: ["active", "inactive"], default: "active" },
    },
    { timestamps: true, versionKey: false },
  ),
);
