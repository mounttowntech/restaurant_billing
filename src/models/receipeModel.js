const mongoose = require("mongoose");

/* ==========================================================
   Recipe Ingredient Schema
========================================================== */

const recipeItemSchema = new mongoose.Schema(
  {
    ingredient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ingredient",
      required: true,
    },

    unit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 0.001,
    },

    wastagePercentage: {
      type: Number,
      default: 0,
      min: 0,
    },

    actualQuantity: {
      type: Number,
      default: 0,
    },

    costPerUnit: {
      type: Number,
      default: 0,
    },

    totalCost: {
      type: Number,
      default: 0,
    },

    remarks: {
      type: String,
      trim: true,
    },
  },
  {
    _id: false,
  },
);

/* ==========================================================
   Recipe Schema
========================================================== */

const recipeSchema = new mongoose.Schema(
  {
    recipeCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    recipeName: {
      type: String,
      required: true,
      trim: true,
    },

    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuItem",
      required: true,
    },

    menuCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuCategory",
    },

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

    preparationTime: {
      type: Number,
      default: 0,
    },

    servingSize: {
      type: Number,
      default: 1,
    },

    items: [recipeItemSchema],

    totalCost: {
      type: Number,
      default: 0,
    },

    sellingPrice: {
      type: Number,
      default: 0,
    },

    profitAmount: {
      type: Number,
      default: 0,
    },

    profitPercentage: {
      type: Number,
      default: 0,
    },

    instructions: {
      type: String,
      trim: true,
    },

    notes: {
      type: String,
      trim: true,
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
  },
);

/* ==========================================================
   Auto Calculations
========================================================== */

recipeSchema.pre("save", function () {
  let totalCost = 0;

  this.items.forEach((item) => {
    const wastageQty =
      (Number(item.quantity) * Number(item.wastagePercentage || 0)) / 100;

    item.actualQuantity = Number(item.quantity) + wastageQty;

    item.totalCost = item.actualQuantity * Number(item.costPerUnit || 0);

    totalCost += item.totalCost;
  });

  this.totalCost = totalCost;

  this.profitAmount = Number(this.sellingPrice) - totalCost;

  this.profitPercentage =
    this.sellingPrice > 0
      ? Number(((this.profitAmount / this.sellingPrice) * 100).toFixed(2))
      : 0;
});

/* ==========================================================
   Virtuals
========================================================== */

recipeSchema.virtual("ingredientCount").get(function () {
  return this.items.length;
});

/* ==========================================================
   Indexes
========================================================== */

recipeSchema.index({ recipeCode: 1 }, { unique: true });

recipeSchema.index({ recipeName: 1 });

recipeSchema.index({ menuItem: 1 });

recipeSchema.index({ restaurant: 1 });

recipeSchema.index({ store: 1 });

recipeSchema.index({ status: 1 });

recipeSchema.index({ isDeleted: 1 });

recipeSchema.index({ createdAt: -1 });

/* ==========================================================
   Middleware
========================================================== */

recipeSchema.pre(/^find/, function () {
  if (this.getFilter().isDeleted === undefined) {
    this.where({
      isDeleted: false,
    });
  }
});

recipeSchema.pre("validate", function () {
  if (this.recipeCode) {
    this.recipeCode = this.recipeCode.trim().toUpperCase();
  }
});

/* ==========================================================
   JSON
========================================================== */

recipeSchema.set("toJSON", {
  virtuals: true,
});

recipeSchema.set("toObject", {
  virtuals: true,
});

/* ==========================================================
   Export
========================================================== */

module.exports = mongoose.model("Recipe", recipeSchema);
