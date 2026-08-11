
const mongoose = require("mongoose");

/* ==========================================================
   Ingredient Schema
========================================================== */

const ingredientSchema = new mongoose.Schema(
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
       Ingredient Code
    ======================================================== */

    ingredientCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },

    /* ========================================================
       Ingredient Name
    ======================================================== */

    ingredientName: {
      type: String,
      required: true,
      trim: true,
    },

    displayName: {
      type: String,
      trim: true,
      default: "",
    },

    /* ========================================================
       Category
    ======================================================== */

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },

    /* ========================================================
       Supplier
    ======================================================== */

    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      default: null,
    },

    /* ========================================================
       Units
    ======================================================== */

    // Stock is maintained in this unit
    unit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
      required: true,
    },

    // Purchase can happen in another unit
    // Example:
    // Unit = Piece
    // Purchase Unit = Box
    purchaseUnit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
      default: null,
    },

    /* ========================================================
       Unit Conversion
    ======================================================== */

    purchaseUnitConversion: {
      type: Number,
      default: 1,
      min: 0.0001,
    },

    /*
      Example:

      Purchase Unit = Box
      Stock Unit = Piece
      1 Box = 12 Pieces

      purchaseUnitConversion = 12
    */

    /* ========================================================
       Barcode
    ======================================================== */

    barcode: {
      type: String,
      default: "",
      trim: true,
    },

    /* ========================================================
       HSN / Tax
    ======================================================== */

    hsnCode: {
      type: String,
      default: "",
      trim: true,
    },

    gstPercentage: {
      type: Number,
      default: 5,
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

    lastPurchasePrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    averageCost: {
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
       Stock
    ======================================================== */

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

    maximumStock: {
      type: Number,
      default: 0,
      min: 0,
    },

    reorderLevel: {
      type: Number,
      default: 0,
      min: 0,
    },

    stockValue: {
      type: Number,
      default: 0,
      min: 0,
    },

    /* ========================================================
       Purchase Tracking
    ======================================================== */

    lastPurchaseDate: {
      type: Date,
      default: null,
    },

    /* ========================================================
       Storage
    ======================================================== */

    storageLocation: {
      type: String,
      default: "",
      trim: true,
    },

    /* ========================================================
       Expiry
    ======================================================== */

    expiryApplicable: {
      type: Boolean,
      default: false,
    },

    shelfLifeDays: {
      type: Number,
      default: 0,
      min: 0,
    },

    /* ========================================================
       Food Information
    ======================================================== */

    isVeg: {
      type: Boolean,
      default: true,
    },

    isPerishable: {
      type: Boolean,
      default: false,
    },

    /* ========================================================
       Availability
    ======================================================== */

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
    },

    /* ========================================================
       Remarks
    ======================================================== */

    remarks: {
      type: String,
      default: "",
      trim: true,
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
   Auto Calculate Stock Value
========================================================== */

ingredientSchema.pre("save", function () {
  this.stockValue =
    Number(this.currentStock || 0) *
    Number(this.averageCost || 0);

 
});

/* ==========================================================
   Virtual Stock Status
========================================================== */

ingredientSchema.virtual("stockStatus").get(function () {
  const stock = Number(this.currentStock || 0);
  const reorder = Number(this.reorderLevel || 0);
  const maximum = Number(this.maximumStock || 0);

  if (stock <= 0) {
    return "Out of Stock";
  }

  if (maximum > 0 && stock > maximum) {
    return "Over Stock";
  }

  if (stock <= reorder) {
    return "Low Stock";
  }

  return "Available";
});

/* ==========================================================
   Indexes
========================================================== */

ingredientSchema.index({
  restaurant: 1,
  store: 1,
});

ingredientSchema.index({
  restaurant: 1,
  ingredientCode: 1,
});

ingredientSchema.index({
  restaurant: 1,
  ingredientName: 1,
});

ingredientSchema.index({
  category: 1,
});

ingredientSchema.index({
  supplier: 1,
});

ingredientSchema.index({
  barcode: 1,
});

ingredientSchema.index({
  currentStock: 1,
});

ingredientSchema.index({
  reorderLevel: 1,
});

ingredientSchema.index({
  isDeleted: 1,
});

ingredientSchema.index({
  isActive: 1,
});

/*
  Same ingredient code can exist in different restaurants,
  but not twice inside the same restaurant.
*/
ingredientSchema.index(
  {
    restaurant: 1,
    ingredientCode: 1,
  },
  {
    unique: true,
  }
);

/*
  Barcode should be unique when it exists.
  Empty barcode values are ignored.
*/
ingredientSchema.index(
  {
    restaurant: 1,
    barcode: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      barcode: {
        $exists: true,
        $ne: "",
      },
    },
  }
);

/* ==========================================================
   JSON / Object Settings
========================================================== */

ingredientSchema.set("toJSON", {
  virtuals: true,
});

ingredientSchema.set("toObject", {
  virtuals: true,
});

/* ==========================================================
   Export
========================================================== */

module.exports = mongoose.model(
  "Ingredient",
  ingredientSchema
);

