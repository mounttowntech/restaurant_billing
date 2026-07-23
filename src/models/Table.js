const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema(
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

    tableCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    tableName: {
      type: String,
      required: true,
      trim: true,
    },

    tableNumber: {
      type: Number,
      required: true,
    },

    floor: {
      type: String,
      trim: true,
      default: "Ground Floor",
    },

    section: {
      type: String,
      trim: true,
      default: "",
    },

    capacity: {
      type: Number,
      required: true,
      min: 1,
      default: 4,
    },

    shape: {
      type: String,
      enum: ["Square", "Rectangle", "Round"],
      default: "Square",
    },

    qrCode: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["Available", "Occupied", "Reserved", "Cleaning", "Out Of Service"],
      default: "Available",
    },

    currentOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },

    currentWaiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    reservation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reservation",
      default: null,
    },

    isMergeTable: {
      type: Boolean,
      default: false,
    },

    mergedTables: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Table",
      },
    ],

    notes: {
      type: String,
      trim: true,
      default: "",
    },

    statusColor: {
      type: String,
      default: "#4CAF50",
    },

    isActive: {
      type: Boolean,
      default: true,
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
  },
);

/* ======================================
   Virtual
====================================== */

tableSchema.virtual("displayName").get(function () {
  return `${this.tableName} (${this.capacity} Seats)`;
});

/* ======================================
   Indexes
====================================== */

tableSchema.index({ restaurant: 1 });

tableSchema.index({ store: 1 });

tableSchema.index({ tableCode: 1 });

tableSchema.index({ tableNumber: 1 });

tableSchema.index({ status: 1 });

tableSchema.index({ floor: 1 });

tableSchema.index({ isDeleted: 1 });

tableSchema.index({ isActive: 1 });

/* ======================================
   JSON
====================================== */

tableSchema.set("toJSON", {
  virtuals: true,
});

tableSchema.set("toObject", {
  virtuals: true,
});

/* ======================================
   Export
====================================== */

module.exports = mongoose.model("Table", tableSchema);
