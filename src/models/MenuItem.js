const mongoose = require("mongoose");

/* ==========================================================
   Variant Schema
========================================================== */

const variantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    preparationTime: {
      type: Number,
      default: 0,
    },

    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
);

/* ==========================================================
   Menu Item Schema
========================================================== */

const menuItemSchema = new mongoose.Schema(
  {
    menuCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    menuName: {
      type: String,
      required: true,
      trim: true,
    },

    shortName: {
      type: String,
      trim: true,
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

    menuCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuCategory",
      required: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },

    recipe: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recipe",
    },

    // kitchen: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "Kitchen",
    // },

    barcode: String,

    hsnCode: String,

    image: String,

    description: String,

    foodType: {
      type: String,
      enum: [
        "Veg",
        "Non Veg",
        "Egg",
        "Vegan",
        "Jain"
      ],
      default: "Veg",
    },

    spiceLevel: {
      type: String,
      enum: [
        "None",
        "Low",
        "Medium",
        "High",
        "Extra Hot"
      ],
      default: "Medium",
    },

    dineInPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    takeawayPrice: {
      type: Number,
      default: 0,
    },

    deliveryPrice: {
      type: Number,
      default: 0,
    },

    costPrice: {
      type: Number,
      default: 0,
    },

    gstPercentage: {
      type: Number,
      default: 5,
    },

    discountPercentage: {
      type: Number,
      default: 0,
    },

    preparationTime: {
      type: Number,
      default: 10,
    },

    calories: Number,

    servingSize: String,

    addons: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Addon",
      },
    ],

    variants: [variantSchema],

    isAvailable: {
      type: Boolean,
      default: true,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    isRecommended: {
      type: Boolean,
      default: false,
    },

    displayOrder: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: [
        "Active",
        "Inactive"
      ],
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
  }
);

/* ==========================================================
   Auto Calculation
========================================================== */

menuItemSchema.pre("save", function () {

  if (!this.takeawayPrice)
    this.takeawayPrice = this.dineInPrice;

  if (!this.deliveryPrice)
    this.deliveryPrice = this.dineInPrice;


});

/* ==========================================================
   Virtuals
========================================================== */

menuItemSchema.virtual("profit").get(function () {

  return (
    Number(this.dineInPrice) -
    Number(this.costPrice)
  );

});

menuItemSchema.virtual("profitPercentage").get(function () {

  if (!this.dineInPrice) return 0;

  return Number(
    (
      ((this.dineInPrice - this.costPrice) /
        this.dineInPrice) *
      100
    ).toFixed(2)
  );

});

/* ==========================================================
   Indexes
========================================================== */

menuItemSchema.index({ menuCode: 1 }, { unique: true });

menuItemSchema.index({ menuName: 1 });

menuItemSchema.index({ menuCategory: 1 });

menuItemSchema.index({ restaurant: 1 });

menuItemSchema.index({ store: 1 });

menuItemSchema.index({ foodType: 1 });

menuItemSchema.index({ status: 1 });

menuItemSchema.index({ isAvailable: 1 });

menuItemSchema.index({ isDeleted: 1 });

menuItemSchema.index({ createdAt: -1 });

/* ==========================================================
   Middleware
========================================================== */

menuItemSchema.pre(/^find/, function () {

  if (this.getFilter().isDeleted === undefined) {

    this.where({
      isDeleted: false,
    });

  }



});

menuItemSchema.pre("validate", function () {

  if (this.menuCode) {

    this.menuCode = this.menuCode
      .trim()
      .toUpperCase();

  }



});

/* ==========================================================
   JSON
========================================================== */

menuItemSchema.set("toJSON", {
  virtuals: true,
});

menuItemSchema.set("toObject", {
  virtuals: true,
});

/* ==========================================================
   Export
========================================================== */

module.exports = mongoose.model(
  "MenuItem",
  menuItemSchema
);