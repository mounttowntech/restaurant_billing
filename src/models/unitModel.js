const mongoose = require("mongoose");

/* ==========================================================
   Unit Schema
========================================================== */

const unitSchema = new mongoose.Schema(
  {
    /* ========================================================
       Restaurant
    ======================================================== */

    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },

    /* ========================================================
       Unit Name
    ======================================================== */

    unitName: {
      type: String,
      required: true,
      trim: true,
    },

    /* ========================================================
       Unit Short Code
       Example: KG, GM, LTR, PCS
    ======================================================== */

    unitCode: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },

    /* ========================================================
       Description
    ======================================================== */

    description: {
      type: String,
      trim: true,
      default: "",
    },

    /* ========================================================
       Unit Type
    ======================================================== */

    unitType: {
      type: String,
      enum: [
        "Quantity",
        "Weight",
        "Volume",
        "Length",
        "Other",
      ],
      default: "Quantity",
    },

    /* ========================================================
       Conversion
       Example:
       1 Kg = 1000 Gram
    ======================================================== */

    conversionValue: {
      type: Number,
      default: 1,
      min: 0,
    },

    baseUnit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Unit",
      default: null,
    },

    /* ========================================================
       Status
    ======================================================== */

    isActive: {
      type: Boolean,
      default: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    /* ========================================================
       Audit
    ======================================================== */

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
   Indexes
========================================================== */

unitSchema.index({
  restaurant: 1,
  unitName: 1,
});

unitSchema.index({
  restaurant: 1,
  unitCode: 1,
});

unitSchema.index({
  unitType: 1,
});

unitSchema.index({
  isActive: 1,
});

unitSchema.index({
  isDeleted: 1,
});

/* ==========================================================
   Prevent Duplicate Unit Name Per Restaurant
========================================================== */

unitSchema.index(
  {
    restaurant: 1,
    unitName: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      isDeleted: false,
    },
  }
);

/* ==========================================================
   Prevent Duplicate Unit Code Per Restaurant
========================================================== */

unitSchema.index(
  {
    restaurant: 1,
    unitCode: 1,
  },
  {
    unique: true,
    partialFilterExpression: {
      isDeleted: false,
    },
  }
);

/* ==========================================================
   Uppercase Code
========================================================== */

unitSchema.pre("validate", function () {
  if (this.unitCode) {
    this.unitCode = this.unitCode.trim().toUpperCase();
  }

  if (this.unitName) {
    this.unitName = this.unitName.trim();
  }


});

/* ==========================================================
   JSON
========================================================== */

unitSchema.set("toJSON", {
  virtuals: true,
});

unitSchema.set("toObject", {
  virtuals: true,
});

/* ==========================================================
   Export
========================================================== */

module.exports = mongoose.model("Unit", unitSchema);