const mongoose = require("mongoose");

/* ==========================================================
   Waste Item Schema
========================================================== */

const wasteItemSchema = new mongoose.Schema(
  {
    /* ==========================================
       Item Type
    ========================================== */

    itemType: {
      type: String,
      enum: [
        "Ingredient",
        "Menu Item",
        "Prepared Food",
      ],
      required: true,
    },

    /* ==========================================
       Ingredient Reference
    ========================================== */

    ingredient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ingredient",
      default: null,
    },

    /* ==========================================
       Menu Item Reference
    ========================================== */

    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuItem",
      default: null,
    },

    /* ==========================================
       Batch Reference
    ========================================== */

    batchNo: {
      type: String,
      trim: true,
      uppercase: true,
    },

    /* ==========================================
       Quantity Details
    ========================================== */

    quantity: {
      type: Number,
      required: true,
      min: 0,
    },

    unit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
      required: true,
    },

    /* ==========================================
       Cost Details
    ========================================== */

    unitCost: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalCost: {
      type: Number,
      default: 0,
      min: 0,
    },

    /* ==========================================
       Stock Details
    ========================================== */

    availableStock: {
      type: Number,
      default: 0,
      min: 0,
    },

    stockAfterWaste: {
      type: Number,
      default: 0,
      min: 0,
    },

    /* ==========================================
       Waste Reason
    ========================================== */

    wasteReason: {
      type: String,
      enum: [
        "Expired",
        "Spoiled",
        "Burnt",
        "Over Cooked",
        "Preparation Error",
        "Customer Return",
        "Damaged",
        "Quality Issue",
        "Cleaning",
        "Other",
      ],
      required: true,
    },

    remarks: {
      type: String,
      trim: true,
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
        "text/plain",
        "other",
      ],
      default: "other",
    },

    fileSize: {
      type: Number,
      default: 0,
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    uploadedAt: {
      type: Date,
      default: Date.now,
    },

    description: {
      type: String,
      trim: true,
    },
  },
  {
    _id: true,
  }
);
/* ==========================================================
   Kitchen Waste Header Schema
========================================================== */

const kitchenWasteSchema = new mongoose.Schema(
  {
    /* ======================================================
       Waste Information
    ====================================================== */

    wasteNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    wasteDate: {
      type: Date,
      default: Date.now,
    },

    /* ======================================================
       Restaurant Details
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

    kitchen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Kitchen",
      required: true,
    },

    /* ======================================================
       Shift & Employee
    ====================================================== */

    shift: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shift",
    },

    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    /* ======================================================
       Waste Details
    ====================================================== */

    wasteType: {
      type: String,
      enum: [
        "Ingredient",
        "Menu Item",
        "Prepared Food",
        "Mixed",
      ],
      required: true,
    },

    wasteReason: {
      type: String,
      enum: [
        "Expired",
        "Spoiled",
        "Burnt",
        "Preparation Error",
        "Customer Return",
        "Damaged",
        "Quality Issue",
        "Over Production",
        "Cleaning",
        "Testing",
        "Other",
      ],
      required: true,
    },

    remarks: {
      type: String,
      trim: true,
    },

    /* ======================================================
       Waste Items
    ====================================================== */

    wasteItems: {
      type: [wasteItemSchema],
      validate: {
        validator: function (items) {
          return items && items.length > 0;
        },
        message: "At least one waste item is required.",
      },
    },

    /* ======================================================
       Attachments
    ====================================================== */

    attachments: [attachmentSchema],

    /* ======================================================
       Cost Summary
    ====================================================== */

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

    totalWasteCost: {
      type: Number,
      default: 0,
      min: 0,
    },

    estimatedRecoveryValue: {
      type: Number,
      default: 0,
      min: 0,
    },

    netLossAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    /* ======================================================
       Approval Details
    ====================================================== */

    approvalRequired: {
      type: Boolean,
      default: true,
    },

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
      default: null,
    },

    approvedAt: {
      type: Date,
      default: null,
    },

    rejectionReason: {
      type: String,
      trim: true,
    },

    /* ======================================================
       Status
    ====================================================== */

    status: {
      type: String,
      enum: [
        "Draft",
        "Pending",
        "Approved",
        "Completed",
        "Rejected",
        "Cancelled",
      ],
      default: "Draft",
    },

    stockUpdated: {
      type: Boolean,
      default: false,
    },

    ledgerUpdated: {
      type: Boolean,
      default: false,
    },

    /* ======================================================
       Soft Delete
    ====================================================== */

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

