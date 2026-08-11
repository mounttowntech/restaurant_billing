const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
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

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },

    profileImage: {
      type: String,
      default: "",
    },

    // ROLE IS STRING
    role: {
      type: String,
      required: true,
      trim: true,
    },

    // STORE IS OBJECT ID
    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      default: null,
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

    salary: {
      type: Number,
      default: 0,
    },

    lastLogin: {
      type: Date,
    },

    refreshToken: {
      type: String,
      default: null,
    },

    resetPasswordOTP: {
      type: String,
      default: null,
    },

    resetPasswordOTPExpire: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: ["active", "inactive", "blocked"],
      default: "active",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// =====================================================
// PASSWORD HASH
// =====================================================

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }

  const salt = await bcrypt.genSalt(10);

  this.password = await bcrypt.hash(
    this.password,
    salt
  );
});

// =====================================================
// COMPARE PASSWORD
// =====================================================

userSchema.methods.comparePassword = async function (
  enteredPassword
) {
  return await bcrypt.compare(
    enteredPassword,
    this.password
  );
};

module.exports = mongoose.model("User", userSchema);