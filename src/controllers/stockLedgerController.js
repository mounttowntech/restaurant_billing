const StockLedger = require("../models/StockLedger");
const asyncHandler = require("../utils/asyncHandler");
exports.createStockLedger = asyncHandler(async (req, res) => {
  const data = await StockLedger.create(req.body);
  res.status(201).json({ success: true, message: "Created", data });
});
exports.getStockLedgers = asyncHandler(async (req, res) => {
  const data = await StockLedger.find().sort({ createdAt: -1 });
  res.json({ success: true, data });
});
exports.getStockLedgerById = asyncHandler(async (req, res) => {
  const data = await StockLedger.findById(req.params.id);
  if (!data)
    return res.status(404).json({ success: false, message: "Not found" });
  res.json({ success: true, data });
});
exports.updateStockLedger = asyncHandler(async (req, res) => {
  const data = await StockLedger.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.json({ success: true, message: "Updated", data });
});
exports.deleteStockLedger = asyncHandler(async (req, res) => {
  await StockLedger.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Deleted" });
});
