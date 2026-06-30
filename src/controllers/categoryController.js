const Category = require("../models/Category");
const asyncHandler = require("../utils/asyncHandler");
exports.createCategory = asyncHandler(async (req, res) => {
  const data = await Category.create(req.body);
  res.status(201).json({ success: true, message: "Created", data });
});
exports.getCategorys = asyncHandler(async (req, res) => {
  const data = await Category.find().sort({ createdAt: -1 });
  res.json({ success: true, data });
});
exports.getCategoryById = asyncHandler(async (req, res) => {
  const data = await Category.findById(req.params.id);
  if (!data)
    return res.status(404).json({ success: false, message: "Not found" });
  res.json({ success: true, data });
});
exports.updateCategory = asyncHandler(async (req, res) => {
  const data = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.json({ success: true, message: "Updated", data });
});
exports.deleteCategory = asyncHandler(async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Deleted" });
});
