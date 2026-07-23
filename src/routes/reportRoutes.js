const router = require("express").Router();
const c = require("../controllers/reportController");

router.get("/sales", c.salesReport);
router.get("/purchases", c.purchaseReport);
router.get("/expenses", c.expenseReport);
module.exports = router;
