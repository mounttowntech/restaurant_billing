const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ======================================================
// Verify JWT Token
// ======================================================

exports.verifyToken = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. Token missing.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id)
      .select("-password -resetPasswordToken -resetPasswordExpire")
      .populate("role")
      .populate("restaurant")
      .populate("store");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.isDeleted) {
      return res.status(403).json({
        success: false,
        message: "User account has been deleted.",
      });
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: "Your account has been blocked.",
      });
    }

    if (user.status !== "Active") {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive.",
      });
    }

    req.user = user;

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

// ======================================================
// Role Authorization
// ======================================================

exports.allowRoles =
  (...roles) =>
  (req, res, next) => {
    const roleName = req.user?.role?.roleName;

    if (!roleName || !roles.includes(roleName)) {
      return res.status(403).json({
        success: false,
        message: "Access denied.",
      });
    }

    next();
  };
 