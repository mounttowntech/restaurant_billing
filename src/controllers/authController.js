const crypto = require("crypto");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");

/* ======================================================
   Register
====================================================== */

exports.register = async (req, res) => {
  try {
    const {
      restaurant,
      store,
      role,
      employeeCode,
      firstName,
      lastName,
      gender,
      dob,
      phone,
      alternatePhone,
      email,
      username,
      password,
      address,
      city,
      state,
      pincode,
      designation,
      salary,
      shift,
    } = req.body;

    const existingUser = await User.findOne({
      $or: [
        { phone },
        { username },
        ...(email ? [{ email }] : []),
      ],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Phone, Username or Email already exists.",
      });
    }

    const user = await User.create({
      restaurant,
      store,
      role,
      employeeCode,
      firstName,
      lastName,
      gender,
      dob,
      phone,
      alternatePhone,
      email,
      username,
      password,
      address,
      city,
      state,
      pincode,
      designation,
      salary,
      shift,
      createdBy: req.user?._id,
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: "User registered successfully.",
      token,
      user,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* ======================================================
   Login
====================================================== */

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required.",
      });
    }

    const user = await User.findOne({
      username: username.toLowerCase(),
      isDeleted: false,
    })
      .populate("role")
      .populate("restaurant")
      .populate("store");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password.",
      });
    }

    if (user.status !== "Active") {
      return res.status(403).json({
        success: false,
        message: "Account is inactive.",
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Account is blocked.",
      });
    }

    const match = await user.comparePassword(password);

    if (!match) {
      user.loginAttempts += 1;
      await user.save();

      return res.status(401).json({
        success: false,
        message: "Invalid username or password.",
      });
    }

    user.loginAttempts = 0;
    user.lastLogin = new Date();
    user.isOnline = true;

    await user.save();

    const token = generateToken(user);

    res.json({
      success: true,
      message: "Login successful.",
      token,
      user,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* ======================================================
   Change Password
====================================================== */

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required.",
      });
    }

    const user = await User.findById(req.user._id);

    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect.",
      });
    }

    user.password = newPassword;

    await user.save();

    res.json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* ======================================================
   Forgot Password
====================================================== */

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Email not found.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save();

    // TODO: Send Email

    res.json({
      success: true,
      message: "Password reset token generated.",
      resetToken,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* ======================================================
   Reset Password
====================================================== */

exports.resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: {
        $gt: Date.now(),
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Token is invalid or expired.",
      });
    }

    user.password = req.body.password;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({
      success: true,
      message: "Password reset successfully.",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};