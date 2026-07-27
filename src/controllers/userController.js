const User = require("../models/User");

/* ==========================================================
   Create User
========================================================== */

exports.createUser = async (req, res) => {
  try {
    const {
      restaurant,
      store,
      role,
      employeeCode,
      firstName,
      lastName,
      gender,
      dob,
      phone,
      alternatePhone,
      email,
      username,
      password,
      profileImage,
      address,
      city,
      state,
      pincode,
      joiningDate,
      designation,
      salary,
      shift,
    } = req.body;

    // Required validation
    if (
      !restaurant ||
      !role ||
      !firstName ||
      !phone ||
      !username ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Restaurant, Role, First Name, Phone, Username and Password are required.",
      });
    }

    // Employee Code
    if (employeeCode) {
      const employeeExists = await User.findOne({
        employeeCode,
      });

      if (employeeExists) {
        return res.status(400).json({
          success: false,
          message: "Employee code already exists.",
        });
      }
    }

    // Phone
    const phoneExists = await User.findOne({
      phone,
    });

    if (phoneExists) {
      return res.status(400).json({
        success: false,
        message: "Phone number already exists.",
      });
    }

    // Username
    const usernameExists = await User.findOne({
      username: username.toLowerCase(),
    });

    if (usernameExists) {
      return res.status(400).json({
        success: false,
        message: "Username already exists.",
      });
    }

    // Email
    if (email) {
      const emailExists = await User.findOne({
        email: email.toLowerCase(),
      });

      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: "Email already exists.",
        });
      }
    }

    const user = await User.create({
      restaurant,
      store,
      role,
      employeeCode,
      firstName,
      lastName,
      gender,
      dob,
      phone,
      alternatePhone,
      email,
      username,
      password,
      profileImage,
      address,
      city,
      state,
      pincode,
      joiningDate,
      designation,
      salary,
      shift,
      createdBy: req.user?.id,
    });

    const result = user.toObject();
    delete result.password;

    res.status(201).json({
      success: true,
      message: "User created successfully.",
      data: result,
    });
  } catch (error) {
    console.error("createUser:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create user.",
      error: error.message,
    });
  }
};

/* ==========================================================
   Get Users
========================================================== */

exports.getUsers = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const filter = {
      isDeleted: false,
    };

    if (req.query.restaurant) filter.restaurant = req.query.restaurant;

    if (req.query.store) filter.store = req.query.store;

    if (req.query.role) filter.role = req.query.role;

    if (req.query.status) filter.status = req.query.status;

    const totalRecords = await User.countDocuments(filter);

    const users = await User.find(filter)
      .populate("restaurant", "restaurantName")
      .populate("store", "storeName")
      .populate("role", "roleName roleCode")
      .populate("shift", "shiftName")
      .select("-password")
      .sort({
        createdAt: -1,
      })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      totalRecords,
      currentPage: page,
      totalPages: Math.ceil(totalRecords / limit),
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error("getUsers:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch users.",
      error: error.message,
    });
  }
};

