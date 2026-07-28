// controllers/discountController.js

const Discount = require("../models/discountModel");

/* ==========================================================
   Create Discount
========================================================== */

exports.createDiscount = async (req, res) => {
  try {
    const {
      discountName,
      description,
      restaurant,
      store,
      discountType,
      discountValue,
      maximumDiscount,
      minimumOrderAmount,
      maximumOrderAmount,
      applyOn,
      startDate,
      endDate,
      applicableDays,
      timeSlots,
      applicableOrderTypes,
      applicableCategories,
      excludedCategories,
      applicableMenuItems,
      excludedMenuItems,
      customerType,
      birthdayOffer,
      firstOrderOnly,
      loyaltyPointsRequired,
      applicableCustomers,
      excludedCustomers,
      stackWithCoupon,
      stackWithDiscount,
      managerApprovalRequired,
      priority,
      status,
    } = req.body;

    // Duplicate Name Check
    const existingDiscount = await Discount.findOne({
      restaurant,
      discountName: discountName.trim(),
      isDeleted: false,
    });

    if (existingDiscount) {
      return res.status(400).json({
        success: false,
        message: "Discount already exists.",
      });
    }

    const discount = await Discount.create({
      discountName,
      description,
      restaurant,
      store,
      discountType,
      discountValue,
      maximumDiscount,
      minimumOrderAmount,
      maximumOrderAmount,
      applyOn,
      startDate,
      endDate,
      applicableDays,
      timeSlots,
      applicableOrderTypes,
      applicableCategories,
      excludedCategories,
      applicableMenuItems,
      excludedMenuItems,
      customerType,
      birthdayOffer,
      firstOrderOnly,
      loyaltyPointsRequired,
      applicableCustomers,
      excludedCustomers,
      stackWithCoupon,
      stackWithDiscount,
      managerApprovalRequired,
      priority,
      status,
      createdBy: req.user?._id,
      updatedBy: req.user?._id,
    });

    return res.status(201).json({
      success: true,
      message: "Discount created successfully.",
      data: discount,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
   Get All Discounts
========================================================== */

exports.getAllDiscounts = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const search = req.query.search || "";
    const status = req.query.status;
    const restaurant = req.query.restaurant;
    const store = req.query.store;

    let query = {
      isDeleted: false,
    };

    if (restaurant) query.restaurant = restaurant;

    if (store) query.store = store;

    if (status !== undefined) {
      query.status = status === "true";
    }

    if (search) {
      query.$or = [
        {
          discountName: {
            $regex: search,
            $options: "i",
          },
        },
        {
          description: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const total = await Discount.countDocuments(query);

    const discounts = await Discount.find(query)
      .populate("restaurant", "restaurantName")
      .populate("store", "storeName")
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email")
      .sort({
        priority: -1,
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      count: discounts.length,
      data: discounts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
   Get Discount By ID
========================================================== */

exports.getDiscountById = async (req, res) => {
  try {
    const discount = await Discount.findOne({
      _id: req.params.id,
      isDeleted: false,
    })
      .populate("restaurant")
      .populate("store")
      .populate("applicableCategories")
      .populate("excludedCategories")
      .populate("applicableMenuItems")
      .populate("excludedMenuItems")
      .populate("applicableCustomers")
      .populate("excludedCustomers")
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email");

    if (!discount) {
      return res.status(404).json({
        success: false,
        message: "Discount not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: discount,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
   Update Discount
========================================================== */

exports.updateDiscount = async (req, res) => {
  try {
    const discount = await Discount.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!discount) {
      return res.status(404).json({
        success: false,
        message: "Discount not found.",
      });
    }

    // Duplicate Name Check
    if (req.body.discountName) {
      const existing = await Discount.findOne({
        _id: { $ne: req.params.id },
        restaurant:
          req.body.restaurant || discount.restaurant,
        discountName: req.body.discountName.trim(),
        isDeleted: false,
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Discount name already exists.",
        });
      }
    }

    Object.keys(req.body).forEach((key) => {
      discount[key] = req.body[key];
    });

    discount.updatedBy = req.user?._id;

    await discount.save();

    return res.status(200).json({
      success: true,
      message: "Discount updated successfully.",
      data: discount,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
   Delete Discount (Soft Delete)
========================================================== */

exports.deleteDiscount = async (req, res) => {
  try {
    const discount = await Discount.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!discount) {
      return res.status(404).json({
        success: false,
        message: "Discount not found.",
      });
    }

    // Soft Delete using Instance Method
    await discount.softDelete(req.user?._id);

    return res.status(200).json({
      success: true,
      message: "Discount deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
   Restore Discount
========================================================== */

exports.restoreDiscount = async (req, res) => {
  try {
    const discount = await Discount.findOne({
      _id: req.params.id,
      isDeleted: true,
    });

    if (!discount) {
      return res.status(404).json({
        success: false,
        message: "Deleted discount not found.",
      });
    }

    await discount.restore();

    discount.updatedBy = req.user?._id;
    await discount.save();

    return res.status(200).json({
      success: true,
      message: "Discount restored successfully.",
      data: discount,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
   Activate Discount
========================================================== */

exports.activateDiscount = async (req, res) => {
  try {
    const discount = await Discount.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!discount) {
      return res.status(404).json({
        success: false,
        message: "Discount not found.",
      });
    }

    if (discount.status) {
      return res.status(400).json({
        success: false,
        message: "Discount is already active.",
      });
    }

    await discount.activateDiscount();

    discount.updatedBy = req.user?._id;
    await discount.save();

    return res.status(200).json({
      success: true,
      message: "Discount activated successfully.",
      data: discount,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
   Deactivate Discount
========================================================== */

exports.deactivateDiscount = async (req, res) => {
  try {
    const discount = await Discount.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!discount) {
      return res.status(404).json({
        success: false,
        message: "Discount not found.",
      });
    }

    if (!discount.status) {
      return res.status(400).json({
        success: false,
        message: "Discount is already inactive.",
      });
    }

    await discount.deactivateDiscount();

    discount.updatedBy = req.user?._id;
    await discount.save();

    return res.status(200).json({
      success: true,
      message: "Discount deactivated successfully.",
      data: discount,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
/* ==========================================================
   Get Active Discounts
========================================================== */

exports.getActiveDiscounts = async (req, res) => {
  try {
    const discounts = await Discount.getActiveDiscounts();

    return res.status(200).json({
      success: true,
      count: discounts.length,
      data: discounts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
   Get Applicable Discounts
========================================================== */

exports.getApplicableDiscounts = async (req, res) => {
  try {
    const { restaurantId, storeId } = req.query;

    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message: "Restaurant ID is required.",
      });
    }

    const discounts = await Discount.getApplicableDiscounts(
      restaurantId,
      storeId
    );

    return res.status(200).json({
      success: true,
      count: discounts.length,
      data: discounts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
   Get Today's Discounts
========================================================== */

exports.getTodayDiscounts = async (req, res) => {
  try {
    const discounts = await Discount.getTodayDiscounts();

    return res.status(200).json({
      success: true,
      count: discounts.length,
      data: discounts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
   Get Category Discounts
========================================================== */

exports.getCategoryDiscounts = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const discounts = await Discount.getCategoryDiscounts(
      categoryId
    );

    return res.status(200).json({
      success: true,
      count: discounts.length,
      data: discounts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
   Get Menu Item Discounts
========================================================== */

exports.getMenuDiscounts = async (req, res) => {
  try {
    const { menuItemId } = req.params;

    const discounts = await Discount.getMenuDiscounts(
      menuItemId
    );

    return res.status(200).json({
      success: true,
      count: discounts.length,
      data: discounts,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
   Calculate Discount
========================================================== */

exports.calculateDiscount = async (req, res) => {
  try {
    const { discountId, orderAmount } = req.body;

    if (!discountId || orderAmount === undefined) {
      return res.status(400).json({
        success: false,
        message: "Discount ID and Order Amount are required.",
      });
    }

    const discount = await Discount.findOne({
      _id: discountId,
      status: true,
      isDeleted: false,
    });

    if (!discount) {
      return res.status(404).json({
        success: false,
        message: "Active discount not found.",
      });
    }

    // Check Date Validity
    const now = new Date();

    if (now < discount.startDate || now > discount.endDate) {
      return res.status(400).json({
        success: false,
        message: "Discount is not currently valid.",
      });
    }

    // Check Applicable Day
    if (
      discount.applicableDays &&
      discount.applicableDays.length > 0
    ) {
      const today = now.toLocaleDateString("en-US", {
        weekday: "long",
      });

      if (!discount.applicableDays.includes(today)) {
        return res.status(400).json({
          success: false,
          message: "Discount is not applicable today.",
        });
      }
    }

    // Check Time Slot
    if (
      discount.timeSlots &&
      discount.timeSlots.length > 0
    ) {
      const currentTime = now.toTimeString().slice(0, 5); // HH:mm

      const validTime = discount.timeSlots.some((slot) => {
        return (
          currentTime >= slot.from &&
          currentTime <= slot.to
        );
      });

      if (!validTime) {
        return res.status(400).json({
          success: false,
          message:
            "Discount is not applicable at this time.",
        });
      }
    }

    const discountAmount =
      discount.calculateDiscount(orderAmount);

    return res.status(200).json({
      success: true,
      data: {
        discountId: discount._id,
        discountName: discount.discountName,
        discountType: discount.discountType,
        discountValue: discount.discountValue,
        orderAmount: Number(orderAmount),
        discountAmount,
        payableAmount: Number(
          (orderAmount - discountAmount).toFixed(2)
        ),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};