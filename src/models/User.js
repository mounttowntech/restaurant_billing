const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },

    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
    },

    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RolePermission",
      required: true,
    },

    employeeCode: {
      type: String,
      unique: true,
      uppercase: true,
      trim: true,
    },

    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      trim: true,
      default: "",
    },

    fullName: {
      type: String,
      trim: true,
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      default: "Male",
    },

    dob: {
      type: Date,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    alternatePhone: {
      type: String,
      trim: true,
      default: "",
    },

    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      default: "",
    },

    username: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      lowercase: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    profileImage: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      default: "",
    },

    city: {
      type: String,
      default: "",
    },

    state: {
      type: String,
      default: "",
    },

    pincode: {
      type: String,
      default: "",
    },

    joiningDate: {
      type: Date,
      default: Date.now,
    },

    designation: {
      type: String,
      default: "",
    },

    salary: {
      type: Number,
      default: 0,
    },

    shift: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shift",
    },

    isOnline: {
      type: Boolean,
      default: false,
    },

    lastLogin: {
      type: Date,
    },

    loginAttempts: {
      type: Number,
      default: 0,
    },

    isBlocked: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
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
   Full Name
===================================== */

userSchema.pre("save", function (next) {
  this.fullName = `${this.firstName} ${this.lastName || ""}`.trim();
  next();
});

/* =====================================
   Password Hash
===================================== */

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 10);

  next();
});

/* =====================================
   Compare Password
===================================== */

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

/* =====================================
   Indexes
===================================== */

userSchema.index({ restaurant: 1 });

userSchema.index({ store: 1 });

userSchema.index({ role: 1 });

userSchema.index({ employeeCode: 1 });

userSchema.index({ username: 1 });

userSchema.index({ email: 1 });

userSchema.index({ phone: 1 });

userSchema.index({ status: 1 });

/* =====================================
   Export
===================================== */

module.exports = mongoose.model("User", userSchema);