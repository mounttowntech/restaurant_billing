
const mongoose = require("mongoose");

const Shift = require("../models/shiftModel");
const Restaurant = require("../models/Restaurant");
const Store = require("../models/storeModel");
const Waiter = require("../models/waiterModel");

// ============================================================
// HELPER
// ============================================================

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// ============================================================
// CREATE SHIFT
// ============================================================

exports.createShift = async (req, res) => {
  try {
    const {
      restaurant,
      store,
      shiftCode,
      shiftName,
      startTime,
      endTime,
      isOvernight,
      breakStartTime,
      breakEndTime,
      breakDuration,
      gracePeriod,
      workingHours,
      applicableDays,
      description,
      color,
      isActive,
    } = req.body;

    // --------------------------------------------------------
    // REQUIRED VALIDATION
    // --------------------------------------------------------

    if (!restaurant) {
      return res.status(400).json({
        success: false,
        message: "Restaurant is required",
      });
    }

    if (!store) {
      return res.status(400).json({
        success: false,
        message: "Store is required",
      });
    }

    if (!shiftCode) {
      return res.status(400).json({
        success: false,
        message: "Shift code is required",
      });
    }

    if (!shiftName) {
      return res.status(400).json({
        success: false,
        message: "Shift name is required",
      });
    }

    if (!startTime) {
      return res.status(400).json({
        success: false,
        message: "Start time is required",
      });
    }

    if (!endTime) {
      return res.status(400).json({
        success: false,
        message: "End time is required",
      });
    }

    // --------------------------------------------------------
    // OBJECT ID VALIDATION
    // --------------------------------------------------------

    if (!isValidObjectId(restaurant)) {
      return res.status(400).json({
        success: false,
        message: "Invalid restaurant ID",
      });
    }

    if (!isValidObjectId(store)) {
      return res.status(400).json({
        success: false,
        message: "Invalid store ID",
      });
    }

    // --------------------------------------------------------
    // CHECK RESTAURANT
    // --------------------------------------------------------

    const restaurantExists = await Restaurant.findById(restaurant);

    if (!restaurantExists) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    // --------------------------------------------------------
    // CHECK STORE
    // --------------------------------------------------------

    const storeExists = await Store.findById(store);

    if (!storeExists) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    // --------------------------------------------------------
    // DUPLICATE SHIFT CODE
    // --------------------------------------------------------

    const normalizedCode = shiftCode.trim().toUpperCase();

    const existingShift = await Shift.findOne({
      shiftCode: normalizedCode,
    });

    if (existingShift) {
      return res.status(409).json({
        success: false,
        message: "Shift code already exists",
      });
    }

    // --------------------------------------------------------
    // CHECK SHIFT NAME
    // --------------------------------------------------------

    const existingName = await Shift.findOne({
      restaurant,
      store,
      shiftName: {
        $regex: `^${shiftName.trim()}$`,
        $options: "i",
      },
      isDeleted: false,
    });

    if (existingName) {
      return res.status(409).json({
        success: false,
        message: "Shift name already exists for this store",
      });
    }

    // --------------------------------------------------------
    // TIME VALIDATION
    // --------------------------------------------------------

    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

    if (!timeRegex.test(startTime)) {
      return res.status(400).json({
        success: false,
        message: "Invalid startTime. Use HH:mm format",
      });
    }

    if (!timeRegex.test(endTime)) {
      return res.status(400).json({
        success: false,
        message: "Invalid endTime. Use HH:mm format",
      });
    }

    if (breakStartTime && !timeRegex.test(breakStartTime)) {
      return res.status(400).json({
        success: false,
        message: "Invalid breakStartTime. Use HH:mm format",
      });
    }

    if (breakEndTime && !timeRegex.test(breakEndTime)) {
      return res.status(400).json({
        success: false,
        message: "Invalid breakEndTime. Use HH:mm format",
      });
    }

    // --------------------------------------------------------
    // CREATE SHIFT
    // --------------------------------------------------------

    const shift = await Shift.create({
      restaurant,
      store,
      shiftCode: normalizedCode,
      shiftName: shiftName.trim(),
      startTime,
      endTime,
      isOvernight: Boolean(isOvernight),
      breakStartTime: breakStartTime || "",
      breakEndTime: breakEndTime || "",
      breakDuration: breakDuration || 0,
      gracePeriod: gracePeriod || 15,
      workingHours: workingHours || 0,
      applicableDays:
        applicableDays && applicableDays.length
          ? applicableDays
          : [
              "Monday",
              "Tuesday",
              "Wednesday",
              "Thursday",
              "Friday",
              "Saturday",
              "Sunday",
            ],
      description: description || "",
      color: color || "",
      isActive:
        isActive !== undefined
          ? isActive
          : true,
      createdBy: req.user?._id || req.user?.id,
      updatedBy: req.user?._id || req.user?.id,
    });

    // --------------------------------------------------------
    // POPULATE
    // --------------------------------------------------------

    const populatedShift = await Shift.findById(shift._id)
      .populate(
        "restaurant",
        "restaurantName restaurantCode"
      )
      .populate(
        "store",
        "storeName storeCode"
      );

    return res.status(201).json({
      success: true,
      message: "Shift created successfully",
      data: populatedShift,
    });
  } catch (error) {
    console.error("Create Shift Error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Shift code already exists",
        error: error.keyValue,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create shift",
      error: error.message,
    });
  }
};

