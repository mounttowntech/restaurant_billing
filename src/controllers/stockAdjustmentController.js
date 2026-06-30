const StockAdjustment = require("../models/StockAdjustment");
const asyncHandler = require("../utils/asyncHandler");
const gen = require("../utils/numberGenerator");
const stock = require("../services/stockService");
exports.createStockAdjustment = asyncHandler(async (req, res) => {
  const type =
    req.body.adjustmentType === "increase" ? "adjustment_in" : "adjustment_out";
  const moved = await stock.moveStock({
    ingredient: req.body.ingredient,
    quantity: req.body.quantity,
    type,
    remarks: req.body.reason,
  });
  const data = await StockAdjustment.create({
    adjustmentNo: await gen(StockAdjustment, "ADJ", "adjustmentNo"),
    ...req.body,
    beforeStock: moved.beforeStock,
    afterStock: moved.afterStock,
    createdBy: req.user._id,
  });
  res.status(201).json({ success: true, data });
});
exports.getStockAdjustments = asyncHandler(async (req, res) =>
  res.json({
    success: true,
    data: await StockAdjustment.find()
      .populate("ingredient")
      .sort({ createdAt: -1 }),
  }),
);