kitchenWasteSchema.pre("validate", function (next) {
  try {
    /* ==========================================
       Waste Number
    ========================================== */

    if (this.wasteNumber) {
      this.wasteNumber = this.wasteNumber
        .trim()
        .toUpperCase();
    }

    /* ==========================================
       Required References
    ========================================== */

    if (!this.restaurant) {
      return next(new Error("Restaurant is required."));
    }

    if (!this.store) {
      return next(new Error("Store is required."));
    }

    if (!this.kitchen) {
      return next(new Error("Kitchen is required."));
    }

    if (!this.reportedBy) {
      return next(new Error("Reported By is required."));
    }

    /* ==========================================
       Waste Items Validation
    ========================================== */

    if (
      !this.wasteItems ||
      this.wasteItems.length === 0
    ) {
      return next(
        new Error(
          "At least one waste item is required."
        )
      );
    }

    /* ==========================================
       Quantity Validation
    ========================================== */

    for (const item of this.wasteItems) {
      if (item.quantity <= 0) {
        return next(
          new Error(
            "Waste quantity must be greater than zero."
          )
        );
      }

      if (item.unitCost < 0) {
        return next(
          new Error(
            "Unit cost cannot be negative."
          )
        );
      }

      if (item.availableStock < item.quantity) {
        return next(
          new Error(
            `Insufficient stock for waste item.`
          )
        );
      }

      // Ingredient Validation
      if (
        item.itemType === "Ingredient" &&
        !item.ingredient
      ) {
        return next(
          new Error(
            "Ingredient reference is required."
          )
        );
      }

      // Menu Validation
      if (
        item.itemType === "Menu Item" &&
        !item.menuItem
      ) {
        return next(
          new Error(
            "Menu Item reference is required."
          )
        );
      }

      if (!item.unit) {
        return next(
          new Error(
            "Unit is required for waste item."
          )
        );
      }
    }

    /* ==========================================
       Approval Validation
    ========================================== */

    if (
      this.approvalStatus === "Approved"
    ) {

      if (!this.approvedBy) {
        return next(
          new Error(
            "Approved By is required."
          )
        );
      }

      if (!this.approvedAt) {
        this.approvedAt = new Date();
      }

    }

    if (
      this.approvalStatus === "Rejected" &&
      !this.rejectionReason
    ) {
      return next(
        new Error(
          "Rejection reason is required."
        )
      );
    }

    /* ==========================================
       Status Validation
    ========================================== */

    const validStatus = [
      "Draft",
      "Pending",
      "Approved",
      "Completed",
      "Rejected",
      "Cancelled",
    ];

    if (!validStatus.includes(this.status)) {
      return next(
        new Error(
          "Invalid waste status."
        )
      );
    }

    /* ==========================================
       Stock Update Validation
    ========================================== */

    if (
      this.stockUpdated &&
      this.status !== "Completed"
    ) {
      return next(
        new Error(
          "Stock can be updated only after waste is completed."
        )
      );
    }

    if (
      this.ledgerUpdated &&
      !this.stockUpdated
    ) {
      return next(
        new Error(
          "Stock ledger cannot be updated before stock update."
        )
      );
    }

    /* ==========================================
       Attachment Validation
    ========================================== */

    if (
      this.attachments &&
      this.attachments.length
    ) {

      for (const file of this.attachments) {

        if (!file.fileUrl) {
          return next(
            new Error(
              "Attachment file URL is required."
            )
          );
        }

      }

    }

    next();

  } catch (error) {
    next(error);
  }
});
/* ==========================================================
   Pre-save Middleware
========================================================== */

