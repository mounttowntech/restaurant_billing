const Invoice = require("../models/Invoice");
const asyncHandler = require("../utils/asyncHandler");
const billing = require("../services/billingService");
exports.createInvoice = asyncHandler(async (req, res) =>
  res
    .status(201)
    .json({ success: true, data: await billing.createInvoice(req.body) }),
);
exports.getInvoices = asyncHandler(async (req, res) =>
  res.json({
    success: true,
    data: await Invoice.find()
      .populate("order customer")
      .sort({ createdAt: -1 }),
  }),
);
exports.getInvoiceById = asyncHandler(async (req, res) =>
  res.json({
    success: true,
    data: await Invoice.findById(req.params.id).populate("order customer"),
  }),
);
