
const mongoose = require("mongoose");

const Waiter = require("../models/waiterModel");
const User = require("../models/User");
const Restaurant = require("../models/Restaurant");
const Store = require("../models/storeModel");
const Table = require("../models/Table");
const Order = require("../models/Order");

// ============================================================
// CREATE WAITER
// ============================================================
exports.createWaiter = async (req, res) => {
  try {
    const {
      restaurant,
      store,
      user,
      waiterCode,
      waiterName,
      phone,
      email,
      gender,
      shift,
      assignedTables,
      commissionPercentage,
      salary,
      joiningDate,
      profileImage,
      isAvailable,
      status,
      notes,
    } = req.body;

    // --------------------------------------------------------
    // Required validation
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

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User is required",
      });
    }

    if (!waiterCode) {
      return res.status(400).json({
        success: false,
        message: "Waiter code is required",
      });
    }

    if (!waiterName) {
      return res.status(400).json({
        success: false,
        message: "Waiter name is required",
      });
    }

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone is required",
      });
    }

    // --------------------------------------------------------
    // ObjectId validation
    // --------------------------------------------------------
    const objectIds = [
      { name: "restaurant", value: restaurant },
      { name: "store", value: store },
      { name: "user", value: user },
    ];

    for (const item of objectIds) {
      if (!mongoose.Types.ObjectId.isValid(item.value)) {
        return res.status(400).json({
          success: false,
          message: `Invalid ${item.name} ID`,
        });
      }
    }

    // --------------------------------------------------------
    // Check restaurant
    // --------------------------------------------------------
    const restaurantExists = await Restaurant.findById(restaurant);

    if (!restaurantExists) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    // --------------------------------------------------------
    // Check store
    // --------------------------------------------------------
    const storeExists = await Store.findById(store);

    if (!storeExists) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    // --------------------------------------------------------
    // Check user
    // --------------------------------------------------------
    const userExists = await User.findById(user);

    if (!userExists) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // --------------------------------------------------------
    // Check duplicate user
    // --------------------------------------------------------
    const existingUser = await Waiter.findOne({
      user,
      isDeleted: false,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "This user is already assigned as a waiter",
      });
    }

    // --------------------------------------------------------
    // Check duplicate waiter code
    // --------------------------------------------------------
    const existingCode = await Waiter.findOne({
      waiterCode: waiterCode.toUpperCase(),
    });

    if (existingCode) {
      return res.status(409).json({
        success: false,
        message: "Waiter code already exists",
      });
    }

    // --------------------------------------------------------
    // Validate assigned tables
    // --------------------------------------------------------
    let validTables = [];

    if (assignedTables && assignedTables.length > 0) {
      if (!Array.isArray(assignedTables)) {
        return res.status(400).json({
          success: false,
          message: "assignedTables must be an array",
        });
      }

      for (const tableId of assignedTables) {
        if (!mongoose.Types.ObjectId.isValid(tableId)) {
          return res.status(400).json({
            success: false,
            message: `Invalid table ID: ${tableId}`,
          });
        }
      }

      validTables = await Table.find({
        _id: { $in: assignedTables },
      }).select("_id");

      if (validTables.length !== assignedTables.length) {
        return res.status(400).json({
          success: false,
          message: "One or more assigned tables were not found",
        });
      }
    }

    // --------------------------------------------------------
    // Create waiter
    // --------------------------------------------------------
    const waiter = await Waiter.create({
      restaurant,
      store,
      user,
      waiterCode: waiterCode.toUpperCase(),
      waiterName,
      phone,
      email,
      gender,
      shift,
      assignedTables,
      commissionPercentage,
      salary,
      joiningDate,
      profileImage,
      isAvailable,
      status,
      notes,
      createdBy: req.user?._id || req.user?.id,
      updatedBy: req.user?._id || req.user?.id,
    });

    const populatedWaiter = await Waiter.findById(waiter._id)
      .populate("restaurant", "restaurantName restaurantCode")
      .populate("store", "storeName storeCode")
      .populate("user", "-password")
      .populate("shift")
      .populate("assignedTables");

    return res.status(201).json({
      success: true,
      message: "Waiter created successfully",
      data: populatedWaiter,
    });
  } catch (error) {
    console.error("Create Waiter Error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Duplicate waiter code or user",
        error: error.keyValue,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create waiter",
      error: error.message,
    });
  }
};

