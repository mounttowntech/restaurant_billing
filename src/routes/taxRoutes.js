const router = require("express").Router();
const c = require("../controllers/taxController");

router.post("/", c.createTax);
router.get("/", c.getTaxs);
router.get("/:id", c.getTaxById);
router.put("/:id", c.updateTax);
router.delete("/:id", c.deleteTax);
module.exports = router;
