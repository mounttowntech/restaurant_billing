const mongoose = require("mongoose");
module.exports = mongoose.model(
  "StockLedger",
  new mongoose.Schema(
    {
      ingredient: { type: mongoose.Schema.Types.ObjectId, ref: "Ingredient" },
      movementType: {
        type: String,
        enum: [
          "purchase",
          "usage",
          "wastage",
          "adjustment_in",
          "adjustment_out",
        ],
      },
      quantity: Number,
      beforeStock: Number,
      afterStock: Number,
      referenceId: mongoose.Schema.Types.ObjectId,
      referenceNumber: String,
      remarks: String,
    },
    { timestamps: true, versionKey: false },
  ),
);
