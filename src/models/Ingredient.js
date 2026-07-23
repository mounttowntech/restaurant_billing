const mongoose = require("mongoose");

const ingredientSchema = new mongoose.Schema(
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

    ingredientCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

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

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },

    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
    },

    unit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
      required: true,
    },

    purchaseUnit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
    },

    barcode: {
      type: String,
      default: "",
      trim: true,
    },

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

    purchasePrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    averageCost: {
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
    },

    storageLocation: {
      type: String,
      default: "",
      trim: true,
    },

    expiryApplicable: {
      type: Boolean,
      default: false,
    },

    shelfLifeDays: {
      type: Number,
      default: 0,
    },

    isVeg: {
      type: Boolean,
      default: true,
    },

    isPerishable: {
      type: Boolean,
      default: false,
    },

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

    remarks: {
      type: String,
      default: "",
      trim: true,
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

/* ===========================
   Auto Calculate Stock Value
=========================== */

ingredientSchema.pre("save", function (next) {
  this.stockValue = Number(this.currentStock) * Number(this.averageCost);
  next();
});

/* ===========================
   Virtual Status
=========================== */

ingredientSchema.virtual("stockStatus").get(function () {
  if (this.currentStock <= 0) return "Out of Stock";

  if (this.currentStock <= this.reorderLevel) return "Low Stock";

  return "Available";
});

/* ===========================
   Indexes
=========================== */

ingredientSchema.index({ restaurant: 1 });
ingredientSchema.index({ store: 1 });
ingredientSchema.index({ ingredientCode: 1 });
ingredientSchema.index({ ingredientName: 1 });
ingredientSchema.index({ category: 1 });
ingredientSchema.index({ supplier: 1 });
ingredientSchema.index({ barcode: 1 });
ingredientSchema.index({ currentStock: 1 });
ingredientSchema.index({ reorderLevel: 1 });
ingredientSchema.index({ isDeleted: 1 });
ingredientSchema.index({ isActive: 1 });

/* ===========================
   JSON
=========================== */

ingredientSchema.set("toJSON", {
  virtuals: true,
});

ingredientSchema.set("toObject", {
  virtuals: true,
});

module.exports = mongoose.model("Ingredient", ingredientSchema);