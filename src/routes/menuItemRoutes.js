const router = require("express").Router();
const c = require("../controllers/menuItemController");

router.post("/", c.createMenuItem);
router.get("/", c.getMenuItems);
router.get("/:id", c.getMenuItemById);
router.put("/:id", c.updateMenuItem);
router.delete("/:id", c.deleteMenuItem);
module.exports = router;
