const Shift = require("../models/shiftModel");

/* ==========================================================
   Create Shift
========================================================== */

exports.createShift = async (req, res) => {
  try {
    const existingShift = await Shift.findOne({
      shiftCode: req.body.shiftCode.toUpperCase(),
      isDeleted: false,
    });

    if (existingShift) {
      return res.status(400).json({
        success: false,
        message: "Shift code already exists.",
      });
    }

    const shift = await Shift.create({
      ...req.body,
      createdBy: req.user?.id || req.body.createdBy,
    });

    const populatedShift = await Shift.findById(shift._id)
      .populate("restaurant", "restaurantName restaurantCode")
      .populate("store", "storeName storeCode")
      .populate("applicableRoles", "roleName roleCode")
      .populate("createdBy", "name");

    return res.status(201).json({
      success: true,
      message: "Shift created successfully.",
      data: populatedShift,
    });
  } catch (error) {
    console.error("createShift Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create shift.",
      error: error.message,
    });
  }
};

/* ==========================================================
   Get All Shifts
========================================================== */

exports.getShifts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      restaurant,
      store,
      shiftType,
      status,
      search,
    } = req.query;

    const filter = {};

    if (restaurant) filter.restaurant = restaurant;

    if (store) filter.store = store;

    if (shiftType) filter.shiftType = shiftType;

    if (status !== undefined) {
      filter.status = status === "true";
    }

    if (search) {
      filter.$or = [
        {
          shiftName: {
            $regex: search,
            $options: "i",
          },
        },
        {
          shiftCode: {
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

    const total = await Shift.countDocuments(filter);

    const shifts = await Shift.find(filter)
      .populate("restaurant", "restaurantName restaurantCode")
      .populate("store", "storeName storeCode")
      .populate("applicableRoles", "roleName roleCode")
      .sort({
        createdAt: -1,
      })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      totalRecords: total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      count: shifts.length,
      data: shifts,
    });
  } catch (error) {
    console.error("getShifts Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch shifts.",
      error: error.message,
    });
  }
};

/* ==========================================================
   Get Shift By Id
========================================================== */

exports.getShiftById = async (req, res) => {
  try {
    const shift = await Shift.findById(req.params.id)
      .populate("restaurant", "restaurantName restaurantCode")
      .populate("store", "storeName storeCode")
      .populate("applicableRoles", "roleName roleCode")
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email");

    if (!shift) {
      return res.status(404).json({
        success: false,
        message: "Shift not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: shift,
    });
  } catch (error) {
    console.error("getShiftById Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch shift.",
      error: error.message,
    });
  }
};

exports.updateShift = async (req, res) => {
  try {
    const shift = await Shift.findById(req.params.id);

    if (!shift) {
      return res.status(404).json({
        success: false,

        message: "Shift not found.",
      });
    }

    // Prevent duplicate shift code

    if (
      req.body.shiftCode &&
      req.body.shiftCode.toUpperCase() !== shift.shiftCode
    ) {
      const exists = await Shift.findOne({
        shiftCode: req.body.shiftCode.toUpperCase(),

        _id: { $ne: shift._id },

        isDeleted: false,
      });

      if (exists) {
        return res.status(400).json({
          success: false,

          message: "Shift code already exists.",
        });
      }
    }

    Object.assign(shift, req.body);

    shift.updatedBy = req.user?.id || req.body.updatedBy || shift.updatedBy;

    await shift.save();

    const updatedShift = await Shift.findById(shift._id)

      .populate("restaurant", "restaurantName restaurantCode")

      .populate("store", "storeName storeCode")

      .populate("applicableRoles", "roleName roleCode")

      .populate("updatedBy", "name");

    return res.status(200).json({
      success: true,

      message: "Shift updated successfully.",

      data: updatedShift,
    });
  } catch (error) {
    console.error("updateShift Error:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to update shift.",

      error: error.message,
    });
  }
};

/* ==========================================================

   Soft Delete Shift

========================================================== */

