const express = require("express");

const router = express.Router();

const {
  createInventory,
  getInventories,
  getInventoryById,
  updateInventory,
  deleteInventory,
  restoreInventory,
  addStock,
  removeStock,
  adjustStock,
  getLowStock,
  getOutOfStock,
  getInventorySummary,
  searchInventory,
  getExpiringInventory,
} = require("../controllers/inventoryController");

// ==========================================================
// CREATE
// ==========================================================

router.post("/create", createInventory);

// ==========================================================
// REPORTS / SPECIAL ROUTES
// IMPORTANT: These MUST come before /:id
// ==========================================================

router.get("/reports/summary", getInventorySummary);

router.get("/reports/search", searchInventory);

router.get("/reports/low-stock", getLowStock);

router.get("/reports/out-of-stock", getOutOfStock);

router.get("/reports/expiring", getExpiringInventory);

// ==========================================================
// ALL INVENTORY
// ==========================================================

router.get("/all", getInventories);

// ==========================================================
// STOCK OPERATIONS
// ==========================================================

router.patch("/add-stock/:id", addStock);

router.patch("/remove-stock/:id", removeStock);

router.patch("/adjust-stock/:id", adjustStock);

// ==========================================================
// UPDATE
// ==========================================================

router.put("/update/:id", updateInventory);

// ==========================================================
// DELETE / RESTORE
// ==========================================================

router.delete("/delete/:id", deleteInventory);

router.put("/restore/:id", restoreInventory);

// ==========================================================
// GET BY ID
// IMPORTANT: Keep this near the bottom
// ==========================================================

router.get("/:id", getInventoryById);

module.exports = router;