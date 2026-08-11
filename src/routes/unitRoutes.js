const express = require("express");

const router = express.Router();

const unitController = require("../controllers/unitController");

const { verifyToken } = require("../middleware/auth");

/* ==========================================================
   Create
========================================================== */

router.post(
  "/create",
  verifyToken,
  unitController.createUnit
);

/* ==========================================================
   Get All
========================================================== */

router.get(
  "/all",
  verifyToken,
  unitController.getUnits
);

/* ==========================================================
   Search
   IMPORTANT: Keep this BEFORE /:id
========================================================== */

router.get(
  "/search",
  verifyToken,
  unitController.searchUnit
);

/* ==========================================================
   Restore
   IMPORTANT: Keep this BEFORE /:id
========================================================== */

router.put(
  "/restore/:id",
  verifyToken,
  unitController.restoreUnit
);

/* ==========================================================
   Activate
========================================================== */

router.put(
  "/activate/:id",
  verifyToken,
  unitController.activateUnit
);

/* ==========================================================
   Deactivate
========================================================== */

router.put(
  "/deactivate/:id",
  verifyToken,
  unitController.deactivateUnit
);

/* ==========================================================
   Get By ID
========================================================== */

router.get(
  "/:id",
  verifyToken,
  unitController.getUnitById
);

/* ==========================================================
   Update
========================================================== */

router.put(
  "/update/:id",
  verifyToken,
  unitController.updateUnit
);

/* ==========================================================
   Delete
========================================================== */

router.delete(
  "/delete/:id",
  verifyToken,
  unitController.deleteUnit
);

module.exports = router;