// ============================================================
// GET ALL WAITERS
// ============================================================
exports.getAllWaiters = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 20,
      search = "",
      restaurant,
      store,
      status,
      isAvailable,
    } = req.query;

    page = Math.max(Number(page), 1);
    limit = Math.min(Math.max(Number(limit), 1), 100);

    const skip = (page - 1) * limit;

    const filter = {
      isDeleted: false,
    };

    // --------------------------------------------------------
    // Filters
    // --------------------------------------------------------
    if (restaurant) {
      if (!mongoose.Types.ObjectId.isValid(restaurant)) {
        return res.status(400).json({
          success: false,
          message: "Invalid restaurant ID",
        });
      }

      filter.restaurant = restaurant;
    }

    if (store) {
      if (!mongoose.Types.ObjectId.isValid(store)) {
        return res.status(400).json({
          success: false,
          message: "Invalid store ID",
        });
      }

      filter.store = store;
    }

    if (status) {
      filter.status = status;
    }

    if (isAvailable !== undefined) {
      filter.isAvailable = isAvailable === "true";
    }

    // --------------------------------------------------------
    // Search
    // --------------------------------------------------------
    if (search.trim()) {
      filter.$or = [
        {
          waiterName: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          waiterCode: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          phone: {
            $regex: search.trim(),
            $options: "i",
          },
        },
        {
          email: {
            $regex: search.trim(),
            $options: "i",
          },
        },
      ];
    }

    const [waiters, total] = await Promise.all([
      Waiter.find(filter)
        .populate("restaurant", "restaurantName restaurantCode")
        .populate("store", "storeName storeCode")
        .populate("user", "name email phone")
        .populate("shift")
        .populate("assignedTables")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      Waiter.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      message: "Waiters fetched successfully",
      data: waiters,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Get All Waiters Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch waiters",
      error: error.message,
    });
  }
};

// ============================================================
// GET WAITER BY ID
// ============================================================
exports.getWaiterById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid waiter ID",
      });
    }

    const waiter = await Waiter.findOne({
      _id: id,
      isDeleted: false,
    })
      .populate("restaurant", "restaurantName restaurantCode ownerName")
      .populate("store", "storeName storeCode phone")
      .populate("user", "-password")
      .populate("shift")
      .populate("assignedTables")
      .populate("currentOrders");

    if (!waiter) {
      return res.status(404).json({
        success: false,
        message: "Waiter not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Waiter fetched successfully",
      data: waiter,
    });
  } catch (error) {
    console.error("Get Waiter Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch waiter",
      error: error.message,
    });
  }
};

// ============================================================
// UPDATE WAITER
// ============================================================
exports.updateWaiter = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid waiter ID",
      });
    }

    const waiter = await Waiter.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!waiter) {
      return res.status(404).json({
        success: false,
        message: "Waiter not found",
      });
    }

    const allowedFields = [
      "restaurant",
      "store",
      "user",
      "waiterCode",
      "waiterName",
      "phone",
      "email",
      "gender",
      "shift",
      "assignedTables",
      "commissionPercentage",
      "salary",
      "joiningDate",
      "profileImage",
      "isAvailable",
      "status",
      "notes",
    ];

    // --------------------------------------------------------
    // Update only allowed fields
    // --------------------------------------------------------
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        waiter[field] = req.body[field];
      }
    });

    // --------------------------------------------------------
    // Normalize waiter code
    // --------------------------------------------------------
    if (req.body.waiterCode) {
      waiter.waiterCode = req.body.waiterCode.toUpperCase().trim();

      const duplicate = await Waiter.findOne({
        waiterCode: waiter.waiterCode,
        _id: { $ne: id },
      });

      if (duplicate) {
        return res.status(409).json({
          success: false,
          message: "Waiter code already exists",
        });
      }
    }

    // --------------------------------------------------------
    // Validate assigned tables
    // --------------------------------------------------------
    if (req.body.assignedTables !== undefined) {
      if (!Array.isArray(req.body.assignedTables)) {
        return res.status(400).json({
          success: false,
          message: "assignedTables must be an array",
        });
      }

      for (const tableId of req.body.assignedTables) {
        if (!mongoose.Types.ObjectId.isValid(tableId)) {
          return res.status(400).json({
            success: false,
            message: `Invalid table ID: ${tableId}`,
          });
        }
      }

      const tableCount = await Table.countDocuments({
        _id: { $in: req.body.assignedTables },
      });

      if (tableCount !== req.body.assignedTables.length) {
        return res.status(400).json({
          success: false,
          message: "One or more assigned tables were not found",
        });
      }
    }

    waiter.updatedBy = req.user?._id || req.user?.id;

    await waiter.save();

    const updatedWaiter = await Waiter.findById(waiter._id)
      .populate("restaurant", "restaurantName restaurantCode")
      .populate("store", "storeName storeCode")
      .populate("user", "-password")
      .populate("shift")
      .populate("assignedTables");

    return res.status(200).json({
      success: true,
      message: "Waiter updated successfully",
      data: updatedWaiter,
    });
  } catch (error) {
    console.error("Update Waiter Error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Duplicate waiter code or user",
        error: error.keyValue,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update waiter",
      error: error.message,
    });
  }
};

