const Order = require("../models/Order");
const asyncHandler = require("../utils/asyncHandler");
const service = require("../services/orderService");
exports.createOrder = asyncHandler(async (req, res) =>
  res
    .status(201)
    .json({
      success: true,
      data: await service.createOrder(req.body, req.user),
    }),
);
exports.getOrders = asyncHandler(async (req, res) =>
  res.json({
    success: true,
    data: await Order.find().populate("table customer").sort({ createdAt: -1 }),
  }),
);
exports.getOrderById = asyncHandler(async (req, res) =>
  res.json({
    success: true,
    data: await Order.findById(req.params.id).populate(
      "table customer items.menuItem",
    ),
  }),
);
exports.updateOrder = asyncHandler(async (req, res) =>
  res.json({
    success: true,
    data: await Order.findByIdAndUpdate(req.params.id, req.body, { new: true }),
  }),
);
exports.cancelOrder = asyncHandler(async (req, res) =>
  res.json({
    success: true,
    data: await Order.findByIdAndUpdate(
      req.params.id,
      { status: "cancelled" },
      { new: true },
    ),
  }),
);
