const KOT = require("../models/KOT");
const asyncHandler = require("../utils/asyncHandler");
exports.createKOT = asyncHandler(async (req, res) => {
  const data = await KOT.create(req.body);
  res.status(201).json({ success: true, message: "Created", data });
});
exports.getKOTs = asyncHandler(async (req, res) => {
  const data = await KOT.find().sort({ createdAt: -1 });
  res.json({ success: true, data });
});
exports.getKOTById = asyncHandler(async (req, res) => {
  const data = await KOT.findById(req.params.id);
  if (!data)
    return res.status(404).json({ success: false, message: "Not found" });
  res.json({ success: true, data });
});
exports.updateKOT = asyncHandler(async (req, res) => {
  const data = await KOT.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.json({ success: true, message: "Updated", data });
});
exports.deleteKOT = asyncHandler(async (req, res) => {
  await KOT.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Deleted" });
});