// ============================================================
// GET ALL SHIFTS
// ============================================================

exports.getAllShifts = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 20,
      search = "",
      restaurant,
      store,
      isActive,
    } = req.query;

    page = Math.max(Number(page), 1);
    limit = Math.min(Math.max(Number(limit), 1), 100);

    const skip = (page - 1) * limit;

    const filter = {
      isDeleted: false,
    };

    // --------------------------------------------------------
    // RESTAURANT
    // --------------------------------------------------------

    if (restaurant) {
      if (!isValidObjectId(restaurant)) {
        return res.status(400).json({
          success: false,
          message: "Invalid restaurant ID",
        });
      }

      filter.restaurant = restaurant;
    }

    // --------------------------------------------------------
    // STORE
    // --------------------------------------------------------

    if (store) {
      if (!isValidObjectId(store)) {
        return res.status(400).json({
          success: false,
          message: "Invalid store ID",
        });
      }

      filter.store = store;
    }

    // --------------------------------------------------------
    // ACTIVE
    // --------------------------------------------------------

    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    // --------------------------------------------------------
    // SEARCH
    // --------------------------------------------------------

    if (search.trim()) {
      filter.$or = [
        {
          shiftCode: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          shiftName: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          description: {
            $regex: search.trim(),
            $options: "i",
          },
        },
      ];
    }

    // --------------------------------------------------------
    // QUERY
    // --------------------------------------------------------

    const [shifts, total] = await Promise.all([
      Shift.find(filter)
        .populate(
          "restaurant",
          "restaurantName restaurantCode"
        )
        .populate(
          "store",
          "storeName storeCode"
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
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit),

      Shift.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      message: "Shifts fetched successfully",
      data: shifts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage:
          page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Get All Shifts Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch shifts",
      error: error.message,
    });
  }
};

// ============================================================
// GET SHIFT BY ID
// ============================================================

exports.getShiftById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid shift ID",
      });
    }

    const shift = await Shift.findOne({
      _id: id,
      isDeleted: false,
    })
      .populate(
        "restaurant",
        "restaurantName restaurantCode ownerName"
      )
      .populate(
        "store",
        "storeName storeCode phone"
      )
      .populate(
        "createdBy",
        "name email"
      )
      .populate(
        "updatedBy",
        "name email"
      );

    if (!shift) {
      return res.status(404).json({
        success: false,
        message: "Shift not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Shift fetched successfully",
      data: shift,
    });
  } catch (error) {
    console.error("Get Shift Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch shift",
      error: error.message,
    });
  }
};

// ============================================================
// UPDATE SHIFT
// ============================================================

exports.updateShift = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid shift ID",
      });
    }

    const shift = await Shift.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!shift) {
      return res.status(404).json({
        success: false,
        message: "Shift not found",
      });
    }

    const allowedFields = [
      "restaurant",
      "store",
      "shiftCode",
      "shiftName",
      "startTime",
      "endTime",
      "isOvernight",
      "breakStartTime",
      "breakEndTime",
      "breakDuration",
      "gracePeriod",
      "workingHours",
      "applicableDays",
      "description",
      "color",
      "isActive",
    ];

    // --------------------------------------------------------
    // UPDATE FIELDS
    // --------------------------------------------------------

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        shift[field] = req.body[field];
      }
    });

    // --------------------------------------------------------
    // NORMALIZE CODE
    // --------------------------------------------------------

    if (req.body.shiftCode) {
      shift.shiftCode = req.body.shiftCode
        .trim()
        .toUpperCase();

      const duplicate = await Shift.findOne({
        shiftCode: shift.shiftCode,
        _id: {
          $ne: id,
        },
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: "Shift code already exists",
        });
      }
    }

    // --------------------------------------------------------
    // TIME VALIDATION
    // --------------------------------------------------------

    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

    const timeFields = [
      "startTime",
      "endTime",
      "breakStartTime",
      "breakEndTime",
    ];

    for (const field of timeFields) {
      if (
        req.body[field] !== undefined &&
        req.body[field] !== "" &&
        !timeRegex.test(req.body[field])
      ) {
        return res.status(400).json({
          success: false,
          message: `Invalid ${field}. Use HH:mm format`,
        });
      }
    }

    shift.updatedBy =
      req.user?._id || req.user?.id;

    await shift.save();

    const updatedShift = await Shift.findById(
      shift._id
    )
      .populate(
        "restaurant",
        "restaurantName restaurantCode"
      )
      .populate(
        "store",
        "storeName storeCode"
      );

    return res.status(200).json({
      success: true,
      message: "Shift updated successfully",
      data: updatedShift,
    });
  } catch (error) {
    console.error("Update Shift Error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Shift code already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update shift",
      error: error.message,
    });
  }
};

