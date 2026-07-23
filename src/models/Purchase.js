const mongoose = require("mongoose");

/* ==========================================================
   Purchase Item Schema
========================================================== */

const purchaseItemSchema = new mongoose.Schema(
  {
    ingredient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ingredient",
      required: true,
    },

    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
    },

    ingredientCode: {
      type: String,
      trim: true,
    },

    ingredientName: {
      type: String,
      required: true,
      trim: true,
    },

    barcode: {
      type: String,
      trim: true,
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

    quantity: {
      type: Number,
      required: true,
      min: 0,
    },

    freeQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },

    purchasePrice: {
      type: Number,
      required: true,
      min: 0,
    },

    sellingPrice: {
      type: Number,
      default: 0,
    },

    discountPercentage: {
      type: Number,
      default: 0,
    },

    discountAmount: {
      type: Number,
      default: 0,
    },

    gstPercentage: {
      type: Number,
      default: 0,
    },

    cgstAmount: {
      type: Number,
      default: 0,
    },

    sgstAmount: {
      type: Number,
      default: 0,
    },

    igstAmount: {
      type: Number,
      default: 0,
    },

    gstAmount: {
      type: Number,
      default: 0,
    },

    taxableAmount: {
      type: Number,
      default: 0,
    },

    totalAmount: {
      type: Number,
      default: 0,
    },

    manufactureDate: Date,

    expiryDate: Date,

    remarks: String,
  },
  {
    _id: false,
  }
);

/* ==========================================================
   Purchase Header Schema
========================================================== */

