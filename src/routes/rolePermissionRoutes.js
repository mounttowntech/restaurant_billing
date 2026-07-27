const express = require("express");

const router = express.Router();

const {
  // ==============================
  // CRUD
  // ==============================

  createRolePermission,
  getRolePermissions,
  getRolePermissionById,

  // ==============================
  // Update
  // ==============================

  updateRolePermission,
  updateRolePermissionStatus,
  deleteRolePermission,
  restoreRolePermission,

  // ==============================
  // Permission Management
  // ==============================

  addModulePermission,
  updateModulePermission,
  removeModulePermission,
  getModulePermissions,

  // ==============================
  // Reports
  // ==============================

  searchRolePermissions,
  getActiveRolePermissions,
  getInactiveRolePermissions,
  getDeletedRolePermissions,
  getRolePermissionSummary,
  getRestaurantRolePermissions,
  getStoreRolePermissions,

} = require("../controllers/rolePermissionController");

/* ===========================================================
   CRUD
=========================================================== */

router.post("/create", createRolePermission);

router.get("/all", getRolePermissions);

router.get("/:id", getRolePermissionById);

/* ===========================================================
   Update
=========================================================== */

router.put("/:id", updateRolePermission);

router.patch("/:id/status", updateRolePermissionStatus);

router.delete("/:id", deleteRolePermission);

router.patch("/:id/restore", restoreRolePermission);

/* ===========================================================
   Permission Management
=========================================================== */

router.post("/:id/module", addModulePermission);

router.put("/:id/module/:module", updateModulePermission);

router.delete("/:id/module/:module", removeModulePermission);

router.get("/:id/modules", getModulePermissions);

/* ===========================================================
   Reports
=========================================================== */

router.get("/reports/search", searchRolePermissions);

router.get("/reports/active", getActiveRolePermissions);

router.get("/reports/inactive", getInactiveRolePermissions);

router.get("/reports/deleted", getDeletedRolePermissions);

router.get("/reports/summary", getRolePermissionSummary);

router.get(
  "/reports/restaurant/:restaurantId",
  getRestaurantRolePermissions
);

router.get(
  "/reports/store/:storeId",
  getStoreRolePermissions
);

module.exports = router;