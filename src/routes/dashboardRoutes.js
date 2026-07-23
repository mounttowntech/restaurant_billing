const router = require("express").Router();
const c = require("../controllers/dashboardController");

router.get("/cards", c.cards);
module.exports = router;
