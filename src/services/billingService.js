const Invoice = require("../models/Invoice");
const Order = require("../models/Order");
const Payment = require("../models/Payment");
const Table = require("../models/Table");
const gen = require("../utils/numberGenerator");
const { paymentStatus } = require("../utils/calc");
exports.createInvoice = async ({ orderId, paidAmount = 0, mode = "cash" }) => {
  const order = await Order.findById(orderId);
  if (!order) throw new Error("Order not found");
  const total = Number(order.grandTotal || 0);
  const invoice = await Invoice.create({
    invoiceNo: await gen(Invoice, "INV", "invoiceNo"),
    order: order._id,
    customer: order.customer,
    subTotal: order.subTotal,
    taxAmount: order.taxAmount,
    discountAmount: order.discountAmount,
    serviceCharge: order.serviceCharge,
    grandTotal: total,
    paidAmount,
    dueAmount: Math.max(total - paidAmount, 0),
    returnAmount: Math.max(paidAmount - total, 0),
    paymentStatus: paymentStatus(total, paidAmount),
  });
  if (paidAmount > 0)
    await Payment.create({
      paymentNo: await gen(Payment, "PAY", "paymentNo"),
      invoice: invoice._id,
      order: order._id,
      customer: order.customer,
      type: "sale",
      mode,
      amount: paidAmount,
    });
  order.status = "completed";
  await order.save();
  if (order.table)
    await Table.findByIdAndUpdate(order.table, { status: "available" });
  return invoice;
};
