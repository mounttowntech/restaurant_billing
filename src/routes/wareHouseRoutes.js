const express = require("express");

const router = express.Router();

const warehouseController = require("../controllers/wareHouseController");

const {
  verifyToken,
} = require("../middleware/auth");

/* ==========================================================
   Create
========================================================== */

router.post(
  "/create",
  verifyToken,
  warehouseController.createWarehouse
);

/* ==========================================================
   Search
========================================================== */

router.get(
  "/search",
  verifyToken,
  warehouseController.searchWarehouse
);

/* ==========================================================
   Summary
========================================================== */

router.get(
  "/summary",
  verifyToken,
  warehouseController.getWarehouseSummary
);

/* ==========================================================
   Default Warehouse
========================================================== */

router.get(
  "/default",
  verifyToken,
  warehouseController.getDefaultWarehouse
);

/* ==========================================================
   Get All
========================================================== */

router.get(
  "/all",
  verifyToken,
  warehouseController.getWarehouses
);

/* ==========================================================
   Set Default
========================================================== */

router.put(
  "/set-default/:id",
  verifyToken,
  warehouseController.setDefaultWarehouse
);

/* ==========================================================
   Restore
========================================================== */

router.put(
  "/restore/:id",
  verifyToken,
  warehouseController.restoreWarehouse
);

/* ==========================================================
   Single Warehouse
========================================================== */

router.get(
  "/:id",
  verifyToken,
  warehouseController.getWarehouseById
);

/* ==========================================================
   Update
========================================================== */

router.put(
  "/update/:id",
  verifyToken,
  warehouseController.updateWarehouse
);

/* ==========================================================
   Delete
========================================================== */

router.delete(
  "/delete/:id",
  verifyToken,
  warehouseController.deleteWarehouse
);

module.exports = router;