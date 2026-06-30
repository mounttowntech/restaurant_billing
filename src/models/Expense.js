const mongoose = require("mongoose");
module.exports = mongoose.model(
  "Expense",
  new mongoose.Schema(
    {
      expenseNo: { type: String, unique: true },
      category: { type: String, required: true },
      title: { type: String, required: true },
      amount: { type: Number, required: true },
      paymentMode: {
        type: String,
        enum: ["cash", "upi", "card", "bank"],
        default: "cash",
      },
      expenseDate: { type: Date, default: Date.now },
      note: String,
    },
    { timestamps: true, versionKey: false },
  ),
);
