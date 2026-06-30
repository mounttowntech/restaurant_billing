const MenuItem = require("../models/MenuItem");
const Order = require("../models/Order");
const KOT = require("../models/KOT");
const Table = require("../models/Table");
const gen = require("../utils/numberGenerator");
const { taxAmount } = require("../utils/calc");
exports.createOrder = async (body, user) => {
  let subTotal = 0,
    tax = 0,
    items = [];
  for (const x of body.items) {
    const m = await MenuItem.findById(x.menuItem);
    if (!m) throw new Error("Menu item not found");
    const price = x.price || m.basePrice;
    const line = price * x.quantity;
    const t = taxAmount(line, m.taxPercent);
    subTotal += line;
    tax += t;
    items.push({
      menuItem: m._id,
      itemName: m.itemName,
      variantName: x.variantName,
      quantity: x.quantity,
      price,
      taxPercent: m.taxPercent,
      taxAmount: t,
      totalAmount: line + t,
      addons: x.addons || [],
    });
  }
  const grandTotal =
    subTotal + tax + (body.serviceCharge || 0) - (body.discountAmount || 0);
  const order = await Order.create({
    orderNo: await gen(Order, "ORD", "orderNo"),
    restaurant: body.restaurant,
    orderType: body.orderType,
    table: body.table,
    customer: body.customer,
    items,
    subTotal,
    taxAmount: tax,
    discountAmount: body.discountAmount || 0,
    serviceCharge: body.serviceCharge || 0,
    grandTotal,
    createdBy: user?._id,
  });
  if (body.orderType === "dine_in" && body.table)
    await Table.findByIdAndUpdate(body.table, { status: "occupied" });
  await KOT.create({
    kotNo: await gen(KOT, "KOT", "kotNo"),
    order: order._id,
    table: body.table,
    items: items.map((i) => ({ itemName: i.itemName, quantity: i.quantity })),
  });
  return order;
};
