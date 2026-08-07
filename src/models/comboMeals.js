const mongoose = require("mongoose");

// =====================================================
// Combo Meal Item Schema
// =====================================================

const ComboMealItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      default: 1,
      min: 1,
    },
  },
  {
    _id: false,
  }
);

// =====================================================
// Combo Meal Schema
// =====================================================

const ComboMealSchema = new mongoose.Schema(
  {
    // =================================================
    // Company
    // =================================================

    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },

    // =================================================
    // Combo Information
    // =================================================

    name: {
      type: String,
      required: true,
      trim: true,
    },

    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    image: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    // =================================================
    // Combo Products
    // =================================================

    items: {
      type: [ComboMealItemSchema],
      required: true,
      validate: {
        validator: function (items) {
          return items && items.length > 0;
        },
        message: "Combo must contain at least one product",
      },
    },

    // =================================================
    // Pricing
    // =================================================

    sellingPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    costPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    tax: {
      type: Number,
      default: 0,
      min: 0,
    },

    // =================================================
    // Category
    // =================================================

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },

    // =================================================
    // Availability Time
    // =================================================

    availableFrom: {
      type: String,
      default: "",
    },

    availableTo: {
      type: String,
      default: "",
    },

    // =================================================
    // Status
    // =================================================

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

    // =================================================
    // Audit
    // =================================================

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

// =====================================================
// Indexes
// =====================================================

ComboMealSchema.index({
  companyId: 1,
  isDeleted: 1,
});

ComboMealSchema.index({
  companyId: 1,
  name: 1,
});

ComboMealSchema.index({
  companyId: 1,
  code: 1,
});

ComboMealSchema.index({
  companyId: 1,
  isAvailable: 1,
});

ComboMealSchema.index({
  companyId: 1,
  isActive: 1,
});

// =====================================================
// Export
// =====================================================

module.exports = mongoose.model(
  "ComboMeal",
  ComboMealSchema
);