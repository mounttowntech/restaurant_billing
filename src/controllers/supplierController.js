const Supplier = require("../models/Supplier");
const asyncHandler = require("../utils/asyncHandler");
exports.createSupplier = asyncHandler(async (req, res) => {
  const data = await Supplier.create(req.body);
  res.status(201).json({ success: true, message: "Created", data });
});
exports.getSuppliers = asyncHandler(async (req, res) => {
  const data = await Supplier.find().sort({ createdAt: -1 });
  res.json({ success: true, data });
});
exports.getSupplierById = asyncHandler(async (req, res) => {
  const data = await Supplier.findById(req.params.id);
  if (!data)
    return res.status(404).json({ success: false, message: "Not found" });
  res.json({ success: true, data });
});
exports.updateSupplier = asyncHandler(async (req, res) => {
  const data = await Supplier.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.json({ success: true, message: "Updated", data });
});
exports.deleteSupplier = asyncHandler(async (req, res) => {
  await Supplier.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Deleted" });
});
