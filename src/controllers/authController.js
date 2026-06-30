const User = require("../models/User");
const Role = require("../models/Role");
const asyncHandler = require("../utils/asyncHandler");
const token = require("../utils/generateToken");
exports.register = asyncHandler(async (req, res) => {
  const role =
    (await Role.findOne({ roleName: req.body.roleName || "admin" })) ||
    (await Role.create({ roleName: req.body.roleName || "admin" }));
  const user = await User.create({ ...req.body, role: role._id });
  res.status(201).json({ success: true, token: token(user), user });
});
exports.login = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email })
    .select("+password")
    .populate("role");
  if (!user || !(await user.comparePassword(req.body.password)))
    return res.status(401).json({ success: false, message: "Invalid login" });
  res.json({ success: true, token: token(user), user });
});
exports.me = asyncHandler(async (req, res) =>
  res.json({ success: true, user: req.user }),
);
