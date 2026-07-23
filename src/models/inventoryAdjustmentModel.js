const mongoose = require("mongoose");

/* ==========================================================
   Inventory Adjustment Item Schema
========================================================== */

const adjustmentItemSchema = new mongoose.Schema(
  {
    /* ======================================================
       Item Type
    ====================================================== */

    itemType: {
      type: String,
      enum: ["Ingredient", "Menu Item"],
      required: true,
      trim: true,
    },

    /* ======================================================
       References
    ====================================================== */

    ingredient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ingredient",
      default: null,
    },

    menuItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MenuItem",
      default: null,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },

    unit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
      required: true,
    },

    /* ======================================================
       Item Details
    ====================================================== */

    itemCode: {
      type: String,
      trim: true,
      uppercase: true,
    },

    itemName: {
      type: String,
      required: true,
      trim: true,
    },

    batchNo: {
      type: String,
      trim: true,
      uppercase: true,
    },

    expiryDate: Date,

    /* ======================================================
       Stock Information
    ====================================================== */

    stockBefore: {
      type: Number,
      required: true,
      min: 0,
    },

    physicalStock: {
      type: Number,
      required: true,
      min: 0,
    },

    stockAfter: {
      type: Number,
      default: 0,
      min: 0,
    },

    quantityDifference: {
      type: Number,
      default: 0,
    },

    adjustmentQuantity: {
      type: Number,
      default: 0,
    },

    adjustmentDirection: {
      type: String,
      enum: ["Increase", "Decrease"],
      default: "Increase",
    },

    /* ======================================================
       Cost Information
    ====================================================== */

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

    /* ======================================================
       Remarks
    ====================================================== */

    remarks: {
      type: String,
      trim: true,
      maxlength: 500,
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
        "text/plain",
        "other",
      ],
      default: "other",
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
   Inventory Adjustment Header Schema
========================================================== */

