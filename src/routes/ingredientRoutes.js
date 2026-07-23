const router = require("express").Router();
const c = require("../controllers/ingredientController");

router.post("/", c.createIngredient);
router.get("/", c.getIngredients);
router.get("/:id", c.getIngredientById);
router.put("/:id", c.updateIngredient);
router.delete("/:id", c.deleteIngredient);
module.exports = router;
