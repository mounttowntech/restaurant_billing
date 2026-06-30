const mongoose = require("mongoose");
module.exports = mongoose.model(
  "StockAdjustment",
  new mongoose.Schema(
    {
      adjustmentNo: { type: String, unique: true, required: true },
      ingredient: { type: mongoose.Schema.Types.ObjectId, ref: "Ingredient" },
      adjustmentType: {
        type: String,
        enum: ["increase", "decrease"],
        required: true,
      },
      quantity: { type: Number, required: true },
      beforeStock: Number,
      afterStock: Number,
      reason: String,
      createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true, versionKey: false },
  ),
);
