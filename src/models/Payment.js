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

    transactionId: {
      type: String,
      trim: true,
    },

    referenceNo: {
      type: String,
      trim: true,
    },

    remarks: {
      type: String,
      trim: true,
    },
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
    /* -------------------------------------------------------
       Payment Number
    ------------------------------------------------------- */

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

    /* -------------------------------------------------------
       Restaurant / Store
    ------------------------------------------------------- */

    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },

    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
      index: true,
    },

    /* -------------------------------------------------------
       References
    ------------------------------------------------------- */

    invoice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Invoice",
      index: true,
    },

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      index: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      index: true,
    },

    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      index: true,
    },

    /* -------------------------------------------------------
       Payment Type
    ------------------------------------------------------- */

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

    /* -------------------------------------------------------
       Payment Gateway
    ------------------------------------------------------- */

    paymentGateway: {
      type: String,
      enum: [
        "Manual",
        "Cashfree",
      ],
      default: "Manual",
      index: true,
    },

    /* -------------------------------------------------------
       Payment Method

       Cashfree is included because you may want to display
       "Cashfree" directly in the POS payment screen.

       For more detailed Cashfree information, the actual
       gateway method is stored in cashfreePaymentMethod.
    ------------------------------------------------------- */

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
        "Cashfree",
      ],
      required: true,
      index: true,
    },

    /* -------------------------------------------------------
       Amounts
    ------------------------------------------------------- */

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    receivedAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    balanceAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    changeAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    /* -------------------------------------------------------
       Manual Payment Details
    ------------------------------------------------------- */

    transactionId: {
      type: String,
      trim: true,
      index: true,
    },

    referenceNo: {
      type: String,
      trim: true,
      index: true,
    },

    bankName: {
      type: String,
      trim: true,
    },

    cardLast4: {
      type: String,
      trim: true,
      maxlength: 4,
    },

    approvalCode: {
      type: String,
      trim: true,
    },

    /* -------------------------------------------------------
       Split Payments
    ------------------------------------------------------- */

    splitPayments: {
      type: [splitPaymentSchema],
      default: [],
    },

    /* -------------------------------------------------------
       Cashfree Details
    ------------------------------------------------------- */

    cashfreeOrderId: {
      type: String,
      trim: true,
      index: true,
      sparse: true,
    },

    cashfreePaymentSessionId: {
      type: String,
      trim: true,
    },

    cashfreePaymentId: {
      type: String,
      trim: true,
      index: true,
      sparse: true,
    },

    cashfreeOrderStatus: {
      type: String,
      trim: true,
    },

    cashfreePaymentStatus: {
      type: String,
      trim: true,
    },

    cashfreePaymentMethod: {
      type: String,
      trim: true,
    },

    cashfreePaymentMessage: {
      type: String,
      trim: true,
    },

    cashfreeBankReference: {
      type: String,
      trim: true,
    },

    cashfreeWebhookReceivedAt: {
      type: Date,
    },

    /* -------------------------------------------------------
       Refund
    ------------------------------------------------------- */

    refundAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    refundReason: {
      type: String,
      trim: true,
    },

    refundedAt: {
      type: Date,
    },

    /* -------------------------------------------------------
       Payment Status
    ------------------------------------------------------- */

    paymentStatus: {
      type: String,
      enum: [
        "Pending",
        "Partial",
        "Paid",
        "Failed",
        "Refunded",
        "Cancelled",
      ],
      default: "Pending",
      index: true,
    },

    /* -------------------------------------------------------
       Remarks
    ------------------------------------------------------- */

    remarks: {
      type: String,
      trim: true,
    },

    /* -------------------------------------------------------
       Soft Delete
    ------------------------------------------------------- */

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    /* -------------------------------------------------------
       Users
    ------------------------------------------------------- */

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
   Pre Validate
========================================================== */

paymentSchema.pre("validate", function () {
  if (this.paymentNo) {
    this.paymentNo = this.paymentNo
      .trim()
      .toUpperCase();
  }

  
});

/* ==========================================================
   Pre Save Calculations
========================================================== */

