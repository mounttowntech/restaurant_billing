const asyncHandler = require("../utils/asyncHandler");
const Invoice = require("../models/Invoice");
const Purchase = require("../models/Purchase");
const Expense = require("../models/Expense");
exports.salesReport = asyncHandler(async (req, res) =>
  res.json({
    success: true,
    data: await Invoice.find(req.query).sort({ createdAt: -1 }),
  }),
);
exports.purchaseReport = asyncHandler(async (req, res) =>
  res.json({
    success: true,
    data: await Purchase.find(req.query).sort({ createdAt: -1 }),
  }),
);
exports.expenseReport = asyncHandler(async (req, res) =>
  res.json({
    success: true,
    data: await Expense.find(req.query).sort({ createdAt: -1 }),
  }),
);
