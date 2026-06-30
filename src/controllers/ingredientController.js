const Ingredient = require("../models/Ingredient");
const asyncHandler = require("../utils/asyncHandler");
exports.createIngredient = asyncHandler(async (req, res) => {
  const data = await Ingredient.create(req.body);
  res.status(201).json({ success: true, message: "Created", data });
});
exports.getIngredients = asyncHandler(async (req, res) => {
  const data = await Ingredient.find().sort({ createdAt: -1 });
  res.json({ success: true, data });
});
exports.getIngredientById = asyncHandler(async (req, res) => {
  const data = await Ingredient.findById(req.params.id);
  if (!data)
    return res.status(404).json({ success: false, message: "Not found" });
  res.json({ success: true, data });
});
exports.updateIngredient = asyncHandler(async (req, res) => {
  const data = await Ingredient.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.json({ success: true, message: "Updated", data });
});
exports.deleteIngredient = asyncHandler(async (req, res) => {
  await Ingredient.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Deleted" });
});
