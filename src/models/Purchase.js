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
      default: null,
    },

    ingredientCode: {
      type: String,
      trim: true,
      default: "",
    },

    ingredientName: {
      type: String,
      required: true,
      trim: true,
    },

    barcode: {
      type: String,
      trim: true,
      default: "",
    },

    /* Stock Unit */
    unit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
      required: true,
    },

    /* Purchase Unit */
    purchaseUnit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
      default: null,
    },

    quantity: {
      type: Number,
      required: true,
      min: 0.0001,
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
      min: 0,
    },

    discountPercentage: {
      type: Number,
      default: 0,
      min: 0,
    },

    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    gstPercentage: {
      type: Number,
      default: 0,
      min: 0,
    },

    cgstAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    sgstAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    igstAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    gstAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    taxableAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    manufactureDate: {
      type: Date,
      default: null,
    },

    expiryDate: {
      type: Date,
      default: null,
    },

    remarks: {
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
      default: null,
    },

    invoiceNumber: {
      type: String,
      trim: true,
      default: "",
    },

    invoiceDate: {
      type: Date,
      default: null,
    },

    items: {
      type: [purchaseItemSchema],
      default: [],
    },

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
      min: 0,
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

    remarks: {
      type: String,
      default: "",
      trim: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

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

/* ==========================================================
   Validate / Clean Purchase Items
========================================================== */

purchaseSchema.pre("save", function () {
  this.items = this.items.filter(
    (item) =>
      item.ingredient &&
      Number(item.quantity) > 0
  );

  /* ========================================================
     Header Calculations
  ======================================================== */

  this.totalItems = this.items.length;

  this.totalQuantity = 0;
  this.subTotal = 0;
  this.taxableAmount = 0;
  this.cgstAmount = 0;
  this.sgstAmount = 0;
  this.igstAmount = 0;
  this.gstAmount = 0;

  /* ========================================================
     Item Calculations
  ======================================================== */

  this.items.forEach((item) => {
    const qty = Number(item.quantity || 0);

    const price = Number(
      item.purchasePrice || 0
    );

    const gross = qty * price;

    /* Calculate discount from percentage */

    const discountPercentage = Number(
      item.discountPercentage || 0
    );

    const discountAmount =
      gross *
      discountPercentage /
      100;

    item.discountAmount =
      Number(discountAmount.toFixed(2));

    /* Taxable */

    const taxable =
      gross -
      item.discountAmount;

    item.taxableAmount =
      Number(taxable.toFixed(2));

    /* GST */

    const gstPercentage = Number(
      item.gstPercentage || 0
    );

    const gst =
      taxable *
      gstPercentage /
      100;

    item.gstAmount =
      Number(gst.toFixed(2));

    /* CGST / SGST */

    item.cgstAmount =
      Number((gst / 2).toFixed(2));

    item.sgstAmount =
      Number((gst / 2).toFixed(2));

    item.igstAmount = 0;

    /* Item Total */

    item.totalAmount =
      Number(
        (taxable + gst).toFixed(2)
      );

    /* Header Totals */

    this.totalQuantity += qty;

    this.subTotal += gross;

    this.taxableAmount += taxable;

    this.cgstAmount +=
      item.cgstAmount;

    this.sgstAmount +=
      item.sgstAmount;

    this.igstAmount +=
      item.igstAmount;

    this.gstAmount += gst;
  });

  /* ========================================================
     Grand Total
  ======================================================== */

  this.grandTotal =
    this.taxableAmount +
    this.gstAmount +
    Number(this.shippingCharge || 0) +
    Number(this.otherCharges || 0) -
    Number(this.discountAmount || 0) +
    Number(this.roundOffAmount || 0);

  this.grandTotal =
    Number(this.grandTotal.toFixed(2));

  /* ========================================================
     Due Amount
  ======================================================== */

  this.paidAmount =
    Number(this.paidAmount || 0);

  this.dueAmount =
    this.grandTotal -
    this.paidAmount;

  this.dueAmount =
    Number(this.dueAmount.toFixed(2));

  /* ========================================================
     Payment Status
  ======================================================== */

  if (this.dueAmount <= 0) {
    this.paymentStatus = "Paid";
  } else if (this.paidAmount > 0) {
    this.paymentStatus = "Partial";
  } else {
    this.paymentStatus = "Pending";
  }
});

/* ==========================================================
   Virtual - Total Discount
========================================================== */

purchaseSchema.virtual(
  "totalDiscount"
).get(function () {
  const itemDiscount =
    this.items.reduce(
      (sum, item) =>
        sum +
        Number(
          item.discountAmount || 0
        ),
      0
    );

  return (
    Number(
      this.discountAmount || 0
    ) + itemDiscount
  );
});

/* ==========================================================
   Virtual - Total Tax
========================================================== */

purchaseSchema.virtual(
  "totalTax"
).get(function () {
  return (
    Number(this.cgstAmount || 0) +
    Number(this.sgstAmount || 0) +
    Number(this.igstAmount || 0)
  );
});

/* ==========================================================
   Virtual - Total Free Quantity
========================================================== */

purchaseSchema.virtual(
  "totalFreeQuantity"
).get(function () {
  return this.items.reduce(
    (sum, item) =>
      sum +
      Number(item.freeQuantity || 0),
    0
  );
});

/* ==========================================================
   Virtual - Payment Percentage
========================================================== */

purchaseSchema.virtual(
  "paymentPercentage"
).get(function () {
  if (!this.grandTotal) {
    return 0;
  }

  return Number(
    (
      (this.paidAmount /
        this.grandTotal) *
      100
    ).toFixed(2)
  );
});

/* ==========================================================
   Virtual - Pending Amount
========================================================== */

purchaseSchema.virtual(
  "pendingAmount"
).get(function () {
  return this.dueAmount;
});

/* ==========================================================
   Indexes
========================================================== */

purchaseSchema.index(
  { purchaseNo: 1 },
  { unique: true }
);

purchaseSchema.index({
  purchaseDate: -1,
});

purchaseSchema.index({
  supplier: 1,
});

purchaseSchema.index({
  restaurant: 1,
});

purchaseSchema.index({
  store: 1,
});

purchaseSchema.index({
  warehouse: 1,
});

purchaseSchema.index({
  paymentStatus: 1,
});

purchaseSchema.index({
  purchaseStatus: 1,
});

purchaseSchema.index({
  invoiceNumber: 1,
});

purchaseSchema.index({
  createdAt: -1,
});

purchaseSchema.index({
  isDeleted: 1,
});

purchaseSchema.index({
  supplier: 1,
  purchaseDate: -1,
});

purchaseSchema.index({
  store: 1,
  purchaseDate: -1,
});

/* ==========================================================
   Purchase Number Uppercase
========================================================== */

purchaseSchema.pre(
  "validate",
  function () {
    if (this.purchaseNo) {
      this.purchaseNo =
        this.purchaseNo
          .trim()
          .toUpperCase();
    }
  }
);

/* ==========================================================
   Hide Deleted Purchases
========================================================== */

purchaseSchema.pre(
  /^find/,
  function () {
    if (
      !Object.prototype.hasOwnProperty.call(
        this.getFilter(),
        "isDeleted"
      )
    ) {
      this.where({
        isDeleted: false,
      });
    }
  }
);

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
   Export
========================================================== */

module.exports = mongoose.model(
  "Purchase",
  purchaseSchema
);