const router = require("express").Router();
const c = require("../controllers/dashboardController");
const { protect } = require("../middleware/auth");
router.use(protect);
router.get("/cards", c.cards);
module.exports = router;
