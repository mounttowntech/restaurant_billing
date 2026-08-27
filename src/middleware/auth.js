const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Store = require("../models/storeModel");
const Restaurant = require("../models/Restaurant");

// ======================================================
// Verify Token
// ======================================================

exports.verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authorization required.",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userId = decoded.id || decoded._id || decoded.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID not found in token.",
      });
    }

    const user = await User.findById(userId).populate("store");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists.",
      });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "User account is not active.",
      });
    }

    req.user = user;
    req.userId = user._id;

    next();
  } catch (error) {
    console.error("VERIFY TOKEN ERROR:", error);

    return res.status(401).json({
      success: false,
      message: error.message || "Invalid or expired token.",
    });
  }
};

// ======================================================
// Role Authorization
// ======================================================

exports.allowRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const userRole = String(req.user.role).trim().toLowerCase();

    const allowed = allowedRoles.map((role) =>
      String(role).trim().toLowerCase(),
    );

    if (!allowed.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized.",
        role: req.user.role,
      });
    }

    next();
  };
};
