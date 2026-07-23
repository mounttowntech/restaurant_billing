const mongoose = require("mongoose");

/* ==========================================================
   Cash Movement Schema (Cash In / Cash Out)
========================================================== */

const cashMovementSchema = new mongoose.Schema(
  {
    movementType: {
      type: String,
      enum: ["Cash In", "Cash Out"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    reason: {
      type: String,
      required: true,
      trim: true,
    },

    referenceNo: {
      type: String,
      trim: true,
    },

    paymentMode: {
      type: String,
      enum: [
        "Cash",
        "Card",
        "UPI",
        "Bank Transfer",
        "Wallet",
        "Cheque",
      ],
      default: "Cash",
    },

    remarks: {
      type: String,
      trim: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: true,
  }
);

/* ==========================================================
   Sales Summary Schema
========================================================== */

const salesSummarySchema = new mongoose.Schema(
  {
    totalBills: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalSales: {
      type: Number,
      default: 0,
      min: 0,
    },

    cashSales: {
      type: Number,
      default: 0,
      min: 0,
    },

    cardSales: {
      type: Number,
      default: 0,
      min: 0,
    },

    upiSales: {
      type: Number,
      default: 0,
      min: 0,
    },

    walletSales: {
      type: Number,
      default: 0,
      min: 0,
    },

    onlineSales: {
      type: Number,
      default: 0,
      min: 0,
    },

    creditSales: {
      type: Number,
      default: 0,
      min: 0,
    },

    refundAmount: {
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
   Expense Summary Schema
========================================================== */

const expenseSummarySchema = new mongoose.Schema(
  {
    pettyCash: {
      type: Number,
      default: 0,
      min: 0,
    },

    cashPaidOut: {
      type: Number,
      default: 0,
      min: 0,
    },

    cashReceived: {
      type: Number,
      default: 0,
      min: 0,
    },

    otherExpenses: {
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
   Cash Register Header Schema
========================================================== */

const cashRegisterSchema = new mongoose.Schema(
  {
    /* ======================================================
       Register Information
    ====================================================== */

    registerNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    registerName: {
      type: String,
      required: true,
      trim: true,
    },

    terminalName: {
      type: String,
      trim: true,
    },

    terminalCode: {
      type: String,
      trim: true,
      uppercase: true,
    },

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
       Shift
    ====================================================== */

    shift: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shift",
      required: true,
    },

    /* ======================================================
       Cashier
    ====================================================== */

    cashier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    /* ======================================================
       Opening Details
    ====================================================== */

    openingDateTime: {
      type: Date,
      default: Date.now,
    },

    openingBalance: {
      type: Number,
      default: 0,
      min: 0,
    },

    openingRemarks: {
      type: String,
      trim: true,
    },

    /* ======================================================
       Closing Details
    ====================================================== */

    closingDateTime: {
      type: Date,
      default: null,
    },

    expectedClosingCash: {
      type: Number,
      default: 0,
      min: 0,
    },

    actualClosingCash: {
      type: Number,
      default: 0,
      min: 0,
    },

    cashDifference: {
      type: Number,
      default: 0,
    },

    closingRemarks: {
      type: String,
      trim: true,
    },

    /* ======================================================
       Sales Summary
    ====================================================== */

    salesSummary: {
      type: salesSummarySchema,
      default: () => ({}),
    },

    /* ======================================================
       Expense Summary
    ====================================================== */

    expenseSummary: {
      type: expenseSummarySchema,
      default: () => ({}),
    },

    /* ======================================================
       Cash Movements
    ====================================================== */

    cashMovements: [cashMovementSchema],

    /* ======================================================
       Register Status
    ====================================================== */

    status: {
      type: String,
      enum: [
        "Open",
        "Closed",
        "Suspended",
      ],
      default: "Open",
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    /* ======================================================
       Audit Fields
    ====================================================== */

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
   Validation Middleware
========================================================== */

cashRegisterSchema.pre("validate", function (next) {
  try {
    // Register Number
    if (this.registerNumber) {
      this.registerNumber = this.registerNumber
        .trim()
        .toUpperCase();
    }

    // Register Name
    if (this.registerName) {
      this.registerName = this.registerName.trim();
    }

    // Terminal Code
    if (this.terminalCode) {
      this.terminalCode = this.terminalCode
        .trim()
        .toUpperCase();
    }

    // Opening Balance
    if (this.openingBalance < 0) {
      return next(
        new Error("Opening balance cannot be negative.")
      );
    }

    // Actual Closing Cash
    if (this.actualClosingCash < 0) {
      return next(
        new Error("Actual closing cash cannot be negative.")
      );
    }

    // Validate Cash Movements
    if (this.cashMovements?.length) {
      for (const movement of this.cashMovements) {
        if (movement.amount < 0) {
          return next(
            new Error("Cash movement amount cannot be negative.")
          );
        }

        if (!movement.reason) {
          return next(
            new Error("Cash movement reason is required.")
          );
        }
      }
    }

    next();
  } catch (err) {
    next(err);
  }
});

/* ==========================================================
   Pre-save Calculations
========================================================== */

cashRegisterSchema.pre("save", function (next) {
  try {
    /* ==========================================
       Calculate Cash Movements
    ========================================== */

    let totalCashIn = 0;
    let totalCashOut = 0;

    if (this.cashMovements?.length) {
      this.cashMovements.forEach((movement) => {
        if (movement.movementType === "Cash In") {
          totalCashIn += movement.amount;
        }

        if (movement.movementType === "Cash Out") {
          totalCashOut += movement.amount;
        }
      });
    }

    this.expenseSummary.cashReceived = totalCashIn;
    this.expenseSummary.cashPaidOut = totalCashOut;

    /* ==========================================
       Sales Total Calculation
    ========================================== */

    this.salesSummary.totalSales =
      Number(this.salesSummary.cashSales || 0) +
      Number(this.salesSummary.cardSales || 0) +
      Number(this.salesSummary.upiSales || 0) +
      Number(this.salesSummary.walletSales || 0) +
      Number(this.salesSummary.onlineSales || 0) +
      Number(this.salesSummary.creditSales || 0);

    /* ==========================================
       Expected Closing Cash
    ========================================== */

    this.expectedClosingCash =
      Number(this.openingBalance || 0) +
      Number(this.salesSummary.cashSales || 0) +
      Number(this.expenseSummary.cashReceived || 0) -
      Number(this.expenseSummary.cashPaidOut || 0) -
      Number(this.salesSummary.refundAmount || 0);

    /* ==========================================
       Cash Difference
    ========================================== */

    this.cashDifference =
      Number(this.actualClosingCash || 0) -
      Number(this.expectedClosingCash || 0);

    /* ==========================================
       Opening / Closing Validation
    ========================================== */

    if (
      this.status === "Closed" &&
      !this.closingDateTime
    ) {
      this.closingDateTime = new Date();
    }

    if (
      this.status === "Closed" &&
      this.actualClosingCash === 0 &&
      this.expectedClosingCash > 0
    ) {
      return next(
        new Error(
          "Actual closing cash must be entered before closing the register."
        )
      );
    }

    /* ==========================================
       Register Status Validation
    ========================================== */

    const validStatus = [
      "Open",
      "Closed",
      "Suspended",
    ];

    if (!validStatus.includes(this.status)) {
      return next(
        new Error("Invalid register status.")
      );
    }

    // Closed register cannot reopen automatically
    if (
      !this.isNew &&
      this.isModified("status") &&
      this.status === "Open" &&
      this.closingDateTime
    ) {
      return next(
        new Error(
          "Closed register cannot be reopened. Create a new cash register session."
        )
      );
    }

    next();
  } catch (err) {
    next(err);
  }
});
/* ==========================================================
   Virtuals
========================================================== */

// Register Active
cashRegisterSchema.virtual("isOpen").get(function () {
  return this.status === "Open" && !this.isDeleted;
});

// Register Closed
cashRegisterSchema.virtual("isClosed").get(function () {
  return this.status === "Closed";
});

// Total Cash Movement
cashRegisterSchema.virtual("totalCashMovement").get(function () {
  return (
    (this.expenseSummary.cashReceived || 0) -
    (this.expenseSummary.cashPaidOut || 0)
  );
});

// Net Collection
cashRegisterSchema.virtual("netCollection").get(function () {
  return (
    (this.salesSummary.totalSales || 0) -
    (this.salesSummary.refundAmount || 0)
  );
});

/* ==========================================================
   Database Indexes
========================================================== */

cashRegisterSchema.index(
  { registerNumber: 1 },
  { unique: true }
);

cashRegisterSchema.index({
  restaurant: 1,
  store: 1,
});

cashRegisterSchema.index({
  restaurant: 1,
  cashier: 1,
});

cashRegisterSchema.index({
  restaurant: 1,
  shift: 1,
});

cashRegisterSchema.index({
  status: 1,
});

cashRegisterSchema.index({
  openingDateTime: -1,
});

cashRegisterSchema.index({
  closingDateTime: -1,
});

cashRegisterSchema.index({
  isDeleted: 1,
});

cashRegisterSchema.index({
  registerName: "text",
  registerNumber: "text",
});

/* ==========================================================
   Query Middleware
========================================================== */

cashRegisterSchema.pre(/^find/, function (next) {

  if (this.getFilter().isDeleted === undefined) {
    this.where({
      isDeleted: false,
    });
  }

  next();

});

/* ==========================================================
   Instance Methods
========================================================== */

// Open Register
cashRegisterSchema.methods.openRegister =
async function () {

  this.status = "Open";

  this.openingDateTime = new Date();

  this.closingDateTime = null;

  return await this.save();

};

// Close Register
cashRegisterSchema.methods.closeRegister =
async function (actualCash) {

  this.actualClosingCash = actualCash;

  this.closingDateTime = new Date();

  this.cashDifference =
    actualCash - this.expectedClosingCash;

  this.status = "Closed";

  return await this.save();

};

// Add Cash In
cashRegisterSchema.methods.addCashIn =
async function (
  amount,
  reason,
  userId = null
) {

  this.cashMovements.push({
    movementType: "Cash In",
    amount,
    reason,
    createdBy: userId,
  });

  return await this.save();

};

// Add Cash Out
cashRegisterSchema.methods.addCashOut =
async function (
  amount,
  reason,
  userId = null
) {

  this.cashMovements.push({
    movementType: "Cash Out",
    amount,
    reason,
    createdBy: userId,
  });

  return await this.save();

};

// Calculate Difference
cashRegisterSchema.methods.calculateDifference =
function () {

  return (
    (this.actualClosingCash || 0) -
    (this.expectedClosingCash || 0)
  );

};

// Soft Delete
cashRegisterSchema.methods.softDelete =
async function (userId) {

  this.isDeleted = true;

  if (userId) {
    this.updatedBy = userId;
  }

  return await this.save();

};

// Restore
cashRegisterSchema.methods.restore =
async function () {

  this.isDeleted = false;

  return await this.save();

};

/* ==========================================================
   Static Methods
========================================================== */

// Open Registers
cashRegisterSchema.statics.getOpenRegisters =
function (restaurantId) {

  return this.find({
    restaurant: restaurantId,
    status: "Open",
    isDeleted: false,
  });

};

// Closed Registers
cashRegisterSchema.statics.getClosedRegisters =
function (restaurantId) {

  return this.find({
    restaurant: restaurantId,
    status: "Closed",
    isDeleted: false,
  });

};

// Store Registers
cashRegisterSchema.statics.getStoreRegisters =
function (storeId) {

  return this.find({
    store: storeId,
    isDeleted: false,
  });

};

// Today's Registers
cashRegisterSchema.statics.getTodayRegisters =
function (restaurantId) {

  const start = new Date();
  start.setHours(0,0,0,0);

  const end = new Date();
  end.setHours(23,59,59,999);

  return this.find({
    restaurant: restaurantId,
    openingDateTime:{
      $gte:start,
      $lte:end,
    },
    isDeleted:false,
  });

};

// Cash Summary
cashRegisterSchema.statics.getCashSummary =
async function (
  restaurantId,
  fromDate,
  toDate
) {

  const filter = {
    restaurant: restaurantId,
    isDeleted: false,
  };

  if (fromDate && toDate) {
    filter.openingDateTime = {
      $gte: new Date(fromDate),
      $lte: new Date(toDate),
    };
  }

  const summary = await this.aggregate([
    {
      $match: filter,
    },
    {
      $group: {
        _id: null,

        openingBalance: {
          $sum: "$openingBalance",
        },

        expectedCash: {
          $sum: "$expectedClosingCash",
        },

        actualCash: {
          $sum: "$actualClosingCash",
        },

        difference: {
          $sum: "$cashDifference",
        },

        cashSales: {
          $sum: "$salesSummary.cashSales",
        },

        totalSales: {
          $sum: "$salesSummary.totalSales",
        },

        refundAmount: {
          $sum: "$salesSummary.refundAmount",
        },

        cashReceived: {
          $sum: "$expenseSummary.cashReceived",
        },

        cashPaidOut: {
          $sum: "$expenseSummary.cashPaidOut",
        },

        totalRegisters: {
          $sum: 1,
        },
      },
    },
  ]);

  return summary[0] || {};

};

/* ==========================================================
   JSON Settings
========================================================== */

cashRegisterSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
});

cashRegisterSchema.set("toObject", {
  virtuals: true,
  versionKey: false,
});

/* ==========================================================
   Production Optimizations
========================================================== */

cashRegisterSchema.index({
  restaurant:1,
  store:1,
  status:1,
});

cashRegisterSchema.index({
  restaurant:1,
  cashier:1,
  status:1,
});

cashRegisterSchema.index({
  restaurant:1,
  shift:1,
});

cashRegisterSchema.index({
  restaurant:1,
  openingDateTime:-1,
});

cashRegisterSchema.index({
  restaurant:1,
  createdAt:-1,
});

/* ==========================================================
   Export
========================================================== */

module.exports = mongoose.model(
  "CashRegister",
  cashRegisterSchema
);