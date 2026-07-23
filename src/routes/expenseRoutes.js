const router = require("express").Router();
const c = require("../controllers/expenseController");

router.post("/", c.createExpense);
router.get("/", c.getExpenses);
router.get("/:id", c.getExpenseById);
router.put("/:id", c.updateExpense);
router.delete("/:id", c.deleteExpense);
module.exports = router;
