const express = require("express");

const router = express.Router();

const {
  // ==========================
  // CRUD
  // ==========================
  createRole,
  getRoles,
  getRoleById,

  // ==========================
  // Update & Status
  // ==========================
  updateRole,
  updateRoleStatus,
  deleteRole,

  // ==========================
  // Permissions
  // ==========================
  addPermission,
  updatePermission,
  removePermission,
  getRolePermissions,

  // ==========================
  // Reports
  // ==========================
  searchRoles,
  getActiveRoles,
  getInactiveRoles,
} = require("../controllers/roleController");

// ======================================================
// CRUD
// ======================================================

router.post("/create", createRole);

router.get("/all", getRoles);

router.get("/:id", getRoleById);

router.put("/:id", updateRole);

router.delete("/:id", deleteRole);

// ======================================================
// Status
// ======================================================

router.patch("/:id/status", updateRoleStatus);

// ======================================================
// Permission APIs
// ======================================================

router.post("/:id/permissions", addPermission);

router.put("/:id/permissions/:module", updatePermission);

router.delete("/:id/permissions/:module", removePermission);

router.get("/:id/permissions", getRolePermissions);

// ======================================================
// Reports
// ======================================================

router.get("/reports/search", searchRoles);

router.get("/reports/active", getActiveRoles);

router.get("/reports/inactive", getInactiveRoles);

module.exports = router;