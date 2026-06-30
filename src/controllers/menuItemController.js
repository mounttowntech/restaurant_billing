const MenuItem = require("../models/MenuItem");
const asyncHandler = require("../utils/asyncHandler");
exports.createMenuItem = asyncHandler(async (req, res) => {
  const data = await MenuItem.create(req.body);
  res.status(201).json({ success: true, message: "Created", data });
});
exports.getMenuItems = asyncHandler(async (req, res) => {
  const data = await MenuItem.find().sort({ createdAt: -1 });
  res.json({ success: true, data });
});
exports.getMenuItemById = asyncHandler(async (req, res) => {
  const data = await MenuItem.findById(req.params.id);
  if (!data)
    return res.status(404).json({ success: false, message: "Not found" });
  res.json({ success: true, data });
});
exports.updateMenuItem = asyncHandler(async (req, res) => {
  const data = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.json({ success: true, message: "Updated", data });
});
exports.deleteMenuItem = asyncHandler(async (req, res) => {
  await MenuItem.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Deleted" });
});
