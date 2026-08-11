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
   Discount Schema
========================================================== */

const discountSchema = new mongoose.Schema(
  {
    /* ======================================================
       Discount Details
    ====================================================== */

    discountName: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
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

    minimumOrderAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    maximumOrderAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    applyOn: {
      type: String,
      enum: [
        "Bill",
        "Category",
        "Menu Item",
        "Addon",
        "Combo",
      ],
      default: "Bill",
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

    timeSlots: [timeSlotSchema],

    /* ======================================================
       Order Rules
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
       Category Rules
    ====================================================== */

    applicableCategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MenuCategory",
      },
    ],

    excludedCategories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MenuCategory",
      },
    ],

    /* ======================================================
       Menu Rules
    ====================================================== */

    applicableMenuItems: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MenuItem",
      },
    ],

    excludedMenuItems: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "MenuItem",
      },
    ],

    /* ======================================================
       Customer Rules
    ====================================================== */

    customerType: {
      type: String,
      enum: [
        "All",
        "New",
        "Existing",
        "VIP",
        "Loyalty",
        "Employee",
      ],
      default: "All",
    },

    birthdayOffer: {
      type: Boolean,
      default: false,
    },

    firstOrderOnly: {
      type: Boolean,
      default: false,
    },

    loyaltyPointsRequired: {
      type: Number,
      default: 0,
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
       Discount Rules
    ====================================================== */

    stackWithCoupon: {
      type: Boolean,
      default: false,
    },

    stackWithDiscount: {
      type: Boolean,
      default: false,
    },

    managerApprovalRequired: {
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

    /* ======================================================
       Audit Fields
    ====================================================== */

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
   Pre-save Validation
========================================================== */

discountSchema.pre("save", function () {

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

  // Maximum Discount
  if (
    this.discountType === "Flat" &&
    this.maximumDiscount > 0 &&
    this.maximumDiscount < this.discountValue
  ) {
    return (
      new Error(
        "Maximum discount cannot be less than flat discount."
      )
    );
  }

  // Order Amount Validation
  if (
    this.maximumOrderAmount > 0 &&
    this.maximumOrderAmount <
      this.minimumOrderAmount
  ) {
    return (
      new Error(
        "Maximum order amount must be greater than minimum order amount."
      )
    );
  }

 

});
/* ==========================================================
   Virtuals
========================================================== */

// Is Active
discountSchema.virtual("isActive").get(function () {
  const now = new Date();

  return (
    this.status &&
    !this.isDeleted &&
    now >= this.startDate &&
    now <= this.endDate
  );
});

// Is Expired
discountSchema.virtual("isExpired").get(function () {
  return new Date() > this.endDate;
});

// Percentage Discount
discountSchema.virtual("isPercentage").get(function () {
  return this.discountType === "Percentage";
});

// Flat Discount
discountSchema.virtual("isFlat").get(function () {
  return this.discountType === "Flat";
});

/* ==========================================================
   Database Indexes
========================================================== */

discountSchema.index({ restaurant: 1 });

discountSchema.index({ store: 1 });

discountSchema.index({ status: 1 });

discountSchema.index({ isDeleted: 1 });

discountSchema.index({ startDate: 1 });

discountSchema.index({ endDate: 1 });

discountSchema.index({ priority: -1 });

discountSchema.index({ applyOn: 1 });

discountSchema.index({ customerType: 1 });

discountSchema.index({ applicableCategories: 1 });

discountSchema.index({ applicableMenuItems: 1 });

discountSchema.index({
  discountName: "text",
  description: "text",
});

/* ==========================================================
   Query Middleware
========================================================== */

discountSchema.pre(/^find/, function () {

  if (this.getFilter().isDeleted === undefined) {
    this.where({
      isDeleted: false,
    });
  }

  

});

/* ==========================================================
   Instance Methods
========================================================== */

// Activate Discount
discountSchema.methods.activateDiscount = async function () {

  this.status = true;

  return await this.save();

};

// Deactivate Discount
discountSchema.methods.deactivateDiscount = async function () {

  this.status = false;

  return await this.save();

};

// Soft Delete
discountSchema.methods.softDelete = async function (
  userId
) {

  this.isDeleted = true;

  this.updatedBy = userId;

  return await this.save();

};

// Restore
discountSchema.methods.restore = async function () {

  this.isDeleted = false;

  return await this.save();

};

// Calculate Discount
discountSchema.methods.calculateDiscount = function (
  orderAmount
) {

  let discount = 0;

  if (
    this.minimumOrderAmount &&
    orderAmount < this.minimumOrderAmount
  ) {
    return 0;
  }

  if (
    this.maximumOrderAmount > 0 &&
    orderAmount > this.maximumOrderAmount
  ) {
    return 0;
  }

  if (this.discountType === "Flat") {

    discount = this.discountValue;

  } else {

    discount =
      (orderAmount * this.discountValue) / 100;

    if (
      this.maximumDiscount > 0 &&
      discount > this.maximumDiscount
    ) {
      discount = this.maximumDiscount;
    }

  }

  return Number(discount.toFixed(2));

};

/* ==========================================================
   Static Methods
========================================================== */

// Active Discounts
discountSchema.statics.getActiveDiscounts =
function () {

  const now = new Date();

  return this.find({

    status: true,

    isDeleted: false,

    startDate: {
      $lte: now,
    },

    endDate: {
      $gte: now,
    },

  }).sort({
    priority: -1,
  });

};

// Applicable Discounts
discountSchema.statics.getApplicableDiscounts =
function (
  restaurantId,
  storeId = null
) {

  const now = new Date();

  const query = {

    restaurant: restaurantId,

    status: true,

    isDeleted: false,

    startDate: {
      $lte: now,
    },

    endDate: {
      $gte: now,
    },

  };

  if (storeId) {
    query.$or = [
      { store: storeId },
      { store: null },
    ];
  }

  return this.find(query).sort({
    priority: -1,
  });

};

// Today's Discounts
discountSchema.statics.getTodayDiscounts =
function () {

  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return this.find({

    status: true,

    isDeleted: false,

    startDate: {
      $lte: end,
    },

    endDate: {
      $gte: start,
    },

  });

};

// Category Discounts
discountSchema.statics.getCategoryDiscounts =
function (categoryId) {

  return this.find({

    applicableCategories: categoryId,

    status: true,

    isDeleted: false,

  }).sort({
    priority: -1,
  });

};

// Menu Item Discounts
discountSchema.statics.getMenuDiscounts =
function (menuItemId) {

  return this.find({

    applicableMenuItems: menuItemId,

    status: true,

    isDeleted: false,

  }).sort({
    priority: -1,
  });

};

/* ==========================================================
   JSON Settings
========================================================== */

discountSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
});

discountSchema.set("toObject", {
  virtuals: true,
  versionKey: false,
});

/* ==========================================================
   Production Optimizations
========================================================== */

discountSchema.index({
  restaurant: 1,
  store: 1,
  status: 1,
});

discountSchema.index({
  restaurant: 1,
  priority: -1,
});

discountSchema.index({
  applyOn: 1,
  priority: -1,
});

discountSchema.index({
  startDate: 1,
  endDate: 1,
});

discountSchema.index({
  customerType: 1,
  priority: -1,
});

/* ==========================================================
   Export
========================================================== */

module.exports = mongoose.model(
  "Discount",
  discountSchema
);