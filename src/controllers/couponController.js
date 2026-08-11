
const Coupon = require("../models/Coupon");


// ======================================================
// Create Coupon
// ======================================================

exports.createCoupon = async (req, res) => {
  try {

    // ==================================================
    // Check Authentication
    // ==================================================

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    if (!req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user ID not found.",
      });
    }

    // ==================================================
    // Validate Coupon Code
    // ==================================================

    if (!req.body.couponCode) {
      return res.status(400).json({
        success: false,
        message: "Coupon code is required.",
      });
    }

    const couponCode = String(
      req.body.couponCode
    )
      .trim()
      .toUpperCase();

    // ==================================================
    // Check Duplicate Coupon
    // ==================================================

    const exists = await Coupon.findOne({
      couponCode,
      isDeleted: false,
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Coupon code already exists.",
      });
    }

    // ==================================================
    // Create Coupon
    // ==================================================

    const coupon = await Coupon.create({
      ...req.body,

      couponCode,

      // Authenticated User
      createdBy: req.user._id,
    });

    // ==================================================
    // Response
    // ==================================================

    return res.status(201).json({
      success: true,
      message: "Coupon created successfully.",
      data: coupon,
    });

  } catch (err) {

    console.error(
      "CREATE COUPON ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


// ======================================================
// Get All Coupons
// ======================================================

exports.getAllCoupons = async (req, res) => {
  try {

    const coupons = await Coupon.find()
      .populate(
        "restaurant",
        "restaurantName"
      )
      .populate(
        "store",
        "storeName"
      )
      .populate(
        "createdBy",
        "name email"
      )
      .populate(
        "updatedBy",
        "name email"
      )
      .sort({
        priority: -1,
        createdAt: -1,
      });

    return res.json({
      success: true,
      count: coupons.length,
      data: coupons,
    });

  } catch (err) {

    console.error(
      "GET ALL COUPONS ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


// ======================================================
// Get Coupon By ID
// ======================================================

exports.getCouponById = async (req, res) => {
  try {

    const coupon = await Coupon.findById(
      req.params.id
    )
      .populate("restaurant")
      .populate("store")
      .populate("applicableCategories")
      .populate("excludedCategories")
      .populate("applicableMenuItems")
      .populate("excludedMenuItems")
      .populate("applicableCustomers")
      .populate("excludedCustomers")
      .populate("createdBy")
      .populate("updatedBy");

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found.",
      });
    }

    return res.json({
      success: true,
      data: coupon,
    });

  } catch (err) {

    console.error(
      "GET COUPON ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


// ======================================================
// Update Coupon
// ======================================================

exports.updateCoupon = async (req, res) => {
  try {

    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user not found.",
      });
    }

    const coupon = await Coupon.findById(
      req.params.id
    );

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found.",
      });
    }

    // ==================================================
    // Coupon Code
    // ==================================================

    if (req.body.couponCode) {

      const couponCode = String(
        req.body.couponCode
      )
        .trim()
        .toUpperCase();

      const exists = await Coupon.findOne({
        couponCode,
        _id: {
          $ne: req.params.id,
        },
        isDeleted: false,
      });

      if (exists) {
        return res.status(400).json({
          success: false,
          message: "Coupon code already exists.",
        });
      }

      req.body.couponCode = couponCode;
    }

    // ==================================================
    // Updated By
    // ==================================================

    req.body.updatedBy = req.user._id;

    // ==================================================
    // Update
    // ==================================================

    const updated = await Coupon.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    return res.json({
      success: true,
      message: "Coupon updated successfully.",
      data: updated,
    });

  } catch (err) {

    console.error(
      "UPDATE COUPON ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


// ======================================================
// Delete Coupon - Soft Delete
// ======================================================

exports.deleteCoupon = async (req, res) => {
  try {

    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user not found.",
      });
    }

    const coupon = await Coupon.findById(
      req.params.id
    );

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found.",
      });
    }

    await coupon.softDelete(
      req.user._id
    );

    return res.json({
      success: true,
      message: "Coupon deleted successfully.",
    });

  } catch (err) {

    console.error(
      "DELETE COUPON ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


// ======================================================
// Change Status
// ======================================================

exports.changeStatus = async (req, res) => {
  try {

    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user not found.",
      });
    }

    const coupon = await Coupon.findById(
      req.params.id
    );

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found.",
      });
    }

    coupon.status = !coupon.status;

    coupon.updatedBy = req.user._id;

    await coupon.save();

    return res.json({
      success: true,
      message: "Coupon status updated.",
      data: coupon,
    });

  } catch (err) {

    console.error(
      "CHANGE STATUS ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


// ======================================================
// Active Coupons
// ======================================================

exports.getActiveCoupons = async (req, res) => {
  try {

    const coupons =
      await Coupon.getActiveCoupons();

    return res.json({
      success: true,
      count: coupons.length,
      data: coupons,
    });

  } catch (err) {

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


// ======================================================
// Auto Apply Coupons
// ======================================================

exports.getAutoApplyCoupons = async (req, res) => {
  try {

    const coupons =
      await Coupon.getAutoApplyCoupons();

    return res.json({
      success: true,
      count: coupons.length,
      data: coupons,
    });

  } catch (err) {

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


// ======================================================
// Expired Coupons
// ======================================================

exports.getExpiredCoupons = async (req, res) => {
  try {

    const coupons =
      await Coupon.getExpiredCoupons();

    return res.json({
      success: true,
      count: coupons.length,
      data: coupons,
    });

  } catch (err) {

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


// ======================================================
// Validate Coupon
// ======================================================

exports.validateCoupon = async (req, res) => {
  try {

    const {
      couponCode,
      orderAmount = 0,
    } = req.body;

    if (!couponCode) {
      return res.status(400).json({
        success: false,
        message: "Coupon code is required.",
      });
    }

    const coupon = await Coupon.findOne({
      couponCode: String(
        couponCode
      )
        .trim()
        .toUpperCase(),
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found.",
      });
    }

    const result =
      coupon.isValidCoupon(
        Number(orderAmount)
      );

    return res.json(result);

  } catch (err) {

    console.error(
      "VALIDATE COUPON ERROR:",
      err
    );

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};


// ======================================================
// Increment Usage
// ======================================================

exports.incrementUsage = async (req, res) => {
  try {

    const coupon =
      await Coupon.findById(
        req.params.id
      );

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found.",
      });
    }

    await coupon.incrementUsage();

    return res.json({
      success: true,
      message: "Coupon usage updated.",
      data: coupon,
    });

  } catch (err) {

    console.error(
      "INCREMENT USAGE ERROR:",
      err
    );

    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};

