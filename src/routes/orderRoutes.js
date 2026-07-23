const router = require("express").Router();
const c = require("../controllers/orderController");

router.post("/", c.createOrder);
router.get("/", c.getOrders);
router.get("/:id", c.getOrderById);
router.put("/:id", c.updateOrder);
router.patch("/:id/cancel", c.cancelOrder);
module.exports = router;
