const Role = require("../models/Role");
const asyncHandler = require("../utils/asyncHandler");
exports.createRole = asyncHandler(async (req, res) => {
  const data = await Role.create(req.body);
  res.status(201).json({ success: true, message: "Created", data });
});
exports.getRoles = asyncHandler(async (req, res) => {
  const data = await Role.find().sort({ createdAt: -1 });
  res.json({ success: true, data });
});
exports.getRoleById = asyncHandler(async (req, res) => {
  const data = await Role.findById(req.params.id);
  if (!data)
    return res.status(404).json({ success: false, message: "Not found" });
  res.json({ success: true, data });
});
exports.updateRole = asyncHandler(async (req, res) => {
  const data = await Role.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.json({ success: true, message: "Updated", data });
});
exports.deleteRole = asyncHandler(async (req, res) => {
  await Role.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Deleted" });
});
