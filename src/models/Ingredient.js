const mongoose = require("mongoose");
module.exports = mongoose.model(
  "Ingredient",
  new mongoose.Schema(
    {
      ingredientCode: { type: String, unique: true },
      name: { type: String, required: true },
      unit: { type: String, default: "kg" },
      currentStock: { type: Number, default: 0 },
      minimumStock: { type: Number, default: 0 },
      purchasePrice: { type: Number, default: 0 },
      status: { type: String, enum: ["active", "inactive"], default: "active" },
    },
    { timestamps: true, versionKey: false },
  ),
);
