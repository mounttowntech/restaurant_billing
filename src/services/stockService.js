const Ingredient = require("../models/Ingredient");
const StockLedger = require("../models/StockLedger");
exports.moveStock = async ({
  ingredient,
  quantity,
  type,
  referenceId,
  referenceNumber,
  remarks,
}) => {
  const ing = await Ingredient.findById(ingredient);
  if (!ing) throw new Error("Ingredient not found");
  const before = Number(ing.currentStock || 0);
  const qty = Number(quantity || 0);
  if (qty <= 0) throw new Error("Invalid quantity");
  let after = before;
  if (["purchase", "adjustment_in"].includes(type)) after = before + qty;
  else {
    if (before < qty) throw new Error("Insufficient stock");
    after = before - qty;
  }
  ing.currentStock = after;
  await ing.save();
  await StockLedger.create({
    ingredient,
    movementType: type,
    quantity: qty,
    beforeStock: before,
    afterStock: after,
    referenceId,
    referenceNumber,
    remarks,
  });
  return { beforeStock: before, afterStock: after };
};
