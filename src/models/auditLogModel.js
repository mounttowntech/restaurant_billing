const mongoose = require("mongoose");

/* ==========================================================
   Audit Log Header Schema
========================================================== */

const auditLogSchema = new mongoose.Schema(
  {
    /* ======================================================
       Log Information
    ====================================================== */

    logNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    logDate: {
      type: Date,
      default: Date.now,
      required: true,
    },

    /* ======================================================
       Restaurant Information
    ====================================================== */

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

    /* ======================================================
       User Information
    ====================================================== */

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
      index: true,
    },

    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RolePermission",
      default: null,
    },

    /* ======================================================
       Module Information
    ====================================================== */

    module: {
      type: String,
      required: true,
      enum: [
        "Authentication",
        "Restaurant",
        "Store",
        "Dashboard",
        "User",
        "Employee",
        "Role",
        "Customer",
        "Supplier",
        "Reservation",
        "Table",
        "Kitchen",
        "Menu Category",
        "Menu Item",
        "Addon",
        "Ingredient",
        "Recipe",
        "Purchase",
        "Purchase Return",
        "Inventory Adjustment",
        "Kitchen Waste",
        "Stock Ledger",
        "Order",
        "KOT",
        "Invoice",
        "Payment",
        "Expense",
        "Coupon",
        "Discount",
        "Delivery Partner",
        "Shift",
        "Cash Register",
        "Settings",
        "Notification",
        "Audit Log",
        "Other",
      ],
      index: true,
    },

    subModule: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    /* ======================================================
       Entity Information
    ====================================================== */

    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    entityName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    entityCode: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: 100,
    },

    entityType: {
      type: String,
      enum: [
        "Restaurant",
        "Store",
        "User",
        "Employee",
        "Customer",
        "Supplier",
        "Table",
        "Kitchen",
        "Menu Category",
        "Menu Item",
        "Addon",
        "Ingredient",
        "Recipe",
        "Purchase",
        "Purchase Return",
        "Inventory Adjustment",
        "Kitchen Waste",
        "Order",
        "KOT",
        "Invoice",
        "Payment",
        "Expense",
        "Coupon",
        "Discount",
        "Delivery Partner",
        "Shift",
        "Cash Register",
        "Settings",
        "Other",
      ],
      required: true,
    },
    /* ======================================================
       Action Details
    ====================================================== */

    action: {
      type: String,
      required: true,
      enum: [
        "Create",
        "Update",
        "Delete",
        "View",
        "Login",
        "Logout",
        "Approve",
        "Reject",
        "Cancel",
        "Restore",
        "Print",
        "Export",
        "Import",
        "Upload",
        "Download",
        "Assign",
        "Unassign",
        "Open",
        "Close",
        "Sync",
        "Other",
      ],
      index: true,
    },

    actionDescription: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    remarks: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    /* ======================================================
       IP Information
    ====================================================== */

    ipAddress: {
      type: String,
      trim: true,
      maxlength: 100,
      index: true,
    },

    forwardedIp: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    /* ======================================================
       Device Information
    ====================================================== */

    deviceType: {
      type: String,
      enum: [
        "Desktop",
        "Laptop",
        "Mobile",
        "Tablet",
        "POS",
        "Kiosk",
        "API",
        "Other",
      ],
      default: "Desktop",
    },

    deviceName: {
      type: String,
      trim: true,
      maxlength: 150,
    },

    operatingSystem: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    osVersion: {
      type: String,
      trim: true,
      maxlength: 50,
    },

    /* ======================================================
       Browser Information
    ====================================================== */

    browser: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    browserVersion: {
      type: String,
      trim: true,
      maxlength: 50,
    },

    userAgent: {
      type: String,
      trim: true,
      maxlength: 2000,
    },

    /* ======================================================
       Request Information
    ====================================================== */

    requestMethod: {
      type: String,
      enum: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
      required: true,
    },

    requestUrl: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    requestPath: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    requestBody: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    requestParams: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    requestQuery: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    responseStatusCode: {
      type: Number,
      default: 200,
    },

    executionTime: {
      type: Number,
      default: 0,
      min: 0,
    },

    /* ======================================================
       Data Snapshot
    ====================================================== */

    oldData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    newData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },

    changedFields: [
      {
        type: String,
        trim: true,
      },
    ],

    /* ======================================================
       Status
    ====================================================== */

    status: {
      type: String,
      enum: ["Success", "Failed", "Warning", "Pending"],
      default: "Success",
      index: true,
    },

    errorMessage: {
      type: String,
      trim: true,
      maxlength: 2000,
    },

    /* ======================================================
       Archive / Soft Delete
    ====================================================== */

    isArchived: {
      type: Boolean,
      default: false,
    },

    archivedAt: {
      type: Date,
      default: null,
    },

    archivedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    /* ======================================================
       Audit Fields
    ====================================================== */

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
  },
);
/* ==========================================================
   Virtuals
========================================================== */

