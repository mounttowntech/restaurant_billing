const mongoose = require("mongoose");

/* ==========================================================
   Invoice Addon Schema
========================================================== */

const invoiceAddonSchema = new mongoose.Schema(
  {
    addon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Addon",
      required: true,
    },

    addonCode: {
      type: String,
      trim: true,
      uppercase: true,
    },

    addonName: {
      type: String,
      required: true,
      trim: true,
    },

    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },

    price: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    _id: false,
  }
);

/* ==========================================================
   Invoice Item Schema
========================================================== */

const invoiceItemSchema = new mongoose.Schema(
  {
    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuItem",
      required: true,
    },

    recipe: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recipe",
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuCategory",
    },

    menuCode: {
      type: String,
      trim: true,
      uppercase: true,
    },

    menuName: {
      type: String,
      required: true,
      trim: true,
    },

    variant: {
      name: String,
      price: Number,
    },

    addons: [invoiceAddonSchema],

    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },

    /* ======================================================
       Pricing
    ====================================================== */

    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    addonAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    grossAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    discountPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    taxableAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    /* ======================================================
       GST
    ====================================================== */

    gstPercentage: {
      type: Number,
      default: 5,
    },

    cgstPercentage: {
      type: Number,
      default: 2.5,
    },

    sgstPercentage: {
      type: Number,
      default: 2.5,
    },

    igstPercentage: {
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

    totalAmount: {
      type: Number,
      default: 0,
    },

    remarks: String,
  },
  {
    _id: false,
  }
);

/* ==========================================================
   Item Calculations
========================================================== */

invoiceItemSchema.pre("validate", function () {

  // Addon Total
  this.addonAmount = this.addons.reduce(
    (sum, addon) =>
      sum + (Number(addon.price) * Number(addon.quantity)),
    0
  );

  // Gross Amount
  this.grossAmount =
    (Number(this.unitPrice) * Number(this.quantity)) +
    Number(this.addonAmount);

  // Discount
  if (this.discountPercentage > 0) {
    this.discountAmount =
      (this.grossAmount * this.discountPercentage) / 100;
  }

  // Taxable
  this.taxableAmount =
    this.grossAmount - this.discountAmount;

  // GST
  this.cgstAmount =
    (this.taxableAmount * this.cgstPercentage) / 100;

  this.sgstAmount =
    (this.taxableAmount * this.sgstPercentage) / 100;

  this.igstAmount =
    (this.taxableAmount * this.igstPercentage) / 100;

  this.gstAmount =
    this.cgstAmount +
    this.sgstAmount +
    this.igstAmount;

  // Line Total
  this.totalAmount =
    this.taxableAmount +
    this.gstAmount;


});
/* ==========================================================
   Invoice Header Schema
========================================================== */

