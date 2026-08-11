const mongoose = require("mongoose");

/* ==========================================================
   Inventory Schema
========================================================== */

const inventorySchema = new mongoose.Schema(
  {
    /* ========================================================
       Restaurant
    ======================================================== */

    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },

    /* ========================================================
       Store
    ======================================================== */

    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },

    /* ========================================================
       Product
    ======================================================== */

    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },

    /* ========================================================
       Inventory Code
    ======================================================== */

    inventoryCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    /* ========================================================
       Stock Information
    ======================================================== */

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

    reservedStock: {
      type: Number,
      default: 0,
      min: 0,
    },

    availableStock: {
      type: Number,
      default: 0,
      min: 0,
    },

    damagedStock: {
      type: Number,
      default: 0,
      min: 0,
    },

    /* ========================================================
       Stock Levels
    ======================================================== */

    minimumStock: {
      type: Number,
      default: 0,
      min: 0,
    },

    reorderLevel: {
      type: Number,
      default: 0,
      min: 0,
    },

    maximumStock: {
      type: Number,
      default: 0,
      min: 0,
    },

    /* ========================================================
       Pricing
    ======================================================== */

    purchasePrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    sellingPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    /* ========================================================
       Stock Value
    ======================================================== */

    stockValue: {
      type: Number,
      default: 0,
      min: 0,
    },

    /* ========================================================
       Unit
    ======================================================== */

    unit: {
      type: String,
      enum: [
        "Piece",
        "Kg",
        "Gram",
        "Liter",
        "ML",
        "Packet",
        "Box",
        "Bottle",
        "Dozen",
        "Set",
        "Other",
      ],
      default: "Piece",
    },

    /* ========================================================
       Batch Information
    ======================================================== */

    batchNumber: {
      type: String,
      trim: true,
      default: "",
    },

    manufacturingDate: {
      type: Date,
    },

    expiryDate: {
      type: Date,
    },

    /* ========================================================
       Supplier
    ======================================================== */

    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
    },

    /* ========================================================
       Stock Status
    ======================================================== */

    stockStatus: {
      type: String,
      enum: [
        "In Stock",
        "Low Stock",
        "Out of Stock",
        "Over Stock",
      ],
      default: "Out of Stock",
    },

    /* ========================================================
       Active / Delete
    ======================================================== */

    isActive: {
      type: Boolean,
      default: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    /* ========================================================
       Remarks
    ======================================================== */

    remarks: {
      type: String,
      trim: true,
      default: "",
    },

    /* ========================================================
       Audit
    ======================================================== */

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

/* ==========================================================
   Indexes
========================================================== */

inventorySchema.index({
  restaurant: 1,
});

inventorySchema.index({
  store: 1,
});

inventorySchema.index({
  product: 1,
});

inventorySchema.index({
  supplier: 1,
});

inventorySchema.index({
  stockStatus: 1,
});

inventorySchema.index({
  expiryDate: 1,
});

inventorySchema.index({
  isActive: 1,
});

inventorySchema.index({
  isDeleted: 1,
});

/* ==========================================================
   Virtual - Available Stock
========================================================== */

inventorySchema.virtual("calculatedAvailableStock").get(function () {
  return Math.max(
    0,
    this.currentStock - this.reservedStock
  );
});

/* ==========================================================
   JSON
========================================================== */

inventorySchema.set("toJSON", {
  virtuals: true,
});

inventorySchema.set("toObject", {
  virtuals: true,
});

/* ==========================================================
   Export
========================================================== */

module.exports = mongoose.model(
  "Inventory",
  inventorySchema
);