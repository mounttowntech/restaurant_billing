const mongoose = require("mongoose");

const waiterSchema = new mongoose.Schema(
  {
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

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    waiterCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    waiterName: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: "",
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      default: "Male",
    },

    shift: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shift",
    },

    assignedTables: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Table",
      },
    ],

    currentOrders: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
      },
    ],

    totalOrders: {
      type: Number,
      default: 0,
    },

    completedOrders: {
      type: Number,
      default: 0,
    },

    cancelledOrders: {
      type: Number,
      default: 0,
    },

    averageServingTime: {
      type: Number,
      default: 0,
    },

    rating: {
      type: Number,
      default: 5,
      min: 0,
      max: 5,
    },

    commissionPercentage: {
      type: Number,
      default: 0,
    },

    salary: {
      type: Number,
      default: 0,
    },

    joiningDate: {
      type: Date,
      default: Date.now,
    },

    profileImage: {
      type: String,
      default: "",
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    status: {
      type: String,
      enum: [
        "Active",
        "Inactive",
        "On Leave",
      ],
      default: "Active",
    },

    notes: {
      type: String,
      default: "",
      trim: true,
    },

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

/* =====================================
   Virtuals
===================================== */

waiterSchema.virtual("pendingOrders").get(function () {
  return this.totalOrders - this.completedOrders;
});

/* =====================================
   Indexes
===================================== */

waiterSchema.index({ restaurant: 1 });
waiterSchema.index({ store: 1 });
waiterSchema.index({ waiterCode: 1 });
waiterSchema.index({ waiterName: 1 });
waiterSchema.index({ phone: 1 });
waiterSchema.index({ status: 1 });
waiterSchema.index({ isAvailable: 1 });
waiterSchema.index({ isDeleted: 1 });

/* =====================================
   JSON
===================================== */

waiterSchema.set("toJSON", {
  virtuals: true,
});

waiterSchema.set("toObject", {
  virtuals: true,
});

/* =====================================
   Export
===================================== */

module.exports = mongoose.model("Waiter", waiterSchema);