const purchaseSchema = new mongoose.Schema(
  {
    purchaseNo: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    purchaseDate: {
      type: Date,
      default: Date.now,
    },

    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
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

    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
    },

    invoiceNumber: {
      type: String,
      trim: true,
    },

    invoiceDate: Date,

    items: [purchaseItemSchema],

    totalItems: {
      type: Number,
      default: 0,
    },

    totalQuantity: {
      type: Number,
      default: 0,
    },

    subTotal: {
      type: Number,
      default: 0,
    },

    discountAmount: {
      type: Number,
      default: 0,
    },

    taxableAmount: {
      type: Number,
      default: 0,
    },

    cgstAmount: {
      type: Number,
      default: 0,
    },

    sgstAmount: {
      type: Number,
      default: 0,
    },

    igstAmount: {
      type: Number,
      default: 0,
    },

    gstAmount: {
      type: Number,
      default: 0,
    },

    shippingCharge: {
      type: Number,
      default: 0,
    },

    otherCharges: {
      type: Number,
      default: 0,
    },

    roundOffAmount: {
      type: Number,
      default: 0,
    },

    grandTotal: {
      type: Number,
      default: 0,
    },

    paidAmount: {
      type: Number,
      default: 0,
    },

    dueAmount: {
      type: Number,
      default: 0,
    },

    paymentMethod: {
      type: String,
      enum: [
        "Cash",
        "Card",
        "UPI",
        "Bank",
        "Cheque",
        "Credit",
      ],
      default: "Cash",
    },

    paymentStatus: {
      type: String,
      enum: [
        "Pending",
        "Partial",
        "Paid",
      ],
      default: "Pending",
    },

    purchaseStatus: {
      type: String,
      enum: [
        "Draft",
        "Ordered",
        "Received",
        "Cancelled",
      ],
      default: "Received",
    },

    remarks: String,

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

purchaseSchema.pre("save", function (next) {
  this.totalItems = this.items.length;

  this.totalQuantity = 0;
  this.subTotal = 0;
  this.taxableAmount = 0;
  this.cgstAmount = 0;
  this.sgstAmount = 0;
  this.igstAmount = 0;
  this.gstAmount = 0;

  this.items.forEach((item) => {

    const qty = Number(item.quantity || 0);
    const price = Number(item.purchasePrice || 0);

    const gross = qty * price;

    const discount = Number(item.discountAmount || 0);

    const taxable = gross - discount;

    const gst = taxable * Number(item.gstPercentage || 0) / 100;

    item.taxableAmount = taxable;
    item.gstAmount = gst;
    item.cgstAmount = gst / 2;
    item.sgstAmount = gst / 2;
    item.igstAmount = 0;

    item.totalAmount = taxable + gst;

    this.totalQuantity += qty;

    this.subTotal += gross;

    this.taxableAmount += taxable;

    this.cgstAmount += item.cgstAmount;

    this.sgstAmount += item.sgstAmount;

    this.igstAmount += item.igstAmount;

    this.gstAmount += gst;
  });

  this.grandTotal =
    this.taxableAmount +
    this.gstAmount +
    Number(this.shippingCharge) +
    Number(this.otherCharges) -
    Number(this.discountAmount);

  this.dueAmount =
    this.grandTotal - Number(this.paidAmount);

  if (this.dueAmount <= 0)
    this.paymentStatus = "Paid";
  else if (this.paidAmount > 0)
    this.paymentStatus = "Partial";
  else
    this.paymentStatus = "Pending";

  next();
});
/* ==========================================================
   Virtuals
========================================================== */

// Total Discount
purchaseSchema.virtual("totalDiscount").get(function () {
  return (
    Number(this.discountAmount || 0) +
    this.items.reduce(
      (sum, item) => sum + Number(item.discountAmount || 0),
      0
    )
  );
});

// Total Tax
purchaseSchema.virtual("totalTax").get(function () {
  return (
    Number(this.cgstAmount || 0) +
    Number(this.sgstAmount || 0) +
    Number(this.igstAmount || 0)
  );
});

// Total Free Quantity
purchaseSchema.virtual("totalFreeQuantity").get(function () {
  return this.items.reduce(
    (sum, item) => sum + Number(item.freeQuantity || 0),
    0
  );
});

// Payment Percentage
purchaseSchema.virtual("paymentPercentage").get(function () {
  if (!this.grandTotal) return 0;

  return Number(
    ((this.paidAmount / this.grandTotal) * 100).toFixed(2)
  );
});

// Pending Amount
purchaseSchema.virtual("pendingAmount").get(function () {
  return this.dueAmount;
});

/* ==========================================================
   Indexes
========================================================== */

purchaseSchema.index({ purchaseNo: 1 }, { unique: true });

purchaseSchema.index({ purchaseDate: -1 });

purchaseSchema.index({ supplier: 1 });

purchaseSchema.index({ restaurant: 1 });

purchaseSchema.index({ store: 1 });

purchaseSchema.index({ warehouse: 1 });

purchaseSchema.index({ paymentStatus: 1 });

purchaseSchema.index({ purchaseStatus: 1 });

purchaseSchema.index({ invoiceNumber: 1 });

purchaseSchema.index({ createdAt: -1 });

purchaseSchema.index({ isDeleted: 1 });

purchaseSchema.index({
  supplier: 1,
  purchaseDate: -1,
});

purchaseSchema.index({
  store: 1,
  purchaseDate: -1,
});

/* ==========================================================
   Middleware
========================================================== */

// Always uppercase Purchase Number

purchaseSchema.pre("validate", function (next) {
  if (this.purchaseNo) {
    this.purchaseNo = this.purchaseNo
      .trim()
      .toUpperCase();
  }

  next();
});

// Hide deleted purchases automatically

purchaseSchema.pre(/^find/, function (next) {
  if (!this.getFilter().hasOwnProperty("isDeleted")) {
    this.where({
      isDeleted: false,
    });
  }

  next();
});

/* ==========================================================
   JSON Settings
========================================================== */

purchaseSchema.set("toJSON", {
  virtuals: true,
});

purchaseSchema.set("toObject", {
  virtuals: true,
});

/* ==========================================================
   Production Optimizations
========================================================== */

// Remove empty items before save

purchaseSchema.pre("save", function (next) {
  this.items = this.items.filter(
    (item) =>
      item.ingredient &&
      Number(item.quantity) > 0
  );

  next();
});

// Update timestamp on update

purchaseSchema.pre("findOneAndUpdate", function (next) {
  this.set({
    updatedAt: new Date(),
  });

  next();
});

/* ==========================================================
   Export Model
========================================================== */

module.exports = mongoose.model(
  "Purchase",
  purchaseSchema
);