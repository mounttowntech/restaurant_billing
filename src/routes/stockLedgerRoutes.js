const router = require("express").Router();
const c = require("../controllers/stockLedgerController");

router.post("/", c.createStockLedger);
router.get("/", c.getStockLedgers);
router.get("/:id", c.getStockLedgerById);
router.put("/:id", c.updateStockLedger);
router.delete("/:id", c.deleteStockLedger);
module.exports = router;
