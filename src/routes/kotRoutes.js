const router = require("express").Router();
const c = require("../controllers/kotController");

router.post("/", c.createKOT);
router.get("/", c.getKOTs);
router.get("/:id", c.getKOTById);
router.put("/:id", c.updateKOT);
router.delete("/:id", c.deleteKOT);
module.exports = router;