// Success Log
auditLogSchema.virtual("isSuccess").get(function () {
  return this.status === "Success" && !this.isArchived;
});

// Failed Log
auditLogSchema.virtual("isFailed").get(function () {
  return this.status === "Failed";
});

// Archived Log
auditLogSchema.virtual("isArchivedLog").get(function () {
  return this.isArchived;
});

// Execution Time (Seconds)
auditLogSchema.virtual("executionTimeSeconds").get(function () {
  return Number(((this.executionTime || 0) / 1000).toFixed(3));
});

// Changed Fields Count
auditLogSchema.virtual("changedFieldsCount").get(function () {
  return this.changedFields ? this.changedFields.length : 0;
});

/* ==========================================================
   Database Indexes
========================================================== */

auditLogSchema.index({ logNumber: 1 }, { unique: true });

auditLogSchema.index({
  restaurant: 1,
  store: 1,
});

auditLogSchema.index({
  restaurant: 1,
  user: 1,
});

auditLogSchema.index({
  restaurant: 1,
  employee: 1,
});

auditLogSchema.index({
  module: 1,
  action: 1,
});

auditLogSchema.index({
  entityType: 1,
  entityId: 1,
});

auditLogSchema.index({
  status: 1,
});

auditLogSchema.index({
  logDate: -1,
});

auditLogSchema.index({
  ipAddress: 1,
});

auditLogSchema.index({
  requestMethod: 1,
});

auditLogSchema.index({
  isArchived: 1,
});

auditLogSchema.index({
  module: "text",
  entityName: "text",
  remarks: "text",
});

/* ==========================================================
   Query Middleware
========================================================== */

auditLogSchema.pre(/^find/, function (next) {
  if (this.getFilter().isArchived === undefined) {
    this.where({
      isArchived: false,
    });
  }

  next();
});

/* ==========================================================
   Instance Methods
========================================================== */

// Mark Success
auditLogSchema.methods.markSuccess = async function () {
  this.status = "Success";
  this.errorMessage = "";

  return await this.save();
};

// Mark Failed
auditLogSchema.methods.markFailed = async function (errorMessage = "") {
  this.status = "Failed";
  this.errorMessage = errorMessage;

  return await this.save();
};

// Archive Log
auditLogSchema.methods.archiveLog = async function (userId) {
  this.isArchived = true;
  this.archivedAt = new Date();
  this.archivedBy = userId;

  return await this.save();
};

// Restore Log
auditLogSchema.methods.restoreLog = async function () {
  this.isArchived = false;
  this.archivedAt = null;
  this.archivedBy = null;

  return await this.save();
};

// Add Remarks
auditLogSchema.methods.addRemarks = async function (remarks) {
  this.remarks = remarks;

  return await this.save();
};
/* ==========================================================
   Static Methods
========================================================== */

// ==========================================================
// Get Today's Logs
// ==========================================================

auditLogSchema.statics.getTodayLogs = function (restaurantId) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return this.find({
    restaurant: restaurantId,
    logDate: {
      $gte: start,
      $lte: end,
    },
    isArchived: false,
  })
    .populate("user", "name employeeCode")
    .populate("store", "storeName")
    .sort({ logDate: -1 });
};

