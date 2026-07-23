const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema(
  {
    restaurantCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    restaurantName: {
      type: String,
      required: true,
      trim: true,
    },

    legalName: {
      type: String,
      trim: true,
      default: "",
    },

    ownerName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: "",
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    alternatePhone: {
      type: String,
      trim: true,
      default: "",
    },

    gstNumber: {
      type: String,
      trim: true,
      uppercase: true,
      default: "",
    },

    fssaiNumber: {
      type: String,
      trim: true,
      uppercase: true,
      default: "",
    },

    panNumber: {
      type: String,
      trim: true,
      uppercase: true,
      default: "",
    },

    address: {
      type: String,
      trim: true,
      default: "",
    },

    area: {
      type: String,
      trim: true,
      default: "",
    },

    city: {
      type: String,
      trim: true,
      default: "",
    },

    state: {
      type: String,
      trim: true,
      default: "",
    },

    country: {
      type: String,
      default: "India",
    },

    pincode: {
      type: String,
      trim: true,
      default: "",
    },

    latitude: Number,

    longitude: Number,

    logo: {
      type: String,
      default: "",
    },

    bannerImage: {
      type: String,
      default: "",
    },

    currency: {
      type: String,
      default: "INR",
    },

    currencySymbol: {
      type: String,
      default: "₹",
    },

    timezone: {
      type: String,
      default: "Asia/Kolkata",
    },

    invoicePrefix: {
      type: String,
      default: "INV",
    },

    kotPrefix: {
      type: String,
      default: "KOT",
    },

    orderPrefix: {
      type: String,
      default: "ORD",
    },

    purchasePrefix: {
      type: String,
      default: "PUR",
    },

    expensePrefix: {
      type: String,
      default: "EXP",
    },

    serviceChargePercentage: {
      type: Number,
      default: 0,
      min: 0,
    },

    gstEnabled: {
      type: Boolean,
      default: true,
    },

    serviceChargeEnabled: {
      type: Boolean,
      default: false,
    },

    loyaltyEnabled: {
      type: Boolean,
      default: true,
    },

    onlineOrderEnabled: {
      type: Boolean,
      default: false,
    },

    takeawayEnabled: {
      type: Boolean,
      default: true,
    },

    dineInEnabled: {
      type: Boolean,
      default: true,
    },

    deliveryEnabled: {
      type: Boolean,
      default: true,
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

restaurantSchema.index({ restaurantCode: 1 });
restaurantSchema.index({ restaurantName: 1 });
restaurantSchema.index({ phone: 1 });
restaurantSchema.index({ email: 1 });
restaurantSchema.index({ city: 1 });
restaurantSchema.index({ status: 1 });

module.exports = mongoose.model("Restaurant", restaurantSchema);