const router = require("express").Router();
const c = require("../controllers/purchaseController");

router.post("/", c.createPurchase);
router.get("/", c.getPurchases);
router.get("/:id", c.getPurchaseById);
module.exports = router;
