const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
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

    categoryCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    categoryName: {
      type: String,
      required: true,
      trim: true,
    },

    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    image: {
      type: String,
      default: "",
    },

    icon: {
      type: String,
      default: "",
    },

    kitchenCategory: {
      type: String,
      enum: [
        "Main Kitchen",
        "Chinese",
        "South Indian",
        "North Indian",
        "Tandoor",
        "Bakery",
        "Dessert",
        "Beverage",
        "Bar",
        "Fast Food",
      ],
      default: "Main Kitchen",
    },

    displayOrder: {
      type: Number,
      default: 0,
    },

    gstPercentage: {
      type: Number,
      default: 5,
      min: 0,
    },

    colorCode: {
      type: String,
      default: "#2196F3",
    },

    isVegCategory: {
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

/* ==========================================
   Virtual
========================================== */

categorySchema.virtual("status").get(function () {
  return this.isAvailable ? "Available" : "Unavailable";
});

/* ==========================================
   Indexes
========================================== */

categorySchema.index({ restaurant: 1 });

categorySchema.index({ store: 1 });

categorySchema.index({ categoryCode: 1 });

categorySchema.index({ categoryName: 1 });

categorySchema.index({ parentCategory: 1 });

categorySchema.index({ kitchenCategory: 1 });

categorySchema.index({ displayOrder: 1 });

categorySchema.index({ isActive: 1 });

categorySchema.index({ isDeleted: 1 });

/* ==========================================
   JSON
========================================== */

categorySchema.set("toJSON", {
  virtuals: true,
});

categorySchema.set("toObject", {
  virtuals: true,
});

/* ==========================================
   Export
========================================== */

module.exports = mongoose.model("Category", categorySchema);