// ============================================================
// DELETE SHIFT
// ============================================================

exports.deleteShift = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid shift ID",
      });
    }

    const shift = await Shift.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!shift) {
      return res.status(404).json({
        success: false,
        message: "Shift not found",
      });
    }

    // --------------------------------------------------------
    // CHECK WAITERS
    // --------------------------------------------------------

    const assignedWaiters =
      await Waiter.countDocuments({
        shift: id,
        isDeleted: false,
      });

    if (assignedWaiters > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Cannot delete shift because waiters are assigned to this shift",
        assignedWaiters,
      });
    }

    shift.isDeleted = true;
    shift.isActive = false;
    shift.updatedBy =
      req.user?._id || req.user?.id;

    await shift.save();

    return res.status(200).json({
      success: true,
      message: "Shift deleted successfully",
    });
  } catch (error) {
    console.error("Delete Shift Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete shift",
      error: error.message,
    });
  }
};

// ============================================================
// RESTORE SHIFT
// ============================================================

exports.restoreShift = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid shift ID",
      });
    }

    const shift = await Shift.findById(id);

    if (!shift) {
      return res.status(404).json({
        success: false,
        message: "Shift not found",
      });
    }

    if (!shift.isDeleted) {
      return res.status(400).json({
        success: false,
        message: "Shift is already active",
      });
    }

    shift.isDeleted = false;
    shift.isActive = true;
    shift.updatedBy =
      req.user?._id || req.user?.id;

    await shift.save();

    return res.status(200).json({
      success: true,
      message: "Shift restored successfully",
      data: shift,
    });
  } catch (error) {
    console.error("Restore Shift Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to restore shift",
      error: error.message,
    });
  }
};

// ============================================================
// UPDATE SHIFT STATUS
// ============================================================

exports.updateShiftStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid shift ID",
      });
    }

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be true or false",
      });
    }

    const shift = await Shift.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!shift) {
      return res.status(404).json({
        success: false,
        message: "Shift not found",
      });
    }

    shift.isActive = isActive;
    shift.updatedBy =
      req.user?._id || req.user?.id;

    await shift.save();

    return res.status(200).json({
      success: true,
      message: "Shift status updated successfully",
      data: shift,
    });
  } catch (error) {
    console.error("Update Shift Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update shift status",
      error: error.message,
    });
  }
};

// ============================================================
// GET ACTIVE SHIFTS
// ============================================================

exports.getActiveShifts = async (req, res) => {
  try {
    const { restaurant, store } = req.query;

    const filter = {
      isDeleted: false,
      isActive: true,
    };

    if (restaurant) {
      if (!isValidObjectId(restaurant)) {
        return res.status(400).json({
          success: false,
          message: "Invalid restaurant ID",
        });
      }

      filter.restaurant = restaurant;
    }

    if (store) {
      if (!isValidObjectId(store)) {
        return res.status(400).json({
          success: false,
          message: "Invalid store ID",
        });
      }

      filter.store = store;
    }

    const shifts = await Shift.find(filter)
      .populate(
        "restaurant",
        "restaurantName restaurantCode"
      )
      .populate(
        "store",
        "storeName storeCode"
      )
      .sort({
        startTime: 1,
      });

    return res.status(200).json({
      success: true,
      message: "Active shifts fetched successfully",
      count: shifts.length,
      data: shifts,
    });
  } catch (error) {
    console.error("Get Active Shifts Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch active shifts",
      error: error.message,
    });
  }
};

// ============================================================
// GET SHIFT WAITERS
// ============================================================

exports.getShiftWaiters = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid shift ID",
      });
    }

    const shift = await Shift.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!shift) {
      return res.status(404).json({
        success: false,
        message: "Shift not found",
      });
    }

    const waiters = await Waiter.find({
      shift: id,
      isDeleted: false,
    })
      .populate(
        "restaurant",
        "restaurantName"
      )
      .populate(
        "store",
        "storeName"
      )
      .populate(
        "user",
        "name email phone"
      )
      .populate(
        "assignedTables"
      )
      .sort({
        waiterName: 1,
      });

    return res.status(200).json({
      success: true,
      message: "Shift waiters fetched successfully",
      count: waiters.length,
      data: waiters,
    });
  } catch (error) {
    console.error("Get Shift Waiters Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch shift waiters",
      error: error.message,
    });
  }
};

module.exports = exports;

