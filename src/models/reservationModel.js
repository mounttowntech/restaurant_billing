
const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema(
  {
    reservationNo: {
      type: String,
      required: true,
      unique: true,
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

    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
      required: true,
    },

    customerName: {
      type: String,
      required: true,
      trim: true,
    },

    customerPhone: {
      type: String,
      trim: true,
    },

    customerEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },

    reservationDate: {
      type: Date,
      required: true,
    },

    reservationTime: {
      type: String,
      required: true,
      trim: true,
    },

    numberOfGuests: {
      type: Number,
      required: true,
      min: 1,
    },

    durationMinutes: {
      type: Number,
      default: 60,
      min: 15,
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Confirmed",
        "Seated",
        "Completed",
        "Cancelled",
        "No Show",
      ],
      default: "Pending",
    },

    notes: {
      type: String,
      trim: true,
    },

    cancelledReason: {
      type: String,
      trim: true,
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
  }
);

module.exports = mongoose.model(
  "Reservation",
  reservationSchema
);

