const router = require("express").Router();
const c = require("../controllers/restaurantController");

router.post("/", c.createRestaurant);
router.get("/", c.getRestaurants);
router.get("/:id", c.getRestaurantById);
router.put("/:id", c.updateRestaurant);
router.delete("/:id", c.deleteRestaurant);
module.exports = router;
