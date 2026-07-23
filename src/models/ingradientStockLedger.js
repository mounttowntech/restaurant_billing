const mongoose = require("mongoose");

const ingredientStockLedgerSchema = new mongoose.Schema(
  {
    ledgerNo: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    ingredient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ingredient",
      required: true,
      index: true,
    },

    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      default: null,
    },

    unit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
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

    transactionType: {
      type: String,
      required: true,
      enum: [
        "Opening Stock",
        "Purchase",
        "Purchase Return",
        "Recipe Consumption",
        "Production",
        "Stock Adjustment",
        "Stock Transfer In",
        "Stock Transfer Out",
        "Supplier Return",
        "Customer Return",
        "Wastage",
        "Damage",
        "Expired",
        "Manual Entry",
      ],
    },

    referenceModel: {
      type: String,
      enum: [
        "Purchase",
        "PurchaseReturn",
        "Recipe",
        "SalesInvoice",
        "StockAdjustment",
        "StockTransfer",
        "OpeningStock",
        "Manual",
      ],
      default: "Manual",
    },

    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },

    referenceNo: {
      type: String,
      trim: true,
    },

    stockIn: {
      type: Number,
      default: 0,
      min: 0,
    },

    stockOut: {
      type: Number,
      default: 0,
      min: 0,
    },

    balanceStock: {
      type: Number,
      required: true,
      min: 0,
    },

    purchasePrice: {
      type: Number,
      default: 0,
    },

    totalValue: {
      type: Number,
      default: 0,
    },

    remarks: {
      type: String,
      trim: true,
    },

    transactionDate: {
      type: Date,
      default: Date.now,
    },

    status: {
      type: String,
      enum: ["Completed", "Pending", "Cancelled"],
      default: "Completed",
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

ingredientStockLedgerSchema.pre("save", function (next) {
  this.totalValue =
    Number(this.balanceStock || 0) *
    Number(this.purchasePrice || 0);

  next();
});

/* ==========================================================
   Virtuals
========================================================== */

ingredientStockLedgerSchema.virtual("movement").get(function () {
  if (this.stockIn > 0) return "IN";
  if (this.stockOut > 0) return "OUT";
  return "NONE";
});

/* ==========================================================
   Indexes
========================================================== */

ingredientStockLedgerSchema.index(
  { ledgerNo: 1 },
  { unique: true }
);

ingredientStockLedgerSchema.index({
  ingredient: 1,
  transactionDate: -1,
});

ingredientStockLedgerSchema.index({
  transactionType: 1,
});

ingredientStockLedgerSchema.index({
  restaurant: 1,
});

ingredientStockLedgerSchema.index({
  store: 1,
});

ingredientStockLedgerSchema.index({
  warehouse: 1,
});

ingredientStockLedgerSchema.index({
  referenceId: 1,
});

ingredientStockLedgerSchema.index({
  createdAt: -1,
});

/* ==========================================================
   Middleware
========================================================== */

ingredientStockLedgerSchema.pre(/^find/, function (next) {
  if (this.getFilter().isDeleted === undefined) {
    this.where({
      isDeleted: false,
    });
  }
  next();
});

ingredientStockLedgerSchema.pre("validate", function (next) {
  if (this.ledgerNo) {
    this.ledgerNo = this.ledgerNo
      .trim()
      .toUpperCase();
  }
  next();
});

/* ==========================================================
   Instance Methods
========================================================== */

ingredientStockLedgerSchema.methods.softDelete =
  async function (userId) {
    this.isDeleted = true;
    this.updatedBy = userId;
    await this.save();
  };

/* ==========================================================
   JSON Settings
========================================================== */

ingredientStockLedgerSchema.set("toJSON", {
  virtuals: true,
});

ingredientStockLedgerSchema.set("toObject", {
  virtuals: true,
});

/* ==========================================================
   Export
========================================================== */

module.exports = mongoose.model(
  "IngredientStockLedger",
  ingredientStockLedgerSchema
);