/* ==========================================================
   Get User By Id
========================================================== */

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate("restaurant", "restaurantName")
      .populate("store", "storeName")
      .populate("role", "roleName roleCode permissions")
      .populate("shift", "shiftName startTime endTime")
      .populate("createdBy", "fullName")
      .populate("updatedBy", "fullName")
      .select("-password");

    if (!user || user.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("getUserById:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch user.",
      error: error.message,
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);

    if (!user || user.isDeleted) {
      return res.status(404).json({
        success: false,

        message: "User not found.",
      });
    }

    const {
      restaurant,

      store,

      role,

      employeeCode,

      firstName,

      lastName,

      gender,

      dob,

      phone,

      alternatePhone,

      email,

      username,

      profileImage,

      address,

      city,

      state,

      pincode,

      joiningDate,

      designation,

      salary,

      shift,
    } = req.body;

    // Employee Code

    if (employeeCode && employeeCode !== user.employeeCode) {
      const exists = await User.findOne({
        employeeCode,

        _id: { $ne: id },
      });

      if (exists) {
        return res.status(400).json({
          success: false,

          message: "Employee code already exists.",
        });
      }
    }

    // Phone

    if (phone && phone !== user.phone) {
      const exists = await User.findOne({
        phone,

        _id: { $ne: id },
      });

      if (exists) {
        return res.status(400).json({
          success: false,

          message: "Phone number already exists.",
        });
      }
    }

    // Username

    if (username && username !== user.username) {
      const exists = await User.findOne({
        username: username.toLowerCase(),

        _id: { $ne: id },
      });

      if (exists) {
        return res.status(400).json({
          success: false,

          message: "Username already exists.",
        });
      }
    }

    // Email

    if (email && email !== user.email) {
      const exists = await User.findOne({
        email: email.toLowerCase(),

        _id: { $ne: id },
      });

      if (exists) {
        return res.status(400).json({
          success: false,

          message: "Email already exists.",
        });
      }
    }

    user.restaurant = restaurant ?? user.restaurant;

    user.store = store ?? user.store;

    user.role = role ?? user.role;

    user.employeeCode = employeeCode ?? user.employeeCode;

    user.firstName = firstName ?? user.firstName;

    user.lastName = lastName ?? user.lastName;

    user.gender = gender ?? user.gender;

    user.dob = dob ?? user.dob;

    user.phone = phone ?? user.phone;

    user.alternatePhone = alternatePhone ?? user.alternatePhone;

    user.email = email ?? user.email;

    user.username = username ? username.toLowerCase() : user.username;

    user.profileImage = profileImage ?? user.profileImage;

    user.address = address ?? user.address;

    user.city = city ?? user.city;

    user.state = state ?? user.state;

    user.pincode = pincode ?? user.pincode;

    user.joiningDate = joiningDate ?? user.joiningDate;

    user.designation = designation ?? user.designation;

    user.salary = salary ?? user.salary;

    user.shift = shift ?? user.shift;

    user.updatedBy = req.user?.id;

    await user.save();

    const result = user.toObject();

    delete result.password;

    res.status(200).json({
      success: true,

      message: "User updated successfully.",

      data: result,
    });
  } catch (error) {
    console.error("updateUser:", error);

    res.status(500).json({
      success: false,

      message: "Failed to update user.",

      error: error.message,
    });
  }
};

/* ==========================================================

   Soft Delete User

========================================================== */

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || user.isDeleted) {
      return res.status(404).json({
        success: false,

        message: "User not found.",
      });
    }

    user.isDeleted = true;

    user.updatedBy = req.user?.id;

    await user.save();

    res.status(200).json({
      success: true,

      message: "User deleted successfully.",
    });
  } catch (error) {
    console.error("deleteUser:", error);

    res.status(500).json({
      success: false,

      message: "Failed to delete user.",

      error: error.message,
    });
  }
};

/* ==========================================================

   Restore User

========================================================== */

exports.restoreUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,

        message: "User not found.",
      });
    }

    user.isDeleted = false;

    user.updatedBy = req.user?.id;

    await user.save();

    res.status(200).json({
      success: true,

      message: "User restored successfully.",

      data: user,
    });
  } catch (error) {
    console.error("restoreUser:", error);

    res.status(500).json({
      success: false,

      message: "Failed to restore user.",

      error: error.message,
    });
  }
};

/* ==========================================================

   Update User Status

========================================================== */

exports.updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Active", "Inactive"].includes(status)) {
      return res.status(400).json({
        success: false,

        message: "Invalid status.",
      });
    }

    const user = await User.findById(req.params.id);

    if (!user || user.isDeleted) {
      return res.status(404).json({
        success: false,

        message: "User not found.",
      });
    }

    user.status = status;

    user.updatedBy = req.user?.id;

    await user.save();

    res.status(200).json({
      success: true,

      message: "User status updated successfully.",

      data: user,
    });
  } catch (error) {
    console.error("updateUserStatus:", error);

    res.status(500).json({
      success: false,

      message: "Failed to update status.",

      error: error.message,
    });
  }
};

