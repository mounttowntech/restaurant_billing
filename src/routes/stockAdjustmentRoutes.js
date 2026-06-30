const router = require("express").Router();
const c = require("../controllers/stockAdjustmentController");
const { protect } = require("../middleware/auth");
router.use(protect);
router.post("/", c.createStockAdjustment);
router.get("/", c.getStockAdjustments);
module.exports = router;