const inventoryAdjustmentSchema = new mongoose.Schema(
  {
    /* ======================================================
       Adjustment Information
    ====================================================== */

    adjustmentNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    adjustmentDate: {
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
       Inventory Location
    ====================================================== */

    warehouse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      default: null,
    },

    kitchen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Kitchen",
      default: null,
    },

    /* ======================================================
       Shift Information
    ====================================================== */

    shift: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shift",
      default: null,
    },

    /* ======================================================
       Employee Information
    ====================================================== */

    adjustedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    /* ======================================================
       Adjustment Details
    ====================================================== */

    adjustmentType: {
      type: String,
      enum: [
        "Increase",
        "Decrease",
        "Physical Count",
        "Damage",
        "Expired",
        "Wastage",
        "Transfer Correction",
        "Opening Stock",
        "Closing Stock",
        "Production",
        "Consumption",
        "Other",
      ],
      required: true,
    },

    adjustmentReason: {
      type: String,
      enum: [
        "Stock Count",
        "Damage",
        "Expired",
        "Wastage",
        "Theft",
        "Production",
        "Consumption",
        "Supplier Error",
        "Transfer Error",
        "System Correction",
        "Audit Correction",
        "Opening Balance",
        "Closing Balance",
        "Other",
      ],
      required: true,
    },

    remarks: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    /* ======================================================
       Adjustment Items
    ====================================================== */

    adjustmentItems: {
      type: [adjustmentItemSchema],
      validate: {
        validator: function (items) {
          return Array.isArray(items) && items.length > 0;
        },
        message:
          "At least one adjustment item is required.",
      },
      required: true,
    },

    /* ======================================================
       Supporting Documents
    ====================================================== */

    attachments: {
      type: [attachmentSchema],
      default: [],
    },
        /* ======================================================
       Stock Summary
    ====================================================== */

    totalStockBefore: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalStockAfter: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalQuantityDifference: {
      type: Number,
      default: 0,
    },

    totalIncreaseQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalDecreaseQuantity: {
      type: Number,
      default: 0,
      min: 0,
    },

    /* ======================================================
       Cost Summary
    ====================================================== */

    totalAdjustmentCost: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalIncreaseCost: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalDecreaseCost: {
      type: Number,
      default: 0,
      min: 0,
    },

    averageUnitCost: {
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
      maxlength: 500,
    },

    /* ======================================================
       Status Fields
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

inventoryAdjustmentSchema.pre("validate", function (next) {
  try {
    /* ======================================================
       Adjustment Number
    ====================================================== */

    if (this.adjustmentNumber) {
      this.adjustmentNumber = this.adjustmentNumber
        .trim()
        .toUpperCase();
    }

    /* ======================================================
       Required Header Validation
    ====================================================== */

    if (!this.restaurant)
      return next(new Error("Restaurant is required."));

    if (!this.store)
      return next(new Error("Store is required."));

    if (!this.adjustedBy)
      return next(new Error("Adjusted By is required."));

    if (!this.adjustmentType)
      return next(new Error("Adjustment Type is required."));

    if (!this.adjustmentReason)
      return next(new Error("Adjustment Reason is required."));

    /* ======================================================
       Warehouse / Kitchen Validation
    ====================================================== */

    if (!this.warehouse && !this.kitchen) {
      return next(
        new Error(
          "Either Warehouse or Kitchen must be selected."
        )
      );
    }

    /* ======================================================
       Adjustment Items Validation
    ====================================================== */

    if (
      !this.adjustmentItems ||
      this.adjustmentItems.length === 0
    ) {
      return next(
        new Error(
          "At least one adjustment item is required."
        )
      );
    }

    /* ======================================================
       Item Validation
    ====================================================== */

    for (const item of this.adjustmentItems) {
      /* ---------- Item Type ---------- */

      if (
        !["Ingredient", "Menu Item"].includes(
          item.itemType
        )
      ) {
        return next(
          new Error("Invalid item type.")
        );
      }

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

      /* ---------- Quantity Validation ---------- */

      if (item.stockBefore < 0) {
        return next(
          new Error(
            "Stock Before cannot be negative."
          )
        );
      }

      if (item.physicalStock < 0) {
        return next(
          new Error(
            "Physical Stock cannot be negative."
          )
        );
      }

      if (item.unitCost < 0) {
        return next(
          new Error(
            "Unit Cost cannot be negative."
          )
        );
      }

      /* ---------- Stock Validation ---------- */

      if (
        item.adjustmentDirection === "Decrease" &&
        item.stockBefore < item.adjustmentQuantity
      ) {
        return next(
          new Error(
            `${item.itemName}: Insufficient stock for decrease adjustment.`
          )
        );
      }

      if (!item.unit) {
        return next(
          new Error(
            `${item.itemName}: Unit is required.`
          )
        );
      }
    }

    /* ======================================================
       Approval Validation
    ====================================================== */

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
          "Rejection Reason is required."
        )
      );
    }

    /* ======================================================
       Status Validation
    ====================================================== */

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
          "Invalid adjustment status."
        )
      );
    }

    if (
      this.stockUpdated &&
      this.status !== "Completed"
    ) {
      return next(
        new Error(
          "Stock can only be updated after adjustment completion."
        )
      );
    }

    if (
      this.ledgerUpdated &&
      !this.stockUpdated
    ) {
      return next(
        new Error(
          "Stock Ledger cannot be updated before stock update."
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

inventoryAdjustmentSchema.pre("save", function (next) {
  try {
    /* ======================================================
       Initialize Totals
    ====================================================== */

    let totalStockBefore = 0;
    let totalStockAfter = 0;
    let totalQuantityDifference = 0;

    let totalIncreaseQuantity = 0;
    let totalDecreaseQuantity = 0;

    let totalAdjustmentCost = 0;
    let totalIncreaseCost = 0;
    let totalDecreaseCost = 0;

    let totalUnitCost = 0;

    /* ======================================================
       Item-wise Calculations
    ====================================================== */

    if (this.adjustmentItems && this.adjustmentItems.length) {

      this.adjustmentItems.forEach((item) => {

        /* ------------------------------------------
           Quantity Difference
        ------------------------------------------ */

        item.quantityDifference =
          Number(item.physicalStock || 0) -
          Number(item.stockBefore || 0);

        item.adjustmentQuantity = Math.abs(
          item.quantityDifference
        );

        /* ------------------------------------------
           Adjustment Direction
        ------------------------------------------ */

        item.adjustmentDirection =
          item.quantityDifference >= 0
            ? "Increase"
            : "Decrease";

        /* ------------------------------------------
           Stock After
        ------------------------------------------ */

        item.stockAfter = Number(
          item.physicalStock || 0
        );

        /* ------------------------------------------
           Item Cost
        ------------------------------------------ */

        item.totalCost =
          Number(item.adjustmentQuantity || 0) *
          Number(item.unitCost || 0);

        /* ------------------------------------------
           Quantity Totals
        ------------------------------------------ */

        totalStockBefore += Number(
          item.stockBefore || 0
        );

        totalStockAfter += Number(
          item.stockAfter || 0
        );

        totalQuantityDifference += Number(
          item.quantityDifference || 0
        );

        totalAdjustmentCost += Number(
          item.totalCost || 0
        );

        totalUnitCost += Number(
          item.unitCost || 0
        );

        if (
          item.adjustmentDirection === "Increase"
        ) {

          totalIncreaseQuantity += Number(
            item.adjustmentQuantity || 0
          );

          totalIncreaseCost += Number(
            item.totalCost || 0
          );

        } else {

          totalDecreaseQuantity += Number(
            item.adjustmentQuantity || 0
          );

          totalDecreaseCost += Number(
            item.totalCost || 0
          );

        }

      });

    }

    /* ======================================================
       Header Totals
    ====================================================== */

    this.totalStockBefore = Number(
      totalStockBefore.toFixed(2)
    );

    this.totalStockAfter = Number(
      totalStockAfter.toFixed(2)
    );

    this.totalQuantityDifference = Number(
      totalQuantityDifference.toFixed(2)
    );

    this.totalIncreaseQuantity = Number(
      totalIncreaseQuantity.toFixed(2)
    );

    this.totalDecreaseQuantity = Number(
      totalDecreaseQuantity.toFixed(2)
    );

    /* ======================================================
       Cost Totals
    ====================================================== */

    this.totalAdjustmentCost = Number(
      totalAdjustmentCost.toFixed(2)
    );

    this.totalIncreaseCost = Number(
      totalIncreaseCost.toFixed(2)
    );

    this.totalDecreaseCost = Number(
      totalDecreaseCost.toFixed(2)
    );

    this.averageUnitCost =
      this.adjustmentItems.length > 0
        ? Number(
            (
              totalUnitCost /
              this.adjustmentItems.length
            ).toFixed(2)
          )
        : 0;

    /* ======================================================
       Automatic Approval Logic
    ====================================================== */

    if (!this.approvalRequired) {

      this.approvalStatus = "Approved";

      if (!this.approvedAt) {
        this.approvedAt = new Date();
      }

    }

    /* ======================================================
       Automatic Status Calculation
    ====================================================== */

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

    /* ======================================================
       Completed Validation
    ====================================================== */

    if (
      this.status === "Completed" &&
      (!this.stockUpdated ||
        !this.ledgerUpdated)
    ) {

      return next(
        new Error(
          "Stock and Ledger must be updated before completing adjustment."
        )
      );

    }

    /* ======================================================
       Cancel Validation
    ====================================================== */

    if (
      this.status === "Cancelled" &&
      this.stockUpdated
    ) {

      return next(
        new Error(
          "Completed inventory adjustments cannot be cancelled."
        )
      );

    }

    /* ======================================================
       Round Monetary Values
    ====================================================== */

    this.totalAdjustmentCost = Number(
      this.totalAdjustmentCost.toFixed(2)
    );

    this.totalIncreaseCost = Number(
      this.totalIncreaseCost.toFixed(2)
    );

    this.totalDecreaseCost = Number(
      this.totalDecreaseCost.toFixed(2)
    );

    this.averageUnitCost = Number(
      this.averageUnitCost.toFixed(2)
    );

    next();

  } catch (error) {

    next(error);

  }
});
/* ==========================================================
   Pre-save Middleware
========================================================== */

inventoryAdjustmentSchema.pre("save", function (next) {
  try {
    /* ======================================================
       Initialize Totals
    ====================================================== */

    let totalStockBefore = 0;
    let totalStockAfter = 0;
    let totalQuantityDifference = 0;

    let totalIncreaseQuantity = 0;
    let totalDecreaseQuantity = 0;

    let totalAdjustmentCost = 0;
    let totalIncreaseCost = 0;
    let totalDecreaseCost = 0;

    let totalUnitCost = 0;

    /* ======================================================
       Item-wise Calculations
    ====================================================== */

    if (this.adjustmentItems && this.adjustmentItems.length) {

      this.adjustmentItems.forEach((item) => {

        /* ------------------------------------------
           Quantity Difference
        ------------------------------------------ */

        item.quantityDifference =
          Number(item.physicalStock || 0) -
          Number(item.stockBefore || 0);

        item.adjustmentQuantity = Math.abs(
          item.quantityDifference
        );

        /* ------------------------------------------
           Adjustment Direction
        ------------------------------------------ */

        item.adjustmentDirection =
          item.quantityDifference >= 0
            ? "Increase"
            : "Decrease";

        /* ------------------------------------------
           Stock After
        ------------------------------------------ */

        item.stockAfter = Number(
          item.physicalStock || 0
        );

        /* ------------------------------------------
           Item Cost
        ------------------------------------------ */

        item.totalCost =
          Number(item.adjustmentQuantity || 0) *
          Number(item.unitCost || 0);

        /* ------------------------------------------
           Quantity Totals
        ------------------------------------------ */

        totalStockBefore += Number(
          item.stockBefore || 0
        );

        totalStockAfter += Number(
          item.stockAfter || 0
        );

        totalQuantityDifference += Number(
          item.quantityDifference || 0
        );

        totalAdjustmentCost += Number(
          item.totalCost || 0
        );

        totalUnitCost += Number(
          item.unitCost || 0
        );

        if (
          item.adjustmentDirection === "Increase"
        ) {

          totalIncreaseQuantity += Number(
            item.adjustmentQuantity || 0
          );

          totalIncreaseCost += Number(
            item.totalCost || 0
          );

        } else {

          totalDecreaseQuantity += Number(
            item.adjustmentQuantity || 0
          );

          totalDecreaseCost += Number(
            item.totalCost || 0
          );

        }

      });

    }

    /* ======================================================
       Header Totals
    ====================================================== */

    this.totalStockBefore = Number(
      totalStockBefore.toFixed(2)
    );

    this.totalStockAfter = Number(
      totalStockAfter.toFixed(2)
    );

    this.totalQuantityDifference = Number(
      totalQuantityDifference.toFixed(2)
    );

    this.totalIncreaseQuantity = Number(
      totalIncreaseQuantity.toFixed(2)
    );

    this.totalDecreaseQuantity = Number(
      totalDecreaseQuantity.toFixed(2)
    );

    /* ======================================================
       Cost Totals
    ====================================================== */

    this.totalAdjustmentCost = Number(
      totalAdjustmentCost.toFixed(2)
    );

    this.totalIncreaseCost = Number(
      totalIncreaseCost.toFixed(2)
    );

    this.totalDecreaseCost = Number(
      totalDecreaseCost.toFixed(2)
    );

    this.averageUnitCost =
      this.adjustmentItems.length > 0
        ? Number(
            (
              totalUnitCost /
              this.adjustmentItems.length
            ).toFixed(2)
          )
        : 0;

    /* ======================================================
       Automatic Approval Logic
    ====================================================== */

    if (!this.approvalRequired) {

      this.approvalStatus = "Approved";

      if (!this.approvedAt) {
        this.approvedAt = new Date();
      }

    }

    /* ======================================================
       Automatic Status Calculation
    ====================================================== */

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

    /* ======================================================
       Completed Validation
    ====================================================== */

    if (
      this.status === "Completed" &&
      (!this.stockUpdated ||
        !this.ledgerUpdated)
    ) {

      return next(
        new Error(
          "Stock and Ledger must be updated before completing adjustment."
        )
      );

    }

    /* ======================================================
       Cancel Validation
    ====================================================== */

    if (
      this.status === "Cancelled" &&
      this.stockUpdated
    ) {

      return next(
        new Error(
          "Completed inventory adjustments cannot be cancelled."
        )
      );

    }

    /* ======================================================
       Round Monetary Values
    ====================================================== */

    this.totalAdjustmentCost = Number(
      this.totalAdjustmentCost.toFixed(2)
    );

    this.totalIncreaseCost = Number(
      this.totalIncreaseCost.toFixed(2)
    );

    this.totalDecreaseCost = Number(
      this.totalDecreaseCost.toFixed(2)
    );

    this.averageUnitCost = Number(
      this.averageUnitCost.toFixed(2)
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
inventoryAdjustmentSchema.virtual("isApproved").get(function () {
  return (
    this.approvalStatus === "Approved" &&
    !this.isDeleted
  );
});

// Is Pending
inventoryAdjustmentSchema.virtual("isPending").get(function () {
  return (
    this.approvalStatus === "Pending" &&
    !this.isDeleted
  );
});

// Is Completed
inventoryAdjustmentSchema.virtual("isCompleted").get(function () {
  return (
    this.status === "Completed" &&
    !this.isDeleted
  );
});

// Net Stock Difference
inventoryAdjustmentSchema.virtual("netStockDifference").get(function () {
  return Number(
    (
      this.totalStockAfter -
      this.totalStockBefore
    ).toFixed(2)
  );
});

// Average Cost Per Adjusted Item
inventoryAdjustmentSchema.virtual("averageAdjustmentCost").get(function () {
  if (!this.adjustmentItems.length) return 0;

  return Number(
    (
      this.totalAdjustmentCost /
      this.adjustmentItems.length
    ).toFixed(2)
  );
});

/* ==========================================================
   Database Indexes
========================================================== */

inventoryAdjustmentSchema.index(
  { adjustmentNumber: 1 },
  { unique: true }
);

inventoryAdjustmentSchema.index({
  restaurant: 1,
  store: 1,
});

inventoryAdjustmentSchema.index({
  restaurant: 1,
  warehouse: 1,
});

inventoryAdjustmentSchema.index({
  restaurant: 1,
  kitchen: 1,
});

inventoryAdjustmentSchema.index({
  restaurant: 1,
  adjustmentDate: -1,
});

inventoryAdjustmentSchema.index({
  restaurant: 1,
  adjustmentType: 1,
});

inventoryAdjustmentSchema.index({
  restaurant: 1,
  adjustmentReason: 1,
});

inventoryAdjustmentSchema.index({
  approvalStatus: 1,
});

inventoryAdjustmentSchema.index({
  status: 1,
});

inventoryAdjustmentSchema.index({
  adjustedBy: 1,
});

inventoryAdjustmentSchema.index({
  isDeleted: 1,
});

inventoryAdjustmentSchema.index({
  adjustmentNumber: "text",
  remarks: "text",
});

/* ==========================================================
   Query Middleware (Soft Delete)
========================================================== */

inventoryAdjustmentSchema.pre(/^find/, function (next) {

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

// Approve Adjustment
inventoryAdjustmentSchema.methods.approveAdjustment =
async function (userId) {

  if (this.approvalStatus === "Approved") {
    throw new Error(
      "Inventory Adjustment already approved."
    );
  }

  this.approvalStatus = "Approved";
  this.status = "Approved";
  this.approvedBy = userId;
  this.approvedAt = new Date();

  return await this.save();

};

// Reject Adjustment
inventoryAdjustmentSchema.methods.rejectAdjustment =
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

// Complete Adjustment
inventoryAdjustmentSchema.methods.completeAdjustment =
async function () {

  if (
    this.approvalStatus !== "Approved"
  ) {
    throw new Error(
      "Inventory Adjustment must be approved before completion."
    );
  }

  this.stockUpdated = true;
  this.ledgerUpdated = true;
  this.status = "Completed";

  return await this.save();

};

// Cancel Adjustment
inventoryAdjustmentSchema.methods.cancelAdjustment =
async function () {

  if (this.status === "Completed") {
    throw new Error(
      "Completed inventory adjustment cannot be cancelled."
    );
  }

  this.status = "Cancelled";

  return await this.save();

};

// Soft Delete
inventoryAdjustmentSchema.methods.softDelete =
async function (userId) {

  this.isDeleted = true;
  this.deletedAt = new Date();
  this.deletedBy = userId;

  return await this.save();

};

// Restore
inventoryAdjustmentSchema.methods.restore =
async function () {

  this.isDeleted = false;
  this.deletedAt = null;
  this.deletedBy = null;

  return await this.save();

};
/* ==========================================================
   Static Methods
========================================================== */

// ==========================================================
// Get Pending Adjustments
// ==========================================================

inventoryAdjustmentSchema.statics.getPendingAdjustments =
function (restaurantId) {

  return this.find({
    restaurant: restaurantId,
    approvalStatus: "Pending",
    isDeleted: false,
  })
    .populate("store", "storeName")
    .populate("warehouse", "warehouseName")
    .populate("kitchen", "kitchenName")
    .populate("adjustedBy", "name employeeCode")
    .sort({ adjustmentDate: -1 });

};

// ==========================================================
// Get Approved Adjustments
// ==========================================================

inventoryAdjustmentSchema.statics.getApprovedAdjustments =
function (restaurantId) {

  return this.find({
    restaurant: restaurantId,
    approvalStatus: "Approved",
    isDeleted: false,
  })
    .populate("store", "storeName")
    .populate("warehouse", "warehouseName")
    .populate("kitchen", "kitchenName")
    .populate("approvedBy", "name employeeCode")
    .sort({ adjustmentDate: -1 });

};

// ==========================================================
// Get Today's Adjustments
// ==========================================================

inventoryAdjustmentSchema.statics.getTodayAdjustments =
function (restaurantId) {

  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return this.find({
    restaurant: restaurantId,
    adjustmentDate: {
      $gte: start,
      $lte: end,
    },
    isDeleted: false,
  })
    .populate("store", "storeName")
    .populate("adjustedBy", "name")
    .sort({ adjustmentDate: -1 });

};

// ==========================================================
// Inventory Adjustment Summary
// ==========================================================

inventoryAdjustmentSchema.statics.getAdjustmentSummary =
async function (
  restaurantId,
  fromDate,
  toDate
) {

  const filter = {
    restaurant: new mongoose.Types.ObjectId(
      restaurantId
    ),
    isDeleted: false,
  };

  if (fromDate && toDate) {
    filter.adjustmentDate = {
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

        totalAdjustments: {
          $sum: 1,
        },

        totalStockBefore: {
          $sum: "$totalStockBefore",
        },

        totalStockAfter: {
          $sum: "$totalStockAfter",
        },

        totalQuantityDifference: {
          $sum: "$totalQuantityDifference",
        },

        totalIncreaseQuantity: {
          $sum: "$totalIncreaseQuantity",
        },

        totalDecreaseQuantity: {
          $sum: "$totalDecreaseQuantity",
        },

        totalAdjustmentCost: {
          $sum: "$totalAdjustmentCost",
        },

        totalIncreaseCost: {
          $sum: "$totalIncreaseCost",
        },

        totalDecreaseCost: {
          $sum: "$totalDecreaseCost",
        },
      },
    },
  ]);

  return (
    result[0] || {
      totalAdjustments: 0,
      totalStockBefore: 0,
      totalStockAfter: 0,
      totalQuantityDifference: 0,
      totalIncreaseQuantity: 0,
      totalDecreaseQuantity: 0,
      totalAdjustmentCost: 0,
      totalIncreaseCost: 0,
      totalDecreaseCost: 0,
    }
  );

};

// ==========================================================
// Reason-wise Adjustments
// ==========================================================

inventoryAdjustmentSchema.statics.getReasonWiseAdjustments =
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
        _id: "$adjustmentReason",

        totalAdjustments: {
          $sum: 1,
        },

        totalQuantity: {
          $sum: "$totalQuantityDifference",
        },

        totalCost: {
          $sum: "$totalAdjustmentCost",
        },
      },
    },
    {
      $sort: {
        totalCost: -1,
      },
    },
  ]);

};

// ==========================================================
// Store Adjustments
// ==========================================================

inventoryAdjustmentSchema.statics.getStoreAdjustments =
function (
  restaurantId,
  storeId
) {

  return this.find({
    restaurant: restaurantId,
    store: storeId,
    isDeleted: false,
  })
    .populate("warehouse", "warehouseName")
    .populate("kitchen", "kitchenName")
    .populate("adjustedBy", "name employeeCode")
    .sort({
      adjustmentDate: -1,
    });

};

/* ==========================================================
   JSON Settings
========================================================== */

inventoryAdjustmentSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
});

inventoryAdjustmentSchema.set("toObject", {
  virtuals: true,
  versionKey: false,
});

/* ==========================================================
   Production Optimizations
========================================================== */

inventoryAdjustmentSchema.index({
  restaurant: 1,
  store: 1,
  adjustmentDate: -1,
});

inventoryAdjustmentSchema.index({
  restaurant: 1,
  approvalStatus: 1,
});

inventoryAdjustmentSchema.index({
  restaurant: 1,
  status: 1,
});

inventoryAdjustmentSchema.index({
  restaurant: 1,
  adjustmentType: 1,
});

inventoryAdjustmentSchema.index({
  restaurant: 1,
  adjustmentReason: 1,
});

inventoryAdjustmentSchema.index({
  restaurant: 1,
  adjustedBy: 1,
});

inventoryAdjustmentSchema.index({
  restaurant: 1,
  createdAt: -1,
});

/* ==========================================================
   Export
========================================================== */

module.exports = mongoose.model(
  "InventoryAdjustment",
  inventoryAdjustmentSchema
);