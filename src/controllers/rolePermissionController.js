const RolePermission = require("../models/rolePermissionModel");

/* =====================================================
   Create Role Permission
   POST /api/role-permissions
===================================================== */

exports.createRolePermission = async (req, res) => {
  try {
    const {
      restaurant,
      store,
      roleCode,
      roleName,
      description,
      permissions,
      isDefault,
      status,
    } = req.body;

    // Check duplicate role code
    const codeExists = await RolePermission.findOne({
      roleCode: roleCode.toUpperCase(),
    });

    if (codeExists) {
      return res.status(400).json({
        success: false,
        message: "Role code already exists.",
      });
    }

    // Check duplicate role name
    const nameExists = await RolePermission.findOne({
      roleName,
    });

    if (nameExists) {
      return res.status(400).json({
        success: false,
        message: "Role name already exists.",
      });
    }

    const rolePermission = await RolePermission.create({
      restaurant,
      store,
      roleCode: roleCode.toUpperCase(),
      roleName,
      description,
      permissions,
      isDefault,
      status,
      createdBy: req.user?.id,
    });

    res.status(201).json({
      success: true,
      message: "Role permission created successfully.",
      data: rolePermission,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =====================================================
   Get All Role Permissions
   GET /api/role-permissions
===================================================== */

exports.getRolePermissions = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const filter = {
      isDeleted: false,
    };

    const total = await RolePermission.countDocuments(filter);

    const data = await RolePermission.find(filter)
      .populate("restaurant", "restaurantName")
      .populate("store", "storeName")
      .populate("createdBy", "name")
      .populate("updatedBy", "name")
      .sort({ createdAt: -1 })
      .skip((page - 1) * Number(limit))
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      count: data.length,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* =====================================================
   Get Role Permission By Id
   GET /api/role-permissions/:id
===================================================== */

exports.getRolePermissionById = async (req, res) => {
  try {
    const role = await RolePermission.findOne({
      _id: req.params.id,
      isDeleted: false,
    })
      .populate("restaurant", "restaurantName")
      .populate("store", "storeName")
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email");

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role permission not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: role,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateRolePermission = async (req, res) => {
  try {
    const role = await RolePermission.findById(req.params.id);

    if (!role || role.isDeleted) {
      return res.status(404).json({
        success: false,

        message: "Role permission not found.",
      });
    }

    const {
      restaurant,

      store,

      roleCode,

      roleName,

      description,

      permissions,

      isDefault,

      status,
    } = req.body;

    // Duplicate Role Code

    if (roleCode) {
      const codeExists = await RolePermission.findOne({
        roleCode: roleCode.toUpperCase(),

        _id: { $ne: req.params.id },
      });

      if (codeExists) {
        return res.status(400).json({
          success: false,

          message: "Role code already exists.",
        });
      }

      role.roleCode = roleCode.toUpperCase();
    }

    // Duplicate Role Name

    if (roleName) {
      const nameExists = await RolePermission.findOne({
        roleName,

        _id: { $ne: req.params.id },
      });

      if (nameExists) {
        return res.status(400).json({
          success: false,

          message: "Role name already exists.",
        });
      }

      role.roleName = roleName;
    }

    if (restaurant !== undefined) role.restaurant = restaurant;

    if (store !== undefined) role.store = store;

    if (description !== undefined) role.description = description;

    if (permissions !== undefined) role.permissions = permissions;

    if (isDefault !== undefined) role.isDefault = isDefault;

    if (status !== undefined) role.status = status;

    role.updatedBy = req.user?.id;

    await role.save();

    res.status(200).json({
      success: true,

      message: "Role permission updated successfully.",

      data: role,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

/* =====================================================

   Update Role Permission Status

   PATCH /api/role-permissions/:id/status

===================================================== */

exports.updateRolePermissionStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!["Active", "Inactive"].includes(status)) {
      return res.status(400).json({
        success: false,

        message: "Invalid status.",
      });
    }

    const role = await RolePermission.findOne({
      _id: req.params.id,

      isDeleted: false,
    });

    if (!role) {
      return res.status(404).json({
        success: false,

        message: "Role permission not found.",
      });
    }

    role.status = status;

    role.updatedBy = req.user?.id;

    await role.save();

    res.status(200).json({
      success: true,

      message: "Status updated successfully.",

      data: role,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

/* =====================================================

   Soft Delete Role Permission

   DELETE /api/role-permissions/:id

===================================================== */

exports.deleteRolePermission = async (req, res) => {
  try {
    const role = await RolePermission.findOne({
      _id: req.params.id,

      isDeleted: false,
    });

    if (!role) {
      return res.status(404).json({
        success: false,

        message: "Role permission not found.",
      });
    }

    role.isDeleted = true;

    role.updatedBy = req.user?.id;

    await role.save();

    res.status(200).json({
      success: true,

      message: "Role permission deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

/* =====================================================

   Restore Role Permission

   PATCH /api/role-permissions/:id/restore

===================================================== */

exports.restoreRolePermission = async (req, res) => {
  try {
    const role = await RolePermission.findOne({
      _id: req.params.id,
      isDeleted: true,
    });
    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Deleted role permission not found.",
      });
    }
    role.isDeleted = false;
    role.updatedBy = req.user?.id;
    await role.save();
    res.status(200).json({
      success: true,
      message: "Role permission restored successfully.",
      data: role,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.addModulePermission = async (req, res) => {
  try {
    const role = await RolePermission.findOne({
      _id: req.params.id,

      isDeleted: false,
    });

    if (!role) {
      return res.status(404).json({
        success: false,

        message: "Role permission not found.",
      });
    }

    const {
      module,

      canView,

      canCreate,

      canEdit,

      canDelete,

      canApprove,

      canReject,

      canPrint,

      canExport,

      canImport,
    } = req.body;

    if (!module) {
      return res.status(400).json({
        success: false,

        message: "Module name is required.",
      });
    }

    const exists = role.permissions.find(
      (item) => item.module.toLowerCase() === module.toLowerCase(),
    );

    if (exists) {
      return res.status(400).json({
        success: false,

        message: "Module permission already exists.",
      });
    }

    role.permissions.push({
      module,

      canView,

      canCreate,

      canEdit,

      canDelete,

      canApprove,

      canReject,

      canPrint,

      canExport,

      canImport,
    });

    role.updatedBy = req.user?.id;

    await role.save();

    res.status(201).json({
      success: true,

      message: "Module permission added successfully.",

      data: role.permissions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

/* =====================================================

   Update Module Permission

   PUT /api/role-permissions/:id/modules/:module

===================================================== */

exports.updateModulePermission = async (req, res) => {
  try {
    const role = await RolePermission.findOne({
      _id: req.params.id,

      isDeleted: false,
    });

    if (!role) {
      return res.status(404).json({
        success: false,

        message: "Role permission not found.",
      });
    }

    const permission = role.permissions.find(
      (item) => item.module.toLowerCase() === req.params.module.toLowerCase(),
    );

    if (!permission) {
      return res.status(404).json({
        success: false,

        message: "Module permission not found.",
      });
    }

    Object.keys(req.body).forEach((key) => {
      permission[key] = req.body[key];
    });

    role.updatedBy = req.user?.id;

    await role.save();

    res.status(200).json({
      success: true,

      message: "Module permission updated successfully.",

      data: permission,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

/* =====================================================

   Remove Module Permission

   DELETE /api/role-permissions/:id/modules/:module

===================================================== */

exports.removeModulePermission = async (req, res) => {
  try {
    const role = await RolePermission.findOne({
      _id: req.params.id,

      isDeleted: false,
    });

    if (!role) {
      return res.status(404).json({
        success: false,

        message: "Role permission not found.",
      });
    }

    const index = role.permissions.findIndex(
      (item) => item.module.toLowerCase() === req.params.module.toLowerCase(),
    );

    if (index === -1) {
      return res.status(404).json({
        success: false,

        message: "Module permission not found.",
      });
    }

    role.permissions.splice(index, 1);

    role.updatedBy = req.user?.id;

    await role.save();

    res.status(200).json({
      success: true,

      message: "Module permission removed successfully.",

      data: role.permissions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

/* =====================================================

   Get Module Permissions

   GET /api/role-permissions/:id/modules

===================================================== */

exports.getModulePermissions = async (req, res) => {
  try {
    const role = await RolePermission.findOne({
      _id: req.params.id,

      isDeleted: false,
    }).select("roleCode roleName permissions");

    if (!role) {
      return res.status(404).json({
        success: false,

        message: "Role permission not found.",
      });
    }

    res.status(200).json({
      success: true,

      roleCode: role.roleCode,

      roleName: role.roleName,

      totalModules: role.permissions.length,

      data: role.permissions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

exports.searchRolePermissions = async (req, res) => {
  try {
    const {
      keyword = "",

      restaurant,

      store,

      status,

      isDefault,

      page = 1,

      limit = 10,
    } = req.query;

    const query = {
      isDeleted: false,
    };

    // Keyword Search

    if (keyword) {
      query.$or = [
        {
          roleCode: {
            $regex: keyword,

            $options: "i",
          },
        },

        {
          roleName: {
            $regex: keyword,

            $options: "i",
          },
        },

        {
          description: {
            $regex: keyword,

            $options: "i",
          },
        },
      ];
    }

    if (restaurant) {
      query.restaurant = restaurant;
    }

    if (store) {
      query.store = store;
    }

    if (status) {
      query.status = status;
    }

    if (isDefault !== undefined) {
      query.isDefault = isDefault === "true";
    }

    const total = await RolePermission.countDocuments(query);

    const data = await RolePermission.find(query)

      .populate("restaurant", "restaurantName")

      .populate("store", "storeName")

      .populate("createdBy", "name")

      .populate("updatedBy", "name")

      .sort({
        createdAt: -1,
      })

      .skip((Number(page) - 1) * Number(limit))

      .limit(Number(limit));

    res.status(200).json({
      success: true,

      total,

      page: Number(page),

      pages: Math.ceil(total / Number(limit)),

      count: data.length,

      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

/* =====================================================

   Active Role Permissions

   GET /api/role-permissions/reports/active

===================================================== */

exports.getActiveRolePermissions = async (req, res) => {
  try {
    const data = await RolePermission.find({
      status: "Active",

      isDeleted: false,
    })

      .populate("restaurant", "restaurantName")

      .populate("store", "storeName")

      .sort({
        roleName: 1,
      });

    res.status(200).json({
      success: true,

      count: data.length,

      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

/* =====================================================

   Inactive Role Permissions

   GET /api/role-permissions/reports/inactive

===================================================== */

exports.getInactiveRolePermissions = async (req, res) => {
  try {
    const data = await RolePermission.find({
      status: "Inactive",

      isDeleted: false,
    })

      .populate("restaurant", "restaurantName")

      .populate("store", "storeName")

      .sort({
        roleName: 1,
      });

    res.status(200).json({
      success: true,

      count: data.length,

      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

exports.getDeletedRolePermissions = async (req, res) => {
  try {
    const {
      page = 1,

      limit = 10,

      search = "",
    } = req.query;

    const filter = {
      isDeleted: true,
    };

    if (search) {
      filter.$or = [
        {
          roleName: {
            $regex: search,

            $options: "i",
          },
        },

        {
          roleCode: {
            $regex: search,

            $options: "i",
          },
        },
      ];
    }

    const total = await RolePermission.countDocuments(filter);

    const roles = await RolePermission.find(filter)

      .populate("restaurant", "restaurantName")

      .populate("store", "storeName")

      .populate("createdBy", "name")

      .populate("updatedBy", "name")

      .sort({
        updatedAt: -1,
      })

      .skip((page - 1) * limit)

      .limit(Number(limit));

    return res.status(200).json({
      success: true,

      count: roles.length,

      total,

      currentPage: Number(page),

      totalPages: Math.ceil(total / limit),

      data: roles,
    });
  } catch (error) {
    console.error("getDeletedRolePermissions Error:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to fetch deleted role permissions.",

      error: error.message,
    });
  }
};

/* ===========================================================

   getRolePermissionSummary()

=========================================================== */

exports.getRolePermissionSummary = async (req, res) => {
  try {
    const summary = await RolePermission.aggregate([
      {
        $group: {
          _id: null,

          totalRoles: {
            $sum: 1,
          },

          activeRoles: {
            $sum: {
              $cond: [
                {
                  $eq: ["$status", "Active"],
                },

                1,

                0,
              ],
            },
          },

          inactiveRoles: {
            $sum: {
              $cond: [
                {
                  $eq: ["$status", "Inactive"],
                },

                1,

                0,
              ],
            },
          },

          deletedRoles: {
            $sum: {
              $cond: ["$isDeleted", 1, 0],
            },
          },

          defaultRoles: {
            $sum: {
              $cond: ["$isDefault", 1, 0],
            },
          },

          totalPermissions: {
            $sum: {
              $size: "$permissions",
            },
          },
        },
      },

      {
        $project: {
          _id: 0,

          totalRoles: 1,

          activeRoles: 1,

          inactiveRoles: 1,

          deletedRoles: 1,

          defaultRoles: 1,

          totalPermissions: 1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,

      data:
        summary.length > 0
          ? summary[0]
          : {
              totalRoles: 0,

              activeRoles: 0,

              inactiveRoles: 0,

              deletedRoles: 0,

              defaultRoles: 0,

              totalPermissions: 0,
            },
    });
  } catch (error) {
    console.error("getRolePermissionSummary Error:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to fetch role permission summary.",

      error: error.message,
    });
  }
};

exports.getRestaurantRolePermissions = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const {
      page = 1,

      limit = 10,

      status,

      search = "",
    } = req.query;

    const filter = {
      restaurant: restaurantId,

      isDeleted: false,
    };

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        {
          roleName: {
            $regex: search,

            $options: "i",
          },
        },

        {
          roleCode: {
            $regex: search,

            $options: "i",
          },
        },
      ];
    }

    const total = await RolePermission.countDocuments(filter);

    const roles = await RolePermission.find(filter)

      .populate("restaurant", "restaurantName restaurantCode")

      .populate("store", "storeName storeCode")

      .populate("createdBy", "name email")

      .populate("updatedBy", "name email")

      .sort({
        roleName: 1,
      })

      .skip((page - 1) * Number(limit))

      .limit(Number(limit));

    return res.status(200).json({
      success: true,

      message: "Restaurant role permissions fetched successfully.",

      count: roles.length,

      total,

      currentPage: Number(page),

      totalPages: Math.ceil(total / Number(limit)),

      data: roles,
    });
  } catch (error) {
    console.error("getRestaurantRolePermissions Error:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to fetch restaurant role permissions.",

      error: error.message,
    });
  }
};

/* ===========================================================

   getStoreRolePermissions()

=========================================================== */

exports.getStoreRolePermissions = async (req, res) => {
  try {
    const { storeId } = req.params;

    const {
      page = 1,

      limit = 10,

      status,

      search = "",
    } = req.query;

    const filter = {
      store: storeId,

      isDeleted: false,
    };

    if (status) {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        {
          roleName: {
            $regex: search,

            $options: "i",
          },
        },

        {
          roleCode: {
            $regex: search,

            $options: "i",
          },
        },
      ];
    }

    const total = await RolePermission.countDocuments(filter);

    const roles = await RolePermission.find(filter)

      .populate("restaurant", "restaurantName restaurantCode")

      .populate("store", "storeName storeCode")

      .populate("createdBy", "name email")

      .populate("updatedBy", "name email")

      .sort({
        roleName: 1,
      })

      .skip((page - 1) * Number(limit))

      .limit(Number(limit));

    return res.status(200).json({
      success: true,

      message: "Store role permissions fetched successfully.",

      count: roles.length,

      total,

      currentPage: Number(page),

      totalPages: Math.ceil(total / Number(limit)),

      data: roles,
    });
  } catch (error) {
    console.error("getStoreRolePermissions Error:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to fetch store role permissions.",

      error: error.message,
    });
  }
};