/* ==========================================================

   Activate User

========================================================== */

exports.activateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,

      {
        status: "Active",

        updatedBy: req.user?.id,
      },

      { new: true },
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,

        message: "User not found.",
      });
    }

    res.status(200).json({
      success: true,

      message: "User activated successfully.",

      data: user,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,

      message: "Activation failed.",
    });
  }
};

/* ==========================================================

   Deactivate User

========================================================== */

exports.deactivateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,

      {
        status: "Inactive",

        updatedBy: req.user?.id,
      },

      { new: true },
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,

        message: "User not found.",
      });
    }

    res.status(200).json({
      success: true,

      message: "User deactivated successfully.",

      data: user,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,

      message: "Deactivation failed.",
    });
  }
};

/* ==========================================================

   Block User

========================================================== */

exports.blockUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,

      {
        isBlocked: true,

        updatedBy: req.user?.id,
      },

      { new: true },
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,

        message: "User not found.",
      });
    }

    res.status(200).json({
      success: true,

      message: "User blocked successfully.",

      data: user,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,

      message: "Failed to block user.",
    });
  }
};

/* ==========================================================

   Unblock User

========================================================== */

exports.unblockUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,

      {
        isBlocked: false,

        loginAttempts: 0,

        updatedBy: req.user?.id,
      },

      { new: true },
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,

        message: "User not found.",
      });
    }

    res.status(200).json({
      success: true,

      message: "User unblocked successfully.",

      data: user,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,

      message: "Failed to unblock user.",
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;

    const user = await User.findById(userId).select("-password");

    if (!user || user.isDeleted) {
      return res.status(404).json({
        success: false,

        message: "User not found.",
      });
    }

    const {
      firstName,

      lastName,

      gender,

      dob,

      phone,

      alternatePhone,

      email,

      address,

      city,

      state,

      pincode,

      designation,
    } = req.body;

    // Check Phone

    if (phone && phone !== user.phone) {
      const phoneExists = await User.findOne({
        phone,

        _id: { $ne: userId },
      });

      if (phoneExists) {
        return res.status(400).json({
          success: false,

          message: "Phone number already exists.",
        });
      }

      user.phone = phone;
    }

    // Check Email

    if (email && email !== user.email) {
      const emailExists = await User.findOne({
        email: email.toLowerCase(),

        _id: { $ne: userId },
      });

      if (emailExists) {
        return res.status(400).json({
          success: false,

          message: "Email already exists.",
        });
      }

      user.email = email.toLowerCase();
    }

    if (firstName !== undefined) user.firstName = firstName;

    if (lastName !== undefined) user.lastName = lastName;

    if (gender !== undefined) user.gender = gender;

    if (dob !== undefined) user.dob = dob;

    if (alternatePhone !== undefined) user.alternatePhone = alternatePhone;

    if (address !== undefined) user.address = address;

    if (city !== undefined) user.city = city;

    if (state !== undefined) user.state = state;

    if (pincode !== undefined) user.pincode = pincode;

    if (designation !== undefined) user.designation = designation;

    user.updatedBy = userId;

    await user.save();

    const result = user.toObject();

    delete result.password;

    res.status(200).json({
      success: true,

      message: "Profile updated successfully.",

      data: result,
    });
  } catch (error) {
    console.error("updateProfile:", error);

    res.status(500).json({
      success: false,

      message: "Failed to update profile.",

      error: error.message,
    });
  }
};

/* ==========================================================

   Upload Profile Image

========================================================== */

exports.uploadProfileImage = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;

    const user = await User.findById(userId);

    if (!user || user.isDeleted) {
      return res.status(404).json({
        success: false,

        message: "User not found.",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,

        message: "Please upload a profile image.",
      });
    }

    // If using multer

    user.profileImage = req.file.path;

    user.updatedBy = userId;

    await user.save();

    res.status(200).json({
      success: true,

      message: "Profile image uploaded successfully.",

      profileImage: user.profileImage,
    });
  } catch (error) {
    console.error("uploadProfileImage:", error);

    res.status(500).json({
      success: false,

      message: "Failed to upload profile image.",

      error: error.message,
    });
  }
};

