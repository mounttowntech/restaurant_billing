const mongoose = require("mongoose");

/* ==========================================================
   Split Payment Schema
========================================================== */

const splitPaymentSchema = new mongoose.Schema(
  {
    paymentMethod: {
      type: String,
      enum: [
        "Cash",
        "Card",
        "UPI",
        "Wallet",
        "Net Banking",
        "Cheque",
      ],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    transactionId: String,

    referenceNo: String,

    remarks: String,
  },
  {
    _id: false,
  }
);

/* ==========================================================
   Payment Schema
========================================================== */

const paymentSchema = new mongoose.Schema(
  {
    paymentNo: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    paymentDate: {
      type: Date,
      default: Date.now,
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

    invoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
    },

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },

    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
    },

    paymentType: {
      type: String,
      enum: [
        "Invoice",
        "Advance",
        "Refund",
        "Purchase",
        "Supplier Payment",
      ],
      required: true,
    },

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
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    receivedAmount: {
      type: Number,
      default: 0,
    },

    balanceAmount: {
      type: Number,
      default: 0,
    },

    changeAmount: {
      type: Number,
      default: 0,
    },

    transactionId: String,

    referenceNo: String,

    bankName: String,

    cardLast4: String,

    approvalCode: String,

    splitPayments: [splitPaymentSchema],

    refundAmount: {
      type: Number,
      default: 0,
    },

    refundReason: String,

    paymentStatus: {
      type: String,
      enum: [
        "Pending",
        "Partial",
        "Paid",
        "Refunded",
        "Cancelled",
      ],
      default: "Pending",
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

paymentSchema.pre("save", function (next) {

  if (this.paymentMethod === "Split") {

    this.receivedAmount = this.splitPayments.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );

  } else {

    this.receivedAmount = Number(this.amount);

  }

  this.balanceAmount =
    Number(this.amount) - Number(this.receivedAmount);

  if (this.balanceAmount < 0) {

    this.changeAmount = Math.abs(this.balanceAmount);

    this.balanceAmount = 0;

  }

  if (this.receivedAmount <= 0) {

    this.paymentStatus = "Pending";

  } else if (this.receivedAmount < this.amount) {

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
paymentSchema.virtual("pendingAmount").get(function () {
  return Math.max(
    Number(this.amount || 0) - Number(this.receivedAmount || 0),
    0
  );
});

// Is Paid
paymentSchema.virtual("isPaid").get(function () {
  return this.paymentStatus === "Paid";
});

// Is Refunded
paymentSchema.virtual("isRefunded").get(function () {
  return this.paymentStatus === "Refunded";
});

// Is Cancelled
paymentSchema.virtual("isCancelled").get(function () {
  return this.paymentStatus === "Cancelled";
});

// Total Split Payments
paymentSchema.virtual("totalSplitPayments").get(function () {
  return this.splitPayments.length;
});

/* ==========================================================
   Database Indexes
========================================================== */

paymentSchema.index({ paymentNo: 1 }, { unique: true });

paymentSchema.index({ paymentDate: -1 });

paymentSchema.index({ restaurant: 1 });

paymentSchema.index({ store: 1 });

paymentSchema.index({ invoice: 1 });

paymentSchema.index({ order: 1 });

paymentSchema.index({ customer: 1 });

paymentSchema.index({ supplier: 1 });

paymentSchema.index({ paymentType: 1 });

paymentSchema.index({ paymentMethod: 1 });

paymentSchema.index({ paymentStatus: 1 });

paymentSchema.index({ transactionId: 1 });

paymentSchema.index({ isDeleted: 1 });

paymentSchema.index({ createdAt: -1 });

paymentSchema.index({
  paymentNo: "text",
  referenceNo: "text",
  transactionId: "text",
});

/* ==========================================================
   Query Middleware
========================================================== */

// Hide Soft Deleted Records
paymentSchema.pre(/^find/, function (next) {

  if (this.getFilter().isDeleted === undefined) {
    this.where({
      isDeleted: false,
    });
  }

  next();

});

// Format Payment Number
paymentSchema.pre("validate", function (next) {

  if (this.paymentNo) {
    this.paymentNo = this.paymentNo
      .trim()
      .toUpperCase();
  }

  next();

});

/* ==========================================================
   Instance Methods
========================================================== */

// Mark Paid
paymentSchema.methods.markPaid = async function (
  paymentMethod = "Cash",
  transactionId = ""
) {

  this.paymentMethod = paymentMethod;
  this.transactionId = transactionId;

  this.receivedAmount = this.amount;

  this.balanceAmount = 0;

  this.changeAmount = 0;

  this.paymentStatus = "Paid";

  return await this.save();

};

// Refund Payment
paymentSchema.methods.refundPayment = async function (
  refundAmount,
  refundReason = ""
) {

  this.refundAmount = refundAmount;

  this.refundReason = refundReason;

  this.paymentStatus = "Refunded";

  return await this.save();

};

// Cancel Payment
paymentSchema.methods.cancelPayment = async function (
  remarks = ""
) {

  this.paymentStatus = "Cancelled";

  this.remarks = remarks;

  return await this.save();

};

// Soft Delete
paymentSchema.methods.softDelete = async function (
  userId
) {

  this.isDeleted = true;

  this.updatedBy = userId;

  return await this.save();

};

// Restore
paymentSchema.methods.restore = async function () {

  this.isDeleted = false;

  return await this.save();

};

/* ==========================================================
   Static Methods
========================================================== */

// Today's Collection
paymentSchema.statics.getTodayCollection = async function () {

  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const result = await this.aggregate([
    {
      $match: {
        paymentDate: {
          $gte: start,
          $lte: end,
        },
        isDeleted: false,
        paymentStatus: {
          $ne: "Cancelled",
        },
      },
    },
    {
      $group: {
        _id: null,
        totalCollection: {
          $sum: "$receivedAmount",
        },
        totalPayments: {
          $sum: 1,
        },
      },
    },
  ]);

  return (
    result[0] || {
      totalCollection: 0,
      totalPayments: 0,
    }
  );

};

// Pending Payments
paymentSchema.statics.getPendingPayments = function () {

  return this.find({
    paymentStatus: {
      $in: ["Pending", "Partial"],
    },
    isDeleted: false,
  }).sort({
    paymentDate: -1,
  });

};

// Payment Summary
paymentSchema.statics.getPaymentSummary =
  async function () {

    const result = await this.aggregate([
      {
        $match: {
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: "$paymentMethod",
          totalAmount: {
            $sum: "$receivedAmount",
          },
          totalPayments: {
            $sum: 1,
          },
        },
      },
    ]);

    return result;

  };

// Store Collection
paymentSchema.statics.getStoreCollection =
  function (storeId) {

    return this.find({
      store: storeId,
      isDeleted: false,
      paymentStatus: {
        $ne: "Cancelled",
      },
    }).sort({
      paymentDate: -1,
    });

  };

/* ==========================================================
   JSON Settings
========================================================== */

paymentSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
});

paymentSchema.set("toObject", {
  virtuals: true,
  versionKey: false,
});

/* ==========================================================
   Production Optimizations
========================================================== */

// Enable virtuals in lean() queries
paymentSchema.set("toJSON", {
  virtuals: true,
});

paymentSchema.set("toObject", {
  virtuals: true,
});

// Optional compound indexes for reporting
paymentSchema.index({
  store: 1,
  paymentDate: -1,
});

paymentSchema.index({
  customer: 1,
  paymentDate: -1,
});

paymentSchema.index({
  supplier: 1,
  paymentDate: -1,
});

/* ==========================================================
   Export
========================================================== */

module.exports = mongoose.model(
  "Payment",
  paymentSchema
);