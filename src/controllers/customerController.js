const Customer = require("../models/Customer");
const asyncHandler = require("../utils/asyncHandler");
exports.createCustomer = asyncHandler(async (req, res) => {
  const data = await Customer.create(req.body);
  res.status(201).json({ success: true, message: "Created", data });
});
exports.getCustomers = asyncHandler(async (req, res) => {
  const data = await Customer.find().sort({ createdAt: -1 });
  res.json({ success: true, data });
});
exports.getCustomerById = asyncHandler(async (req, res) => {
  const data = await Customer.findById(req.params.id);
  if (!data)
    return res.status(404).json({ success: false, message: "Not found" });
  res.json({ success: true, data });
});
exports.updateCustomer = asyncHandler(async (req, res) => {
  const data = await Customer.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.json({ success: true, message: "Updated", data });
});
exports.deleteCustomer = asyncHandler(async (req, res) => {
  await Customer.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Deleted" });
});
