const mongoose = require("mongoose");

/* ==========================================================
   Recipient Schema
========================================================== */

const recipientSchema = new mongoose.Schema(
  {
    /* ======================================================
       Recipient Information
    ====================================================== */

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },

    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RolePermission",
      default: null,
    },

    /* ======================================================
       Delivery Channels
    ====================================================== */

    channels: {
      app: {
        type: Boolean,
        default: true,
      },

      email: {
        type: Boolean,
        default: false,
      },

      sms: {
        type: Boolean,
        default: false,
      },

      push: {
        type: Boolean,
        default: false,
      },

      whatsapp: {
        type: Boolean,
        default: false,
      },
    },

    /* ======================================================
       Delivery Status
    ====================================================== */

    deliveryStatus: {
      type: String,
      enum: [
        "Pending",
        "Queued",
        "Sent",
        "Delivered",
        "Read",
        "Failed",
      ],
      default: "Pending",
    },

    deliveredAt: {
      type: Date,
      default: null,
    },

    readAt: {
      type: Date,
      default: null,
    },

    failedReason: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    retryCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    /* ======================================================
       Notification Flags
    ====================================================== */

    isRead: {
      type: Boolean,
      default: false,
    },

    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: true,
  }
);

/* ==========================================================
   Attachment Schema
========================================================== */

const attachmentSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
      required: true,
      trim: true,
    },

    originalName: {
      type: String,
      trim: true,
    },

    fileUrl: {
      type: String,
      required: true,
      trim: true,
    },

    fileType: {
      type: String,
      enum: [
        "image/jpeg",
        "image/png",
        "image/webp",
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "text/plain",
        "other",
      ],
      default: "other",
    },

    mimeType: {
      type: String,
      trim: true,
    },

    fileSize: {
      type: Number,
      default: 0,
      min: 0,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 300,
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: true,
  }
);
/* ==========================================================
   Notification Header Schema
========================================================== */

const notificationSchema = new mongoose.Schema(
  {
    /* ======================================================
       Notification Information
    ====================================================== */

    notificationNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    notificationDate: {
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
      default: null,
      index: true,
    },

    /* ======================================================
       Sender Information
    ====================================================== */

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    senderEmployee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },

    senderRole: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RolePermission",
      default: null,
    },

    /* ======================================================
       Recipients
    ====================================================== */

    recipients: {
      type: [recipientSchema],
      validate: {
        validator: function (value) {
          return value && value.length > 0;
        },
        message: "At least one recipient is required.",
      },
    },

    /* ======================================================
       Notification Content
    ====================================================== */

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 5000,
    },

    shortMessage: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    /* ======================================================
       Notification Type
    ====================================================== */

    notificationType: {
      type: String,
      required: true,
      enum: [
        "System",
        "Order",
        "Kitchen",
        "Inventory",
        "Purchase",
        "Purchase Return",
        "Invoice",
        "Payment",
        "Expense",
        "Customer",
        "Supplier",
        "Reservation",
        "Shift",
        "Cash Register",
        "HR",
        "Security",
        "Promotion",
        "Reminder",
        "Alert",
        "Warning",
        "Information",
        "Announcement",
        "Custom",
      ],
      index: true,
    },

    /* ======================================================
       Notification Category
    ====================================================== */

    category: {
      type: String,
      enum: [
        "General",
        "Approval",
        "Success",
        "Failure",
        "Stock",
        "Finance",
        "Kitchen",
        "Delivery",
        "Attendance",
        "Payroll",
        "Maintenance",
        "Marketing",
        "Emergency",
      ],
      default: "General",
      index: true,
    },

    /* ======================================================
       Priority
    ====================================================== */

    priority: {
      type: String,
      enum: [
        "Low",
        "Normal",
        "High",
        "Urgent",
        "Critical",
      ],
      default: "Normal",
      index: true,
    },

    /* ======================================================
       Delivery Channels
    ====================================================== */

    channels: {
      app: {
        type: Boolean,
        default: true,
      },

      email: {
        type: Boolean,
        default: false,
      },

      sms: {
        type: Boolean,
        default: false,
      },

      push: {
        type: Boolean,
        default: false,
      },

      whatsapp: {
        type: Boolean,
        default: false,
      },
    },

    /* ======================================================
       Module Reference
    ====================================================== */

    module: {
      type: String,
      enum: [
        "Dashboard",
        "Authentication",
        "Restaurant",
        "Store",
        "Employee",
        "User",
        "Role",
        "Customer",
        "Supplier",
        "Reservation",
        "Table",
        "Kitchen",
        "Menu Item",
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
        "Notification",
        "Audit Log",
        "Other",
      ],
      default: "Other",
      index: true,
    },

    subModule: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    /* ======================================================
       Entity Reference
    ====================================================== */

    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      index: true,
    },

    entityName: {
      type: String,
      trim: true,
      maxlength: 200,
    },

    entityCode: {
      type: String,
      trim: true,
      uppercase: true,
      maxlength: 100,
    },

    entityModel: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    /* ======================================================
       Attachments
    ====================================================== */

    attachments: {
      type: [attachmentSchema],
      default: [],
    },
        /* ======================================================
       Scheduling
    ====================================================== */

    scheduledAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    sentAt: {
      type: Date,
      default: null,
    },

    /* ======================================================
       Delivery Status
    ====================================================== */

    deliveryStatus: {
      type: String,
      enum: [
        "Pending",
        "Queued",
        "Processing",
        "Sent",
        "Delivered",
        "Failed",
        "Cancelled",
      ],
      default: "Pending",
      index: true,
    },

    deliveredAt: {
      type: Date,
      default: null,
    },

    deliveryMessage: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    /* ======================================================
       Read Status
    ====================================================== */

    totalRecipients: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalDelivered: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalRead: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalFailed: {
      type: Number,
      default: 0,
      min: 0,
    },

    isRead: {
      type: Boolean,
      default: false,
    },

    readAt: {
      type: Date,
      default: null,
    },

    /* ======================================================
       Retry Information
    ====================================================== */

    retryCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    maxRetryCount: {
      type: Number,
      default: 3,
      min: 0,
    },

    lastRetryAt: {
      type: Date,
      default: null,
    },

    /* ======================================================
       Expiry Information
    ====================================================== */

    expiresAt: {
      type: Date,
      default: null,
      index: true,
    },

    isExpired: {
      type: Boolean,
      default: false,
      index: true,
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
      required: true,
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
  }
);

