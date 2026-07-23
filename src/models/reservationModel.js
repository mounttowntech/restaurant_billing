const mongoose = require("mongoose");

/* ==========================================================
   Reservation Schema
========================================================== */

const reservationSchema = new mongoose.Schema(
  {
    reservationNo: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
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

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      required: true,
    },

    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
      required: true,
    },

    waiter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Waiter",
    },

    reservationType: {
      type: String,
      enum: [
        "Walk In",
        "Phone",
        "Website",
        "App",
        "Third Party",
      ],
      default: "Walk In",
    },

    reservationDate: {
      type: Date,
      required: true,
    },

    reservationTime: {
      type: String,
      required: true,
    },

    expectedDuration: {
      type: Number,
      default: 60,
    },

    guests: {
      type: Number,
      required: true,
      min: 1,
    },

    occasion: {
      type: String,
      enum: [
        "Birthday",
        "Anniversary",
        "Business Meeting",
        "Family Dinner",
        "Party",
        "Other",
      ],
      default: "Other",
    },

    specialRequest: {
      type: String,
      trim: true,
    },

    advanceAmount: {
      type: Number,
      default: 0,
    },

    paymentMethod: {
      type: String,
      enum: [
        "Cash",
        "Card",
        "UPI",
        "Wallet",
        "Online",
      ],
      default: "Cash",
    },

    reservationStatus: {
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

    arrivalTime: Date,

    completedTime: Date,

    remarks: String,

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
   Virtuals
========================================================== */

reservationSchema.virtual("isUpcoming").get(function () {
  return (
    new Date(this.reservationDate).getTime() >
    Date.now()
  );
});

reservationSchema.virtual("isCompleted").get(function () {
  return this.reservationStatus === "Completed";
});

/* ==========================================================
   Indexes
========================================================== */

reservationSchema.index(
  { reservationNo: 1 },
  { unique: true }
);

reservationSchema.index({
  reservationDate: 1,
});

reservationSchema.index({
  reservationStatus: 1,
});

reservationSchema.index({
  customer: 1,
});

reservationSchema.index({
  table: 1,
});

reservationSchema.index({
  waiter: 1,
});

reservationSchema.index({
  restaurant: 1,
});

reservationSchema.index({
  store: 1,
});

reservationSchema.index({
  createdAt: -1,
});

reservationSchema.index({
  isDeleted: 1,
});

/* ==========================================================
   Middleware
========================================================== */

reservationSchema.pre("validate", function (next) {

  if (this.reservationNo) {
    this.reservationNo = this.reservationNo
      .trim()
      .toUpperCase();
  }

  next();
});

reservationSchema.pre(/^find/, function (next) {

  if (this.getFilter().isDeleted === undefined) {
    this.where({
      isDeleted: false,
    });
  }

  next();
});

/* ==========================================================
   Instance Methods
========================================================== */

reservationSchema.methods.softDelete = async function (userId) {
  this.isDeleted = true;
  this.updatedBy = userId;
  await this.save();
};

reservationSchema.methods.restore = async function () {
  this.isDeleted = false;
  await this.save();
};

/* ==========================================================
   JSON
========================================================== */

reservationSchema.set("toJSON", {
  virtuals: true,
});

reservationSchema.set("toObject", {
  virtuals: true,
});

/* ==========================================================
   Export
========================================================== */

module.exports = mongoose.model(
  "Reservation",
  reservationSchema
);