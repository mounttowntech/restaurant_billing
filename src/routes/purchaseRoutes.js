const router = require("express").Router();
const c = require("../controllers/purchaseController");
const { protect } = require("../middleware/auth");
router.use(protect);
router.post("/", c.createPurchase);
router.get("/", c.getPurchases);
router.get("/:id", c.getPurchaseById);
module.exports = router;