/* ==========================================================
   Validation Middleware
========================================================== */

notificationSchema.pre("validate", function (next) {
  try {

    /* Notification Number */

    if (this.notificationNumber) {
      this.notificationNumber = this.notificationNumber
        .trim()
        .toUpperCase();
    }

    /* Recipient Validation */

    if (!this.recipients || this.recipients.length === 0) {
      return next(
        new Error("At least one recipient is required.")
      );
    }

    /* Scheduled Time */

    if (
      this.expiresAt &&
      this.scheduledAt &&
      this.expiresAt <= this.scheduledAt
    ) {
      return next(
        new Error(
          "Expiry date must be after scheduled date."
        )
      );
    }

    /* Retry Validation */

    if (this.retryCount > this.maxRetryCount) {
      return next(
        new Error(
          "Retry count cannot exceed maximum retry count."
        )
      );
    }

    next();

  } catch (err) {
    next(err);
  }
});

/* ==========================================================
   Pre-save Middleware
========================================================== */

notificationSchema.pre("save", function (next) {
  try {

    /* Recipient Counts */

    this.totalRecipients = this.recipients.length;

    this.totalDelivered = this.recipients.filter(
      r => r.deliveryStatus === "Delivered"
    ).length;

    this.totalRead = this.recipients.filter(
      r => r.isRead
    ).length;

    this.totalFailed = this.recipients.filter(
      r => r.deliveryStatus === "Failed"
    ).length;

    /* Overall Read Status */

    this.isRead =
      this.totalRecipients > 0 &&
      this.totalRead === this.totalRecipients;

    if (this.isRead && !this.readAt) {
      this.readAt = new Date();
    }

    /* Delivery Status */

    if (this.totalDelivered === this.totalRecipients) {
      this.deliveryStatus = "Delivered";

      if (!this.deliveredAt) {
        this.deliveredAt = new Date();
      }

    } else if (this.totalFailed === this.totalRecipients) {

      this.deliveryStatus = "Failed";

    } else if (this.totalDelivered > 0) {

      this.deliveryStatus = "Sent";

    }

    /* Expiry */

    if (
      this.expiresAt &&
      new Date() >= this.expiresAt
    ) {
      this.isExpired = true;
    }

    next();

  } catch (err) {
    next(err);
  }
});
/* ==========================================================
   Virtuals
========================================================== */

// Is Delivered
notificationSchema.virtual("isDelivered").get(function () {
  return (
    this.deliveryStatus === "Delivered" &&
    !this.isArchived
  );
});

