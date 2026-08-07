const mongoose = require("mongoose");
const Restaurant = require("../models/Restaurant");

// =====================================================
// CREATE RESTAURANT
// POST /api/restaurants/create
// =====================================================

exports.createRestaurant = async (req, res) => {
  try {
    const {
      companyId,
      restaurantCode,
      restaurantName,
      legalName,
      ownerName,
      email,
      phone,
      alternatePhone,
      gstNumber,
      fssaiNumber,
      panNumber,
      address,
      area,
      city,
      state,
      country,
      pincode,
      latitude,
      longitude,
      currency,
      currencySymbol,
      timezone,
      invoicePrefix,
      kotPrefix,
      orderPrefix,
      purchasePrefix,
      expensePrefix,
      serviceChargePercentage,
      gstEnabled,
      serviceChargeEnabled,
      loyaltyEnabled,
      onlineOrderEnabled,
      takeawayEnabled,
      dineInEnabled,
      deliveryEnabled,
      logo,
      bannerImage,
      status,
    } = req.body;

    // =================================================
    // VALIDATION
    // =================================================

    if (!companyId) {
      return res.status(400).json({
        success: false,
        message: "Company ID is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Company ID",
      });
    }

    if (!restaurantCode) {
      return res.status(400).json({
        success: false,
        message: "Restaurant code is required",
      });
    }

    if (!restaurantName) {
      return res.status(400).json({
        success: false,
        message: "Restaurant name is required",
      });
    }

    if (!ownerName) {
      return res.status(400).json({
        success: false,
        message: "Owner name is required",
      });
    }

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone is required",
      });
    }

    // =================================================
    // CHECK DUPLICATE RESTAURANT CODE
    // =================================================

    const existingRestaurant = await Restaurant.findOne({
      restaurantCode: restaurantCode.toUpperCase(),
      isDeleted: false,
    });

    if (existingRestaurant) {
      return res.status(400).json({
        success: false,
        message: "Restaurant code already exists",
      });
    }

    // =================================================
    // CREATE RESTAURANT
    // =================================================

    const restaurant = await Restaurant.create({
      companyId,

      restaurantCode: restaurantCode.toUpperCase(),

      restaurantName,

      legalName: legalName || "",

      ownerName,

      email: email || "",

      phone,

      alternatePhone: alternatePhone || "",

      gstNumber: gstNumber || "",

      fssaiNumber: fssaiNumber || "",

      panNumber: panNumber || "",

      address: address || "",

      area: area || "",

      city: city || "",

      state: state || "",

      country: country || "India",

      pincode: pincode || "",

      latitude:
        latitude !== undefined
          ? latitude
          : null,

      longitude:
        longitude !== undefined
          ? longitude
          : null,

      currency: currency || "INR",

      currencySymbol:
        currencySymbol || "₹",

      timezone:
        timezone || "Asia/Kolkata",

      invoicePrefix:
        invoicePrefix || "INV",

      kotPrefix:
        kotPrefix || "KOT",

      orderPrefix:
        orderPrefix || "ORD",

      purchasePrefix:
        purchasePrefix || "PUR",

      expensePrefix:
        expensePrefix || "EXP",

      serviceChargePercentage:
        serviceChargePercentage || 0,

      gstEnabled:
        gstEnabled !== undefined
          ? gstEnabled
          : true,

      serviceChargeEnabled:
        serviceChargeEnabled !== undefined
          ? serviceChargeEnabled
          : false,

      loyaltyEnabled:
        loyaltyEnabled !== undefined
          ? loyaltyEnabled
          : true,

      onlineOrderEnabled:
        onlineOrderEnabled !== undefined
          ? onlineOrderEnabled
          : false,

      takeawayEnabled:
        takeawayEnabled !== undefined
          ? takeawayEnabled
          : true,

      dineInEnabled:
        dineInEnabled !== undefined
          ? dineInEnabled
          : true,

      deliveryEnabled:
        deliveryEnabled !== undefined
          ? deliveryEnabled
          : true,

      logo: logo || "",

      bannerImage:
        bannerImage || "",

      status: status || "Active",
    });

    return res.status(201).json({
      success: true,
      message: "Restaurant created successfully",
      data: restaurant,
    });
  } catch (error) {
    console.error(
      "CREATE RESTAURANT ERROR:",
      error
    );

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message:
          "Restaurant code already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// GET ALL RESTAURANTS
// GET /api/restaurants
// =====================================================

exports.getAllRestaurants = async (
  req,
  res
) => {
  try {
    const filter = {
      isDeleted: false,
    };

    // Search
    if (req.query.search) {
      filter.$or = [
        {
          restaurantName: {
            $regex: req.query.search,
            $options: "i",
          },
        },
        {
          restaurantCode: {
            $regex: req.query.search,
            $options: "i",
          },
        },
      ];
    }

    // Status
    if (req.query.status) {
      filter.status = req.query.status;
    }

    // Company filter
    if (req.query.companyId) {
      if (
        !mongoose.Types.ObjectId.isValid(
          req.query.companyId
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid company ID",
        });
      }

      filter.companyId =
        req.query.companyId;
    }

    const restaurants =
      await Restaurant.find(filter)
        .populate(
          "companyId",
          "companyName companyCode"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      count: restaurants.length,
      data: restaurants,
    });
  } catch (error) {
    console.error(
      "GET RESTAURANTS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// GET RESTAURANT BY ID
// GET /api/restaurants/:id
// =====================================================

exports.getRestaurantById = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid restaurant ID",
      });
    }

    const restaurant =
      await Restaurant.findOne({
        _id: id,
        isDeleted: false,
      }).populate(
        "companyId",
        "companyName companyCode"
      );

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: restaurant,
    });
  } catch (error) {
    console.error(
      "GET RESTAURANT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// UPDATE RESTAURANT
// PUT /api/restaurants/:id
// =====================================================

exports.updateRestaurant = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid restaurant ID",
      });
    }

    const restaurant =
      await Restaurant.findOne({
        _id: id,
        isDeleted: false,
      });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    // Company cannot be changed here
    if (req.body.companyId) {
      return res.status(400).json({
        success: false,
        message:
          "Company ID cannot be changed",
      });
    }

    const allowedFields = [
      "restaurantName",
      "legalName",
      "ownerName",
      "email",
      "phone",
      "alternatePhone",
      "gstNumber",
      "fssaiNumber",
      "panNumber",
      "address",
      "area",
      "city",
      "state",
      "country",
      "pincode",
      "latitude",
      "longitude",
      "currency",
      "currencySymbol",
      "timezone",
      "invoicePrefix",
      "kotPrefix",
      "orderPrefix",
      "purchasePrefix",
      "expensePrefix",
      "serviceChargePercentage",
      "gstEnabled",
      "serviceChargeEnabled",
      "loyaltyEnabled",
      "onlineOrderEnabled",
      "takeawayEnabled",
      "dineInEnabled",
      "deliveryEnabled",
      "logo",
      "bannerImage",
      "status",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        restaurant[field] =
          req.body[field];
      }
    });

    await restaurant.save();

    return res.status(200).json({
      success: true,
      message:
        "Restaurant updated successfully",
      data: restaurant,
    });
  } catch (error) {
    console.error(
      "UPDATE RESTAURANT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// DELETE RESTAURANT
// DELETE /api/restaurants/:id
// =====================================================

exports.deleteRestaurant = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid restaurant ID",
      });
    }

    const restaurant =
      await Restaurant.findOne({
        _id: id,
        isDeleted: false,
      });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    restaurant.isDeleted = true;

    await restaurant.save();

    return res.status(200).json({
      success: true,
      message:
        "Restaurant deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE RESTAURANT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// RESTORE RESTAURANT
// PATCH /api/restaurants/:id/restore
// =====================================================

exports.restoreRestaurant = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid restaurant ID",
      });
    }

    const restaurant =
      await Restaurant.findById(id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    restaurant.isDeleted = false;

    await restaurant.save();

    return res.status(200).json({
      success: true,
      message:
        "Restaurant restored successfully",
      data: restaurant,
    });
  } catch (error) {
    console.error(
      "RESTORE RESTAURANT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// TOGGLE RESTAURANT STATUS
// PATCH /api/restaurants/:id/toggle-status
// =====================================================

exports.toggleRestaurantStatus =
  async (req, res) => {
    try {
      const { id } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(id)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid restaurant ID",
        });
      }

      const restaurant =
        await Restaurant.findById(id);

      if (!restaurant) {
        return res.status(404).json({
          success: false,
          message:
            "Restaurant not found",
        });
      }

      restaurant.status =
        restaurant.status === "Active"
          ? "Inactive"
          : "Active";

      await restaurant.save();

      return res.status(200).json({
        success: true,
        message:
          "Restaurant status updated successfully",
        data: restaurant,
      });
    } catch (error) {
      console.error(
        "TOGGLE RESTAURANT STATUS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };