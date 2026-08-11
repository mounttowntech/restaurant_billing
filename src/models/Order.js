const mongoose = require("mongoose");

/* ==========================================================
   Order Item Schema
========================================================== */

const orderItemSchema = new mongoose.Schema(
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

    variant: {
      name: String,
      price: Number,
    },

    addons: [
      {
        addon: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Addon",
        },
        addonName: String,
        price: Number,
      },
    ],

    menuCode: String,

    menuName: {
      type: String,
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },

    unitPrice: {
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

    taxableAmount: {
      type: Number,
      default: 0,
    },

    gstPercentage: {
      type: Number,
      default: 5,
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

    kitchenStatus: {
      type: String,
      enum: [
        "Pending",
        "Preparing",
        "Ready",
        "Served",
        "Cancelled",
      ],
      default: "Pending",
    },

    remarks: String,
  },
  {
    _id: false,
  }
);

/* ==========================================================
   Order Header Schema
========================================================== */

const orderSchema = new mongoose.Schema(
  {
    orderNo: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
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

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },

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

    chef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chef",
    },

    orderType: {
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

    items: {
      type: [orderItemSchema],
      validate: [(v) => v.length > 0, "Order items required"],
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

    discountPercentage: {
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

    paymentMethod: {
      type: String,
      enum: [
        "Cash",
        "Card",
        "UPI",
        "Wallet",
        "Credit",
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

    orderStatus: {
      type: String,
      enum: [
        "Pending",
        "Accepted",
        "Preparing",
        "Ready",
        "Completed",
        "Cancelled",
      ],
      default: "Pending",
    },

    kitchenStatus: {
      type: String,
      enum: [
        "Pending",
        "Cooking",
        "Ready",
        "Served",
      ],
      default: "Pending",
    },

    deliveryStatus: {
      type: String,
      enum: [
        "Not Applicable",
        "Waiting",
        "Out For Delivery",
        "Delivered",
      ],
      default: "Not Applicable",
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
   Pre Save Calculation
========================================================== */

orderSchema.pre("save", function () {

  this.totalItems = this.items.length;

  this.totalQuantity = this.items.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  this.subTotal = this.items.reduce(
    (sum, item) =>
      sum + Number(item.unitPrice) * Number(item.quantity),
    0
  );

  this.discountAmount =
    this.items.reduce(
      (sum, item) => sum + Number(item.discountAmount || 0),
      0
    ) + Number(this.discountAmount || 0);

  this.taxableAmount =
    this.subTotal - this.discountAmount;

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
    this.cgstAmount +
    this.sgstAmount +
    this.igstAmount;

  this.grandTotal =
    this.taxableAmount +
    this.gstAmount +
    Number(this.serviceCharge || 0) +
    Number(this.packingCharge || 0) +
    Number(this.deliveryCharge || 0) +
    Number(this.tipAmount || 0) +
    Number(this.roundOffAmount || 0);

  this.dueAmount =
    this.grandTotal -
    Number(this.paidAmount || 0);

 
});

/* ==========================================================
   Virtuals
========================================================== */

// Average Item Value
orderSchema.virtual("averageItemValue").get(function () {
  if (!this.totalQuantity) return 0;

  return Number((this.grandTotal / this.totalQuantity).toFixed(2));
});

// Payment Completed
orderSchema.virtual("isPaid").get(function () {
  return this.paymentStatus === "Paid";
});

// Kitchen Completed
orderSchema.virtual("isKitchenCompleted").get(function () {
  return this.kitchenStatus === "Served";
});

// Order Completed
orderSchema.virtual("isCompleted").get(function () {
  return this.orderStatus === "Completed";
});

// Delivery Completed
orderSchema.virtual("isDelivered").get(function () {
  return (
    this.orderType !== "Delivery" ||
    this.deliveryStatus === "Delivered"
  );
});

/* ==========================================================
   Indexes
========================================================== */

orderSchema.index(
  { orderNo: 1 },
  { unique: true }
);

orderSchema.index({
  restaurant: 1,
});

orderSchema.index({
  store: 1,
});

orderSchema.index({
  customer: 1,
});

orderSchema.index({
  reservation: 1,
});

orderSchema.index({
  table: 1,
});

orderSchema.index({
  waiter: 1,
});

orderSchema.index({
  chef: 1,
});

orderSchema.index({
  orderType: 1,
});

orderSchema.index({
  orderStatus: 1,
});

orderSchema.index({
  kitchenStatus: 1,
});

orderSchema.index({
  paymentStatus: 1,
});

orderSchema.index({
  createdAt: -1,
});

orderSchema.index({
  isDeleted: 1,
});

/* ==========================================================
   Middleware
========================================================== */

// Hide Soft Deleted Records
orderSchema.pre(/^find/, function () {

  if (this.getFilter().isDeleted === undefined) {
    this.where({
      isDeleted: false,
    });
  }

 
});

// Format Order Number
orderSchema.pre("validate", function () {

  if (this.orderNo) {
    this.orderNo = this.orderNo
      .trim()
      .toUpperCase();
  }

  
});

/* ==========================================================
   Instance Methods
========================================================== */

// Soft Delete
orderSchema.methods.softDelete = async function (userId) {

  this.isDeleted = true;
  this.updatedBy = userId;

  await this.save();
};

// Restore
orderSchema.methods.restore = async function () {

  this.isDeleted = false;

  await this.save();
};

// Mark Paid
orderSchema.methods.markPaid = async function () {

  this.paymentStatus = "Paid";
  this.paidAmount = this.grandTotal;
  this.dueAmount = 0;

  await this.save();
};

// Cancel Order
orderSchema.methods.cancelOrder = async function () {

  this.orderStatus = "Cancelled";

  await this.save();
};

/* ==========================================================
   Static Methods
========================================================== */

// Today's Orders
orderSchema.statics.getTodayOrders = function () {

  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return this.find({
    createdAt: {
      $gte: start,
      $lte: end,
    },
    isDeleted: false,
  });
};

// Pending Kitchen Orders
orderSchema.statics.getKitchenQueue = function () {

  return this.find({
    kitchenStatus: {
      $in: ["Pending", "Cooking"],
    },
    orderStatus: {
      $ne: "Cancelled",
    },
    isDeleted: false,
  }).sort({
    createdAt: 1,
  });
};

// Active Table Orders
orderSchema.statics.getActiveTableOrders = function (tableId) {

  return this.find({
    table: tableId,
    orderStatus: {
      $nin: ["Completed", "Cancelled"],
    },
    isDeleted: false,
  });
};

/* ==========================================================
   JSON Settings
========================================================== */

orderSchema.set("toJSON", {
  virtuals: true,
});

orderSchema.set("toObject", {
  virtuals: true,
});

/* ==========================================================
   Export
========================================================== */

module.exports = mongoose.model(
  "Order",
  orderSchema
);