paymentSchema.pre("save", function () {
  const amount = Number(this.amount || 0);

  /* --------------------------------------------------------
     Split Payment
  -------------------------------------------------------- */

  if (
    this.paymentMethod === "Split" &&
    Array.isArray(this.splitPayments)
  ) {
    this.receivedAmount =
      this.splitPayments.reduce(
        (sum, item) =>
          sum + Number(item.amount || 0),
        0
      );
  }

  /* --------------------------------------------------------
     Cashfree
  -------------------------------------------------------- */

  else if (
    this.paymentGateway === "Cashfree"
  ) {
    /*
      Cashfree payment should remain pending until
      Cashfree confirms SUCCESS.
    */

    if (
      this.paymentStatus === "Paid"
    ) {
      this.receivedAmount = amount;
    }
  }

  /* --------------------------------------------------------
     Manual Payment
  -------------------------------------------------------- */

  else if (
    this.isModified("receivedAmount") === false &&
    this.paymentStatus !== "Refunded" &&
    this.paymentStatus !== "Cancelled" &&
    this.paymentStatus !== "Failed"
  ) {
    this.receivedAmount = amount;
  }

  /* --------------------------------------------------------
     Calculate Balance / Change
  -------------------------------------------------------- */

  const received =
    Number(this.receivedAmount || 0);

  let balance =
    amount - received;

  if (balance < 0) {
    this.changeAmount =
      Math.abs(balance);

    balance = 0;
  } else {
    this.changeAmount = 0;
  }

  this.balanceAmount = balance;

  /* --------------------------------------------------------
     Do NOT overwrite terminal statuses
  -------------------------------------------------------- */

  if (
    this.paymentStatus !== "Refunded" &&
    this.paymentStatus !== "Cancelled" &&
    this.paymentStatus !== "Failed"
  ) {
    if (received <= 0) {
      this.paymentStatus = "Pending";
    } else if (received < amount) {
      this.paymentStatus = "Partial";
    } else {
      this.paymentStatus = "Paid";
    }
  }

 
});

/* ==========================================================
   Query Middleware
========================================================== */

paymentSchema.pre(/^find/, function () {
  const filter = this.getFilter();

  if (
    filter.isDeleted === undefined
  ) {
    this.where({
      isDeleted: false,
    });
  }


});

/* ==========================================================
   Virtuals
========================================================== */

paymentSchema.virtual("pendingAmount").get(function () {
  return Math.max(
    Number(this.amount || 0) -
      Number(this.receivedAmount || 0),
    0
  );
});

paymentSchema.virtual("isPaid").get(function () {
  return this.paymentStatus === "Paid";
});

paymentSchema.virtual("isRefunded").get(function () {
  return this.paymentStatus === "Refunded";
});

paymentSchema.virtual("isCancelled").get(function () {
  return this.paymentStatus === "Cancelled";
});

paymentSchema.virtual("isFailed").get(function () {
  return this.paymentStatus === "Failed";
});

paymentSchema.virtual("isCashfree").get(function () {
  return this.paymentGateway === "Cashfree";
});

paymentSchema.virtual("totalSplitPayments").get(function () {
  return Array.isArray(this.splitPayments)
    ? this.splitPayments.length
    : 0;
});

/* ==========================================================
   Instance Methods
========================================================== */

/* ----------------------------------------------------------
   Mark Paid
---------------------------------------------------------- */

paymentSchema.methods.markPaid = async function (
  paymentMethod = "Cash",
  transactionId = ""
) {
  this.paymentGateway = "Manual";

  this.paymentMethod =
    paymentMethod;

  this.transactionId =
    transactionId;

  this.receivedAmount =
    Number(this.amount);

  this.balanceAmount = 0;
  this.changeAmount = 0;
  this.paymentStatus = "Paid";

  return await this.save();
};

/* ----------------------------------------------------------
   Mark Failed
---------------------------------------------------------- */

paymentSchema.methods.markFailed =
  async function (reason = "") {
    this.paymentStatus = "Failed";

    if (reason) {
      this.cashfreePaymentMessage =
        reason;
    }

    return await this.save();
  };

/* ----------------------------------------------------------
   Refund
---------------------------------------------------------- */

paymentSchema.methods.refundPayment =
  async function (
    refundAmount,
    refundReason = ""
  ) {
    const amount =
      Number(refundAmount);

    if (
      !Number.isFinite(amount) ||
      amount <= 0
    ) {
      throw new Error(
        "Refund amount must be greater than 0"
      );
    }

    if (amount > this.receivedAmount) {
      throw new Error(
        "Refund amount cannot exceed received amount"
      );
    }

    this.refundAmount = amount;

    this.refundReason =
      refundReason;

    this.refundedAt =
      new Date();

    this.paymentStatus =
      "Refunded";

    return await this.save();
  };

/* ----------------------------------------------------------
   Cancel
---------------------------------------------------------- */

