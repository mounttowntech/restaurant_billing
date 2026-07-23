const router = require("express").Router();
const c = require("../controllers/tableController");

router.post("/", c.createTable);
router.get("/", c.getTables);
router.get("/:id", c.getTableById);
router.put("/:id", c.updateTable);
router.delete("/:id", c.deleteTable);
module.exports = router;