/* ==========================================================

   Remove Profile Image

========================================================== */

exports.removeProfileImage = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;

    const user = await User.findById(userId);

    if (!user || user.isDeleted) {
      return res.status(404).json({
        success: false,

        message: "User not found.",
      });
    }

    user.profileImage = "";

    user.updatedBy = userId;

    await user.save();

    res.status(200).json({
      success: true,

      message: "Profile image removed successfully.",
    });
  } catch (error) {
    console.error("removeProfileImage:", error);

    res.status(500).json({
      success: false,

      message: "Failed to remove profile image.",

      error: error.message,
    });
  }
};

/* ==========================================================

   Get Current User Profile

========================================================== */

exports.getCurrentUserProfile = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId;

    const user = await User.findById(userId)

      .populate("restaurant", "restaurantName restaurantCode")

      .populate("store", "storeName storeCode")

      .populate("role", "roleName roleCode permissions")

      .populate("shift", "shiftName startTime endTime")

      .select("-password");

    if (!user || user.isDeleted) {
      return res.status(404).json({
        success: false,

        message: "User not found.",
      });
    }

    res.status(200).json({
      success: true,

      data: user,
    });
  } catch (error) {
    console.error("getCurrentUserProfile:", error);

    res.status(500).json({
      success: false,

      message: "Failed to fetch profile.",

      error: error.message,
    });
  }
};

exports.searchUsers = async (req, res) => {
  try {
    const {
      keyword,

      restaurant,

      store,

      role,

      status,

      isOnline,

      page = 1,

      limit = 10,
    } = req.query;

    const filter = {
      isDeleted: false,
    };

    if (keyword) {
      filter.$or = [
        { firstName: { $regex: keyword, $options: "i" } },

        { lastName: { $regex: keyword, $options: "i" } },

        { fullName: { $regex: keyword, $options: "i" } },

        { employeeCode: { $regex: keyword, $options: "i" } },

        { username: { $regex: keyword, $options: "i" } },

        { phone: { $regex: keyword, $options: "i" } },

        { email: { $regex: keyword, $options: "i" } },
      ];
    }

    if (restaurant) filter.restaurant = restaurant;

    if (store) filter.store = store;

    if (role) filter.role = role;

    if (status) filter.status = status;

    if (isOnline !== undefined) {
      filter.isOnline = isOnline === "true";
    }

    const totalRecords = await User.countDocuments(filter);

    const users = await User.find(filter)

      .populate("restaurant", "restaurantName")

      .populate("store", "storeName")

      .populate("role", "roleName roleCode")

      .populate("shift", "shiftName")

      .select("-password")

      .sort({ createdAt: -1 })

      .skip((Number(page) - 1) * Number(limit))

      .limit(Number(limit));

    res.status(200).json({
      success: true,

      totalRecords,

      currentPage: Number(page),

      totalPages: Math.ceil(totalRecords / Number(limit)),

      count: users.length,

      data: users,
    });
  } catch (error) {
    console.error("searchUsers:", error);

    res.status(500).json({
      success: false,

      message: "Failed to search users.",

      error: error.message,
    });
  }
};

/* ==========================================================

   Get Active Users

========================================================== */

exports.getActiveUsers = async (req, res) => {
  try {
    const users = await User.find({
      status: "Active",

      isDeleted: false,
    })

      .populate("restaurant", "restaurantName")

      .populate("store", "storeName")

      .populate("role", "roleName")

      .populate("shift", "shiftName")

      .select("-password")

      .sort({ fullName: 1 });

    res.status(200).json({
      success: true,

      count: users.length,

      data: users,
    });
  } catch (error) {
    console.error("getActiveUsers:", error);

    res.status(500).json({
      success: false,

      message: "Failed to fetch active users.",

      error: error.message,
    });
  }
};

/* ==========================================================

   Get Inactive Users

========================================================== */

