const express = require("express");
const router = express.Router();

const tableController = require("../controllers/tableController");

// ======================================================
// CRUD
// ======================================================

router.post("/create", tableController.createTable);

router.get("/all", tableController.getTables);

router.get("/:id", tableController.getTableById);

// ======================================================
// Update & Status
// ======================================================

router.put("/:id", tableController.updateTable);

router.delete("/:id", tableController.deleteTable);

router.put("/restore/:id", tableController.restoreTable);

router.put("/activate/:id", tableController.activateTable);

router.put("/deactivate/:id", tableController.deactivateTable);

router.put("/status/:id", tableController.updateTableStatus);

router.put("/assign-waiter/:id", tableController.assignWaiter);

router.put("/remove-waiter/:id", tableController.removeWaiter);

// ======================================================
// Table Operations
// ======================================================

router.put("/reserve/:id", tableController.reserveTable);

router.put("/release/:id", tableController.releaseTable);

router.put("/occupy/:id", tableController.occupyTable);

router.put("/clean/:id", tableController.cleanTable);

router.put("/out-of-service/:id", tableController.markOutOfService);

router.put("/merge/:id", tableController.mergeTables);

router.put("/unmerge/:id", tableController.unmergeTables);

// ======================================================
// Reports
// ======================================================

router.get("/search/all", tableController.searchTables);

router.get("/available/all", tableController.getAvailableTables);

router.get("/occupied/all", tableController.getOccupiedTables);

router.get("/reserved/all", tableController.getReservedTables);

router.get("/cleaning/all", tableController.getCleaningTables);

router.get("/out-of-service/all", tableController.getOutOfServiceTables);

router.get("/active/all", tableController.getActiveTables);

router.get("/inactive/all", tableController.getInactiveTables);

router.get("/deleted/all", tableController.getDeletedTables);

router.get("/restaurant/:restaurant", tableController.getRestaurantTables);

router.get("/store/:store", tableController.getStoreTables);

router.get("/floor/:floor", tableController.getFloorTables);

router.get("/section/:section", tableController.getSectionTables);

router.get("/capacity/:capacity", tableController.getCapacityTables);

router.get("/waiter/:waiterId", tableController.getWaiterTables);

router.get("/merged/all", tableController.getMergedTables);

router.get("/summary/all", tableController.getTableSummary);

router.get("/analytics/all", tableController.getTableAnalytics);

module.exports = router;