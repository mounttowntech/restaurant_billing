const mongoose = require("mongoose");
module.exports = mongoose.model(
  "Category",
  new mongoose.Schema(
    {
      restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" },
      categoryName: { type: String, required: true },
      type: {
        type: String,
        enum: ["veg", "non_veg", "egg", "beverage", "others"],
        default: "others",
      },
      image: String,
      displayOrder: Number,
      status: { type: String, enum: ["active", "inactive"], default: "active" },
    },
    { timestamps: true, versionKey: false },
  ),
);