// Is Failed
notificationSchema.virtual("isFailed").get(function () {
  return this.deliveryStatus === "Failed";
});

// Is Pending
notificationSchema.virtual("isPending").get(function () {
  return this.deliveryStatus === "Pending";
});

// Is Scheduled
notificationSchema.virtual("isScheduled").get(function () {
  return (
    this.scheduledAt &&
    this.scheduledAt > new Date()
  );
});

// Delivery Percentage
notificationSchema.virtual("deliveryPercentage").get(function () {

  if (!this.totalRecipients) return 0;

  return Number(
    (
      (this.totalDelivered / this.totalRecipients) *
      100
    ).toFixed(2)
  );

});

// Read Percentage
notificationSchema.virtual("readPercentage").get(function () {

  if (!this.totalRecipients) return 0;

  return Number(
    (
      (this.totalRead / this.totalRecipients) *
      100
    ).toFixed(2)
  );

});

// Failed Percentage
notificationSchema.virtual("failedPercentage").get(function () {

  if (!this.totalRecipients) return 0;

  return Number(
    (
      (this.totalFailed / this.totalRecipients) *
      100
    ).toFixed(2)
  );

});

/* ==========================================================
   Database Indexes
========================================================== */

notificationSchema.index(
  { notificationNumber: 1 },
  { unique: true }
);

notificationSchema.index({
  restaurant: 1,
  store: 1,
});

notificationSchema.index({
  sender: 1,
});

notificationSchema.index({
  notificationType: 1,
});

notificationSchema.index({
  category: 1,
});

notificationSchema.index({
  priority: 1,
});

notificationSchema.index({
  module: 1,
});

notificationSchema.index({
  entityId: 1,
});

notificationSchema.index({
  deliveryStatus: 1,
});

notificationSchema.index({
  scheduledAt: -1,
});

notificationSchema.index({
  expiresAt: 1,
});

notificationSchema.index({
  isArchived: 1,
});

notificationSchema.index({
  title: "text",
  message: "text",
});

/* ==========================================================
   Query Middleware
========================================================== */