// ============================================================
// DELETE WAITER - SOFT DELETE
// ============================================================
exports.deleteWaiter = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid waiter ID",
      });
    }

    const waiter = await Waiter.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!waiter) {
      return res.status(404).json({
        success: false,
        message: "Waiter not found",
      });
    }

    waiter.isDeleted = true;
    waiter.status = "Inactive";
    waiter.isAvailable = false;
    waiter.updatedBy = req.user?._id || req.user?.id;

    await waiter.save();

    return res.status(200).json({
      success: true,
      message: "Waiter deleted successfully",
    });
  } catch (error) {
    console.error("Delete Waiter Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete waiter",
      error: error.message,
    });
  }
};

// ============================================================
// RESTORE WAITER
// ============================================================
exports.restoreWaiter = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid waiter ID",
      });
    }

    const waiter = await Waiter.findById(id);

    if (!waiter) {
      return res.status(404).json({
        success: false,
        message: "Waiter not found",
      });
    }

    waiter.isDeleted = false;
    waiter.status = "Active";
    waiter.isAvailable = true;
    waiter.updatedBy = req.user?._id || req.user?.id;

    await waiter.save();

    return res.status(200).json({
      success: true,
      message: "Waiter restored successfully",
      data: waiter,
    });
  } catch (error) {
    console.error("Restore Waiter Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to restore waiter",
      error: error.message,
    });
  }
};

// ============================================================
// UPDATE WAITER STATUS
// ============================================================
exports.updateWaiterStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid waiter ID",
      });
    }

    if (!["Active", "Inactive", "On Leave"].includes(status)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid status. Allowed values: Active, Inactive, On Leave",
      });
    }

    const waiter = await Waiter.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!waiter) {
      return res.status(404).json({
        success: false,
        message: "Waiter not found",
      });
    }

    waiter.status = status;

    if (status !== "Active") {
      waiter.isAvailable = false;
    }

    waiter.updatedBy = req.user?._id || req.user?.id;

    await waiter.save();

    return res.status(200).json({
      success: true,
      message: "Waiter status updated successfully",
      data: waiter,
    });
  } catch (error) {
    console.error("Update Waiter Status Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update waiter status",
      error: error.message,
    });
  }
};

// ============================================================
// UPDATE AVAILABILITY
// ============================================================
exports.updateWaiterAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { isAvailable } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid waiter ID",
      });
    }

    if (typeof isAvailable !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isAvailable must be true or false",
      });
    }

    const waiter = await Waiter.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!waiter) {
      return res.status(404).json({
        success: false,
        message: "Waiter not found",
      });
    }

    if (waiter.status !== "Active" && isAvailable === true) {
      return res.status(400).json({
        success: false,
        message: "Inactive or on-leave waiter cannot be available",
      });
    }

    waiter.isAvailable = isAvailable;
    waiter.updatedBy = req.user?._id || req.user?.id;

    await waiter.save();

    return res.status(200).json({
      success: true,
      message: "Waiter availability updated successfully",
      data: waiter,
    });
  } catch (error) {
    console.error("Update Waiter Availability Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update waiter availability",
      error: error.message,
    });
  }
};

