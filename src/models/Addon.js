const mongoose = require("mongoose");
module.exports = mongoose.model(
  "Addon",
  new mongoose.Schema(
    {
      restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" },
      addonName: { type: String, required: true },
      price: { type: Number, default: 0 },
      status: { type: String, enum: ["active", "inactive"], default: "active" },
    },
    { timestamps: true, versionKey: false },
  ),
);