kitchenWasteSchema.pre("save", function (next) {
  try {
    /* ==========================================
       Initialize Totals
    ========================================== */

    let totalItems = 0;
    let totalQuantity = 0;
    let totalWasteCost = 0;
    let estimatedRecoveryValue = 0;

    /* ==========================================
       Item-wise Calculations
    ========================================== */

    if (this.wasteItems && this.wasteItems.length) {

      totalItems = this.wasteItems.length;

      this.wasteItems.forEach((item) => {

        /* --------------------------------------
           Calculate Item Total Cost
        -------------------------------------- */

        item.totalCost =
          Number(item.quantity || 0) *
          Number(item.unitCost || 0);

        /* --------------------------------------
           Remaining Stock
        -------------------------------------- */

        item.stockAfterWaste = Math.max(
          Number(item.availableStock || 0) -
            Number(item.quantity || 0),
          0
        );

        /* --------------------------------------
           Totals
        -------------------------------------- */

        totalQuantity += Number(item.quantity || 0);

        totalWasteCost += Number(item.totalCost || 0);

      });

    }

    /* ==========================================
       Header Totals
    ========================================== */

    this.totalItems = totalItems;

    this.totalQuantity = Number(
      totalQuantity.toFixed(2)
    );

    this.totalWasteCost = Number(
      totalWasteCost.toFixed(2)
    );

    /* ==========================================
       Estimated Recovery Value
       (User Editable - Default 0)
    ========================================== */

    estimatedRecoveryValue = Number(
      this.estimatedRecoveryValue || 0
    );

    this.estimatedRecoveryValue =
      estimatedRecoveryValue;

    /* ==========================================
       Net Loss
    ========================================== */

    this.netLossAmount = Number(
      (
        this.totalWasteCost -
        estimatedRecoveryValue
      ).toFixed(2)
    );

    if (this.netLossAmount < 0) {
      this.netLossAmount = 0;
    }

    /* ==========================================
       Approval Status Logic
    ========================================== */

    if (!this.approvalRequired) {

      this.approvalStatus = "Approved";

      if (!this.approvedAt) {
        this.approvedAt = new Date();
      }

    }

    /* ==========================================
       Automatic Status Calculation
    ========================================== */

    switch (this.approvalStatus) {

      case "Pending":
        if (this.status === "Draft") {
          this.status = "Pending";
        }
        break;

      case "Approved":

        if (
          this.stockUpdated &&
          this.ledgerUpdated
        ) {

          this.status = "Completed";

        } else {

          this.status = "Approved";

        }

        break;

      case "Rejected":
        this.status = "Rejected";
        break;

      default:
        break;

    }

    /* ==========================================
       Completed Validation
    ========================================== */

    if (
      this.status === "Completed" &&
      (!this.stockUpdated || !this.ledgerUpdated)
    ) {

      return next(
        new Error(
          "Stock and ledger must be updated before marking waste as Completed."
        )
      );

    }

    /* ==========================================
       Cancelled Validation
    ========================================== */

    if (
      this.status === "Cancelled" &&
      this.stockUpdated
    ) {

      return next(
        new Error(
          "Completed stock transactions cannot be cancelled."
        )
      );

    }

    /* ==========================================
       Round Monetary Values
    ========================================== */

    this.totalWasteCost = Number(
      this.totalWasteCost.toFixed(2)
    );

    this.estimatedRecoveryValue = Number(
      this.estimatedRecoveryValue.toFixed(2)
    );

    this.netLossAmount = Number(
      this.netLossAmount.toFixed(2)
    );

    next();

  } catch (error) {

    next(error);

  }
});
/* ==========================================================
   Virtuals
========================================================== */

// Is Approved
kitchenWasteSchema.virtual("isApproved").get(function () {
  return (
    this.approvalStatus === "Approved" &&
    !this.isDeleted
  );
});

// Is Pending
kitchenWasteSchema.virtual("isPending").get(function () {
  return this.approvalStatus === "Pending";
});

