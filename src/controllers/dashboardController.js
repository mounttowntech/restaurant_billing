const asyncHandler = require("../utils/asyncHandler");
const Invoice = require("../models/Invoice");
const Order = require("../models/Order");
const Customer = require("../models/Customer");
const Ingredient = require("../models/Ingredient");
exports.cards = asyncHandler(async (req, res) => {
  const sales = await Invoice.aggregate([
    {
      $group: { _id: null, total: { $sum: "$grandTotal" }, count: { $sum: 1 } },
    },
  ]);
  const orders = await Order.countDocuments();
  const customers = await Customer.countDocuments();
  const lowStock = await Ingredient.countDocuments({
    $expr: { $lte: ["$currentStock", "$minimumStock"] },
  });
  res.json({
    success: true,
    data: {
      totalSales: sales[0]?.total || 0,
      totalBills: sales[0]?.count || 0,
      totalOrders: orders,
      totalCustomers: customers,
      lowStock,
    },
  });
});
