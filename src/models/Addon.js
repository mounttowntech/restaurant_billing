const mongoose = require("mongoose");

const addonSchema = new mongoose.Schema(
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

    addonCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    addonName: {
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

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuCategory",
    },

    image: {
      type: String,
      default: "",
    },

    foodType: {
      type: String,
      enum: ["Veg", "Non Veg", "Both"],
      default: "Both",
    },

    addonType: {
      type: String,
      enum: [
        "Ingredient",
        "Topping",
        "Side Dish",
        "Beverage",
        "Dessert",
        "Extra",
      ],
      default: "Extra",
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    gstPercentage: {
      type: Number,
      default: 5,
      min: 0,
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

    applicableMenuItems: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MenuItem",
      },
    ],

    isMandatory: {
      type: Boolean,
      default: false,
    },

    allowMultiple: {
      type: Boolean,
      default: false,
    },

    maxQuantity: {
      type: Number,
      default: 1,
      min: 1,
    },

    displayOrder: {
      type: Number,
      default: 0,
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

/* ==============================
   Virtuals
============================== */

addonSchema.virtual("status").get(function () {
  return this.isAvailable ? "Available" : "Unavailable";
});

/* ==============================
   Indexes
============================== */

addonSchema.index({ restaurant: 1 });
addonSchema.index({ store: 1 });
addonSchema.index({ addonCode: 1 });
addonSchema.index({ addonName: 1 });
addonSchema.index({ category: 1 });
addonSchema.index({ addonType: 1 });
addonSchema.index({ foodType: 1 });
addonSchema.index({ isAvailable: 1 });
addonSchema.index({ isDeleted: 1 });

/* ==============================
   JSON
============================== */

addonSchema.set("toJSON", { virtuals: true });
addonSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Addon", addonSchema);