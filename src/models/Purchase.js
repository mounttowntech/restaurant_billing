const mongoose = require("mongoose");
const itemSchema = new mongoose.Schema(
  {
    ingredient: { type: mongoose.Schema.Types.ObjectId, ref: "Ingredient" },
    name: String,
    quantity: Number,
    unit: String,
    price: Number,
    totalAmount: Number,
  },
  { _id: false },
);
module.exports = mongoose.model(
  "Purchase",
  new mongoose.Schema(
    {
      purchaseNo: { type: String, unique: true, required: true },
      supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier" },
      items: [itemSchema],
      subTotal: Number,
      taxAmount: { type: Number, default: 0 },
      grandTotal: Number,
      paidAmount: { type: Number, default: 0 },
      dueAmount: { type: Number, default: 0 },
      paymentStatus: {
        type: String,
        enum: ["paid", "partial", "unpaid"],
        default: "unpaid",
      },
    },
    { timestamps: true, versionKey: false },
  ),
);