// ==========================================================
// Get User Logs
// ==========================================================

auditLogSchema.statics.getUserLogs = function (restaurantId, userId) {
  return this.find({
    restaurant: restaurantId,
    user: userId,
    isArchived: false,
  })
    .populate("store", "storeName")
    .sort({ logDate: -1 });
};

// ==========================================================
// Get Module Logs
// ==========================================================

auditLogSchema.statics.getModuleLogs = function (restaurantId, moduleName) {
  return this.find({
    restaurant: restaurantId,
    module: moduleName,
    isArchived: false,
  })
    .populate("user", "name employeeCode")
    .sort({ logDate: -1 });
};

// ==========================================================
// Get Failed Logs
// ==========================================================

auditLogSchema.statics.getFailedLogs = function (restaurantId) {
  return this.find({
    restaurant: restaurantId,
    status: "Failed",
    isArchived: false,
  })
    .populate("user", "name employeeCode")
    .populate("store", "storeName")
    .sort({ logDate: -1 });
};

// ==========================================================
// Audit Summary
// ==========================================================

auditLogSchema.statics.getAuditSummary = async function (
  restaurantId,
  fromDate,
  toDate,
) {
  const filter = {
    restaurant: new mongoose.Types.ObjectId(restaurantId),
    isArchived: false,
  };

  if (fromDate && toDate) {
    filter.logDate = {
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

        totalLogs: {
          $sum: 1,
        },

        successLogs: {
          $sum: {
            $cond: [
              {
                $eq: ["$status", "Success"],
              },
              1,
              0,
            ],
          },
        },

        failedLogs: {
          $sum: {
            $cond: [
              {
                $eq: ["$status", "Failed"],
              },
              1,
              0,
            ],
          },
        },

        warningLogs: {
          $sum: {
            $cond: [
              {
                $eq: ["$status", "Warning"],
              },
              1,
              0,
            ],
          },
        },

        pendingLogs: {
          $sum: {
            $cond: [
              {
                $eq: ["$status", "Pending"],
              },
              1,
              0,
            ],
          },
        },

        averageExecutionTime: {
          $avg: "$executionTime",
        },
      },
    },
  ]);

  return (
    summary[0] || {
      totalLogs: 0,
      successLogs: 0,
      failedLogs: 0,
      warningLogs: 0,
      pendingLogs: 0,
      averageExecutionTime: 0,
    }
  );
};

// ==========================================================
// Get Restaurant Logs
// ==========================================================

auditLogSchema.statics.getRestaurantLogs = function (
  restaurantId,
  storeId = null,
) {
  const filter = {
    restaurant: restaurantId,
    isArchived: false,
  };

  if (storeId) {
    filter.store = storeId;
  }

  return this.find(filter)
    .populate("store", "storeName")
    .populate("user", "name employeeCode")
    .sort({
      logDate: -1,
    });
};

/* ==========================================================
   JSON Settings
========================================================== */

auditLogSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
});

auditLogSchema.set("toObject", {
  virtuals: true,
  versionKey: false,
});

/* ==========================================================
   Production Optimizations
========================================================== */

auditLogSchema.index({
  restaurant: 1,
  store: 1,
  logDate: -1,
});

auditLogSchema.index({
  restaurant: 1,
  module: 1,
  action: 1,
});

auditLogSchema.index({
  restaurant: 1,
  status: 1,
});

auditLogSchema.index({
  restaurant: 1,
  user: 1,
});

auditLogSchema.index({
  restaurant: 1,
  entityType: 1,
  entityId: 1,
});

auditLogSchema.index({
  restaurant: 1,
  ipAddress: 1,
});

auditLogSchema.index({
  restaurant: 1,
  createdAt: -1,
});

/* ==========================================================
   Export
========================================================== */

module.exports = mongoose.model("AuditLog", auditLogSchema);
