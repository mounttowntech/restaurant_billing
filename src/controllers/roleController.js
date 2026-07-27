const Role = require("../models/Role");

/* ==========================================================
   createRole()
========================================================== */

exports.createRole = async (req, res) => {
  try {
    const { roleName, permissions, status } = req.body;

    if (!roleName) {
      return res.status(400).json({
        success: false,
        message: "Role name is required.",
      });
    }

    const existingRole = await Role.findOne({
      roleName: roleName.trim(),
    });

    if (existingRole) {
      return res.status(409).json({
        success: false,
        message: "Role already exists.",
      });
    }

    const role = await Role.create({
      roleName: roleName.trim(),
      permissions: permissions || [],
      status: status || "active",
    });

    return res.status(201).json({
      success: true,
      message: "Role created successfully.",
      data: role,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
   getRoles()
========================================================== */

exports.getRoles = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status,
      sortBy = "createdAt",
      order = "desc",
    } = req.query;

    const filter = {};

    if (search) {
      filter.roleName = {
        $regex: search,
        $options: "i",
      };
    }

    if (status) {
      filter.status = status;
    }

    const total = await Role.countDocuments(filter);

    const roles = await Role.find(filter)
      .sort({
        [sortBy]: order === "asc" ? 1 : -1,
      })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      totalRecords: total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      count: roles.length,
      data: roles,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
   getRoleById()
========================================================== */

exports.getRoleById = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await Role.findById(id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: role,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateRole = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      roleName,

      permissions,

      status,
    } = req.body;

    const role = await Role.findById(id);

    if (!role) {
      return res.status(404).json({
        success: false,

        message: "Role not found.",
      });
    }

    // Check duplicate role name

    if (roleName) {
      const existingRole = await Role.findOne({
        roleName: roleName.trim(),

        _id: { $ne: id },
      });

      if (existingRole) {
        return res.status(409).json({
          success: false,

          message: "Role name already exists.",
        });
      }

      role.roleName = roleName.trim();
    }

    if (permissions !== undefined) {
      role.permissions = permissions;
    }

    if (status) {
      role.status = status;
    }

    await role.save();

    return res.status(200).json({
      success: true,

      message: "Role updated successfully.",

      data: role,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

/* ==========================================================

   updateRoleStatus()

========================================================== */

exports.updateRoleStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const { status } = req.body;

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({
        success: false,

        message: "Invalid status.",
      });
    }

    const role = await Role.findById(id);

    if (!role) {
      return res.status(404).json({
        success: false,

        message: "Role not found.",
      });
    }

    role.status = status;

    await role.save();

    return res.status(200).json({
      success: true,

      message: `Role ${status} successfully.`,

      data: role,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

exports.deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await Role.findById(id);
    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found.",
      });
    }
    await Role.findByIdAndDelete(id);
    return res.status(200).json({
      success: true,
      message: "Role deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.addPermission = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      module,

      canView,

      canCreate,

      canEdit,

      canDelete,

      canPrint,

      canExport,
    } = req.body;

    const role = await Role.findById(id);

    if (!role) {
      return res.status(404).json({
        success: false,

        message: "Role not found.",
      });
    }

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
      return res.status(409).json({
        success: false,

        message: "Permission already exists for this module.",
      });
    }

    role.permissions.push({
      module,

      canView: canView || false,

      canCreate: canCreate || false,

      canEdit: canEdit || false,

      canDelete: canDelete || false,

      canPrint: canPrint || false,

      canExport: canExport || false,
    });

    await role.save();

    return res.status(200).json({
      success: true,

      message: "Permission added successfully.",

      data: role.permissions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

/* ==========================================================

   updatePermission()

========================================================== */

exports.updatePermission = async (req, res) => {
  try {
    const { id, module } = req.params;

    const role = await Role.findById(id);

    if (!role) {
      return res.status(404).json({
        success: false,

        message: "Role not found.",
      });
    }

    const permission = role.permissions.find(
      (item) => item.module.toLowerCase() === module.toLowerCase(),
    );

    if (!permission) {
      return res.status(404).json({
        success: false,

        message: "Permission not found.",
      });
    }

    const fields = [
      "canView",

      "canCreate",

      "canEdit",

      "canDelete",

      "canPrint",

      "canExport",
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        permission[field] = req.body[field];
      }
    });

    await role.save();

    return res.status(200).json({
      success: true,

      message: "Permission updated successfully.",

      data: permission,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

/* ==========================================================

   removePermission()

========================================================== */

exports.removePermission = async (req, res) => {
  try {
    const { id, module } = req.params;

    const role = await Role.findById(id);

    if (!role) {
      return res.status(404).json({
        success: false,

        message: "Role not found.",
      });
    }

    const index = role.permissions.findIndex(
      (item) => item.module.toLowerCase() === module.toLowerCase(),
    );

    if (index === -1) {
      return res.status(404).json({
        success: false,

        message: "Permission not found.",
      });
    }

    role.permissions.splice(index, 1);

    await role.save();

    return res.status(200).json({
      success: true,

      message: "Permission removed successfully.",

      data: role.permissions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

/* ==========================================================

   getRolePermissions()

========================================================== */

exports.getRolePermissions = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await Role.findById(id).select("roleName permissions status");
    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found.",
      });
    }
    return res.status(200).json({
      success: true,
      role: role.roleName,
      status: role.status,
      totalPermissions: role.permissions.length,
      permissions: role.permissions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.searchRoles = async (req, res) => {
  try {
    const {
      keyword = "",

      status,

      page = 1,

      limit = 10,
    } = req.query;

    const query = {};

    if (keyword) {
      query.roleName = {
        $regex: keyword,

        $options: "i",
      };
    }

    if (status) {
      query.status = status;
    }

    const roles = await Role.find(query)

      .sort({ createdAt: -1 })

      .skip((page - 1) * Number(limit))

      .limit(Number(limit));

    const total = await Role.countDocuments(query);

    res.status(200).json({
      success: true,

      total,

      page: Number(page),

      pages: Math.ceil(total / limit),

      data: roles,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

/* ==========================================================

   getActiveRoles()

========================================================== */

exports.getActiveRoles = async (req, res) => {
  try {
    const roles = await Role.find({
      status: "active",
    }).sort({
      roleName: 1,
    });

    res.status(200).json({
      success: true,

      count: roles.length,

      data: roles,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

/* ==========================================================

   getInactiveRoles()

========================================================== */

exports.getInactiveRoles = async (req, res) => {
  try {
    const roles = await Role.find({
      status: "inactive",
    }).sort({
      roleName: 1,
    });
    res.status(200).json({
      success: true,
      count: roles.length,
      data: roles,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
