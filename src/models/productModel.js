const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    // ==========================================
    // COMPANY
    // ==========================================

    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },

    // ==========================================
    // RESTAURANT
    // ==========================================

    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },

    // ==========================================
    // STORE
    // ==========================================

    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },

    // ==========================================
    // PRODUCT INFORMATION
    // ==========================================

    productCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },

    productName: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    // ==========================================
    // CATEGORY
    // ==========================================

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },

    // ==========================================
    // PRICING
    // ==========================================

    purchasePrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    sellingPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    mrp: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ==========================================
    // TAX
    // ==========================================

    taxPercentage: {
      type: Number,
      default: 0,
      min: 0,
    },

    taxInclusive: {
      type: Boolean,
      default: false,
    },

    // ==========================================
    // UNIT
    // ==========================================

    unit: {
      type: String,
      default: "PCS",
      trim: true,
      uppercase: true,
    },

    // ==========================================
    // INVENTORY
    // ==========================================

    openingStock: {
      type: Number,
      default: 0,
      min: 0,
    },

    currentStock: {
      type: Number,
      default: 0,
      min: 0,
    },

    minimumStock: {
      type: Number,
      default: 0,
      min: 0,
    },

    trackInventory: {
      type: Boolean,
      default: true,
    },

    // ==========================================
    // PRODUCT TYPE
    // ==========================================

    productType: {
      type: String,
      enum: [
        "Food",
        "Beverage",
        "Addon",
        "Raw Material",
        "Other",
      ],
      default: "Food",
    },

    // ==========================================
    // KITCHEN
    // ==========================================

    kitchenName: {
      type: String,
      default: "",
      trim: true,
    },

    preparationTime: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ==========================================
    // IMAGE
    // ==========================================

    image: {
      type: String,
      default: "",
    },

    // ==========================================
    // OPTIONS
    // ==========================================

    isAvailable: {
      type: Boolean,
      default: true,
    },

    isActive: {
      type: Boolean,
      default: true,
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

productSchema.index({
  companyId: 1,
  restaurant: 1,
  store: 1,
});

productSchema.index({
  store: 1,
  productName: 1,
});

productSchema.index({
  store: 1,
  productCode: 1,
});

productSchema.index({
  store: 1,
  isActive: 1,
});

productSchema.index({
  store: 1,
  isAvailable: 1,
});

productSchema.index({
  store: 1,
  isDeleted: 1,
});

// ==========================================
// UNIQUE PRODUCT CODE PER STORE
// ==========================================

productSchema.index(
  {
    store: 1,
    productCode: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model(
  "Product",
  productSchema
);