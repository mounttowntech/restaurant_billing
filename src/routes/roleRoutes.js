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

router.put("/update/:id", updateRole);

router.delete("/delete/:id", deleteRole);

// ======================================================
// Status
// ======================================================

router.patch("/status/:id", updateRoleStatus);

// ======================================================
// Permission APIs
// ======================================================

router.post("/permissions/:id", addPermission);

router.put("/permissions/:module/:id", updatePermission);

router.delete("/permissions/:module/:id", removePermission);

router.get("/permissions/:id", getRolePermissions);

// ======================================================
// Reports
// ======================================================

router.get("/reports/search", searchRoles);

router.get("/reports/active", getActiveRoles);

router.get("/reports/inactive", getInactiveRoles);

module.exports = router;