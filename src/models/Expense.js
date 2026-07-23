const mongoose = require("mongoose");

/* ==========================================================
   Attachment Schema
========================================================== */

const attachmentSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      trim: true,
    },

    fileUrl: {
      type: String,
      trim: true,
    },

    fileType: {
      type: String,
      trim: true,
    },

    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  }
);

/* ==========================================================
   Expense Schema
========================================================== */

const expenseSchema = new mongoose.Schema(
  {
    /* ======================================================
       Expense Details
    ====================================================== */

    expenseNo: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    expenseDate: {
      type: Date,
      default: Date.now,
    },

    dueDate: Date,

    /* ======================================================
       Restaurant
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

    /* ======================================================
       Category
    ====================================================== */

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExpenseCategory",
      required: true,
    },

    expenseName: {
      type: String,
      required: true,
      trim: true,
    },

    description: String,

    /* ======================================================
       Supplier
    ====================================================== */

    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
    },

    /* ======================================================
       References
    ====================================================== */

    purchase: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Purchase",
    },

    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },

    /* ======================================================
       Pricing
    ====================================================== */

    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },

    unitPrice: {
      type: Number,
      default: 0,
      min: 0,
    },

    grossAmount: {
      type: Number,
      default: 0,
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
    },

    taxableAmount: {
      type: Number,
      default: 0,
    },

    /* ======================================================
       GST
    ====================================================== */

    gstPercentage: {
      type: Number,
      default: 0,
    },

    cgstPercentage: {
      type: Number,
      default: 0,
    },

    sgstPercentage: {
      type: Number,
      default: 0,
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

    /* ======================================================
       Payment
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
        "Cancelled",
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

    transactionId: String,

    referenceNo: String,

    /* ======================================================
       Approval
    ====================================================== */

    approvalStatus: {
      type: String,
      enum: [
        "Pending",
        "Approved",
        "Rejected",
      ],
      default: "Pending",
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    approvedAt: Date,

    rejectionReason: String,

    /* ======================================================
       Attachments
    ====================================================== */

    attachments: [attachmentSchema],

    remarks: String,

    /* ======================================================
       Audit
    ====================================================== */

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

expenseSchema.pre("save", function (next) {

  // Gross Amount
  this.grossAmount =
    Number(this.quantity || 0) *
    Number(this.unitPrice || 0);

  // Discount
  this.discountAmount =
    (this.grossAmount *
      Number(this.discountPercentage || 0)) /
    100;

  // Taxable Amount
  this.taxableAmount =
    this.grossAmount -
    this.discountAmount;

  // GST
  this.cgstAmount =
    (this.taxableAmount *
      Number(this.cgstPercentage || 0)) /
    100;

  this.sgstAmount =
    (this.taxableAmount *
      Number(this.sgstPercentage || 0)) /
    100;

  this.igstAmount =
    (this.taxableAmount *
      Number(this.igstPercentage || 0)) /
    100;

  this.gstAmount =
    this.cgstAmount +
    this.sgstAmount +
    this.igstAmount;

  // Total
  this.totalAmount =
    this.taxableAmount +
    this.gstAmount;

  // Due
  this.dueAmount =
    this.totalAmount -
    Number(this.paidAmount || 0);

  if (this.dueAmount < 0) {
    this.dueAmount = 0;
  }

  // Payment Status
  if (this.paidAmount <= 0) {
    this.paymentStatus = "Pending";
  } else if (this.paidAmount < this.totalAmount) {
    this.paymentStatus = "Partial";
  } else {
    this.paymentStatus = "Paid";
  }

  next();
});
/* ==========================================================
   Virtuals
========================================================== */

// Pending Amount
expenseSchema.virtual("pendingAmount").get(function () {
  return Math.max(
    Number(this.totalAmount || 0) - Number(this.paidAmount || 0),
    0
  );
});

// Is Paid
expenseSchema.virtual("isPaid").get(function () {
  return this.paymentStatus === "Paid";
});

// Is Approved
expenseSchema.virtual("isApproved").get(function () {
  return this.approvalStatus === "Approved";
});

// Is Rejected
expenseSchema.virtual("isRejected").get(function () {
  return this.approvalStatus === "Rejected";
});

// Is Pending Approval
expenseSchema.virtual("isPendingApproval").get(function () {
  return this.approvalStatus === "Pending";
});

/* ==========================================================
   Database Indexes
========================================================== */

expenseSchema.index({ expenseNo: 1 }, { unique: true });

expenseSchema.index({ expenseDate: -1 });

expenseSchema.index({ restaurant: 1 });

expenseSchema.index({ store: 1 });

expenseSchema.index({ category: 1 });

expenseSchema.index({ supplier: 1 });

expenseSchema.index({ purchase: 1 });

expenseSchema.index({ payment: 1 });

expenseSchema.index({ paymentStatus: 1 });

expenseSchema.index({ approvalStatus: 1 });

expenseSchema.index({ isDeleted: 1 });

expenseSchema.index({ createdAt: -1 });

expenseSchema.index({
  expenseNo: "text",
  expenseName: "text",
  description: "text",
});

/* ==========================================================
   Query Middleware
========================================================== */

// Hide Soft Deleted Records
expenseSchema.pre(/^find/, function (next) {

  if (this.getFilter().isDeleted === undefined) {
    this.where({
      isDeleted: false,
    });
  }

  next();

});

// Format Expense Number
expenseSchema.pre("validate", function (next) {

  if (this.expenseNo) {
    this.expenseNo = this.expenseNo
      .trim()
      .toUpperCase();
  }

  next();

});

/* ==========================================================
   Instance Methods
========================================================== */

// Mark Paid
expenseSchema.methods.markPaid = async function (
  paymentMethod = "Cash",
  transactionId = ""
) {

  this.paymentMethod = paymentMethod;

  this.transactionId = transactionId;

  this.paidAmount = this.totalAmount;

  this.dueAmount = 0;

  this.paymentStatus = "Paid";

  return await this.save();

};

// Approve Expense
expenseSchema.methods.approveExpense = async function (
  approvedBy
) {

  this.approvalStatus = "Approved";

  this.approvedBy = approvedBy;

  this.approvedAt = new Date();

  return await this.save();

};

// Reject Expense
expenseSchema.methods.rejectExpense = async function (
  reason = ""
) {

  this.approvalStatus = "Rejected";

  this.rejectionReason = reason;

  return await this.save();

};

// Cancel Expense
expenseSchema.methods.cancelExpense = async function (
  remarks = ""
) {

  this.paymentStatus = "Cancelled";

  this.remarks = remarks;

  return await this.save();

};

// Soft Delete
expenseSchema.methods.softDelete = async function (
  userId
) {

  this.isDeleted = true;

  this.updatedBy = userId;

  return await this.save();

};

// Restore
expenseSchema.methods.restore = async function () {

  this.isDeleted = false;

  return await this.save();

};

/* ==========================================================
   Static Methods
========================================================== */

// Today's Expenses
expenseSchema.statics.getTodayExpenses = async function () {

  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return await this.find({
    expenseDate: {
      $gte: start,
      $lte: end,
    },
    isDeleted: false,
  });

};

// Expense Summary
expenseSchema.statics.getExpenseSummary = async function () {

  const result = await this.aggregate([
    {
      $match: {
        isDeleted: false,
      },
    },
    {
      $group: {
        _id: null,
        totalExpense: {
          $sum: "$totalAmount",
        },
        totalPaid: {
          $sum: "$paidAmount",
        },
        totalDue: {
          $sum: "$dueAmount",
        },
        totalRecords: {
          $sum: 1,
        },
      },
    },
  ]);

  return (
    result[0] || {
      totalExpense: 0,
      totalPaid: 0,
      totalDue: 0,
      totalRecords: 0,
    }
  );

};

// Store Expenses
expenseSchema.statics.getStoreExpenses = function (
  storeId
) {

  return this.find({
    store: storeId,
    isDeleted: false,
  }).sort({
    expenseDate: -1,
  });

};

// Pending Approvals
expenseSchema.statics.getPendingApprovals = function () {

  return this.find({
    approvalStatus: "Pending",
    isDeleted: false,
  }).sort({
    expenseDate: -1,
  });

};

// Category Wise Expense
expenseSchema.statics.getCategoryWiseExpense =
  async function () {

    return await this.aggregate([
      {
        $match: {
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: "$category",
          totalExpense: {
            $sum: "$totalAmount",
          },
          totalRecords: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          totalExpense: -1,
        },
      },
    ]);

  };

/* ==========================================================
   JSON Settings
========================================================== */

expenseSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
});

expenseSchema.set("toObject", {
  virtuals: true,
  versionKey: false,
});

/* ==========================================================
   Production Optimizations
========================================================== */

// Compound indexes
expenseSchema.index({
  store: 1,
  expenseDate: -1,
});

expenseSchema.index({
  category: 1,
  expenseDate: -1,
});

expenseSchema.index({
  supplier: 1,
  expenseDate: -1,
});

expenseSchema.index({
  paymentStatus: 1,
  approvalStatus: 1,
});

/* ==========================================================
   Export
========================================================== */

module.exports = mongoose.model(
  "Expense",
  expenseSchema
);