exports.getInactiveUsers = async (req, res) => {
  try {
    const users = await User.find({
      status: "Inactive",

      isDeleted: false,
    })

      .populate("restaurant", "restaurantName")

      .populate("store", "storeName")

      .populate("role", "roleName")

      .populate("shift", "shiftName")

      .select("-password")

      .sort({ fullName: 1 });

    res.status(200).json({
      success: true,

      count: users.length,

      data: users,
    });
  } catch (error) {
    console.error("getInactiveUsers:", error);

    res.status(500).json({
      success: false,

      message: "Failed to fetch inactive users.",

      error: error.message,
    });
  }
};

/* ==========================================================

   Get Blocked Users

========================================================== */

exports.getBlockedUsers = async (req, res) => {
  try {
    const users = await User.find({
      isBlocked: true,

      isDeleted: false,
    })

      .populate("restaurant", "restaurantName")

      .populate("store", "storeName")

      .populate("role", "roleName")

      .populate("shift", "shiftName")

      .select("-password")

      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,

      count: users.length,

      data: users,
    });
  } catch (error) {
    console.error("getBlockedUsers:", error);

    res.status(500).json({
      success: false,

      message: "Failed to fetch blocked users.",

      error: error.message,
    });
  }
};

exports.getDeletedUsers = async (req, res) => {
  try {
    const users = await User.find({
      isDeleted: true,
    })

      .populate("restaurant", "restaurantName")

      .populate("store", "storeName")

      .populate("role", "roleName roleCode")

      .populate("shift", "shiftName")

      .select("-password")

      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,

      count: users.length,

      data: users,
    });
  } catch (error) {
    console.error("getDeletedUsers:", error);

    res.status(500).json({
      success: false,

      message: "Failed to fetch deleted users.",

      error: error.message,
    });
  }
};

/* ==========================================================

   Get Online Users

========================================================== */

exports.getOnlineUsers = async (req, res) => {
  try {
    const users = await User.find({
      isOnline: true,

      isDeleted: false,
    })

      .populate("restaurant", "restaurantName")

      .populate("store", "storeName")

      .populate("role", "roleName roleCode")

      .populate("shift", "shiftName")

      .select("-password")

      .sort({ lastLogin: -1 });

    res.status(200).json({
      success: true,

      count: users.length,

      data: users,
    });
  } catch (error) {
    console.error("getOnlineUsers:", error);

    res.status(500).json({
      success: false,

      message: "Failed to fetch online users.",

      error: error.message,
    });
  }
};

/* ==========================================================

   Get Offline Users

========================================================== */

exports.getOfflineUsers = async (req, res) => {
  try {
    const users = await User.find({
      isOnline: false,

      isDeleted: false,
    })

      .populate("restaurant", "restaurantName")

      .populate("store", "storeName")

      .populate("role", "roleName roleCode")

      .populate("shift", "shiftName")

      .select("-password")

      .sort({ fullName: 1 });

    res.status(200).json({
      success: true,

      count: users.length,

      data: users,
    });
  } catch (error) {
    console.error("getOfflineUsers:", error);

    res.status(500).json({
      success: false,

      message: "Failed to fetch offline users.",

      error: error.message,
    });
  }
};

/* ==========================================================

   Get Restaurant Users

========================================================== */

exports.getRestaurantUsers = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const users = await User.find({
      restaurant: restaurantId,

      isDeleted: false,
    })

      .populate("restaurant", "restaurantName")

      .populate("store", "storeName")

      .populate("role", "roleName roleCode")

      .populate("shift", "shiftName")

      .select("-password")

      .sort({ fullName: 1 });

    res.status(200).json({
      success: true,

      count: users.length,

      data: users,
    });
  } catch (error) {
    console.error("getRestaurantUsers:", error);

    res.status(500).json({
      success: false,

      message: "Failed to fetch restaurant users.",

      error: error.message,
    });
  }
};

