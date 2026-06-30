const mongoose = require("mongoose");
module.exports = mongoose.model(
  "Invoice",
  new mongoose.Schema(
    {
      invoiceNo: { type: String, unique: true, required: true },
      order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
      customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
      subTotal: Number,
      taxAmount: Number,
      discountAmount: Number,
      serviceCharge: Number,
      grandTotal: Number,
      paidAmount: { type: Number, default: 0 },
      returnAmount: { type: Number, default: 0 },
      dueAmount: { type: Number, default: 0 },
      paymentStatus: {
        type: String,
        enum: ["paid", "partial", "pending"],
        default: "pending",
      },
      status: {
        type: String,
        enum: ["active", "cancelled"],
        default: "active",
      },
    },
    { timestamps: true, versionKey: false },
  ),
);
