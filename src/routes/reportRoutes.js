const router = require("express").Router();
const c = require("../controllers/reportController");
const { protect } = require("../middleware/auth");
router.use(protect);
router.get("/sales", c.salesReport);
router.get("/purchases", c.purchaseReport);
router.get("/expenses", c.expenseReport);
module.exports = router;
