const Addon = require("../models/Addon");
const asyncHandler = require("../utils/asyncHandler");
exports.createAddon = asyncHandler(async (req, res) => {
    const data = await Addon.create(req.body);
    res.status(201).json({ success: true, message: "Created", data });
});
exports.getAddons = asyncHandler(async (req, res) => {
    const data = await Addon.find().sort({ createdAt: -1 });
    res.json({ success: true, data });
});
exports.getAddonById = asyncHandler(async (req, res) => {
    const data = await Addon.findById(req.params.id);
    if (!data)
        return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data });
});
exports.updateAddon = asyncHandler(async (req, res) => {
    const data = await Addon.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
    });
    res.json({ success: true, message: "Updated", data });
});
exports.deleteAddon = asyncHandler(async (req, res) => {
    await Addon.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Deleted" });
});