// Is Completed
kitchenWasteSchema.virtual("isCompleted").get(function () {
  return this.status === "Completed";
});

// Waste Per Item Cost
kitchenWasteSchema.virtual("averageWasteCost").get(function () {
  if (!this.totalItems) return 0;

  return Number(
    (this.totalWasteCost / this.totalItems).toFixed(2)
  );
});

// Recovery Percentage
kitchenWasteSchema.virtual("recoveryPercentage").get(function () {
  if (!this.totalWasteCost) return 0;

  return Number(
    (
      (this.estimatedRecoveryValue /
        this.totalWasteCost) *
      100
    ).toFixed(2)
  );
});

/* ==========================================================
   Database Indexes
========================================================== */

kitchenWasteSchema.index(
  { wasteNumber: 1 },
  { unique: true }
);

kitchenWasteSchema.index({
  restaurant: 1,
  store: 1,
});

kitchenWasteSchema.index({
  restaurant: 1,
  kitchen: 1,
});

kitchenWasteSchema.index({
  restaurant: 1,
  wasteDate: -1,
});

kitchenWasteSchema.index({
  restaurant: 1,
  wasteType: 1,
});

kitchenWasteSchema.index({
  restaurant: 1,
  wasteReason: 1,
});

kitchenWasteSchema.index({
  approvalStatus: 1,
});

kitchenWasteSchema.index({
  status: 1,
});

kitchenWasteSchema.index({
  reportedBy: 1,
});

kitchenWasteSchema.index({
  isDeleted: 1,
});

kitchenWasteSchema.index({
  wasteNumber: "text",
  remarks: "text",
});

/* ==========================================================
   Query Middleware (Soft Delete)
========================================================== */

kitchenWasteSchema.pre(/^find/, function (next) {

  if (
    this.getFilter().isDeleted === undefined
  ) {
    this.where({
      isDeleted: false,
    });
  }

  next();

});

/* ==========================================================
   Instance Methods
========================================================== */

// Approve Waste
kitchenWasteSchema.methods.approveWaste =
async function (userId) {

  if (this.approvalStatus === "Approved") {
    throw new Error("Waste already approved.");
  }

  this.approvalStatus = "Approved";
  this.status = "Approved";
  this.approvedBy = userId;
  this.approvedAt = new Date();

  return await this.save();

};

// Reject Waste
kitchenWasteSchema.methods.rejectWaste =
async function (
  userId,
  reason = ""
) {

  this.approvalStatus = "Rejected";
  this.status = "Rejected";
  this.approvedBy = userId;
  this.approvedAt = new Date();
  this.rejectionReason = reason;

  return await this.save();

};

// Complete Waste
kitchenWasteSchema.methods.completeWaste =
async function () {

  if (
    this.approvalStatus !== "Approved"
  ) {
    throw new Error(
      "Waste must be approved before completion."
    );
  }

  this.stockUpdated = true;
  this.ledgerUpdated = true;
  this.status = "Completed";

  return await this.save();

};

// Cancel Waste
kitchenWasteSchema.methods.cancelWaste =
async function () {

  if (this.status === "Completed") {
    throw new Error(
      "Completed waste cannot be cancelled."
    );
  }

  this.status = "Cancelled";

  return await this.save();

};

// Soft Delete
kitchenWasteSchema.methods.softDelete =
async function (userId) {

  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = userId;

  return await this.save();

};

// Restore
kitchenWasteSchema.methods.restore =
async function () {

  this.isDeleted = false;
  this.deletedAt = null;
  this.deletedBy = null;

  return await this.save();

};
/* ==========================================================
   Static Methods
========================================================== */

// Get Pending Waste
kitchenWasteSchema.statics.getPendingWaste = function (
  restaurantId
) {
  return this.find({
    restaurant: restaurantId,
    approvalStatus: "Pending",
    isDeleted: false,
  })
    .populate("reportedBy", "firstName lastName employeeCode")
    .populate("store", "storeName")
    .populate("kitchen", "kitchenName")
    .sort({ wasteDate: -1 });
};

