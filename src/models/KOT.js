const mongoose = require("mongoose");

/* ==========================================================
   KOT Item Schema
========================================================== */

const kotItemSchema = new mongoose.Schema(
  {
        order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order"
    },
    orderItem: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuItem",
      required: true,
    },

    recipe: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recipe",
    },

    menuCode: {
      type: String,
      trim: true,
    },

    menuName: {
      type: String,
      required: true,
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    preparedQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },

    servedQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },

    estimatedPreparationTime: {
      type: Number,
      default: 15,
    },

    kitchenStatus: {
      type: String,
      enum: ["Pending", "Preparing", "Ready", "Served", "Cancelled"],
      default: "Pending",
    },

    isPrepared: {
      type: Boolean,
      default: false,
    },

    isServed: {
      type: Boolean,
      default: false,
    },

    startedAt: Date,

    readyAt: Date,

    servedAt: Date,

    cancelReason: String,

    chefRemarks: String,

    remarks: String,
  },
  {
    _id: false,
  },
);

/* ==========================================================
   KOT Header Schema
========================================================== */

const kotSchema = new mongoose.Schema(
  {
    kotNo: {
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

    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
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

    kotType: {
      type: String,
      enum: ["Dine In", "Takeaway", "Delivery", "Online", "QR Order"],
      default: "Dine In",
    },

    priority: {
      type: String,
      enum: ["Low", "Normal", "High", "Urgent"],
      default: "Normal",
    },

    kotDate: {
      type: Date,
      default: Date.now,
    },

    startedAt: Date,

    completedAt: Date,

    servedAt: Date,

    cancelledAt: Date,

    kitchenStatus: {
      type: String,
      enum: ["Pending", "Preparing", "Ready", "Served", "Cancelled"],
      default: "Pending",
    },

    printed: {
      type: Boolean,
      default: false,
    },

    printedAt: Date,

    items: {
      type: [kotItemSchema],
      validate: [
        (items) => items.length > 0,
        "KOT must contain at least one item",
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
  },
);

/* ==========================================================
   Pre-save Calculations
========================================================== */

kotSchema.pre("save", function () {
  this.totalItems = this.items.length;

  this.totalQuantity = this.items.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0,
  );

  // Header kitchen status
  if (this.items.every((item) => item.kitchenStatus === "Served")) {
    this.kitchenStatus = "Served";
  } else if (this.items.every((item) => item.kitchenStatus === "Ready")) {
    this.kitchenStatus = "Ready";
  } else if (this.items.some((item) => item.kitchenStatus === "Preparing")) {
    this.kitchenStatus = "Preparing";
  } else if (this.items.every((item) => item.kitchenStatus === "Cancelled")) {
    this.kitchenStatus = "Cancelled";
  } else {
    this.kitchenStatus = "Pending";
  }
});
/* ==========================================================
   Virtuals
========================================================== */

// Pending Items Count
kotSchema.virtual("pendingItems").get(function () {
  return this.items.filter((item) => item.kitchenStatus !== "Served").length;
});

// Ready Items Count
kotSchema.virtual("readyItems").get(function () {
  return this.items.filter((item) => item.kitchenStatus === "Ready").length;
});

// Served Items Count
kotSchema.virtual("servedItems").get(function () {
  return this.items.filter((item) => item.kitchenStatus === "Served").length;
});

// Completion Status
kotSchema.virtual("isCompleted").get(function () {
  return this.kitchenStatus === "Served";
});

// Printed Status
kotSchema.virtual("isPrinted").get(function () {
  return this.printed;
});

/* ==========================================================
   Indexes
========================================================== */

kotSchema.index({ kotNo: 1 }, { unique: true });

kotSchema.index({ restaurant: 1 });

kotSchema.index({ store: 1 });

kotSchema.index({ order: 1 });

kotSchema.index({ customer: 1 });

kotSchema.index({ reservation: 1 });

kotSchema.index({ table: 1 });

kotSchema.index({ waiter: 1 });

kotSchema.index({ chef: 1 });

kotSchema.index({ kitchenStatus: 1 });

kotSchema.index({ priority: 1 });

kotSchema.index({ kotDate: -1 });

kotSchema.index({ printed: 1 });

kotSchema.index({ isDeleted: 1 });

kotSchema.index({ createdAt: -1 });

/* ==========================================================
   Middleware
========================================================== */

// Hide soft deleted records
kotSchema.pre(/^find/, function () {
  if (this.getFilter().isDeleted === undefined) {
    this.where({
      isDeleted: false,
    });
  }
});

// Format KOT Number
kotSchema.pre("validate", function () {
  if (this.kotNo) {
    this.kotNo = this.kotNo.trim().toUpperCase();
  }
});

/* ==========================================================
   Instance Methods
========================================================== */

// Mark Preparing
kotSchema.methods.markPreparing = async function () {
  this.kitchenStatus = "Preparing";

  this.startedAt = new Date();

  this.items.forEach((item) => {
    if (item.kitchenStatus === "Pending") {
      item.kitchenStatus = "Preparing";

      item.startedAt = new Date();
    }
  });

  return await this.save();
};

// Mark Ready
kotSchema.methods.markReady = async function () {
  this.kitchenStatus = "Ready";

  this.completedAt = new Date();

  this.items.forEach((item) => {
    if (
      item.kitchenStatus === "Preparing" ||
      item.kitchenStatus === "Pending"
    ) {
      item.kitchenStatus = "Ready";

      item.readyAt = new Date();

      item.isPrepared = true;
    }
  });

  return await this.save();
};

// Mark Served
kotSchema.methods.markServed = async function () {
  this.kitchenStatus = "Served";

  this.servedAt = new Date();

  this.items.forEach((item) => {
    item.kitchenStatus = "Served";

    item.isServed = true;

    item.servedQuantity = item.quantity;

    item.servedAt = new Date();
  });

  return await this.save();
};

// Mark Printed
kotSchema.methods.markPrinted = async function () {
  this.printed = true;

  this.printedAt = new Date();

  return await this.save();
};

// Soft Delete
kotSchema.methods.softDelete = async function (userId) {
  this.isDeleted = true;

  this.updatedBy = userId;

  return await this.save();
};

// Restore
kotSchema.methods.restore = async function () {
  this.isDeleted = false;

  return await this.save();
};

/* ==========================================================
   Static Methods
========================================================== */

// Kitchen Queue
kotSchema.statics.getKitchenQueue = function () {
  return this.find({
    kitchenStatus: {
      $in: ["Pending", "Preparing"],
    },

    isDeleted: false,
  }).sort({
    priority: -1,

    createdAt: 1,
  });
};

// Chef Orders
kotSchema.statics.getChefOrders = function (chefId) {
  return this.find({
    chef: chefId,

    kitchenStatus: {
      $ne: "Served",
    },

    isDeleted: false,
  }).sort({
    createdAt: 1,
  });
};

// Pending KOTs
kotSchema.statics.getPendingKOTs = function () {
  return this.find({
    kitchenStatus: "Pending",

    isDeleted: false,
  }).sort({
    createdAt: 1,
  });
};

// Today's KOTs
kotSchema.statics.getTodayKOTs = function () {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return this.find({
    kotDate: {
      $gte: start,
      $lte: end,
    },

    isDeleted: false,
  });
};

/* ==========================================================
   JSON Settings
========================================================== */

kotSchema.set("toJSON", {
  virtuals: true,
});

kotSchema.set("toObject", {
  virtuals: true,
});

/* ==========================================================
   Export
========================================================== */

module.exports = mongoose.model("KOT", kotSchema);
