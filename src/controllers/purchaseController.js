const Purchase = require("../models/Purchase");
const Payment = require("../models/Payment");
const asyncHandler = require("../utils/asyncHandler");
const gen = require("../utils/numberGenerator");
const stock = require("../services/stockService");
exports.createPurchase = asyncHandler(async (req, res) => {
  let subTotal = 0,
    items = [];
  for (const i of req.body.items) {
    const total = i.quantity * i.price;
    subTotal += total;
    items.push({ ...i, totalAmount: total });
  }
  const grandTotal = subTotal + (req.body.taxAmount || 0);
  const p = await Purchase.create({
    purchaseNo: await gen(Purchase, "PUR", "purchaseNo"),
    supplier: req.body.supplier,
    items,
    subTotal,
    taxAmount: req.body.taxAmount || 0,
    grandTotal,
    paidAmount: req.body.paidAmount || 0,
    dueAmount: Math.max(grandTotal - (req.body.paidAmount || 0), 0),
    paymentStatus:
      (req.body.paidAmount || 0) >= grandTotal
        ? "paid"
        : (req.body.paidAmount || 0) > 0
          ? "partial"
          : "unpaid",
  });
  for (const i of items)
    await stock.moveStock({
      ingredient: i.ingredient,
      quantity: i.quantity,
      type: "purchase",
      referenceId: p._id,
      referenceNumber: p.purchaseNo,
      remarks: "Purchase stock in",
    });
  if (req.body.paidAmount > 0)
    await Payment.create({
      paymentNo: await gen(Payment, "PAY", "paymentNo"),
      purchase: p._id,
      type: "purchase",
      mode: req.body.paymentMode || "cash",
      amount: req.body.paidAmount,
    });
  res.status(201).json({ success: true, data: p });
});
exports.getPurchases = asyncHandler(async (req, res) =>
  res.json({
    success: true,
    data: await Purchase.find().populate("supplier").sort({ createdAt: -1 }),
  }),
);
exports.getPurchaseById = asyncHandler(async (req, res) =>
  res.json({
    success: true,
    data: await Purchase.findById(req.params.id).populate(
      "supplier items.ingredient",
    ),
  }),
);
