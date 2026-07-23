const Coupon = require("../models/Coupon");

/* ===========================================
   Create Coupon
=========================================== */
exports.createCoupon = async (req, res) => {
  try {
    const couponCode = req.body.couponCode.toUpperCase();

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

    const coupon = await Coupon.create({
      ...req.body,
      couponCode,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Coupon created successfully.",
      data: coupon,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* ===========================================
   Get All Coupons
=========================================== */
exports.getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find()
      .populate("restaurant", "restaurantName")
      .populate("store", "storeName")
      .sort({ priority: -1, createdAt: -1 });

    res.json({
      success: true,
      count: coupons.length,
      data: coupons,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* ===========================================
   Get Coupon By Id
=========================================== */
exports.getCouponById = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id)
      .populate("restaurant")
      .populate("store")
      .populate("applicableCategories")
      .populate("excludedCategories")
      .populate("applicableMenuItems")
      .populate("excludedMenuItems")
      .populate("applicableCustomers")
      .populate("excludedCustomers");

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found.",
      });
    }

    res.json({
      success: true,
      data: coupon,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* ===========================================
   Update Coupon
=========================================== */
exports.updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found.",
      });
    }

    if (req.body.couponCode) {
      const exists = await Coupon.findOne({
        couponCode: req.body.couponCode.toUpperCase(),
        _id: { $ne: req.params.id },
      });

      if (exists) {
        return res.status(400).json({
          success: false,
          message: "Coupon code already exists.",
        });
      }

      req.body.couponCode =
        req.body.couponCode.toUpperCase();
    }

    req.body.updatedBy = req.user._id;

    const updated = await Coupon.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.json({
      success: true,
      message: "Coupon updated successfully.",
      data: updated,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* ===========================================
   Delete Coupon (Soft Delete)
=========================================== */
exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found.",
      });
    }

    await coupon.softDelete(req.user._id);

    res.json({
      success: true,
      message: "Coupon deleted successfully.",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* ===========================================
   Change Status
=========================================== */
exports.changeStatus = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found.",
      });
    }

    coupon.status = !coupon.status;
    coupon.updatedBy = req.user._id;

    await coupon.save();

    res.json({
      success: true,
      message: "Coupon status updated.",
      data: coupon,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* ===========================================
   Active Coupons
=========================================== */
exports.getActiveCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.getActiveCoupons();

    res.json({
      success: true,
      count: coupons.length,
      data: coupons,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* ===========================================
   Auto Apply Coupons
=========================================== */
exports.getAutoApplyCoupons = async (req, res) => {
  try {
    const coupons =
      await Coupon.getAutoApplyCoupons();

    res.json({
      success: true,
      count: coupons.length,
      data: coupons,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* ===========================================
   Expired Coupons
=========================================== */
exports.getExpiredCoupons = async (req, res) => {
  try {
    const coupons =
      await Coupon.getExpiredCoupons();

    res.json({
      success: true,
      count: coupons.length,
      data: coupons,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* ===========================================
   Validate Coupon
=========================================== */
exports.validateCoupon = async (req, res) => {
  try {
    const { couponCode, orderAmount } = req.body;

    const coupon = await Coupon.findOne({
      couponCode: couponCode.toUpperCase(),
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found.",
      });
    }

    const result =
      coupon.isValidCoupon(orderAmount);

    res.json(result);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* ===========================================
   Increase Usage Count
=========================================== */
exports.incrementUsage = async (req, res) => {
  try {
    const coupon = await Coupon.findById(
      req.params.id
    );

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Coupon not found.",
      });
    }

    await coupon.incrementUsage();

    res.json({
      success: true,
      message: "Coupon usage updated.",
      data: coupon,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};