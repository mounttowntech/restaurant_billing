const mongoose = require("mongoose");
module.exports = mongoose.model(
  "Payment",
  new mongoose.Schema(
    {
      paymentNo: { type: String, unique: true },
      invoice: { type: mongoose.Schema.Types.ObjectId, ref: "Invoice" },
      order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
      customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
      type: {
        type: String,
        enum: ["sale", "purchase", "expense", "refund"],
        required: true,
      },
      mode: {
        type: String,
        enum: ["cash", "upi", "card", "wallet", "bank", "credit"],
        required: true,
      },
      amount: { type: Number, required: true },
      transactionId: String,
      status: {
        type: String,
        enum: ["success", "failed", "pending"],
        default: "success",
      },
    },
    { timestamps: true, versionKey: false },
  ),
);
