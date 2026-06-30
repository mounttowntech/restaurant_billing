const Expense = require("../models/Expense");
const asyncHandler = require("../utils/asyncHandler");
exports.createExpense = asyncHandler(async (req, res) => {
  const data = await Expense.create(req.body);
  res.status(201).json({ success: true, message: "Created", data });
});
exports.getExpenses = asyncHandler(async (req, res) => {
  const data = await Expense.find().sort({ createdAt: -1 });
  res.json({ success: true, data });
});
exports.getExpenseById = asyncHandler(async (req, res) => {
  const data = await Expense.findById(req.params.id);
  if (!data)
    return res.status(404).json({ success: false, message: "Not found" });
  res.json({ success: true, data });
});
exports.updateExpense = asyncHandler(async (req, res) => {
  const data = await Expense.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.json({ success: true, message: "Updated", data });
});
exports.deleteExpense = asyncHandler(async (req, res) => {
  await Expense.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Deleted" });
});