paymentSchema.methods.cancelPayment =
  async function (
    remarks = ""
  ) {
    if (this.paymentStatus === "Paid") {
      throw new Error(
        "Paid payment cannot be cancelled"
      );
    }

    this.paymentStatus =
      "Cancelled";

    this.remarks =
      remarks || this.remarks;

    return await this.save();
  };

/* ----------------------------------------------------------
   Soft Delete
---------------------------------------------------------- */

paymentSchema.methods.softDelete =
  async function (userId) {
    this.isDeleted = true;

    if (userId) {
      this.updatedBy = userId;
    }

    return await this.save();
  };

/* ----------------------------------------------------------
   Restore
---------------------------------------------------------- */

paymentSchema.methods.restore =
  async function () {
    this.isDeleted = false;

    return await this.save();
  };

/* ==========================================================
   Static Methods
========================================================== */

/* ----------------------------------------------------------
   Today Collection
---------------------------------------------------------- */

paymentSchema.statics.getTodayCollection =
  async function (storeId = null) {
    const start = new Date();

    start.setHours(
      0,
      0,
      0,
      0
    );

    const end = new Date();

    end.setHours(
      23,
      59,
      59,
      999
    );

    const match = {
      paymentDate: {
        $gte: start,
        $lte: end,
      },

      isDeleted: false,

      paymentStatus: {
        $ne: "Cancelled",
      },
    };

    if (storeId) {
      match.store =
        new mongoose.Types.ObjectId(
          storeId
        );
    }

    const result =
      await this.aggregate([
        {
          $match: match,
        },

        {
          $group: {
            _id: null,

            totalCollection: {
              $sum: "$receivedAmount",
            },

            totalRefund: {
              $sum: "$refundAmount",
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
        totalRefund: 0,
        totalPayments: 0,
      }
    );
  };

/* ----------------------------------------------------------
   Pending Payments
---------------------------------------------------------- */

paymentSchema.statics.getPendingPayments =
  function (storeId = null) {
    const query = {
      paymentStatus: {
        $in: [
          "Pending",
          "Partial",
        ],
      },

      isDeleted: false,
    };

    if (storeId) {
      query.store = storeId;
    }

    return this.find(query)
      .populate(
        "customer",
        "name phone"
      )
      .populate(
        "invoice",
        "invoiceNo"
      )
      .populate(
        "order",
        "orderNo"
      )
      .sort({
        paymentDate: -1,
      });
  };

/* ----------------------------------------------------------
   Payment Summary
---------------------------------------------------------- */

paymentSchema.statics.getPaymentSummary =
  async function (
    storeId = null
  ) {
    const match = {
      isDeleted: false,
    };

    if (storeId) {
      match.store =
        new mongoose.Types.ObjectId(
          storeId
        );
    }

    return await this.aggregate([
      {
        $match: match,
      },

      {
        $group: {
          _id: {
            gateway:
              "$paymentGateway",

            method:
              "$paymentMethod",
          },

          totalAmount: {
            $sum: "$receivedAmount",
          },

          totalPayments: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          totalAmount: -1,
        },
      },
    ]);
  };

/* ----------------------------------------------------------
   Store Collection
---------------------------------------------------------- */

paymentSchema.statics.getStoreCollection =
  function (storeId) {
    return this.find({
      store: storeId,

      isDeleted: false,

      paymentStatus: {
        $ne: "Cancelled",
      },
    })
      .populate(
        "customer",
        "name phone"
      )
      .populate(
        "invoice",
        "invoiceNo"
      )
      .populate(
        "order",
        "orderNo"
      )
      .sort({
        paymentDate: -1,
      });
  };

/* ==========================================================
   Indexes
========================================================== */

paymentSchema.index({
  paymentDate: -1,
});

paymentSchema.index({
  restaurant: 1,
  paymentDate: -1,
});

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

paymentSchema.index({
  paymentStatus: 1,
});

paymentSchema.index({
  paymentGateway: 1,
});

paymentSchema.index({
  cashfreeOrderId: 1,
});

paymentSchema.index({
  cashfreePaymentId: 1,
});

paymentSchema.index({
  isDeleted: 1,
});

paymentSchema.index({
  paymentNo: "text",
  referenceNo: "text",
  transactionId: "text",
  cashfreeOrderId: "text",
});

/* ==========================================================
   JSON / Object Settings
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
   Export
========================================================== */

module.exports = mongoose.model(
  "Payment",
  paymentSchema
);