exports.getStoreUsers = async (req, res) => {
  try {
    const { storeId } = req.params;

    const users = await User.find({
      store: storeId,

      isDeleted: false,
    })

      .populate("restaurant", "restaurantName")

      .populate("store", "storeName storeCode")

      .populate("role", "roleName roleCode")

      .populate("shift", "shiftName startTime endTime")

      .select("-password")

      .sort({ fullName: 1 });

    res.status(200).json({
      success: true,

      count: users.length,

      data: users,
    });
  } catch (error) {
    console.error("getStoreUsers:", error);

    res.status(500).json({
      success: false,

      message: "Failed to fetch store users.",

      error: error.message,
    });
  }
};

/* ==========================================================

   Get Role Users

========================================================== */

exports.getRoleUsers = async (req, res) => {
  try {
    const { roleId } = req.params;

    const users = await User.find({
      role: roleId,

      isDeleted: false,
    })

      .populate("restaurant", "restaurantName")

      .populate("store", "storeName storeCode")

      .populate("role", "roleName roleCode")

      .populate("shift", "shiftName startTime endTime")

      .select("-password")

      .sort({ fullName: 1 });

    res.status(200).json({
      success: true,

      count: users.length,

      data: users,
    });
  } catch (error) {
    console.error("getRoleUsers:", error);

    res.status(500).json({
      success: false,

      message: "Failed to fetch role users.",

      error: error.message,
    });
  }
};

/* ==========================================================

   Get Shift Users

========================================================== */

exports.getShiftUsers = async (req, res) => {
  try {
    const { shiftId } = req.params;

    const users = await User.find({
      shift: shiftId,

      isDeleted: false,
    })

      .populate("restaurant", "restaurantName")

      .populate("store", "storeName storeCode")

      .populate("role", "roleName roleCode")

      .populate("shift", "shiftName startTime endTime")

      .select("-password")

      .sort({ fullName: 1 });

    res.status(200).json({
      success: true,

      count: users.length,

      data: users,
    });
  } catch (error) {
    console.error("getShiftUsers:", error);

    res.status(500).json({
      success: false,

      message: "Failed to fetch shift users.",

      error: error.message,
    });
  }
};

exports.getUserSummary = async (req, res) => {
  try {
    const filter = {};

    if (req.query.restaurant) filter.restaurant = req.query.restaurant;

    if (req.query.store) filter.store = req.query.store;

    const [
      totalUsers,

      activeUsers,

      inactiveUsers,

      blockedUsers,

      onlineUsers,

      offlineUsers,

      deletedUsers,

      maleUsers,

      femaleUsers,

      otherUsers,

      totalSalary,

      averageSalary,
    ] = await Promise.all([
      User.countDocuments({
        ...filter,

        isDeleted: false,
      }),

      User.countDocuments({
        ...filter,

        status: "Active",

        isDeleted: false,
      }),

      User.countDocuments({
        ...filter,

        status: "Inactive",

        isDeleted: false,
      }),

      User.countDocuments({
        ...filter,

        isBlocked: true,

        isDeleted: false,
      }),

      User.countDocuments({
        ...filter,

        isOnline: true,

        isDeleted: false,
      }),

      User.countDocuments({
        ...filter,

        isOnline: false,

        isDeleted: false,
      }),

      User.countDocuments({
        ...filter,

        isDeleted: true,
      }),

      User.countDocuments({
        ...filter,

        gender: "Male",

        isDeleted: false,
      }),

      User.countDocuments({
        ...filter,

        gender: "Female",

        isDeleted: false,
      }),

      User.countDocuments({
        ...filter,

        gender: "Other",

        isDeleted: false,
      }),

      User.aggregate([
        {
          $match: {
            ...filter,

            isDeleted: false,
          },
        },

        {
          $group: {
            _id: null,

            total: {
              $sum: "$salary",
            },
          },
        },
      ]),

      User.aggregate([
        {
          $match: {
            ...filter,

            isDeleted: false,
          },
        },

        {
          $group: {
            _id: null,

            average: {
              $avg: "$salary",
            },
          },
        },
      ]),
    ]);

    res.status(200).json({
      success: true,

      data: {
        totalUsers,

        activeUsers,

        inactiveUsers,

        blockedUsers,

        onlineUsers,

        offlineUsers,

        deletedUsers,

        maleUsers,

        femaleUsers,

        otherUsers,

        totalSalary: totalSalary.length > 0 ? totalSalary[0].total : 0,

        averageSalary:
          averageSalary.length > 0
            ? Number(averageSalary[0].average.toFixed(2))
            : 0,
      },
    });
  } catch (error) {
    console.error("getUserSummary:", error);

    res.status(500).json({
      success: false,

      message: "Failed to fetch user summary.",

      error: error.message,
    });
  }
};