// Get Approved Waste
kitchenWasteSchema.statics.getApprovedWaste = function (
  restaurantId
) {
  return this.find({
    restaurant: restaurantId,
    approvalStatus: "Approved",
    isDeleted: false,
  })
    .populate("reportedBy", "firstName lastName employeeCode")
    .populate("approvedBy", "firstName lastName")
    .populate("store", "storeName")
    .populate("kitchen", "kitchenName")
    .sort({ wasteDate: -1 });
};

// Get Today's Waste
kitchenWasteSchema.statics.getTodayWaste = function (
  restaurantId
) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return this.find({
    restaurant: restaurantId,
    wasteDate: {
      $gte: start,
      $lte: end,
    },
    isDeleted: false,
  })
    .populate("reportedBy", "firstName lastName")
    .populate("store", "storeName")
    .populate("kitchen", "kitchenName")
    .sort({ wasteDate: -1 });
};

// Waste Summary
kitchenWasteSchema.statics.getWasteSummary =
async function (restaurantId, fromDate, toDate) {

  const filter = {
    restaurant: new mongoose.Types.ObjectId(
      restaurantId
    ),
    isDeleted: false,
  };

  if (fromDate && toDate) {
    filter.wasteDate = {
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

        totalRecords: {
          $sum: 1,
        },

        totalItems: {
          $sum: "$totalItems",
        },

        totalQuantity: {
          $sum: "$totalQuantity",
        },

        totalWasteCost: {
          $sum: "$totalWasteCost",
        },

        totalRecovery: {
          $sum: "$estimatedRecoveryValue",
        },

        totalNetLoss: {
          $sum: "$netLossAmount",
        },
      },
    },
  ]);

  return (
    summary[0] || {
      totalRecords: 0,
      totalItems: 0,
      totalQuantity: 0,
      totalWasteCost: 0,
      totalRecovery: 0,
      totalNetLoss: 0,
    }
  );
};

// Category-wise Waste
kitchenWasteSchema.statics.getCategoryWiseWaste =
async function (restaurantId) {

  return this.aggregate([
    {
      $match: {
        restaurant: new mongoose.Types.ObjectId(
          restaurantId
        ),
        isDeleted: false,
      },
    },
    {
      $group: {
        _id: "$wasteReason",

        totalRecords: {
          $sum: 1,
        },

        totalQuantity: {
          $sum: "$totalQuantity",
        },

        totalWasteCost: {
          $sum: "$totalWasteCost",
        },
      },
    },
    {
      $sort: {
        totalWasteCost: -1,
      },
    },
  ]);
};

// Store-wise Waste
kitchenWasteSchema.statics.getStoreWaste =
async function (
  restaurantId,
  storeId = null
) {

  const filter = {
    restaurant: new mongoose.Types.ObjectId(
      restaurantId
    ),
    isDeleted: false,
  };

  if (storeId) {
    filter.store = new mongoose.Types.ObjectId(
      storeId
    );
  }

  return this.find(filter)
    .populate("store", "storeName")
    .populate("reportedBy", "firstName lastName")
    .sort({
      wasteDate: -1,
    });
};

/* ==========================================================
   JSON Settings
========================================================== */

kitchenWasteSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
});

kitchenWasteSchema.set("toObject", {
  virtuals: true,
  versionKey: false,
});

/* ==========================================================
   Production Optimizations
========================================================== */

kitchenWasteSchema.index({
  restaurant: 1,
  store: 1,
  wasteDate: -1,
});

kitchenWasteSchema.index({
  restaurant: 1,
  approvalStatus: 1,
});

kitchenWasteSchema.index({
  restaurant: 1,
  status: 1,
});

kitchenWasteSchema.index({
  restaurant: 1,
  wasteReason: 1,
});

kitchenWasteSchema.index({
  restaurant: 1,
  reportedBy: 1,
});

kitchenWasteSchema.index({
  restaurant: 1,
  createdAt: -1,
});

/* ==========================================================
   Export
========================================================== */

module.exports = mongoose.model(
  "KitchenWaste",
  kitchenWasteSchema
);