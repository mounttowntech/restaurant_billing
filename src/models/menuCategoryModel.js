const mongoose = require("mongoose");

const menuCategorySchema = new mongoose.Schema(
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

    displayName: {
      type: String,
      trim: true,
      default: "",
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    image: {
      type: String,
      default: "",
    },

    icon: {
      type: String,
      default: "",
    },

    parentCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuCategory",
      default: null,
    },

    kitchenSection: {
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

    foodType: {
      type: String,
      enum: ["Veg", "Non Veg", "Both"],
      default: "Both",
    },

    serviceType: [
      {
        type: String,
        enum: ["Dine In", "Take Away", "Delivery", "Drive Thru"],
      },
    ],

    displayOrder: {
      type: Number,
      default: 0,
    },

    colorCode: {
      type: String,
      default: "#4CAF50",
    },

    isPopular: {
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
  },
);

/* ===========================
   Virtual
=========================== */

menuCategorySchema.virtual("status").get(function () {
  return this.isAvailable ? "Available" : "Unavailable";
});

/* ===========================
   Indexes
=========================== */

menuCategorySchema.index({ restaurant: 1 });

menuCategorySchema.index({ store: 1 });

menuCategorySchema.index({ categoryCode: 1 });

menuCategorySchema.index({ categoryName: 1 });

menuCategorySchema.index({ kitchenSection: 1 });

menuCategorySchema.index({ foodType: 1 });

menuCategorySchema.index({ isPopular: 1 });

menuCategorySchema.index({ displayOrder: 1 });

menuCategorySchema.index({ isDeleted: 1 });

/* ===========================
   JSON
=========================== */

menuCategorySchema.set("toJSON", {
  virtuals: true,
});

menuCategorySchema.set("toObject", {
  virtuals: true,
});

/* ===========================
   Export
=========================== */

module.exports = mongoose.model("MenuCategory", menuCategorySchema);