/* ==========================================================

   Get User Analytics

========================================================== */

exports.getUserAnalytics = async (req, res) => {
  try {
    const filter = {
      isDeleted: false,
    };

    if (req.query.restaurant) filter.restaurant = req.query.restaurant;

    if (req.query.store) filter.store = req.query.store;

    const [
      usersByRole,

      usersByStore,

      usersByRestaurant,

      monthlyJoining,

      designationWise,

      genderWise,

      latestUsers,
    ] = await Promise.all([
      User.aggregate([
        {
          $match: filter,
        },

        {
          $group: {
            _id: "$role",

            totalUsers: {
              $sum: 1,
            },
          },
        },

        {
          $lookup: {
            from: "rolepermissions",

            localField: "_id",

            foreignField: "_id",

            as: "role",
          },
        },

        {
          $unwind: {
            path: "$role",

            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $project: {
            _id: 0,

            roleName: "$role.roleName",

            totalUsers: 1,
          },
        },
      ]),

      User.aggregate([
        {
          $match: filter,
        },

        {
          $group: {
            _id: "$store",

            totalUsers: {
              $sum: 1,
            },
          },
        },

        {
          $lookup: {
            from: "stores",

            localField: "_id",

            foreignField: "_id",

            as: "store",
          },
        },

        {
          $unwind: {
            path: "$store",

            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $project: {
            _id: 0,

            storeName: "$store.storeName",

            totalUsers: 1,
          },
        },
      ]),

      User.aggregate([
        {
          $match: filter,
        },

        {
          $group: {
            _id: "$restaurant",

            totalUsers: {
              $sum: 1,
            },
          },
        },

        {
          $lookup: {
            from: "restaurants",

            localField: "_id",

            foreignField: "_id",

            as: "restaurant",
          },
        },

        {
          $unwind: {
            path: "$restaurant",

            preserveNullAndEmptyArrays: true,
          },
        },

        {
          $project: {
            _id: 0,

            restaurantName: "$restaurant.restaurantName",

            totalUsers: 1,
          },
        },
      ]),

      User.aggregate([
        {
          $match: filter,
        },

        {
          $group: {
            _id: {
              year: {
                $year: "$joiningDate",
              },

              month: {
                $month: "$joiningDate",
              },
            },

            totalUsers: {
              $sum: 1,
            },
          },
        },

        {
          $sort: {
            "_id.year": 1,

            "_id.month": 1,
          },
        },
      ]),

      User.aggregate([
        {
          $match: filter,
        },

        {
          $group: {
            _id: "$designation",

            totalUsers: {
              $sum: 1,
            },
          },
        },

        {
          $sort: {
            totalUsers: -1,
          },
        },
      ]),

      User.aggregate([
        {
          $match: filter,
        },

        {
          $group: {
            _id: "$gender",

            totalUsers: {
              $sum: 1,
            },
          },
        },
      ]),

      User.find(filter)

        .select("-password")

        .populate("role", "roleName")

        .populate("store", "storeName")

        .sort({
          createdAt: -1,
        })

        .limit(10),
    ]);

    res.status(200).json({
      success: true,

      data: {
        usersByRole,

        usersByStore,

        usersByRestaurant,

        monthlyJoining,

        designationWise,

        genderWise,

        latestUsers,
      },
    });
  } catch (error) {
    console.error("getUserAnalytics:", error);

    res.status(500).json({
      success: false,

      message: "Failed to fetch user analytics.",

      error: error.message,
    });
  }
};
