const User = require("../models/User");

const Store = require("../models/storeModel");

const sendMail = require("../utils/sendEmail");

const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const registerEmail = require("../templates/registerEmail");
const loginEmail = require("../templates/loginEmail");
const changePasswordEmail = require("../templates/changePasswordEmail");


// =====================================================
// REGISTER USER
// =====================================================

exports.register = async (req, res) => {
  try {
    let {
      firstName,
      lastName,
      email,
      phone,
      password,
      role,
      store,
      address,
      city,
      state,
      pincode,
      salary,
    } = req.body;

    // =================================================
    // Normalize
    // =================================================

    firstName = firstName?.trim();
    lastName = lastName?.trim();
    email = email?.trim().toLowerCase();
    phone = phone?.trim();
    role = role?.trim();

    // =================================================
    // Required Fields
    // =================================================

    if (!firstName || !email || !phone || !password || !role) {
      return res.status(400).json({
        success: false,
        message:
          "First name, email, phone, password and role are required.",
      });
    }

    // =================================================
    // Allowed Roles
    // =================================================
    // Since RolePermission does not exist yet,
    // validate the role directly.

    const allowedRoles = [
      "Admin",
      "Manager",
      "Cashier",
      "Waiter",
      "Kitchen",
      "Accountant",
      "Staff",
    ];

    const validRole = allowedRoles.find(
      (item) => item.toLowerCase() === role.toLowerCase()
    );

    if (!validRole) {
      return res.status(400).json({
        success: false,
        message: "Invalid role.",
        allowedRoles,
      });
    }

    // =================================================
    // Check Store
    // =================================================

    let storeExists = null;

    if (store) {
      storeExists = await Store.findOne({
        _id: store,
        isDeleted: false,
        status: "Active",
      });

      if (!storeExists) {
        return res.status(404).json({
          success: false,
          message: "Invalid store.",
          store,
        });
      }
    }

    // =================================================
    // Duplicate Email
    // =================================================

    const emailExists = await User.findOne({
      email,
    });

    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: "Email already exists.",
      });
    }

    // =================================================
    // Duplicate Phone
    // =================================================

    const phoneExists = await User.findOne({
      phone,
    });

    if (phoneExists) {
      return res.status(400).json({
        success: false,
        message: "Phone number already exists.",
      });
    }

    // =================================================
    // Create User
    // =================================================

    const user = await User.create({
      firstName,
      lastName,
      email,
      phone,
      password,

      // Save role as STRING
      role: validRole,

      // Save Store ObjectId
      store: storeExists ? storeExists._id : null,

      address,
      city,
      state,
      pincode,
      salary: salary || 0,
    });

    // =================================================
    // Welcome Email
    // =================================================

    try {
      await sendMail({
        to: user.email,
        subject: "Welcome to WonderBill",
        html: registerEmail(user),
      });

      console.log("Welcome email sent.");
    } catch (mailError) {
      console.error(
        "Welcome email failed:",
        mailError.message
      );
    }

    // =================================================
    // Remove Password
    // =================================================

    const userData = user.toObject();

    delete userData.password;

    // =================================================
    // Response
    // =================================================

    return res.status(201).json({
      success: true,
      message: "User registered successfully.",
      data: userData,
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);

    if (error.code === 11000) {
      const field = Object.keys(
        error.keyPattern || {}
      )[0];

      return res.status(400).json({
        success: false,
        message: `${field || "Field"} already exists.`,
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// LOGIN
// ======================================================

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ==========================================
    // Validation
    // ==========================================

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    // ==========================================
    // Find User
    // ==========================================

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    })
      .select("+password")
      .populate("store");

    // ==========================================
    // User Not Found
    // ==========================================

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // ==========================================
    // Check Status
    // ==========================================

    if (user.status === "blocked") {
      return res.status(403).json({
        success: false,
        message: "Account blocked.",
      });
    }

    if (user.status === "inactive") {
      return res.status(403).json({
        success: false,
        message: "Account inactive.",
      });
    }

    // ==========================================
    // Password
    // ==========================================

    const match = await user.comparePassword(password);

    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // ==========================================
    // JWT
    // ==========================================

    const token = jwt.sign(
      {
        id: user._id,

        // IMPORTANT
        // Role is STRING
        role: user.role,

        // Store ID
        store: user.store?._id || user.store || null,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRE || "7d",
      }
    );

    // ==========================================
    // Last Login
    // ==========================================

    user.lastLogin = new Date();

    await user.save();

    // ==========================================
    // Login Email
    // ==========================================

    try {
      await sendMail({
        to: user.email,
        subject: "Successful Login",
        html: loginEmail(user),
      });
    } catch (mailError) {
      console.error("Login email failed");
      console.error(mailError.message);
    }

    // ==========================================
    // Remove Password
    // ==========================================

    const userData = user.toObject();

    delete userData.password;

    // ==========================================
    // Response
    // ==========================================

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: userData,
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// CHANGE PASSWORD
// ======================================================

exports.changePassword = async (req, res) => {
  try {
    const {
      oldPassword,
      newPassword,
    } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Old password and new password are required.",
      });
    }

    const user = await User.findById(
      req.user._id || req.user.id
    ).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const match = await user.comparePassword(
      oldPassword
    );

    if (!match) {
      return res.status(400).json({
        success: false,
        message: "Old password is incorrect.",
      });
    }

    user.password = newPassword;

    await user.save();

    await sendEmailSafely({
      to: user.email,
      subject: "Password Changed Successfully",
      html: changePasswordEmail(user),
    });

    return res.status(200).json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (error) {
    console.error("CHANGE PASSWORD ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// FORGOT PASSWORD
// ======================================================

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // ==========================================
    // Generate Token
    // ==========================================

    const resetToken = crypto
      .randomBytes(32)
      .toString("hex");

    user.resetPasswordToken = resetToken;

    user.resetPasswordExpire =
      Date.now() + 15 * 60 * 1000;

    await user.save();

    // ==========================================
    // Reset URL
    // ==========================================

    const resetURL =
      `http://localhost:5173/reset-password/${resetToken}`;

    try {
      await sendMail({
        to: user.email,
        subject: "Reset Your Password",
        html: `
          <h2>Password Reset Request</h2>

          <p>Hello ${user.firstName},</p>

          <p>
            Click the button below to reset your password.
          </p>

          <a
            href="${resetURL}"
            style="
              display:inline-block;
              padding:12px 25px;
              background:#2563eb;
              color:#fff;
              text-decoration:none;
              border-radius:6px;
            "
          >
            Reset Password
          </a>

          <p>
            This link will expire in
            <b>15 minutes</b>.
          </p>

          <p>
            If you did not request this,
            simply ignore this email.
          </p>
        `,
      });

      return res.status(200).json({
        success: true,
        message:
          "Reset password link sent successfully.",
      });
    } catch (mailError) {
      console.error(mailError);

      return res.status(500).json({
        success: false,
        message: "Failed to send email.",
      });
    }
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================================
// RESET PASSWORD
// ======================================================

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;

    const { password } = req.body;

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required.",
      });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: {
        $gt: Date.now(),
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message:
          "Reset link is invalid or has expired.",
      });
    }

    user.password = password;

    user.resetPasswordToken = undefined;

    user.resetPasswordExpire = undefined;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully.",
    });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};