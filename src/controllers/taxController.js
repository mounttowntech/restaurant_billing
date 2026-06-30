const Tax = require("../models/Tax");
const asyncHandler = require("../utils/asyncHandler");
exports.createTax = asyncHandler(async (req, res) => {
  const data = await Tax.create(req.body);
  res.status(201).json({ success: true, message: "Created", data });
});
exports.getTaxs = asyncHandler(async (req, res) => {
  const data = await Tax.find().sort({ createdAt: -1 });
  res.json({ success: true, data });
});
exports.getTaxById = asyncHandler(async (req, res) => {
  const data = await Tax.findById(req.params.id);
  if (!data)
    return res.status(404).json({ success: false, message: "Not found" });
  res.json({ success: true, data });
});
exports.updateTax = asyncHandler(async (req, res) => {
  const data = await Tax.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.json({ success: true, message: "Updated", data });
});
exports.deleteTax = asyncHandler(async (req, res) => {
  await Tax.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Deleted" });
});