exports.deleteShift = async (req, res) => {
  try {
    const shift = await Shift.findById(req.params.id);

    if (!shift) {
      return res.status(404).json({
        success: false,

        message: "Shift not found.",
      });
    }

    shift.isDeleted = true;

    shift.updatedBy = req.user?.id || req.body.updatedBy || shift.updatedBy;

    await shift.save();

    return res.status(200).json({
      success: true,

      message: "Shift deleted successfully.",
    });
  } catch (error) {
    console.error("deleteShift Error:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to delete shift.",

      error: error.message,
    });
  }
};

/* ==========================================================

   Restore Shift

========================================================== */

exports.restoreShift = async (req, res) => {
  try {
    const shift = await Shift.findOne({
      _id: req.params.id,

      isDeleted: true,
    });

    if (!shift) {
      return res.status(404).json({
        success: false,

        message: "Deleted shift not found.",
      });
    }

    shift.isDeleted = false;

    shift.updatedBy = req.user?.id || req.body.updatedBy || shift.updatedBy;

    await shift.save();

    return res.status(200).json({
      success: true,

      message: "Shift restored successfully.",

      data: shift,
    });
  } catch (error) {
    console.error("restoreShift Error:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to restore shift.",

      error: error.message,
    });
  }
};

/* ==========================================================

   Update Shift Status

========================================================== */

exports.updateShiftStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const shift = await Shift.findById(req.params.id);

    if (!shift) {
      return res.status(404).json({
        success: false,

        message: "Shift not found.",
      });
    }

    shift.status = status;

    shift.updatedBy = req.user?.id || req.body.updatedBy || shift.updatedBy;

    await shift.save();

    return res.status(200).json({
      success: true,

      message: "Shift status updated successfully.",

      data: shift,
    });
  } catch (error) {
    console.error("updateShiftStatus Error:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to update shift status.",

      error: error.message,
    });
  }
};

/* ==========================================================

   Activate Shift

========================================================== */

exports.activateShift = async (req, res) => {
  try {
    const shift = await Shift.findById(req.params.id);

    if (!shift) {
      return res.status(404).json({
        success: false,

        message: "Shift not found.",
      });
    }

    shift.status = true;

    shift.updatedBy = req.user?.id || req.body.updatedBy || shift.updatedBy;

    await shift.save();

    return res.status(200).json({
      success: true,

      message: "Shift activated successfully.",

      data: shift,
    });
  } catch (error) {
    console.error("activateShift Error:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to activate shift.",

      error: error.message,
    });
  }
};

/* ==========================================================

   Deactivate Shift

========================================================== */

exports.deactivateShift = async (req, res) => {
  try {
    const shift = await Shift.findById(req.params.id);

    if (!shift) {
      return res.status(404).json({
        success: false,

        message: "Shift not found.",
      });
    }

    shift.status = false;

    shift.updatedBy = req.user?.id || req.body.updatedBy || shift.updatedBy;

    await shift.save();

    return res.status(200).json({
      success: true,

      message: "Shift deactivated successfully.",

      data: shift,
    });
  } catch (error) {
    console.error("deactivateShift Error:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to deactivate shift.",

      error: error.message,
    });
  }
};

