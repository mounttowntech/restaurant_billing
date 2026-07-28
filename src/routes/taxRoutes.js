const express = require("express");
const router = express.Router();

const taxController = require("../controllers/taxController");

/* ==========================================================
   CRUD
========================================================== */

router.post("/create", taxController.createTax);

router.get("/all", taxController.getTaxes);

router.get("/:id", taxController.getTaxById);

/* ==========================================================
   Update & Status
========================================================== */

router.put("/:id", taxController.updateTax);

router.delete("/:id", taxController.deleteTax);

router.put("/status/:id", taxController.updateTaxStatus);

router.put("/default/:id", taxController.setDefaultTax);

/* ==========================================================
   Reports
========================================================== */

router.get("/search/all", taxController.searchTaxes);

router.get("/active/all", taxController.getActiveTaxes);

router.get("/inactive/all", taxController.getInactiveTaxes);

router.get("/default/all", taxController.getDefaultTax);

router.get("/summary/all", taxController.getTaxSummary);

module.exports = router;