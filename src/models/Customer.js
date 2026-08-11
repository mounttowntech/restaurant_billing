const mongoose = require("mongoose");

/* ==========================================================
   Address Schema
========================================================== */

const addressSchema = new mongoose.Schema(
  {
    addressType: {
      type: String,
      enum: ["Home", "Office", "Other"],
      default: "Home",
    },

    addressLine1: String,

    addressLine2: String,

    landmark: String,

    city: String,

    state: String,

    country: {
      type: String,
      default: "India",
    },

    pincode: String,

    latitude: Number,

    longitude: Number,

    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: false,
  }
);

/* ==========================================================
   Customer Schema
========================================================== */

const customerSchema = new mongoose.Schema(
  {
    customerCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    customerName: {
      type: String,
      required: true,
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

    customerType: {
      type: String,
      enum: [
        "Walk In",
        "Regular",
        "Corporate",
        "VIP",
        "Online",
      ],
      default: "Walk In",
    },

    mobile: {
      type: String,
      required: true,
      trim: true,
    },

    alternateMobile: String,

    email: {
      type: String,
      lowercase: true,
      trim: true,
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },

    dob: Date,

    anniversary: Date,

    gstNumber: String,

    panNumber: String,

    companyName: String,

    addresses: [addressSchema],

    loyaltyPoints: {
      type: Number,
      default: 0,
    },

    totalOrders: {
      type: Number,
      default: 0,
    },

    totalSpent: {
      type: Number,
      default: 0,
    },

    walletBalance: {
      type: Number,
      default: 0,
    },

    creditLimit: {
      type: Number,
      default: 0,
    },

    outstandingAmount: {
      type: Number,
      default: 0,
    },

    membershipType: {
      type: String,
      enum: [
        "None",
        "Silver",
        "Gold",
        "Platinum",
      ],
      default: "None",
    },

    favoriteFood: [String],

    notes: String,

    status: {
      type: String,
      enum: [
        "Active",
        "Inactive",
        "Blocked",
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
   Virtuals
========================================================== */

customerSchema.virtual("averageOrderValue").get(function () {
  if (!this.totalOrders) return 0;

  return Number(
    (this.totalSpent / this.totalOrders).toFixed(2)
  );
});

/* ==========================================================
   Indexes
========================================================== */

customerSchema.index(
  { customerCode: 1 },
  { unique: true }
);

customerSchema.index({ customerName: 1 });

customerSchema.index({ mobile: 1 });

customerSchema.index({ email: 1 });

customerSchema.index({ restaurant: 1 });

customerSchema.index({ store: 1 });

customerSchema.index({ customerType: 1 });

customerSchema.index({ membershipType: 1 });

customerSchema.index({ status: 1 });

customerSchema.index({ isDeleted: 1 });

customerSchema.index({ createdAt: -1 });

/* ==========================================================
   Middleware
========================================================== */

customerSchema.pre(/^find/, function () {

  if (this.getFilter().isDeleted === undefined) {

    this.where({
      isDeleted: false,
    });

  }



});

customerSchema.pre("validate", function () {

  if (this.customerCode) {

    this.customerCode = this.customerCode
      .trim()
      .toUpperCase();

  }

 

});

/* ==========================================================
   JSON
========================================================== */

customerSchema.set("toJSON", {
  virtuals: true,
});

customerSchema.set("toObject", {
  virtuals: true,
});

/* ==========================================================
   Export
========================================================== */

module.exports = mongoose.model(
  "Customer",
  customerSchema
);