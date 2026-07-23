const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    addressLine1: {
      type: String,
      trim: true,
      default: "",
    },

    addressLine2: {
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
  },
  { _id: false }
);

const bankSchema = new mongoose.Schema(
  {
    bankName: {
      type: String,
      trim: true,
      default: "",
    },

    accountHolder: {
      type: String,
      trim: true,
      default: "",
    },

    accountNumber: {
      type: String,
      trim: true,
      default: "",
    },

    ifscCode: {
      type: String,
      trim: true,
      default: "",
    },

    branch: {
      type: String,
      trim: true,
      default: "",
    },

    upiId: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { _id: false }
);

const supplierSchema = new mongoose.Schema(
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

    supplierCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    supplierName: {
      type: String,
      required: true,
      trim: true,
    },

    companyName: {
      type: String,
      trim: true,
      default: "",
    },

    contactPerson: {
      type: String,
      trim: true,
      default: "",
    },

    mobile: {
      type: String,
      required: true,
      trim: true,
    },

    alternateMobile: {
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

    website: {
      type: String,
      trim: true,
      default: "",
    },

    gstNumber: {
      type: String,
      trim: true,
      uppercase: true,
      default: "",
    },

    panNumber: {
      type: String,
      trim: true,
      uppercase: true,
      default: "",
    },

    licenseNumber: {
      type: String,
      trim: true,
      default: "",
    },

    address: addressSchema,

    bankDetails: bankSchema,

    paymentTerms: {
      type: String,
      enum: [
        "Cash",
        "7 Days",
        "15 Days",
        "30 Days",
        "45 Days",
        "60 Days",
      ],
      default: "Cash",
    },

    creditLimit: {
      type: Number,
      default: 0,
      min: 0,
    },

    outstandingAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalPurchaseAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalOrders: {
      type: Number,
      default: 0,
    },

    supplierType: {
      type: String,
      enum: [
        "Vegetable",
        "Grocery",
        "Meat",
        "Seafood",
        "Beverage",
        "Dairy",
        "Bakery",
        "Packaging",
        "General",
      ],
      default: "General",
    },

    rating: {
      type: Number,
      default: 5,
      min: 0,
      max: 5,
    },

    isPreferredSupplier: {
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

    remarks: {
      type: String,
      trim: true,
      default: "",
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

/* =====================================
   Virtuals
===================================== */

supplierSchema.virtual("paymentStatus").get(function () {
  return this.outstandingAmount > 0 ? "Pending" : "Paid";
});

/* =====================================
   Indexes
===================================== */

supplierSchema.index({ restaurant: 1 });

supplierSchema.index({ store: 1 });

supplierSchema.index({ supplierCode: 1 });

supplierSchema.index({ supplierName: 1 });

supplierSchema.index({ companyName: 1 });

supplierSchema.index({ mobile: 1 });

supplierSchema.index({ gstNumber: 1 });

supplierSchema.index({ supplierType: 1 });

supplierSchema.index({ isPreferredSupplier: 1 });

supplierSchema.index({ isDeleted: 1 });

supplierSchema.index({ isActive: 1 });

/* =====================================
   JSON
===================================== */

supplierSchema.set("toJSON", {
  virtuals: true,
});

supplierSchema.set("toObject", {
  virtuals: true,
});

/* =====================================
   Export
===================================== */

module.exports = mongoose.model("Supplier", supplierSchema);