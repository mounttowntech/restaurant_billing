const Table = require("../models/Table");
const asyncHandler = require("../utils/asyncHandler");
exports.createTable = asyncHandler(async (req, res) => {
  const data = await Table.create(req.body);
  res.status(201).json({ success: true, message: "Created", data });
});
exports.getTables = asyncHandler(async (req, res) => {
  const data = await Table.find().sort({ createdAt: -1 });
  res.json({ success: true, data });
});
exports.getTableById = asyncHandler(async (req, res) => {
  const data = await Table.findById(req.params.id);
  if (!data)
    return res.status(404).json({ success: false, message: "Not found" });
  res.json({ success: true, data });
});
exports.updateTable = asyncHandler(async (req, res) => {
  const data = await Table.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.json({ success: true, message: "Updated", data });
});
exports.deleteTable = asyncHandler(async (req, res) => {
  await Table.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Deleted" });
});
