const mongoose = require("mongoose");
const addonSchema = new mongoose.Schema(
  {
    addon: { type: mongoose.Schema.Types.ObjectId, ref: "Addon" },
    name: String,
    price: Number,
  },
  { _id: false },
);
const itemSchema = new mongoose.Schema(
  {
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: "MenuItem" },
    itemName: String,
    variantName: String,
    quantity: Number,
    price: Number,
    taxPercent: Number,
    taxAmount: Number,
    totalAmount: Number,
    addons: [addonSchema],
    status: {
      type: String,
      enum: ["pending", "preparing", "ready", "served", "cancelled"],
      default: "pending",
    },
  },
  { _id: false },
);
module.exports = mongoose.model(
  "Order",
  new mongoose.Schema(
    {
      orderNo: { type: String, unique: true, required: true },
      restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant" },
      orderType: {
        type: String,
        enum: ["dine_in", "takeaway", "delivery"],
        required: true,
      },
      table: { type: mongoose.Schema.Types.ObjectId, ref: "Table" },
      customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer" },
      items: [itemSchema],
      subTotal: Number,
      taxAmount: Number,
      discountAmount: { type: Number, default: 0 },
      serviceCharge: { type: Number, default: 0 },
      grandTotal: Number,
      status: {
        type: String,
        enum: ["open", "completed", "cancelled"],
        default: "open",
      },
      createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true, versionKey: false },
  ),
);
