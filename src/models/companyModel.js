const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    // ==========================================
    // Company Basic Information
    // ==========================================

    companyCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    companyName: {
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
    // Contact Information
    // ==========================================

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

    // ==========================================
    // Tax Information
    // ==========================================

    gstNumber: {
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
    // Address
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
    // Company Settings
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
    // Logo
    // ==========================================

    logo: {
      type: String,
      default: "",
    },

    // ==========================================
    // Status
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
    // Audit
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
// Indexes
// ==========================================

companySchema.index({
  companyCode: 1,
});

companySchema.index({
  companyName: 1,
});

companySchema.index({
  phone: 1,
});

companySchema.index({
  email: 1,
});

companySchema.index({
  city: 1,
});

companySchema.index({
  status: 1,
});

companySchema.index({
  isDeleted: 1,
});

module.exports = mongoose.model(
  "Company",
  companySchema
);