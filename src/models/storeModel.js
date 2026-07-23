const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },

    storeCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    storeName: {
      type: String,
      required: true,
      trim: true,
    },

    branchName: {
      type: String,
      trim: true,
      default: "",
    },

    managerName: {
      type: String,
      trim: true,
      default: "",
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: "",
    },

    phone: {
      type: String,
      trim: true,
      required: true,
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

    latitude: {
      type: Number,
      default: null,
    },

    longitude: {
      type: Number,
      default: null,
    },

    openingTime: {
      type: String,
      default: "09:00",
    },

    closingTime: {
      type: String,
      default: "23:00",
    },

    totalTables: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalSeats: {
      type: Number,
      default: 0,
      min: 0,
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

    dineInEnabled: {
      type: Boolean,
      default: true,
    },

    takeawayEnabled: {
      type: Boolean,
      default: true,
    },

    deliveryEnabled: {
      type: Boolean,
      default: true,
    },

    onlineOrderEnabled: {
      type: Boolean,
      default: false,
    },

    printerName: {
      type: String,
      default: "",
    },

    kitchenPrinter: {
      type: String,
      default: "",
    },

    billingPrinter: {
      type: String,
      default: "",
    },

    logo: {
      type: String,
      default: "",
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

/* ==========================================
   Indexes
========================================== */

storeSchema.index({ restaurant: 1 });
storeSchema.index({ storeCode: 1 });
storeSchema.index({ storeName: 1 });
storeSchema.index({ city: 1 });
storeSchema.index({ phone: 1 });
storeSchema.index({ email: 1 });
storeSchema.index({ status: 1 });

/* ==========================================
   Export
========================================== */

module.exports = mongoose.model("Store", storeSchema);