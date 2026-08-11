
const express = require("express");

const router = express.Router();

const ingredientController = require("../controllers/ingradientController");

const { verifyToken } = require("../middleware/auth");

/* ==========================================================
   Create
   POST /api/ingredients/create
========================================================== */

router.post(
  "/create",
  verifyToken,
  ingredientController.createIngredient
);

/* ==========================================================
   Search
   GET /api/ingredients/search?keyword=tomato
========================================================== */

router.get(
  "/search",
  verifyToken,
  ingredientController.searchIngredients
);

/* ==========================================================
   Low Stock
   GET /api/ingredients/low-stock
========================================================== */

router.get(
  "/low-stock",
  verifyToken,
  ingredientController.getLowStock
);

/* ==========================================================
   Out Of Stock
   GET /api/ingredients/out-of-stock
========================================================== */

router.get(
  "/out-of-stock",
  verifyToken,
  ingredientController.getOutOfStock
);

/* ==========================================================
   Available
   GET /api/ingredients/available
========================================================== */

router.get(
  "/available",
  verifyToken,
  ingredientController.getAvailableIngredients
);

/* ==========================================================
   Summary
   GET /api/ingredients/summary
========================================================== */

router.get(
  "/summary",
  verifyToken,
  ingredientController.getIngredientSummary
);

/* ==========================================================
   Add Stock
   PUT /api/ingredients/add-stock/:id
========================================================== */

router.put(
  "/add-stock/:id",
  verifyToken,
  ingredientController.addStock
);

/* ==========================================================
   Remove Stock
   PUT /api/ingredients/remove-stock/:id
========================================================== */

router.put(
  "/remove-stock/:id",
  verifyToken,
  ingredientController.removeStock
);

/* ==========================================================
   Adjust Stock
   PUT /api/ingredients/adjust-stock/:id
========================================================== */

router.put(
  "/adjust-stock/:id",
  verifyToken,
  ingredientController.adjustStock
);

/* ==========================================================
   Activate
   PUT /api/ingredients/activate/:id
========================================================== */

router.put(
  "/activate/:id",
  verifyToken,
  ingredientController.activateIngredient
);

/* ==========================================================
   Deactivate
   PUT /api/ingredients/deactivate/:id
========================================================== */

router.put(
  "/deactivate/:id",
  verifyToken,
  ingredientController.deactivateIngredient
);

/* ==========================================================
   Get All
   GET /api/ingredients/all
========================================================== */

router.get(
  "/all",
  verifyToken,
  ingredientController.getIngredients
);

/* ==========================================================
   Restore
   PUT /api/ingredients/restore/:id
========================================================== */

router.put(
  "/restore/:id",
  verifyToken,
  ingredientController.restoreIngredient
);

/* ==========================================================
   Get By ID
   GET /api/ingredients/:id
========================================================== */

router.get(
  "/:id",
  verifyToken,
  ingredientController.getIngredientById
);

/* ==========================================================
   Update
   PUT /api/ingredients/:id
========================================================== */

router.put(
  "/update/:id",
  verifyToken,
  ingredientController.updateIngredient
);

/* ==========================================================
   Delete
   DELETE /api/ingredients/:id
========================================================== */

router.delete(
  "/delete/:id",
  verifyToken,
  ingredientController.deleteIngredient
);

module.exports = router;

