const mongoose = require("mongoose");

/* ==========================================================
   Purchase Return Item Schema
========================================================== */

const purchaseReturnItemSchema = new mongoose.Schema(
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

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    purchasePrice: {
      type: Number,
      required: true,
      min: 0,
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

    refundAmount: {
      type: Number,
      default: 0,
    },

    reason: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    _id: false,
  }
);

/* ==========================================================
   Purchase Return Header Schema
========================================================== */

const purchaseReturnSchema = new mongoose.Schema(
  {
    returnNo: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    purchase: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Purchase",
      required: true,
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

    returnDate: {
      type: Date,
      default: Date.now,
    },

    returnType: {
      type: String,
      enum: [
        "Damaged",
        "Expired",
        "Wrong Item",
        "Excess",
        "Quality Issue",
        "Other",
      ],
      default: "Damaged",
    },

    refundMethod: {
      type: String,
      enum: [
        "Cash",
        "Bank",
        "UPI",
        "Credit Note",
        "Replacement",
      ],
      default: "Cash",
    },

    items: [purchaseReturnItemSchema],

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

    refundAmount: {
      type: Number,
      default: 0,
    },

    adjustmentAmount: {
      type: Number,
      default: 0,
    },

    returnStatus: {
      type: String,
      enum: [
        "Pending",
        "Approved",
        "Completed",
        "Rejected",
      ],
      default: "Completed",
    },

    remarks: {
      type: String,
      default: "",
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
   Auto Calculations
========================================================== */

purchaseReturnSchema.pre("save", function (next) {
  this.totalItems = this.items.length;

  this.totalQuantity = 0;
  this.subTotal = 0;
  this.discountAmount = 0;
  this.taxableAmount = 0;
  this.cgstAmount = 0;
  this.sgstAmount = 0;
  this.igstAmount = 0;
  this.gstAmount = 0;
  this.refundAmount = 0;

  this.items.forEach((item) => {

    const qty = Number(item.quantity || 0);
    const rate = Number(item.purchasePrice || 0);

    const gross = qty * rate;

    const discount = Number(item.discountAmount || 0);

    const taxable = gross - discount;

    const gst = taxable * Number(item.gstPercentage || 0) / 100;

    item.taxableAmount = taxable;
    item.gstAmount = gst;
    item.cgstAmount = gst / 2;
    item.sgstAmount = gst / 2;
    item.igstAmount = 0;

    item.refundAmount = taxable + gst;

    this.totalQuantity += qty;

    this.subTotal += gross;

    this.discountAmount += discount;

    this.taxableAmount += taxable;

    this.cgstAmount += item.cgstAmount;

    this.sgstAmount += item.sgstAmount;

    this.igstAmount += item.igstAmount;

    this.gstAmount += gst;

    this.refundAmount += item.refundAmount;
  });

  next();
});
/* ==========================================================
   Virtuals
========================================================== */

// Total Tax

purchaseReturnSchema.virtual("totalTax").get(function () {
  return (
    Number(this.cgstAmount || 0) +
    Number(this.sgstAmount || 0) +
    Number(this.igstAmount || 0)
  );
});

// Net Refund Amount

purchaseReturnSchema.virtual("netRefund").get(function () {
  return (
    Number(this.refundAmount || 0) -
    Number(this.adjustmentAmount || 0)
  );
});

// Average Item Cost

purchaseReturnSchema.virtual("averageItemCost").get(function () {
  if (!this.totalQuantity) return 0;

  return Number(
    (this.subTotal / this.totalQuantity).toFixed(2)
  );
});

// Total Returned Quantity

purchaseReturnSchema.virtual("returnedQuantity").get(function () {
  return this.items.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );
});

/* ==========================================================
   Indexes
========================================================== */

purchaseReturnSchema.index(
  { returnNo: 1 },
  { unique: true }
);

purchaseReturnSchema.index({
  purchase: 1,
});

purchaseReturnSchema.index({
  supplier: 1,
});

purchaseReturnSchema.index({
  restaurant: 1,
});

purchaseReturnSchema.index({
  store: 1,
});

purchaseReturnSchema.index({
  warehouse: 1,
});

purchaseReturnSchema.index({
  returnDate: -1,
});

purchaseReturnSchema.index({
  returnStatus: 1,
});

purchaseReturnSchema.index({
  refundMethod: 1,
});

purchaseReturnSchema.index({
  isDeleted: 1,
});

purchaseReturnSchema.index({
  createdAt: -1,
});

purchaseReturnSchema.index({
  supplier: 1,
  returnDate: -1,
});

purchaseReturnSchema.index({
  purchase: 1,
  returnDate: -1,
});

/* ==========================================================
   Middleware
========================================================== */

// Uppercase Return Number

purchaseReturnSchema.pre("validate", function (next) {

  if (this.returnNo) {
    this.returnNo = this.returnNo
      .trim()
      .toUpperCase();
  }

  next();
});

// Hide Soft Deleted Records

purchaseReturnSchema.pre(/^find/, function (next) {

  if (
    this.getFilter().isDeleted === undefined
  ) {
    this.where({
      isDeleted: false,
    });
  }

  next();
});

// Remove Invalid Items

purchaseReturnSchema.pre("save", function (next) {

  this.items = this.items.filter(
    (item) =>
      item.ingredient &&
      Number(item.quantity) > 0
  );

  next();
});

// Auto Update Timestamp

purchaseReturnSchema.pre(
  "findOneAndUpdate",
  function (next) {

    this.set({
      updatedAt: new Date(),
    });

    next();
  }
);

/* ==========================================================
   Instance Methods
========================================================== */

// Soft Delete

purchaseReturnSchema.methods.softDelete =
  async function (userId) {

    this.isDeleted = true;

    this.updatedBy = userId;

    await this.save();

    return this;
  };

// Restore

purchaseReturnSchema.methods.restore =
  async function () {

    this.isDeleted = false;

    await this.save();

    return this;
  };

/* ==========================================================
   Static Methods
========================================================== */

// Active Records

purchaseReturnSchema.statics.active =
  function () {

    return this.find({
      isDeleted: false,
    });
  };

// Deleted Records

purchaseReturnSchema.statics.deleted =
  function () {

    return this.find({
      isDeleted: true,
    });
  };

/* ==========================================================
   JSON Settings
========================================================== */

purchaseReturnSchema.set("toJSON", {
  virtuals: true,
});

purchaseReturnSchema.set("toObject", {
  virtuals: true,
});

/* ==========================================================
   Production Optimizations
========================================================== */

// Enable Virtuals in Lean Queries

purchaseReturnSchema.plugin(
  require("mongoose-lean-virtuals")
);

// Optimistic Concurrency

purchaseReturnSchema.set(
  "optimisticConcurrency",
  true
);

// Disable Version Key

purchaseReturnSchema.set(
  "versionKey",
  false
);

// Strict Query

purchaseReturnSchema.set(
  "strictQuery",
  true
);

/* ==========================================================
   Export Model
========================================================== */

module.exports = mongoose.model(
  "PurchaseReturn",
  purchaseReturnSchema
);