exports.searchShifts = async (req, res) => {
  try {
    const { keyword = "" } = req.query;

    const shifts = await Shift.find({
      $or: [
        { shiftCode: { $regex: keyword, $options: "i" } },

        { shiftName: { $regex: keyword, $options: "i" } },

        { description: { $regex: keyword, $options: "i" } },
      ],
    })

      .populate("restaurant", "restaurantName")

      .populate("store", "storeName")

      .sort({ createdAt: -1 });

    res.json({
      success: true,

      count: shifts.length,

      data: shifts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

/* ==========================================================

   Get Active Shifts

========================================================== */

exports.getActiveShifts = async (req, res) => {
  try {
    const shifts = await Shift.find({
      status: true,
    })

      .populate("restaurant", "restaurantName")

      .populate("store", "storeName")

      .sort({ shiftName: 1 });

    res.json({
      success: true,

      count: shifts.length,

      data: shifts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

/* ==========================================================

   Get Inactive Shifts

========================================================== */

exports.getInactiveShifts = async (req, res) => {
  try {
    const shifts = await Shift.find({
      status: false,
    })

      .populate("restaurant", "restaurantName")

      .populate("store", "storeName")

      .sort({ shiftName: 1 });

    res.json({
      success: true,

      count: shifts.length,

      data: shifts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

/* ==========================================================

   Get Deleted Shifts

========================================================== */

exports.getDeletedShifts = async (req, res) => {
  try {
    const shifts = await Shift.find({
      isDeleted: true,
    })

      .setOptions({
        bypassDeleted: true,
      })

      .populate("restaurant", "restaurantName")

      .populate("store", "storeName")

      .sort({ updatedAt: -1 });

    res.json({
      success: true,

      count: shifts.length,

      data: shifts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

/* ==========================================================

   Get Night Shifts

========================================================== */

exports.getNightShifts = async (req, res) => {
  try {
    const shifts = await Shift.find({
      shiftType: "Night",

      status: true,
    })

      .populate("restaurant", "restaurantName")

      .populate("store", "storeName");

    res.json({
      success: true,

      count: shifts.length,

      data: shifts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

/* ==========================================================

   Get Store Shifts

========================================================== */

exports.getStoreShifts = async (req, res) => {
  try {
    const shifts = await Shift.find({
      store: req.params.storeId,
    })

      .populate("restaurant", "restaurantName")

      .populate("store", "storeName")

      .sort({ shiftName: 1 });

    res.json({
      success: true,

      count: shifts.length,

      data: shifts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

/* ==========================================================

   Get Role Shifts

========================================================== */

exports.getRoleShifts = async (req, res) => {
  try {
    const shifts = await Shift.find({
      applicableRoles: req.params.roleId,
    })

      .populate("restaurant", "restaurantName")

      .populate("store", "storeName")

      .populate("applicableRoles", "roleName");

    res.json({
      success: true,

      count: shifts.length,

      data: shifts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

/* ==========================================================

   Get Today's Shifts

========================================================== */

exports.getTodayShifts = async (req, res) => {
  try {
    const day = new Date().toLocaleDateString("en-US", {
      weekday: "long",
    });

    const shifts = await Shift.find({
      workingDays: day,

      status: true,
    })

      .populate("restaurant", "restaurantName")

      .populate("store", "storeName");

    res.json({
      success: true,

      today: day,

      count: shifts.length,

      data: shifts,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

/* ==========================================================

   Shift Summary

========================================================== */

exports.getShiftSummary = async (req, res) => {
  try {
    const [total, active, inactive, deleted, night] = await Promise.all([
      Shift.countDocuments(),

      Shift.countDocuments({ status: true }),

      Shift.countDocuments({ status: false }),

      Shift.countDocuments({
        isDeleted: true,
      }).setOptions({
        bypassDeleted: true,
      }),

      Shift.countDocuments({
        shiftType: "Night",
      }),
    ]);

    res.json({
      success: true,

      data: {
        totalShifts: total,

        activeShifts: active,

        inactiveShifts: inactive,

        deletedShifts: deleted,

        nightShifts: night,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

/* ==========================================================

   Shift Analytics

========================================================== */

exports.getShiftAnalytics = async (req, res) => {
  try {
    const analytics = await Shift.aggregate([
      {
        $match: {
          isDeleted: false,
        },
      },

      {
        $facet: {
          shiftTypes: [
            {
              $group: {
                _id: "$shiftType",

                total: {
                  $sum: 1,
                },
              },
            },
          ],

          statusWise: [
            {
              $group: {
                _id: "$status",

                total: {
                  $sum: 1,
                },
              },
            },
          ],

          restaurantWise: [
            {
              $group: {
                _id: "$restaurant",

                total: {
                  $sum: 1,
                },
              },
            },
          ],

          storeWise: [
            {
              $group: {
                _id: "$store",

                total: {
                  $sum: 1,
                },
              },
            },
          ],

          weeklyHours: [
            {
              $project: {
                totalHours: {
                  $multiply: [
                    {
                      $ifNull: ["$workingHours", 0],
                    },

                    {
                      $size: {
                        $ifNull: ["$workingDays", []],
                      },
                    },
                  ],
                },
              },
            },

            {
              $group: {
                _id: null,

                totalWeeklyHours: {
                  $sum: "$totalHours",
                },

                averageWeeklyHours: {
                  $avg: "$totalHours",
                },
              },
            },
          ],
        },
      },
    ]);

    res.json({
      success: true,

      data: analytics[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};
