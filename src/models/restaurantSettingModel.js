// models/RestaurantSetting.js

const mongoose = require("mongoose");

const restaurantSettingSchema = new mongoose.Schema(
  {
    // ===============================
    // Restaurant Mapping
    // ===============================

    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      unique: true,
    },

    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
    },

    // ===============================
    // Business Information
    // ===============================

    restaurantName: {
      type: String,
      required: true,
      trim: true,
    },

    ownerName: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    address: {
      type: String,
      trim: true,
    },

    gstNumber: {
      type: String,
      trim: true,
      uppercase: true,
    },

    fssaiNumber: {
      type: String,
      trim: true,
      uppercase: true,
    },

    // ===============================
    // Currency & Localization
    // ===============================

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

    language: {
      type: String,
      default: "English",
    },

    // ===============================
    // Billing Settings
    // ===============================

    invoicePrefix: {
      type: String,
      default: "INV",
    },

    invoiceStartNumber: {
      type: Number,
      default: 1,
    },

    enableGST: {
      type: Boolean,
      default: true,
    },

    gstPercentage: {
      type: Number,
      default: 5,
    },

    serviceCharge: {
      type: Number,
      default: 0,
    },

    // ===============================
    // POS Settings
    // ===============================

    autoPrintInvoice: {
      type: Boolean,
      default: true,
    },

    autoPrintKOT: {
      type: Boolean,
      default: true,
    },

    allowNegativeStock: {
      type: Boolean,
      default: false,
    },

    // ===============================
    // Order Settings
    // ===============================

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

    reservationEnabled: {
      type: Boolean,
      default: false,
    },

    // ===============================
    // Payment Settings
    // ===============================

    acceptedPaymentModes: [
      {
        type: String,
        enum: [
          "Cash",
          "Card",
          "UPI",
          "Wallet",
          "Net Banking",
        ],
      },
    ],

    // ===============================
    // Printer Settings
    // ===============================

    receiptPrinterName: String,
    kitchenPrinterName: String,

    // ===============================
    // Branding
    // ===============================

    logo: String,

    favicon: String,

    receiptFooter: {
      type: String,
      default: "Thank you! Visit Again.",
    },

    // ===============================
    // Status
    // ===============================

    isActive: {
      type: Boolean,
      default: true,
    },

    // ===============================
    // Soft Delete
    // ===============================

    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: Date,
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ===============================
// Indexes
// ===============================

restaurantSettingSchema.index({ restaurant: 1 });
restaurantSettingSchema.index({ store: 1 });

// ===============================
// Query Middleware
// ===============================

restaurantSettingSchema.pre(/^find/, function () {
  this.where({ isDeleted: false });
 
});

// ===============================
// Export
// ===============================

module.exports = mongoose.model(
  "RestaurantSetting",
  restaurantSettingSchema
);