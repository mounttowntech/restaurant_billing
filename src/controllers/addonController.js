// controllers/addonController.js

const Addon = require("../models/Addon");
const MenuItem = require("../models/MenuItem");

/* =====================================================
   Create Addon
===================================================== */

// exports.createAddon = async (req, res) => {
//   try {
//     const existing = await Addon.findOne({
//       addonCode: req.body.addonCode.toUpperCase(),
//     });

//     if (existing) {
//       return res.status(400).json({
//         success: false,
//         message: "Addon code already exists",
//       });
//     }

//     const addon = await Addon.create({
//       ...req.body,
//       addonCode: req.body.addonCode.toUpperCase(),
//       createdBy: req.user?._id,
//     });

//     res.status(201).json({
//       success: true,
//       message: "Addon created successfully",
//       data: addon,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

/* =====================================================
   Create Addon
===================================================== */

exports.createAddon = async (req, res) => {
  try {
    const {
      addonCode,
      applicableMenuItems = [],
    } = req.body;

    // ---------------------------------------------------
    // Validate addon code
    // ---------------------------------------------------

    if (!addonCode) {
      return res.status(400).json({
        success: false,
        message: "Addon code is required",
      });
    }

    const code = addonCode.trim().toUpperCase();

    // ---------------------------------------------------
    // Check duplicate addon code
    // ---------------------------------------------------

    const existing = await Addon.findOne({
      addonCode: code,
      isDeleted: false,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Addon code already exists",
      });
    }

    // ---------------------------------------------------
    // Create Addon
    // ---------------------------------------------------

    const addon = await Addon.create({
      ...req.body,

      addonCode: code,

      // Make sure this is always an array
      applicableMenuItems: Array.isArray(applicableMenuItems)
        ? applicableMenuItems
        : [],

      createdBy: req.user?._id,
    });

    // ---------------------------------------------------
    // Update MenuItems
    // Add this addon ID to selected menu items
    // ---------------------------------------------------

    if (
      Array.isArray(applicableMenuItems) &&
      applicableMenuItems.length > 0
    ) {
      await MenuItem.updateMany(
        {
          _id: {
            $in: applicableMenuItems,
          },
        },
        {
          $addToSet: {
            addons: addon._id,
          },
        }
      );
    }

    // ---------------------------------------------------
    // Populate response
    // ---------------------------------------------------

    const populatedAddon = await Addon.findById(addon._id)
      .populate(
        "applicableMenuItems",
        "menuCode menuName"
      );

    res.status(201).json({
      success: true,
      message: "Addon created successfully",
      data: populatedAddon,
    });
  } catch (error) {
    console.error("Create Addon Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =====================================================
   Get All Addons
===================================================== */

exports.getAllAddons = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {
      isDeleted: false,
    };

    if (req.query.restaurant)
      filter.restaurant = req.query.restaurant;

    if (req.query.store)
      filter.store = req.query.store;

    if (req.query.category)
      filter.category = req.query.category;

    if (req.query.foodType)
      filter.foodType = req.query.foodType;

    if (req.query.addonType)
      filter.addonType = req.query.addonType;

    if (req.query.isAvailable)
      filter.isAvailable = req.query.isAvailable === "true";

    if (req.query.isActive)
      filter.isActive = req.query.isActive === "true";

    if (req.query.search) {
      filter.$or = [
        {
          addonName: {
            $regex: req.query.search,
            $options: "i",
          },
        },
        {
          addonCode: {
            $regex: req.query.search,
            $options: "i",
          },
        },
        {
          displayName: {
            $regex: req.query.search,
            $options: "i",
          },
        },
      ];
    }

    const [addons, total] = await Promise.all([
      Addon.find(filter)
        .populate("restaurant store category")
        .sort({ displayOrder: 1, addonName: 1 })
        .skip(skip)
        .limit(limit),

      Addon.countDocuments(filter),
    ]);

    res.json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      count: addons.length,
      data: addons,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =====================================================
   Get Addon By ID
===================================================== */

exports.getAddonById = async (req, res) => {
  try {
    const addon = await Addon.findById(req.params.id)
      .populate("restaurant store category applicableMenuItems");

    if (!addon || addon.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Addon not found",
      });
    }

    res.json({
      success: true,
      data: addon,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =====================================================
   Update Addon
===================================================== */

// exports.updateAddon = async (req, res) => {
//   try {
//     const addon = await Addon.findById(req.params.id);

//     if (!addon || addon.isDeleted) {
//       return res.status(404).json({
//         success: false,
//         message: "Addon not found",
//       });
//     }

//     Object.assign(addon, req.body);

//     addon.updatedBy = req.user?._id;

//     await addon.save();

//     res.json({
//       success: true,
//       message: "Addon updated successfully",
//       data: addon,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };


/* =====================================================
   Update Addon
===================================================== */

exports.updateAddon = async (req, res) => {
  try {
    const addon = await Addon.findById(req.params.id);

    // ---------------------------------------------------
    // Check addon
    // ---------------------------------------------------

    if (!addon || addon.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Addon not found",
      });
    }

    // ---------------------------------------------------
    // Get old menu items
    // ---------------------------------------------------

    const oldMenuItems = Array.isArray(
      addon.applicableMenuItems
    )
      ? addon.applicableMenuItems.map((id) =>
          id.toString()
        )
      : [];

    // ---------------------------------------------------
    // Get new menu items
    // ---------------------------------------------------

    const newMenuItems = Array.isArray(
      req.body.applicableMenuItems
    )
      ? req.body.applicableMenuItems.map((id) =>
          id.toString()
        )
      : [];

    // ---------------------------------------------------
    // Find removed menu items
    // ---------------------------------------------------

    const removedMenuItems = oldMenuItems.filter(
      (oldId) => !newMenuItems.includes(oldId)
    );

    // ---------------------------------------------------
    // Find newly added menu items
    // ---------------------------------------------------

    const addedMenuItems = newMenuItems.filter(
      (newId) => !oldMenuItems.includes(newId)
    );

    // ---------------------------------------------------
    // Remove addon from old menu items
    // ---------------------------------------------------

    if (removedMenuItems.length > 0) {
      await MenuItem.updateMany(
        {
          _id: {
            $in: removedMenuItems,
          },
        },
        {
          $pull: {
            addons: addon._id,
          },
        }
      );
    }

    // ---------------------------------------------------
    // Add addon to new menu items
    // ---------------------------------------------------

    if (addedMenuItems.length > 0) {
      await MenuItem.updateMany(
        {
          _id: {
            $in: addedMenuItems,
          },
        },
        {
          $addToSet: {
            addons: addon._id,
          },
        }
      );
    }

    // ---------------------------------------------------
    // Check duplicate addon code
    // ---------------------------------------------------

    if (req.body.addonCode) {
      const newCode = req.body.addonCode
        .trim()
        .toUpperCase();

      const duplicate = await Addon.findOne({
        addonCode: newCode,
        _id: {
          $ne: addon._id,
        },
        isDeleted: false,
      });

      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: "Addon code already exists",
        });
      }

      req.body.addonCode = newCode;
    }

    // ---------------------------------------------------
    // Update Addon
    // ---------------------------------------------------

    Object.assign(addon, req.body);

    addon.updatedBy = req.user?._id;

    await addon.save();

    // ---------------------------------------------------
    // Populate response
    // ---------------------------------------------------

    const populatedAddon = await Addon.findById(addon._id)
      .populate(
        "applicableMenuItems",
        "menuCode menuName"
      );

    res.json({
      success: true,
      message: "Addon updated successfully",
      data: populatedAddon,
    });
  } catch (error) {
    console.error("Update Addon Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =====================================================
   Delete Addon (Soft Delete)
===================================================== */

exports.deleteAddon = async (req, res) => {
  try {
    const addon = await Addon.findById(req.params.id);

    if (!addon) {
      return res.status(404).json({
        success: false,
        message: "Addon not found",
      });
    }

    addon.isDeleted = true;
    addon.updatedBy = req.user?._id;

    await addon.save();

    res.json({
      success: true,
      message: "Addon deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =====================================================
   Restore Addon
===================================================== */

exports.restoreAddon = async (req, res) => {
  try {
    const addon = await Addon.findById(req.params.id);

    if (!addon) {
      return res.status(404).json({
        success: false,
        message: "Addon not found",
      });
    }

    addon.isDeleted = false;

    await addon.save();

    res.json({
      success: true,
      message: "Addon restored successfully",
      data: addon,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =====================================================
   Toggle Active Status
===================================================== */

exports.toggleActive = async (req, res) => {
  try {
    const addon = await Addon.findById(req.params.id);

    if (!addon) {
      return res.status(404).json({
        success: false,
        message: "Addon not found",
      });
    }

    addon.isActive = !addon.isActive;

    await addon.save();

    res.json({
      success: true,
      message: "Status updated successfully",
      data: addon,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =====================================================
   Toggle Availability
===================================================== */

exports.toggleAvailability = async (req, res) => {
  try {
    const addon = await Addon.findById(req.params.id);

    if (!addon) {
      return res.status(404).json({
        success: false,
        message: "Addon not found",
      });
    }

    addon.isAvailable = !addon.isAvailable;

    await addon.save();

    res.json({
      success: true,
      message: "Availability updated successfully",
      data: addon,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};