notificationSchema.pre(/^find/, function (next) {

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

// ==========================================================
// Mark As Read
// ==========================================================

notificationSchema.methods.markAsRead =
async function (userId) {

  const recipient = this.recipients.find(
    r =>
      r.user &&
      r.user.toString() === userId.toString()
  );

  if (!recipient) {
    throw new Error("Recipient not found.");
  }

  recipient.isRead = true;
  recipient.readAt = new Date();

  return await this.save();

};

// ==========================================================
// Mark As Delivered
// ==========================================================

notificationSchema.methods.markAsDelivered =
async function (userId) {

  const recipient = this.recipients.find(
    r =>
      r.user &&
      r.user.toString() === userId.toString()
  );

  if (!recipient) {
    throw new Error("Recipient not found.");
  }

  recipient.deliveryStatus = "Delivered";
  recipient.deliveredAt = new Date();

  return await this.save();

};

// ==========================================================
// Mark As Failed
// ==========================================================

notificationSchema.methods.markAsFailed =
async function (
  userId,
  reason = ""
) {

  const recipient = this.recipients.find(
    r =>
      r.user &&
      r.user.toString() === userId.toString()
  );

  if (!recipient) {
    throw new Error("Recipient not found.");
  }

  recipient.deliveryStatus = "Failed";
  recipient.failedReason = reason;
  recipient.retryCount += 1;

  return await this.save();

};

// ==========================================================
// Archive Notification
// ==========================================================

notificationSchema.methods.archiveNotification =
async function (userId) {

  this.isArchived = true;
  this.archivedAt = new Date();
  this.archivedBy = userId;

  return await this.save();

};

// ==========================================================
// Restore Notification
// ==========================================================

notificationSchema.methods.restoreNotification =
async function () {

  this.isArchived = false;
  this.archivedAt = null;
  this.archivedBy = null;

  return await this.save();

};
/* ==========================================================
   Static Methods
========================================================== */

// ==========================================================
// Get Unread Notifications
// ==========================================================

notificationSchema.statics.getUnreadNotifications =
function (restaurantId, userId) {

  return this.find({
    restaurant: restaurantId,
    isArchived: false,
    recipients: {
      $elemMatch: {
        user: userId,
        isRead: false,
      },
    },
  })
    .populate("sender", "name employeeCode")
    .populate("store", "storeName")
    .sort({ createdAt: -1 });

};

// ==========================================================
// Get User Notifications
// ==========================================================

notificationSchema.statics.getUserNotifications =
function (restaurantId, userId) {

  return this.find({
    restaurant: restaurantId,
    isArchived: false,
    recipients: {
      $elemMatch: {
        user: userId,
      },
    },
  })
    .populate("sender", "name employeeCode")
    .populate("store", "storeName")
    .sort({ createdAt: -1 });

};

// ==========================================================
// Get Today's Notifications
// ==========================================================

notificationSchema.statics.getTodayNotifications =
function (restaurantId) {

  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return this.find({
    restaurant: restaurantId,
    notificationDate: {
      $gte: start,
      $lte: end,
    },
    isArchived: false,
  })
    .populate("sender", "name employeeCode")
    .populate("store", "storeName")
    .sort({ notificationDate: -1 });

};

// ==========================================================
// Notification Summary
// ==========================================================

notificationSchema.statics.getNotificationSummary =
async function (
  restaurantId,
  fromDate,
  toDate
) {

  const filter = {
    restaurant: new mongoose.Types.ObjectId(
      restaurantId
    ),
    isArchived: false,
  };

  if (fromDate && toDate) {
    filter.notificationDate = {
      $gte: new Date(fromDate),
      $lte: new Date(toDate),
    };
  }

  const result = await this.aggregate([
    {
      $match: filter,
    },
    {
      $group: {
        _id: null,

        totalNotifications: {
          $sum: 1,
        },

        delivered: {
          $sum: {
            $cond: [
              { $eq: ["$deliveryStatus", "Delivered"] },
              1,
              0,
            ],
          },
        },

        pending: {
          $sum: {
            $cond: [
              { $eq: ["$deliveryStatus", "Pending"] },
              1,
              0,
            ],
          },
        },

        failed: {
          $sum: {
            $cond: [
              { $eq: ["$deliveryStatus", "Failed"] },
              1,
              0,
            ],
          },
        },

        expired: {
          $sum: {
            $cond: [
              { $eq: ["$isExpired", true] },
              1,
              0,
            ],
          },
        },

        totalRecipients: {
          $sum: "$totalRecipients",
        },

        totalRead: {
          $sum: "$totalRead",
        },
      },
    },
  ]);

  return (
    result[0] || {
      totalNotifications: 0,
      delivered: 0,
      pending: 0,
      failed: 0,
      expired: 0,
      totalRecipients: 0,
      totalRead: 0,
    }
  );

};

// ==========================================================
// Get Module Notifications
// ==========================================================

notificationSchema.statics.getModuleNotifications =
function (
  restaurantId,
  moduleName
) {

  return this.find({
    restaurant: restaurantId,
    module: moduleName,
    isArchived: false,
  })
    .populate("sender", "name employeeCode")
    .populate("store", "storeName")
    .sort({ createdAt: -1 });

};

// ==========================================================
// Get Restaurant Notifications
// ==========================================================

notificationSchema.statics.getRestaurantNotifications =
function (
  restaurantId,
  storeId = null
) {

  const filter = {
    restaurant: restaurantId,
    isArchived: false,
  };

  if (storeId) {
    filter.store = storeId;
  }

  return this.find(filter)
    .populate("sender", "name employeeCode")
    .populate("store", "storeName")
    .sort({ createdAt: -1 });

};

/* ==========================================================
   JSON Settings
========================================================== */

notificationSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
});

notificationSchema.set("toObject", {
  virtuals: true,
  versionKey: false,
});

/* ==========================================================
   Production Optimizations
========================================================== */

notificationSchema.index({
  restaurant: 1,
  store: 1,
  notificationDate: -1,
});

notificationSchema.index({
  restaurant: 1,
  deliveryStatus: 1,
});

notificationSchema.index({
  restaurant: 1,
  notificationType: 1,
});

notificationSchema.index({
  restaurant: 1,
  category: 1,
});

notificationSchema.index({
  restaurant: 1,
  priority: 1,
});

notificationSchema.index({
  restaurant: 1,
  sender: 1,
});

notificationSchema.index({
  restaurant: 1,
  module: 1,
});

notificationSchema.index({
  restaurant: 1,
  isExpired: 1,
});

notificationSchema.index({
  restaurant: 1,
  createdAt: -1,
});

/* ==========================================================
   Export
========================================================== */

module.exports = mongoose.model(
  "Notification",
  notificationSchema
);