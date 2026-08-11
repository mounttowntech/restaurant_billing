const mongoose = require("mongoose");

/* ==========================================================
   Warehouse Schema
========================================================== */

const warehouseSchema = new mongoose.Schema(
  {
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    required: true,
},

store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Store",
    required: true,
},

    /* ========================================================
       Warehouse Code
    ======================================================== */

    warehouseCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },

    /* ========================================================
       Warehouse Name
    ======================================================== */

    warehouseName: {
      type: String,
      required: true,
      trim: true,
    },

    /* ========================================================
       Warehouse Type
    ======================================================== */

    warehouseType: {
      type: String,
      enum: [
        "Main",
        "Raw Material",
        "Finished Goods",
        "Cold Storage",
        "Dry Storage",
        "General",
        "Other",
      ],
      default: "General",
    },

    /* ========================================================
       Manager
    ======================================================== */

    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    /* ========================================================
       Contact Information
    ======================================================== */

    contactPerson: {
      type: String,
      trim: true,
      default: "",
    },

    phone: {
      type: String,
      trim: true,
      default: "",
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },

    /* ========================================================
       Address
    ======================================================== */

    address: {
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

    /* ========================================================
       Capacity
    ======================================================== */

    capacity: {
      type: Number,
      default: 0,
      min: 0,
    },

    capacityUnit: {
      type: String,
      enum: [
        "Piece",
        "Kg",
        "Gram",
        "Liter",
        "ML",
        "Box",
        "Packet",
        "Pallet",
        "Other",
      ],
      default: "Piece",
    },

    /* ========================================================
       Warehouse Status
    ======================================================== */

    isDefault: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    /* ========================================================
       Description
    ======================================================== */

    description: {
      type: String,
      trim: true,
      default: "",
    },

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

/* ==========================================================
   Indexes
========================================================== */

warehouseSchema.index({
  restaurant: 1,
  store: 1,
});

warehouseSchema.index({
  restaurant: 1,
  warehouseCode: 1,
});

warehouseSchema.index({
  warehouseName: 1,
});

warehouseSchema.index({
  warehouseType: 1,
});

warehouseSchema.index({
  manager: 1,
});

warehouseSchema.index({
  isDefault: 1,
});

warehouseSchema.index({
  isActive: 1,
});

warehouseSchema.index({
  isDeleted: 1,
});

/* ==========================================================
   Unique Warehouse Code Per Restaurant
========================================================== */

warehouseSchema.index(
  {
    restaurant: 1,
    warehouseCode: 1,
  },
  {
    unique: true,
  }
);

/* ==========================================================
   JSON
========================================================== */

warehouseSchema.set("toJSON", {
  virtuals: true,
});

warehouseSchema.set("toObject", {
  virtuals: true,
});

/* ==========================================================
   Export
========================================================== */

/* ==========================================================
   Export Model
========================================================== */

module.exports =
  mongoose.models.Warehouse ||
  mongoose.model("Warehouse", warehouseSchema);