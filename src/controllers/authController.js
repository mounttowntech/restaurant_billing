const User = require("../models/User");
const sendMail = require("../utils/sendEmail");
const RolePermission = require("../models/rolePermissionModel");
const Store = require("../models/storeModel");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const registerEmail = require("../templates/registerEmail");
const loginEmail = require("../templates/loginEmail");
const forgotPasswordEmail = require("../templates/forgotPasswordEmail");
const resetPasswordEmail = require("../templates/resetPasswordEmail");
const changePasswordEmail = require("../templates/changePasswordEmail");
const sendEmailSafely = async ({ to, subject, html }) => {
  try {
    await sendMail({
      to,
      subject,
      html,
    });

    console.log(`✅ Email sent to ${to}`);
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}`);
    console.error(error.message);
  }
};
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

    // Trim Inputs
    firstName = firstName?.trim();
    lastName = lastName?.trim();
    email = email?.trim().toLowerCase();
    phone = phone?.trim();

    // Validation
    if (!firstName || !email || !phone || !password || !role) {
      return res.status(400).json({
        success: false,
        message: "First name, email, phone, password and role are required.",
      });
    }

    // Check Role
    const roleExists = await RolePermission.findById(role);

    if (!roleExists) {
      return res.status(404).json({
        success: false,
        message: "Invalid role.",
      });
    }

    // Check Store
    if (store) {
      const storeExists = await Store.findById(store);

      if (!storeExists) {
        return res.status(404).json({
          success: false,
          message: "Invalid store.",
        });
      }
    }

    // Duplicate Email
    const emailExists = await User.findOne({ email });

    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: "Email already exists.",
      });
    }

    // Duplicate Phone
    const phoneExists = await User.findOne({ phone });

    if (phoneExists) {
      return res.status(400).json({
        success: false,
        message: "Phone number already exists.",
      });
    }

    // Create User
    const user = await User.create({
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
    });

    // Send Welcome Email
    try {
      await sendMail({
        to: user.email,
        subject: "Welcome to WonderBill",
        html: registerEmail(user),
      });

      console.log("✅ Welcome email sent.");
    } catch (mailError) {
      console.error("❌ Welcome email failed.");
      console.error(mailError);
    }

    // Remove Password
    const userData = user.toObject();
    delete userData.password;

    return res.status(201).json({
      success: true,
      message: "User registered successfully.",
      data: userData,
    });
  } catch (err) {
    console.error(err);

    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];

      return res.status(400).json({
        success: false,
        message: `${field} already exists.`,
      });
    }

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email })
      .select("+password")
      .populate("role")
      .populate("store");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Invalid email",
      });
    }

    if (user.status === "blocked") {
      return res.status(403).json({
        success: false,
        message: "Account blocked",
      });
    }

    const match = await user.comparePassword(password);

    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    // JWT Token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRE || "7d",
      }
    );

    // Update Last Login
    user.lastLogin = new Date();

    await user.save();

    // Send Login Email
    try {
      await sendMail({
        to: user.email,
        subject: "Successful Login",
        html: loginEmail(user),
      });

      console.log("✅ Login email sent.");
    } catch (mailError) {
      console.error("❌ Login email failed.");
      console.error(mailError);
    }

    // Remove Password Before Response
    const userData = user.toObject();
    delete userData.password;

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: userData,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};



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

    // Generate Reset Token
    const resetToken = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 Minutes

    await user.save();

    // Frontend Reset Password URL
    const resetURL = `http://localhost:5173/reset-password/${resetToken}`;

    try {
      await sendMail({
        to: user.email,
        subject: "Reset Your Password",
        html: `
          <h2>Password Reset Request</h2>

          <p>Hello ${user.name},</p>

          <p>Click the button below to reset your password.</p>

          <a href="${resetURL}"
             style="
               display:inline-block;
               padding:12px 25px;
               background:#2563eb;
               color:#fff;
               text-decoration:none;
               border-radius:6px;
             ">
             Reset Password
          </a>

          <p>This link will expire in <b>15 minutes</b>.</p>

          <p>If you didn't request this, simply ignore this email.</p>
        `,
      });

      return res.status(200).json({
        success: true,
        message: "Reset password link sent successfully.",
      });
    } catch (mailError) {
      console.error(mailError);

      return res.status(500).json({
        success: false,
        message: "Failed to send email.",
      });
    }
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Reset link is invalid or has expired.",
      });
    }

    user.password = await bcrypt.hash(password, 10);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
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
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Old password and new password are required.",
      });
    }

    const user = await User.findById(req.user.id).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const match = await user.comparePassword(oldPassword);

    if (!match) {
      return res.status(400).json({
        success: false,
        message: "Old password is incorrect.",
      });
    }

    user.password = newPassword;

    await user.save();

    // Send Email
    await sendEmailSafely({
      to: user.email,
      subject: "Password Changed Successfully",
      html: changePasswordEmail(user),
    });

    return res.status(200).json({
      success: true,
      message: "Password updated successfully.",
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
