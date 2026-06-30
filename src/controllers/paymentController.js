const Payment = require("../models/Payment");
const asyncHandler = require("../utils/asyncHandler");
exports.createPayment = asyncHandler(async (req, res) => {
  const data = await Payment.create(req.body);
  res.status(201).json({ success: true, message: "Created", data });
});
exports.getPayments = asyncHandler(async (req, res) => {
  const data = await Payment.find().sort({ createdAt: -1 });
  res.json({ success: true, data });
});
exports.getPaymentById = asyncHandler(async (req, res) => {
  const data = await Payment.findById(req.params.id);
  if (!data)
    return res.status(404).json({ success: false, message: "Not found" });
  res.json({ success: true, data });
});
exports.updatePayment = asyncHandler(async (req, res) => {
  const data = await Payment.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.json({ success: true, message: "Updated", data });
});
exports.deletePayment = asyncHandler(async (req, res) => {
  await Payment.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Deleted" });
});
