const mongoose = require("mongoose");

/* ==========================================================
   Break Schema
========================================================== */

const breakSchema = new mongoose.Schema(
  {
    breakName: {
      type: String,
      required: true,
      trim: true,
    },

    startTime: {
      type: String,
      required: true, // HH:mm
    },

    endTime: {
      type: String,
      required: true, // HH:mm
    },

    duration: {
      type: Number,
      default: 0, // Minutes
    },

    paidBreak: {
      type: Boolean,
      default: true,
    },
  },
  {
    _id: false,
  }
);

/* ==========================================================
   Weekly Schedule Schema
========================================================== */

const weeklyScheduleSchema = new mongoose.Schema(
  {
    day: {
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
      required: true,
    },

    working: {
      type: Boolean,
      default: true,
    },
  },
  {
    _id: false,
  }
);

/* ==========================================================
   Shift Header Schema
========================================================== */

const shiftSchema = new mongoose.Schema(
  {
    /* ======================================================
       Shift Information
    ====================================================== */

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
      required: true,
    },

    /* ======================================================
       Shift Type
    ====================================================== */

    shiftType: {
      type: String,
      enum: [
        "Morning",
        "Afternoon",
        "Evening",
        "Night",
        "General",
        "Split",
        "Custom",
      ],
      default: "General",
    },

    /* ======================================================
       Shift Timing
    ====================================================== */

    startTime: {
      type: String,
      required: true, // HH:mm
    },

    endTime: {
      type: String,
      required: true, // HH:mm
    },

    totalWorkingHours: {
      type: Number,
      default: 0,
    },

    graceInMinutes: {
      type: Number,
      default: 15,
    },

    graceOutMinutes: {
      type: Number,
      default: 15,
    },

    /* ======================================================
       Break Details
    ====================================================== */

    breaks: [breakSchema],

    /* ======================================================
       Weekly Schedule
    ====================================================== */

    weeklySchedule: [weeklyScheduleSchema],

    weeklyOffDays: [
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
       Applicable Roles
    ====================================================== */

    applicableRoles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "RolePermission",
      },
    ],

    /* ======================================================
       Attendance Rules
    ====================================================== */

    allowLatePunch: {
      type: Boolean,
      default: true,
    },

    allowEarlyExit: {
      type: Boolean,
      default: true,
    },

    overtimeAllowed: {
      type: Boolean,
      default: true,
    },

    overtimeAfterMinutes: {
      type: Number,
      default: 30,
    },

    minimumWorkingHours: {
      type: Number,
      default: 8,
    },

    /* ======================================================
       Night Shift
    ====================================================== */

    isNightShift: {
      type: Boolean,
      default: false,
    },

    nextDayCheckout: {
      type: Boolean,
      default: false,
    },

    /* ======================================================
       Shift Status
    ====================================================== */

    status: {
      type: Boolean,
      default: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    /* ======================================================
       Audit Fields
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
   Helper Functions
========================================================== */

// Convert HH:mm to Minutes
function timeToMinutes(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

// Convert Minutes to Hours
function minutesToHours(minutes) {
  return Number((minutes / 60).toFixed(2));
}

/* ==========================================================
   Validation
========================================================== */

shiftSchema.pre("validate", function (next) {

  // Shift Name
  if (this.shiftName) {
    this.shiftName = this.shiftName.trim();
  }

  // Shift Code
  if (this.shiftCode) {
    this.shiftCode = this.shiftCode.trim().toUpperCase();
  }

  // Validate Start Time
  if (!this.startTime || !/^\d{2}:\d{2}$/.test(this.startTime)) {
    return next(new Error("Invalid start time. Use HH:mm format."));
  }

  // Validate End Time
  if (!this.endTime || !/^\d{2}:\d{2}$/.test(this.endTime)) {
    return next(new Error("Invalid end time. Use HH:mm format."));
  }

  // Validate Breaks
  if (this.breaks && this.breaks.length) {

    for (const item of this.breaks) {

      if (!item.startTime || !item.endTime) {
        return next(new Error("Break start/end time is required."));
      }

      if (
        !/^\d{2}:\d{2}$/.test(item.startTime) ||
        !/^\d{2}:\d{2}$/.test(item.endTime)
      ) {
        return next(
          new Error("Break time must be in HH:mm format.")
        );
      }

    }

  }

  next();

});

/* ==========================================================
   Pre-save Calculations
========================================================== */

shiftSchema.pre("save", function (next) {

  let start = timeToMinutes(this.startTime);
  let end = timeToMinutes(this.endTime);

  /* ==========================================
     Night Shift Detection
  ========================================== */

  this.isNightShift = end <= start;

  if (this.isNightShift) {

    end += 24 * 60;

    this.nextDayCheckout = true;

  } else {

    this.nextDayCheckout = false;

  }

  /* ==========================================
     Break Duration Calculation
  ========================================== */

  let totalBreakMinutes = 0;

  if (this.breaks && this.breaks.length) {

    this.breaks.forEach((item) => {

      let breakStart = timeToMinutes(item.startTime);
      let breakEnd = timeToMinutes(item.endTime);

      if (breakEnd <= breakStart) {
        breakEnd += 24 * 60;
      }

      item.duration = breakEnd - breakStart;

      totalBreakMinutes += item.duration;

    });

  }

  /* ==========================================
     Working Hours Calculation
  ========================================== */

  const totalShiftMinutes =
    end - start - totalBreakMinutes;

  this.totalWorkingHours =
    minutesToHours(totalShiftMinutes);

  /* ==========================================
     Minimum Working Hours Validation
  ========================================== */

  if (this.minimumWorkingHours > this.totalWorkingHours) {

    return next(
      new Error(
        "Minimum working hours cannot exceed total shift hours."
      )
    );

  }

  /* ==========================================
     Overtime Validation
  ========================================== */

  if (
    this.overtimeAllowed &&
    this.overtimeAfterMinutes < 0
  ) {

    return next(
      new Error(
        "Overtime minutes cannot be negative."
      )
    );

  }

  /* ==========================================
     Grace Time Validation
  ========================================== */

  if (
    this.graceInMinutes < 0 ||
    this.graceOutMinutes < 0
  ) {

    return next(
      new Error(
        "Grace minutes cannot be negative."
      )
    );

  }

  next();

});
/* ==========================================================
   Virtuals
========================================================== */

// Shift Active
shiftSchema.virtual("isActive").get(function () {
  return this.status && !this.isDeleted;
});

// Shift Duration
shiftSchema.virtual("shiftDuration").get(function () {
  return `${this.totalWorkingHours} Hours`;
});

// Total Break Time
shiftSchema.virtual("totalBreakMinutes").get(function () {
  if (!this.breaks || this.breaks.length === 0) return 0;

  return this.breaks.reduce(
    (total, item) => total + (item.duration || 0),
    0
  );
});

// Weekly Working Days
shiftSchema.virtual("workingDays").get(function () {
  return this.weeklySchedule.filter(day => day.working).length;
});

/* ==========================================================
   Database Indexes
========================================================== */

shiftSchema.index(
  { shiftCode: 1 },
  { unique: true }
);

shiftSchema.index({
  restaurant: 1,
  store: 1,
});

shiftSchema.index({
  restaurant: 1,
  shiftName: 1,
});

shiftSchema.index({
  restaurant: 1,
  status: 1,
});

shiftSchema.index({
  restaurant: 1,
  shiftType: 1,
});

shiftSchema.index({
  applicableRoles: 1,
});

shiftSchema.index({
  isNightShift: 1,
});

shiftSchema.index({
  isDeleted: 1,
});

shiftSchema.index({
  shiftName: "text",
  description: "text",
});

/* ==========================================================
   Query Middleware
========================================================== */

shiftSchema.pre(/^find/, function (next) {

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

// Activate Shift
shiftSchema.methods.activateShift =
async function () {

  this.status = true;

  return await this.save();

};

// Deactivate Shift
shiftSchema.methods.deactivateShift =
async function () {

  this.status = false;

  return await this.save();

};

// Soft Delete
shiftSchema.methods.softDelete =
async function (userId) {

  this.isDeleted = true;

  if (userId) {
    this.updatedBy = userId;
  }

  return await this.save();

};

// Restore
shiftSchema.methods.restore =
async function () {

  this.isDeleted = false;

  return await this.save();

};

// Calculate Shift Duration
shiftSchema.methods.calculateShiftDuration =
function () {

  return this.totalWorkingHours;

};

/* ==========================================================
   Static Methods
========================================================== */

// Active Shifts
shiftSchema.statics.getActiveShifts =
function (restaurantId) {

  return this.find({
    restaurant: restaurantId,
    status: true,
    isDeleted: false,
  });

};

// Night Shifts
shiftSchema.statics.getNightShifts =
function (restaurantId) {

  return this.find({
    restaurant: restaurantId,
    isNightShift: true,
    status: true,
    isDeleted: false,
  });

};

// Store Shifts
shiftSchema.statics.getStoreShifts =
function (storeId) {

  return this.find({
    store: storeId,
    status: true,
    isDeleted: false,
  });

};

// Role-wise Shifts
shiftSchema.statics.getRoleShifts =
function (roleId) {

  return this.find({
    applicableRoles: roleId,
    status: true,
    isDeleted: false,
  });

};

// Today's Shifts
shiftSchema.statics.getTodayShifts =
function (restaurantId) {

  const today = new Date().toLocaleString("en-US", {
    weekday: "long",
  });

  return this.find({
    restaurant: restaurantId,
    "weeklySchedule.day": today,
    "weeklySchedule.working": true,
    status: true,
    isDeleted: false,
  });

};

/* ==========================================================
   JSON Settings
========================================================== */

shiftSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
});

shiftSchema.set("toObject", {
  virtuals: true,
  versionKey: false,
});

/* ==========================================================
   Production Optimizations
========================================================== */

shiftSchema.index({
  restaurant: 1,
  store: 1,
  status: 1,
});

shiftSchema.index({
  restaurant: 1,
  shiftType: 1,
  status: 1,
});

shiftSchema.index({
  restaurant: 1,
  isNightShift: 1,
});

shiftSchema.index({
  restaurant: 1,
  applicableRoles: 1,
});

shiftSchema.index({
  restaurant: 1,
  createdAt: -1,
});

/* ==========================================================
   Export
========================================================== */

module.exports = mongoose.model(
  "Shift",
  shiftSchema
);