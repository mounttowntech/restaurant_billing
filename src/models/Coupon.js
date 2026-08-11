const mongoose = require("mongoose");

/* ==========================================================
   Time Slot Schema
========================================================== */

const timeSlotSchema = new mongoose.Schema(
  {
    from: {
      type: String,
      required: true, // HH:mm
    },

    to: {
      type: String,
      required: true, // HH:mm
    },
  },
  {
    _id: false,
  }
);

/* ==========================================================
   Coupon Schema
========================================================== */

const couponSchema = new mongoose.Schema(
  {
    /* ======================================================
       Coupon Details
    ====================================================== */

    couponCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    couponName: {
      type: String,
      required: true,
      trim: true,
    },

    description: String,

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
    },

    /* ======================================================
       Discount Configuration
    ====================================================== */

    discountType: {
      type: String,
      enum: ["Flat", "Percentage"],
      required: true,
    },

    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },

    maximumDiscount: {
      type: Number,
      default: 0,
      min: 0,
    },

    /* ======================================================
       Order Conditions
    ====================================================== */

    minimumOrderAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    maximumOrderAmount: {
      type: Number,
      default: 0,
    },

    /* ======================================================
       Validity
    ====================================================== */

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    /* ======================================================
       Days
    ====================================================== */

    applicableDays: [
      {
        type: String,
        enum: [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ],
      },
    ],

    /* ======================================================
       Time Slots
    ====================================================== */

    timeSlots: [timeSlotSchema],

    /* ======================================================
       Order Types
    ====================================================== */

    applicableOrderTypes: [
      {
        type: String,
        enum: [
          "Dine-In",
          "Takeaway",
          "Delivery",
          "Drive-Thru",
        ],
      },
    ],

    /* ======================================================
       Menu Rules
    ====================================================== */

    applicableCategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MenuCategory",
      },
    ],

    applicableMenuItems: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MenuItem",
      },
    ],

    excludedCategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MenuCategory",
      },
    ],

    excludedMenuItems: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MenuItem",
      },
    ],

    /* ======================================================
       Usage Limits
    ====================================================== */

    usageLimit: {
      type: Number,
      default: 0,
    },

    usageCount: {
      type: Number,
      default: 0,
    },

    usagePerCustomer: {
      type: Number,
      default: 1,
    },

    /* ======================================================
       Customer Eligibility
    ====================================================== */

    firstOrderOnly: {
      type: Boolean,
      default: false,
    },

    newCustomerOnly: {
      type: Boolean,
      default: false,
    },

    applicableCustomers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
      },
    ],

    excludedCustomers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
      },
    ],

    /* ======================================================
       Status
    ====================================================== */

    autoApply: {
      type: Boolean,
      default: false,
    },

    priority: {
      type: Number,
      default: 1,
    },

    status: {
      type: Boolean,
      default: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    /* ======================================================
       Audit
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
   Pre-save Validation
========================================================== */

couponSchema.pre("save", function () {

  // Coupon Code
  if (this.couponCode) {
    this.couponCode = this.couponCode
      .trim()
      .toUpperCase();
  }

  // Date Validation
  if (this.endDate <= this.startDate) {
    return (
      new Error("End Date must be greater than Start Date.")
    );
  }

  // Percentage Validation
  if (
    this.discountType === "Percentage" &&
    this.discountValue > 100
  ) {
    return (
      new Error(
        "Percentage discount cannot exceed 100."
      )
    );
  }

  // Usage Count Validation
  if (
    this.usageLimit > 0 &&
    this.usageCount > this.usageLimit
  ) {
    return (
      new Error(
        "Usage count cannot exceed usage limit."
      )
    );
  }



});
/* ==========================================================
   Virtuals
========================================================== */

// Is Active
couponSchema.virtual("isActive").get(function () {

  const now = new Date();

  return (
    this.status &&
    !this.isDeleted &&
    now >= this.startDate &&
    now <= this.endDate
  );

});

// Is Expired
couponSchema.virtual("isExpired").get(function () {

  return new Date() > this.endDate;

});

// Remaining Usage
couponSchema.virtual("remainingUsage").get(function () {

  if (this.usageLimit === 0) return "Unlimited";

  return Math.max(
    this.usageLimit - this.usageCount,
    0
  );

});

// Unlimited Coupon
couponSchema.virtual("isUnlimited").get(function () {

  return this.usageLimit === 0;

});

/* ==========================================================
   Database Indexes
========================================================== */

couponSchema.index(
  { couponCode: 1 },
  { unique: true }
);

couponSchema.index({ restaurant: 1 });

couponSchema.index({ store: 1 });

couponSchema.index({ status: 1 });

couponSchema.index({ startDate: 1 });

couponSchema.index({ endDate: 1 });

couponSchema.index({ autoApply: 1 });

couponSchema.index({ priority: -1 });

couponSchema.index({ isDeleted: 1 });

couponSchema.index({
  couponCode: "text",
  couponName: "text",
  description: "text",
});

/* ==========================================================
   Query Middleware
========================================================== */

couponSchema.pre(/^find/, function () {

  if (this.getFilter().isDeleted === undefined) {

    this.where({
      isDeleted: false,
    });

  }



});

/* ==========================================================
   Instance Methods
========================================================== */

// Activate Coupon
couponSchema.methods.activateCoupon =
async function () {

  this.status = true;

  return await this.save();

};

// Deactivate Coupon
couponSchema.methods.deactivateCoupon =
async function () {

  this.status = false;

  return await this.save();

};

// Increase Usage Count
couponSchema.methods.incrementUsage =
async function () {

  if (
    this.usageLimit > 0 &&
    this.usageCount >= this.usageLimit
  ) {

    throw new Error("Coupon usage limit reached.");

  }

  this.usageCount += 1;

  return await this.save();

};

// Soft Delete
couponSchema.methods.softDelete =
async function (userId) {

  this.isDeleted = true;

  this.updatedBy = userId;

  return await this.save();

};

// Restore
couponSchema.methods.restore =
async function () {

  this.isDeleted = false;

  return await this.save();

};

// Validate Coupon
couponSchema.methods.isValidCoupon =
function (orderAmount = 0) {

  const now = new Date();

  if (!this.status)
    return {
      valid: false,
      message: "Coupon is inactive.",
    };

  if (this.isDeleted)
    return {
      valid: false,
      message: "Coupon deleted.",
    };

  if (
    now < this.startDate ||
    now > this.endDate
  ) {
    return {
      valid: false,
      message: "Coupon expired.",
    };
  }

  if (
    this.minimumOrderAmount &&
    orderAmount < this.minimumOrderAmount
  ) {
    return {
      valid: false,
      message: "Minimum order amount not reached.",
    };
  }

  if (
    this.maximumOrderAmount > 0 &&
    orderAmount > this.maximumOrderAmount
  ) {
    return {
      valid: false,
      message: "Order exceeds coupon limit.",
    };
  }

  if (
    this.usageLimit > 0 &&
    this.usageCount >= this.usageLimit
  ) {
    return {
      valid: false,
      message: "Coupon usage limit exceeded.",
    };
  }

  return {
    valid: true,
    message: "Coupon is valid.",
  };

};

/* ==========================================================
   Static Methods
========================================================== */

// Active Coupons
couponSchema.statics.getActiveCoupons =
function () {

  const now = new Date();

  return this.find({

    status: true,

    isDeleted: false,

    startDate: { $lte: now },

    endDate: { $gte: now },

  }).sort({
    priority: -1,
  });

};

// Applicable Coupons
couponSchema.statics.getApplicableCoupons =
function (
  restaurantId,
  storeId = null
) {

  const now = new Date();

  const query = {

    restaurant: restaurantId,

    status: true,

    isDeleted: false,

    startDate: { $lte: now },

    endDate: { $gte: now },

  };

  if (storeId)
    query.$or = [
      { store: storeId },
      { store: null },
    ];

  return this.find(query).sort({
    priority: -1,
  });

};

// Auto Apply Coupons
couponSchema.statics.getAutoApplyCoupons =
function () {

  const now = new Date();

  return this.find({

    autoApply: true,

    status: true,

    isDeleted: false,

    startDate: { $lte: now },

    endDate: { $gte: now },

  }).sort({
    priority: -1,
  });

};

// Expired Coupons
couponSchema.statics.getExpiredCoupons =
function () {

  return this.find({

    endDate: {
      $lt: new Date(),
    },

    isDeleted: false,

  });

};

// Today's Coupons
couponSchema.statics.getTodayCoupons =
function () {

  const start = new Date();
  start.setHours(0,0,0,0);

  const end = new Date();
  end.setHours(23,59,59,999);

  return this.find({

    startDate: {
      $gte: start,
      $lte: end,
    },

    isDeleted: false,

  });

};

/* ==========================================================
   JSON Settings
========================================================== */

couponSchema.set("toJSON", {

  virtuals: true,

  versionKey: false,

});

couponSchema.set("toObject", {

  virtuals: true,

  versionKey: false,

});

/* ==========================================================
   Production Optimizations
========================================================== */

// Compound Indexes

couponSchema.index({
  restaurant: 1,
  status: 1,
  startDate: 1,
  endDate: 1,
});

couponSchema.index({
  restaurant: 1,
  store: 1,
  priority: -1,
});

couponSchema.index({
  autoApply: 1,
  priority: -1,
});

couponSchema.index({
  applicableOrderTypes: 1,
});

couponSchema.index({
  applicableCategories: 1,
});

couponSchema.index({
  applicableMenuItems: 1,
});

/* ==========================================================
   Export
========================================================== */

module.exports = mongoose.model(
  "Coupon",
  couponSchema
);