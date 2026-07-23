const Chef = require("../models/Chef");

// =============================================
// Create Chef
// =============================================
exports.createChef = async (req, res) => {
  try {
    const {
      restaurant,
      store,
      user,
      chefCode,
      chefName,
      phone,
      email,
      gender,
      designation,
      kitchenSection,
      specialization,
      shift,
      salary,
      joiningDate,
      profileImage,
      notes,
    } = req.body;

    const codeExists = await Chef.findOne({
      chefCode: chefCode.toUpperCase(),
      isDeleted: false,
    });

    if (codeExists) {
      return res.status(400).json({
        success: false,
        message: "Chef Code already exists",
      });
    }

    const userExists = await Chef.findOne({
      user,
      isDeleted: false,
    });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already assigned as Chef",
      });
    }

    if (email) {
      const emailExists = await Chef.findOne({
        email: email.toLowerCase(),
        isDeleted: false,
      });

      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }
    }

    const chef = await Chef.create({
      restaurant,
      store,
      user,
      chefCode: chefCode.toUpperCase(),
      chefName,
      phone,
      email: email?.toLowerCase(),
      gender,
      designation,
      kitchenSection,
      specialization,
      shift,
      salary,
      joiningDate,
      profileImage,
      notes,
      createdBy: req.user?._id,
    });

    res.status(201).json({
      success: true,
      message: "Chef created successfully",
      data: chef,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =============================================
// Get All Chefs
// =============================================
exports.getAllChefs = async (req, res) => {
  try {
    const chefs = await Chef.find({
      isDeleted: false,
    })
      .populate("user", "name email")
      .populate("shift", "shiftName")
      .populate("restaurant", "restaurantName")
      .populate("store", "storeName")
      .sort({ chefName: 1 });

    res.status(200).json({
      success: true,
      count: chefs.length,
      data: chefs,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =============================================
// Get Chef By ID
// =============================================
exports.getChefById = async (req, res) => {
  try {
    const chef = await Chef.findOne({
      _id: req.params.id,
      isDeleted: false,
    })
      .populate("user")
      .populate("shift")
      .populate("assignedKOTs");

    if (!chef) {
      return res.status(404).json({
        success: false,
        message: "Chef not found",
      });
    }

    res.status(200).json({
      success: true,
      data: chef,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =============================================
// Update Chef
// =============================================
exports.updateChef = async (req, res) => {
  try {
    const chef = await Chef.findById(req.params.id);

    if (!chef || chef.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Chef not found",
      });
    }

    if (req.body.chefCode) {
      const exists = await Chef.findOne({
        chefCode: req.body.chefCode.toUpperCase(),
        _id: { $ne: req.params.id },
        isDeleted: false,
      });

      if (exists) {
        return res.status(400).json({
          success: false,
          message: "Chef Code already exists",
        });
      }

      req.body.chefCode = req.body.chefCode.toUpperCase();
    }

    if (req.body.email) {
      const emailExists = await Chef.findOne({
        email: req.body.email.toLowerCase(),
        _id: { $ne: req.params.id },
        isDeleted: false,
      });

      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }

      req.body.email = req.body.email.toLowerCase();
    }

    req.body.updatedBy = req.user?._id;

    const updated = await Chef.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Chef updated successfully",
      data: updated,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =============================================
// Delete Chef (Soft Delete)
// =============================================
exports.deleteChef = async (req, res) => {
  try {
    const chef = await Chef.findById(req.params.id);

    if (!chef || chef.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Chef not found",
      });
    }

    chef.isDeleted = true;
    chef.updatedBy = req.user?._id;

    await chef.save();

    res.status(200).json({
      success: true,
      message: "Chef deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =============================================
// Change Status
// =============================================
exports.changeChefStatus = async (req, res) => {
  try {
    const chef = await Chef.findById(req.params.id);

    if (!chef || chef.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Chef not found",
      });
    }

    chef.status = req.body.status;
    chef.updatedBy = req.user?._id;

    await chef.save();

    res.status(200).json({
      success: true,
      message: "Chef status updated",
      data: chef,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =============================================
// Change Availability
// =============================================
exports.changeAvailability = async (req, res) => {
  try {
    const chef = await Chef.findById(req.params.id);

    if (!chef || chef.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Chef not found",
      });
    }

    chef.isAvailable = !chef.isAvailable;
    chef.updatedBy = req.user?._id;

    await chef.save();

    res.status(200).json({
      success: true,
      message: "Availability updated",
      data: chef,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =============================================
// Dropdown
// =============================================
exports.getChefDropdown = async (req, res) => {
  try {
    const chefs = await Chef.find({
      isDeleted: false,
      status: "Active",
    })
      .select("_id chefName chefCode")
      .sort({ chefName: 1 });

    res.status(200).json({
      success: true,
      data: chefs,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =============================================
// Available Chefs
// =============================================
exports.getAvailableChefs = async (req, res) => {
  try {
    const chefs = await Chef.find({
      isDeleted: false,
      status: "Active",
      isAvailable: true,
    });

    res.status(200).json({
      success: true,
      data: chefs,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};