const Restaurant = require("../models/Restaurant");
const asyncHandler = require("../utils/asyncHandler");
exports.createRestaurant = asyncHandler(async (req, res) => {
  const data = await Restaurant.create(req.body);
  res.status(201).json({ success: true, message: "Created", data });
});
exports.getRestaurants = asyncHandler(async (req, res) => {
  const data = await Restaurant.find().sort({ createdAt: -1 });
  res.json({ success: true, data });
});
exports.getRestaurantById = asyncHandler(async (req, res) => {
  const data = await Restaurant.findById(req.params.id);
  if (!data)
    return res.status(404).json({ success: false, message: "Not found" });
  res.json({ success: true, data });
});
exports.updateRestaurant = asyncHandler(async (req, res) => {
  const data = await Restaurant.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.json({ success: true, message: "Updated", data });
});
exports.deleteRestaurant = asyncHandler(async (req, res) => {
  await Restaurant.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Deleted" });
});
