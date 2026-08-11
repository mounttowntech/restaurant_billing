
const mongoose = require("mongoose");

const shiftSchema = new mongoose.Schema(
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

    shiftCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    shiftName: {
      type: String,
      required: true,
      trim: true,
    },

    startTime: {
      type: String,
      required: true,
      trim: true,
    },

    endTime: {
      type: String,
      required: true,
      trim: true,
    },

    // If true, the shift continues after midnight.
    // Example: 10:00 PM -> 06:00 AM
    isOvernight: {
      type: Boolean,
      default: false,
    },

    breakStartTime: {
      type: String,
      default: "",
      trim: true,
    },

    breakEndTime: {
      type: String,
      default: "",
      trim: true,
    },

    breakDuration: {
      type: Number,
      default: 0,
      min: 0,
    },

    gracePeriod: {
      type: Number,
      default: 15,
      min: 0,
    },

    workingHours: {
      type: Number,
      default: 0,
      min: 0,
    },

    applicableDays: {
      type: [String],
      enum: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
      default: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    color: {
      type: String,
      default: "",
      trim: true,
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
  }
);

// ============================================================
// INDEXES
// ============================================================

shiftSchema.index({ restaurant: 1 });
shiftSchema.index({ store: 1 });
shiftSchema.index({ shiftCode: 1 });
shiftSchema.index({ shiftName: 1 });
shiftSchema.index({ isActive: 1 });
shiftSchema.index({ isDeleted: 1 });

shiftSchema.index({
  restaurant: 1,
  store: 1,
  shiftCode: 1,
});

// ============================================================
// JSON
// ============================================================

shiftSchema.set("toJSON", {
  virtuals: true,
});

shiftSchema.set("toObject", {
  virtuals: true,
});

// ============================================================
// EXPORT
// ============================================================

module.exports = mongoose.model("Shift", shiftSchema);

