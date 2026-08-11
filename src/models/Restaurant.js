const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema(
  {
    // ==========================================
    // COMPANY REFERENCE
    // ==========================================

    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },

    // ==========================================
    // BASIC INFORMATION
    // ==========================================

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

    // ==========================================
    // CONTACT
    // ==========================================

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

    // ==========================================
    // TAX
    // ==========================================

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

    // ==========================================
    // ADDRESS
    // ==========================================

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
      trim: true,
      default: "India",
    },

    pincode: {
      type: String,
      trim: true,
      default: "",
    },

    // ==========================================
    // LOCATION
    // ==========================================

    latitude: {
      type: Number,
      default: null,
    },

    longitude: {
      type: Number,
      default: null,
    },

    // ==========================================
    // CURRENCY
    // ==========================================

    currency: {
      type: String,
      trim: true,
      default: "INR",
    },

    currencySymbol: {
      type: String,
      trim: true,
      default: "₹",
    },

    timezone: {
      type: String,
      trim: true,
      default: "Asia/Kolkata",
    },

    // ==========================================
    // PREFIXES
    // ==========================================

    invoicePrefix: {
      type: String,
      trim: true,
      uppercase: true,
      default: "INV",
    },

    kotPrefix: {
      type: String,
      trim: true,
      uppercase: true,
      default: "KOT",
    },

    orderPrefix: {
      type: String,
      trim: true,
      uppercase: true,
      default: "ORD",
    },

    purchasePrefix: {
      type: String,
      trim: true,
      uppercase: true,
      default: "PUR",
    },

    expensePrefix: {
      type: String,
      trim: true,
      uppercase: true,
      default: "EXP",
    },

    // ==========================================
    // BUSINESS SETTINGS
    // ==========================================

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

    // ==========================================
    // IMAGES
    // ==========================================

    logo: {
      type: String,
      default: "",
    },

    bannerImage: {
      type: String,
      default: "",
    },

    // ==========================================
    // STATUS
    // ==========================================

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    // ==========================================
    // AUDIT
    // ==========================================

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// ==========================================
// INDEXES
// ==========================================

restaurantSchema.index({
  companyId: 1,
});

restaurantSchema.index({
  companyId: 1,
  restaurantName: 1,
});

restaurantSchema.index({
  restaurantCode: 1,
});

restaurantSchema.index({
  restaurantName: 1,
});

restaurantSchema.index({
  phone: 1,
});

restaurantSchema.index({
  email: 1,
});

restaurantSchema.index({
  city: 1,
});

restaurantSchema.index({
  status: 1,
});

restaurantSchema.index({
  isDeleted: 1,
});

// ==========================================
// EXPORT
// ==========================================

module.exports = mongoose.model(
  "Restaurant",
  restaurantSchema
);