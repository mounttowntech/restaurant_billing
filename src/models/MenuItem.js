const mongoose = require("mongoose");
const variantSchema = new mongoose.Schema(
  { name: String, price: Number },
  { _id: false },
);
module.exports = mongoose.model(
  "MenuItem",
  new mongoose.Schema(
    {
      restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" },
      itemCode: { type: String, unique: true },
      itemName: { type: String, required: true },
      category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
      foodType: {
        type: String,
        enum: ["veg", "non_veg", "egg"],
        default: "veg",
      },
      basePrice: { type: Number, required: true },
      taxPercent: { type: Number, default: 5 },
      variants: [variantSchema],
      preparationTime: Number,
      image: String,
      isAvailable: { type: Boolean, default: true },
      status: { type: String, enum: ["active", "inactive"], default: "active" },
    },
    { timestamps: true, versionKey: false },
  ),
);
