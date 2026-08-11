const mongoose = require("mongoose");

// ==========================================================
// PURCHASE RETURN ITEM
// ==========================================================

const purchaseReturnItemSchema = new mongoose.Schema(
  {
    ingredient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ingredient",
      required: [true, "Ingredient is required"],
    },

    ingredientCode: {
      type: String,
      trim: true,
      default: "",
    },

    ingredientName: {
      type: String,
      trim: true,
      default: "",
    },

    barcode: {
      type: String,
      trim: true,
      default: "",
    },

    unit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
      default: null,
    },

    purchaseUnit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
      default: null,
    },

    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0.0001, "Quantity must be greater than 0"],
    },

    purchasePrice: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
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

    taxAmount: {
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

    reason: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    _id: true,
  }
);

// ==========================================================
// PURCHASE RETURN
// ==========================================================

const purchaseReturnSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
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

    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },

    purchase: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Purchase",
      required: true,
    },

    purchaseInvoiceNo: {
      type: String,
      trim: true,
      default: "",
    },

    returnNo: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    returnDate: {
      type: Date,
      default: Date.now,
    },

    // IMPORTANT
    // Always default to []
    items: {
      type: [purchaseReturnItemSchema],
      default: [],
      required: true,
    },

    totalItems: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },

    subtotal: {
      type: Number,
      default: 0,
      min: 0,
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

    totalTax: {
      type: Number,
      default: 0,
      min: 0,
    },

    otherCharges: {
      type: Number,
      default: 0,
      min: 0,
    },

    grandTotal: {
      type: Number,
      default: 0,
      min: 0,
    },

    paymentStatus: {
      type: String,
      enum: [
        "pending",
        "refunded",
        "adjusted",
        "cancelled",
      ],
      default: "pending",
    },

    status: {
      type: String,
      enum: [
        "draft",
        "completed",
        "cancelled",
      ],
      default: "completed",
    },

    returnReason: {
      type: String,
      trim: true,
      default: "",
    },

    remarks: {
      type: String,
      trim: true,
      default: "",
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

    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
      default: null,
    },

    deletedBy: {
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

// ==========================================================
// INDEXES
// ==========================================================

purchaseReturnSchema.index({
  company: 1,
  restaurant: 1,
  returnDate: -1,
});

purchaseReturnSchema.index({
  restaurant: 1,
  store: 1,
  returnDate: -1,
});

purchaseReturnSchema.index({
  supplier: 1,
  returnDate: -1,
});

purchaseReturnSchema.index({
  purchase: 1,
});

purchaseReturnSchema.index({
  isDeleted: 1,
});

purchaseReturnSchema.index({
  status: 1,
});

purchaseReturnSchema.index({
  paymentStatus: 1,
});

// ==========================================================
// RETURN NUMBER
// ==========================================================

purchaseReturnSchema.pre(
  "validate",
  function () {
    if (this.returnNo) {
      this.returnNo = String(
        this.returnNo
      )
        .trim()
        .toUpperCase();
    }

   
  }
);

// ==========================================================
// IMPORTANT
// NO .reduce() HERE
// ==========================================================

purchaseReturnSchema.pre(
  "save",
  function () {
    if (!Array.isArray(this.items)) {
      this.items = [];
    }

    this.totalItems =
      this.items.length;

    let totalQuantity = 0;
    let subtotal = 0;
    let discountAmount = 0;
    let taxableAmount = 0;
    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;
    let totalTax = 0;

    for (
      let i = 0;
      i < this.items.length;
      i++
    ) {
      const item = this.items[i];

      const quantity =
        Number(item.quantity) || 0;

      const purchasePrice =
        Number(
          item.purchasePrice
        ) || 0;

      const discount =
        Number(
          item.discountAmount
        ) || 0;

      const taxable =
        Number(
          item.taxableAmount
        ) ||
        Math.max(
          0,
          quantity *
            purchasePrice -
            discount
        );

      const cgst =
        Number(
          item.cgstAmount
        ) || 0;

      const sgst =
        Number(
          item.sgstAmount
        ) || 0;

      const igst =
        Number(
          item.igstAmount
        ) || 0;

      const tax =
        Number(
          item.taxAmount
        ) ||
        cgst +
          sgst +
          igst;

      const total =
        Number(
          item.totalAmount
        ) ||
        taxable + tax;

      totalQuantity +=
        quantity;

      subtotal +=
        quantity *
        purchasePrice;

      discountAmount +=
        discount;

      taxableAmount +=
        taxable;

      cgstAmount +=
        cgst;

      sgstAmount +=
        sgst;

      igstAmount +=
        igst;

      totalTax +=
        tax;

      item.taxAmount =
        Number(
          tax.toFixed(2)
        );

      item.taxableAmount =
        Number(
          taxable.toFixed(2)
        );

      item.totalAmount =
        Number(
          total.toFixed(2)
        );
    }

    this.totalQuantity =
      Number(
        totalQuantity.toFixed(3)
      );

    this.subtotal =
      Number(
        subtotal.toFixed(2)
      );

    this.discountAmount =
      Number(
        discountAmount.toFixed(2)
      );

    this.taxableAmount =
      Number(
        taxableAmount.toFixed(2)
      );

    this.cgstAmount =
      Number(
        cgstAmount.toFixed(2)
      );

    this.sgstAmount =
      Number(
        sgstAmount.toFixed(2)
      );

    this.igstAmount =
      Number(
        igstAmount.toFixed(2)
      );

    this.totalTax =
      Number(
        totalTax.toFixed(2)
      );

    const otherCharges =
      Number(
        this.otherCharges
      ) || 0;

    this.grandTotal =
      Number(
        (
          taxableAmount +
          totalTax +
          otherCharges
        ).toFixed(2)
      );

    
  }
);

// ==========================================================
// JSON
// ==========================================================

purchaseReturnSchema.set(
  "toJSON",
  {
    virtuals: true,
  }
);

purchaseReturnSchema.set(
  "toObject",
  {
    virtuals: true,
  }
);

// ==========================================================
// EXPORT
// ==========================================================

module.exports =
  mongoose.model(
    "PurchaseReturn",
    purchaseReturnSchema
  );