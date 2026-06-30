const mongoose = require("mongoose");
module.exports = mongoose.model(
  "KOT",
  new mongoose.Schema(
    {
      kotNo: { type: String, unique: true, required: true },
      order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
      table: { type: mongoose.Schema.Types.ObjectId, ref: "Table" },
      items: [
        {
          itemName: String,
          quantity: Number,
          notes: String,
          status: {
            type: String,
            enum: ["pending", "preparing", "ready"],
            default: "pending",
          },
        },
      ],
      status: {
        type: String,
        enum: ["pending", "preparing", "ready", "served", "cancelled"],
        default: "pending",
      },
    },
    { timestamps: true, versionKey: false },
  ),
);