// ============================================================
// ASSIGN TABLES
// ============================================================
exports.assignTablesToWaiter = async (req, res) => {
  try {
    const { id } = req.params;
    const { tableIds } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid waiter ID",
      });
    }

    if (!Array.isArray(tableIds)) {
      return res.status(400).json({
        success: false,
        message: "tableIds must be an array",
      });
    }

    for (const tableId of tableIds) {
      if (!mongoose.Types.ObjectId.isValid(tableId)) {
        return res.status(400).json({
          success: false,
          message: `Invalid table ID: ${tableId}`,
        });
      }
    }

    const waiter = await Waiter.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!waiter) {
      return res.status(404).json({
        success: false,
        message: "Waiter not found",
      });
    }

    const tables = await Table.find({
      _id: { $in: tableIds },
    });

    if (tables.length !== tableIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more tables were not found",
      });
    }

    waiter.assignedTables = tableIds;
    waiter.updatedBy = req.user?._id || req.user?.id;

    await waiter.save();

    const updatedWaiter = await Waiter.findById(id).populate(
      "assignedTables"
    );

    return res.status(200).json({
      success: true,
      message: "Tables assigned to waiter successfully",
      data: updatedWaiter,
    });
  } catch (error) {
    console.error("Assign Tables Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to assign tables",
      error: error.message,
    });
  }
};

// ============================================================
// GET AVAILABLE WAITERS
// ============================================================
exports.getAvailableWaiters = async (req, res) => {
  try {
    const { restaurant, store } = req.query;

    const filter = {
      isDeleted: false,
      status: "Active",
      isAvailable: true,
    };

    if (restaurant) {
      if (!mongoose.Types.ObjectId.isValid(restaurant)) {
        return res.status(400).json({
          success: false,
          message: "Invalid restaurant ID",
        });
      }

      filter.restaurant = restaurant;
    }

    if (store) {
      if (!mongoose.Types.ObjectId.isValid(store)) {
        return res.status(400).json({
          success: false,
          message: "Invalid store ID",
        });
      }

      filter.store = store;
    }

    const waiters = await Waiter.find(filter)
      .populate("restaurant", "restaurantName restaurantCode")
      .populate("store", "storeName storeCode")
      .populate("assignedTables")
      .sort({ waiterName: 1 });

    return res.status(200).json({
      success: true,
      message: "Available waiters fetched successfully",
      count: waiters.length,
      data: waiters,
    });
  } catch (error) {
    console.error("Get Available Waiters Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch available waiters",
      error: error.message,
    });
  }
};

// ============================================================
// GET WAITER STATISTICS
// ============================================================
exports.getWaiterStatistics = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid waiter ID",
      });
    }

    const waiter = await Waiter.findOne({
      _id: id,
      isDeleted: false,
    })
      .populate("restaurant", "restaurantName")
      .populate("store", "storeName");

    if (!waiter) {
      return res.status(404).json({
        success: false,
        message: "Waiter not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Waiter statistics fetched successfully",
      data: {
        waiterId: waiter._id,
        waiterCode: waiter.waiterCode,
        waiterName: waiter.waiterName,
        totalOrders: waiter.totalOrders,
        completedOrders: waiter.completedOrders,
        cancelledOrders: waiter.cancelledOrders,
        pendingOrders:
          waiter.totalOrders - waiter.completedOrders,
        averageServingTime: waiter.averageServingTime,
        rating: waiter.rating,
        commissionPercentage: waiter.commissionPercentage,
        salary: waiter.salary,
        assignedTables: waiter.assignedTables?.length || 0,
        isAvailable: waiter.isAvailable,
        status: waiter.status,
      },
    });
  } catch (error) {
    console.error("Get Waiter Statistics Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch waiter statistics",
      error: error.message,
    });
  }
};

// ============================================================
// GET WAITER ORDERS
// ============================================================
exports.getWaiterOrders = async (req, res) => {
  try {
    const { id } = req.params;

    let { page = 1, limit = 20 } = req.query;

    page = Math.max(Number(page), 1);
    limit = Math.min(Math.max(Number(limit), 1), 100);

    const skip = (page - 1) * limit;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid waiter ID",
      });
    }

    const waiter = await Waiter.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!waiter) {
      return res.status(404).json({
        success: false,
        message: "Waiter not found",
      });
    }

    const filter = {
      waiter: id,
    };

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      Order.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      message: "Waiter orders fetched successfully",
      data: orders,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get Waiter Orders Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch waiter orders",
      error: error.message,
    });
  }
};
