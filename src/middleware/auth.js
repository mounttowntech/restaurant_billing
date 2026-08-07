const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Store = require("../models/storeModel");
const Restaurant = require("../models/Restaurant");

exports.verifyToken = async (req, res, next) => {
  try {
    console.log("========================================");
    console.log("VERIFY TOKEN START");
    console.log("========================================");

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authorization header missing.",
      });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Invalid authorization format.",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token missing.",
      });
    }

    // ==========================================
    // Decode Token
    // ==========================================

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    console.log("DECODED TOKEN:", decoded);

    // ==========================================
    // Find User
    // ==========================================

    const user = await User.findById(decoded.id)
      .populate("store");

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

    // ==========================================
    // Attach User
    // ==========================================

    req.user = user;

    // ==========================================
    // Attach Company ID if available
    // ==========================================

    if (user.store) {
      const Store = require("../models/storeModel");
      const Restaurant = require("../models/Restaurant");

      const store = await Store.findById(user.store._id);

      if (store) {
        const restaurant = await Restaurant.findById(
          store.restaurant
        );

        if (restaurant) {
          req.restaurantId = restaurant._id;
          req.companyId = restaurant.companyId;
        }
      }
    }

    console.log("USER ID:", user._id);
    console.log("USER ROLE:", user.role);
    console.log("USER STORE:", user.store?._id);
    console.log("RESTAURANT ID:", req.restaurantId);
    console.log("COMPANY ID:", req.companyId);

    console.log("========================================");

    next();
  } catch (error) {
    console.error("VERIFY TOKEN ERROR:", error);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
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

    const userRole = String(req.user.role)
      .trim()
      .toLowerCase();

    const allowed = allowedRoles.map((role) =>
      String(role).trim().toLowerCase()
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