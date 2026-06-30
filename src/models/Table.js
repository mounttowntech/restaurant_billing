const mongoose = require("mongoose");
module.exports = mongoose.model(
  "Table",
  new mongoose.Schema(
    {
      restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" },
      tableNo: { type: String, required: true },
      floor: String,
      capacity: { type: Number, default: 4 },
      status: {
        type: String,
        enum: ["available", "occupied", "reserved", "cleaning", "inactive"],
        default: "available",
      },
    },
    { timestamps: true, versionKey: false },
  ),
);