const invoiceSchema = new mongoose.Schema(
  {
    /* ======================================================
       Invoice Details
    ====================================================== */

    invoiceNo: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    invoiceDate: {
      type: Date,
      default: Date.now,
    },

    financialYear: {
      type: String,
      trim: true,
    },

    billNo: {
      type: String,
      trim: true,
    },

    /* ======================================================
       Restaurant Details
    ====================================================== */

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

    terminal: {
      type: String,
      trim: true,
    },

    shift: {
      type: String,
      enum: ["Morning", "Afternoon", "Evening", "Night"],
      default: "Morning",
    },

    /* ======================================================
       Customer
    ====================================================== */

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },

    customerName: String,

    customerMobile: String,

    customerGSTNo: String,

    /* ======================================================
       Order References
    ====================================================== */

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    kots: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "KOT",
      },
    ],

    reservation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reservation",
    },

    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
    },

    waiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Waiter",
    },

    cashier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    /* ======================================================
       Billing Type
    ====================================================== */

    billingType: {
      type: String,
      enum: [
        "Dine In",
        "Takeaway",
        "Delivery",
        "Online",
        "QR Order",
      ],
      default: "Dine In",
    },

    /* ======================================================
       Invoice Items
    ====================================================== */

    items: {
      type: [invoiceItemSchema],
      validate: [
        (items) => items.length > 0,
        "Invoice should contain at least one item.",
      ],
    },

    totalItems: {
      type: Number,
      default: 0,
    },

    totalQuantity: {
      type: Number,
      default: 0,
    },

    /* ======================================================
       Pricing Summary
    ====================================================== */

    subTotal: {
      type: Number,
      default: 0,
    },

    addonAmount: {
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

    serviceCharge: {
      type: Number,
      default: 0,
    },

    packingCharge: {
      type: Number,
      default: 0,
    },

    deliveryCharge: {
      type: Number,
      default: 0,
    },

    tipAmount: {
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

    /* ======================================================
       GST Summary
    ====================================================== */

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

    /* ======================================================
       Payment Details
    ====================================================== */

    paymentMethod: {
      type: String,
      enum: [
        "Cash",
        "Card",
        "UPI",
        "Wallet",
        "Net Banking",
        "Cheque",
        "Split",
      ],
      default: "Cash",
    },

    paymentStatus: {
      type: String,
      enum: [
        "Pending",
        "Partial",
        "Paid",
        "Refunded",
      ],
      default: "Pending",
    },

    paidAmount: {
      type: Number,
      default: 0,
    },

    dueAmount: {
      type: Number,
      default: 0,
    },

    changeAmount: {
      type: Number,
      default: 0,
    },

    transactionId: {
      type: String,
      trim: true,
    },

    splitPayments: [
      {
        paymentMethod: {
          type: String,
          enum: [
            "Cash",
            "Card",
            "UPI",
            "Wallet",
            "Net Banking",
          ],
        },

        amount: Number,

        transactionId: String,
      },
    ],

    /* ======================================================
       Status Fields
    ====================================================== */

    invoiceStatus: {
      type: String,
      enum: [
        "Draft",
        "Completed",
        "Cancelled",
      ],
      default: "Completed",
    },

    returnStatus: {
      type: String,
      enum: [
        "None",
        "Partial",
        "Returned",
      ],
      default: "None",
    },

    refundStatus: {
      type: String,
      enum: [
        "Not Refunded",
        "Partial",
        "Refunded",
      ],
      default: "Not Refunded",
    },

    deliveryStatus: {
      type: String,
      enum: [
        "Pending",
        "Preparing",
        "Out For Delivery",
        "Delivered",
      ],
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
   Pre-save Calculations
========================================================== */

invoiceSchema.pre("save", function () {
  // ============================================
  // Total Items & Quantity
  // ============================================

  this.totalItems = this.items.length;

  this.totalQuantity = this.items.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  // ============================================
  // Item Totals
  // ============================================

  this.subTotal = this.items.reduce(
    (sum, item) => sum + Number(item.grossAmount || 0),
    0
  );

  this.addonAmount = this.items.reduce(
    (sum, item) => sum + Number(item.addonAmount || 0),
    0
  );

  this.discountAmount = this.items.reduce(
    (sum, item) => sum + Number(item.discountAmount || 0),
    0
  );

  this.taxableAmount = this.items.reduce(
    (sum, item) => sum + Number(item.taxableAmount || 0),
    0
  );

  // ============================================
  // GST Summary
  // ============================================

  this.cgstAmount = this.items.reduce(
    (sum, item) => sum + Number(item.cgstAmount || 0),
    0
  );

  this.sgstAmount = this.items.reduce(
    (sum, item) => sum + Number(item.sgstAmount || 0),
    0
  );

  this.igstAmount = this.items.reduce(
    (sum, item) => sum + Number(item.igstAmount || 0),
    0
  );

  this.gstAmount =
    Number(this.cgstAmount) +
    Number(this.sgstAmount) +
    Number(this.igstAmount);

  // ============================================
  // Grand Total
  // ============================================

  this.grandTotal =
    Number(this.taxableAmount) +
    Number(this.gstAmount) +
    Number(this.serviceCharge || 0) +
    Number(this.packingCharge || 0) +
    Number(this.deliveryCharge || 0) +
    Number(this.tipAmount || 0) +
    Number(this.roundOffAmount || 0);

  // Round to 2 decimal places
  this.grandTotal = Number(this.grandTotal.toFixed(2));

  // ============================================
  // Due Amount
  // ============================================

  this.dueAmount =
    Number(this.grandTotal) -
    Number(this.paidAmount || 0);

  if (this.dueAmount < 0) {
    this.changeAmount = Math.abs(this.dueAmount);
    this.dueAmount = 0;
  } else {
    this.changeAmount = 0;
  }

  // ============================================
  // Payment Status
  // ============================================

  if (this.paidAmount <= 0) {
    this.paymentStatus = "Pending";
  } else if (this.paidAmount < this.grandTotal) {
    this.paymentStatus = "Partial";
  } else if (this.paidAmount >= this.grandTotal) {
    this.paymentStatus = "Paid";
  }

  // ============================================
  // Invoice Status
  // ============================================

  if (this.invoiceStatus !== "Cancelled") {
    this.invoiceStatus = "Completed";
  }

  // ============================================
  // Refund Status
  // ============================================

  if (this.returnStatus === "Returned") {
    this.refundStatus = "Refunded";
  } else if (this.returnStatus === "Partial") {
    this.refundStatus = "Partial";
  } else {
    this.refundStatus = "Not Refunded";
  }

  // ============================================
  // Payment Method Validation
  // ============================================

  if (
    this.paymentMethod === "Split" &&
    this.splitPayments &&
    this.splitPayments.length > 0
  ) {
    const splitTotal = this.splitPayments.reduce(
      (sum, payment) => sum + Number(payment.amount || 0),
      0
    );

    this.paidAmount = splitTotal;

    this.dueAmount =
      Number(this.grandTotal) - Number(splitTotal);

    if (this.dueAmount < 0) {
      this.changeAmount = Math.abs(this.dueAmount);
      this.dueAmount = 0;
    }
  }

});
/* ==========================================================
   Virtuals
========================================================== */

// Total Tax
invoiceSchema.virtual("totalTax").get(function () {
  return (
    Number(this.cgstAmount || 0) +
    Number(this.sgstAmount || 0) +
    Number(this.igstAmount || 0)
  );
});

// Pending Amount
invoiceSchema.virtual("pendingAmount").get(function () {
  return Math.max(
    Number(this.grandTotal || 0) - Number(this.paidAmount || 0),
    0
  );
});

// Is Paid
invoiceSchema.virtual("isPaid").get(function () {
  return this.paymentStatus === "Paid";
});

// Is Cancelled
invoiceSchema.virtual("isCancelled").get(function () {
  return this.invoiceStatus === "Cancelled";
});

// Total Addons
invoiceSchema.virtual("totalAddons").get(function () {
  return this.items.reduce(
    (sum, item) => sum + (item.addons ? item.addons.length : 0),
    0
  );
});

/* ==========================================================
   Indexes
========================================================== */

invoiceSchema.index({ invoiceNo: 1 }, { unique: true });

invoiceSchema.index({ invoiceDate: -1 });

invoiceSchema.index({ restaurant: 1 });

invoiceSchema.index({ store: 1 });

invoiceSchema.index({ customer: 1 });

invoiceSchema.index({ order: 1 });

invoiceSchema.index({ table: 1 });

invoiceSchema.index({ waiter: 1 });

invoiceSchema.index({ cashier: 1 });

invoiceSchema.index({ billingType: 1 });

invoiceSchema.index({ paymentStatus: 1 });

invoiceSchema.index({ invoiceStatus: 1 });

invoiceSchema.index({ returnStatus: 1 });

invoiceSchema.index({ refundStatus: 1 });

invoiceSchema.index({ isDeleted: 1 });

invoiceSchema.index({ createdAt: -1 });

invoiceSchema.index({
  invoiceNo: "text",
  customerName: "text",
});

/* ==========================================================
   Query Middleware
========================================================== */

// Hide Soft Deleted Records
invoiceSchema.pre(/^find/, function () {
  if (this.getFilter().isDeleted === undefined) {
    this.where({ isDeleted: false });
  }


});

// Format Invoice Number
invoiceSchema.pre("validate", function () {
  if (this.invoiceNo) {
    this.invoiceNo = this.invoiceNo
      .trim()
      .toUpperCase();
  }


});

/* ==========================================================
   Instance Methods
========================================================== */

// Mark Paid
invoiceSchema.methods.markPaid = async function (
  paymentMethod = "Cash",
  transactionId = ""
) {
  this.paymentMethod = paymentMethod;
  this.transactionId = transactionId;
  this.paidAmount = this.grandTotal;
  this.dueAmount = 0;
  this.changeAmount = 0;
  this.paymentStatus = "Paid";

  return await this.save();
};

// Cancel Invoice
invoiceSchema.methods.cancelInvoice = async function (
  remarks = ""
) {
  this.invoiceStatus = "Cancelled";
  this.remarks = remarks;

  return await this.save();
};

// Mark Refunded
invoiceSchema.methods.markRefunded = async function () {
  this.refundStatus = "Refunded";
  this.returnStatus = "Returned";

  return await this.save();
};

// Soft Delete
invoiceSchema.methods.softDelete = async function (
  userId
) {
  this.isDeleted = true;
  this.updatedBy = userId;

  return await this.save();
};

// Restore
invoiceSchema.methods.restore = async function () {
  this.isDeleted = false;

  return await this.save();
};

/* ==========================================================
   Static Methods
========================================================== */

// Today's Sales
invoiceSchema.statics.getTodaySales = function () {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return this.find({
    invoiceDate: {
      $gte: start,
      $lte: end,
    },
    isDeleted: false,
  });
};

// Pending Invoices
invoiceSchema.statics.getPendingInvoices = function () {
  return this.find({
    paymentStatus: {
      $in: ["Pending", "Partial"],
    },
    invoiceStatus: "Completed",
    isDeleted: false,
  }).sort({
    invoiceDate: -1,
  });
};

// Daily Collection
invoiceSchema.statics.getDailyCollection =
  async function (date = new Date()) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const result = await this.aggregate([
      {
        $match: {
          invoiceDate: {
            $gte: start,
            $lte: end,
          },
          invoiceStatus: "Completed",
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: null,
          totalSales: {
            $sum: "$grandTotal",
          },
          totalReceived: {
            $sum: "$paidAmount",
          },
          totalDue: {
            $sum: "$dueAmount",
          },
          totalBills: {
            $sum: 1,
          },
        },
      },
    ]);

    return (
      result[0] || {
        totalSales: 0,
        totalReceived: 0,
        totalDue: 0,
        totalBills: 0,
      }
    );
  };

// Sales By Store
invoiceSchema.statics.getStoreSales = function (
  storeId
) {
  return this.find({
    store: storeId,
    invoiceStatus: "Completed",
    isDeleted: false,
  });
};

/* ==========================================================
   JSON Settings
========================================================== */

invoiceSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
});

invoiceSchema.set("toObject", {
  virtuals: true,
  versionKey: false,
});

/* ==========================================================
   Export
========================================================== */

module.exports = mongoose.model(
  "Invoice",
  invoiceSchema
);