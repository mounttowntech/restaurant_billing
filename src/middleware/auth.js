const jwt = require("jsonwebtoken");
const User = require("../models/User");
exports.protect = async (req, res, next) => {
  try {
    const h = req.headers.authorization;
    if (!h?.startsWith("Bearer "))
      return res.status(401).json({ success: false, message: "No token" });
    const d = jwt.verify(h.split(" ")[1], process.env.JWT_SECRET);
    req.user = await User.findById(d.id).populate("role");
    if (!req.user)
      return res
        .status(401)
        .json({ success: false, message: "User not found" });
    next();
  } catch (e) {
    res.status(401).json({ success: false, message: "Invalid token" });
  }
};
exports.allowRoles =
  (...roles) =>
  (req, res, next) => {
    const role = req.user?.role?.roleName;
    if (!roles.includes(role))
      return res.status(403).json({ success: false, message: "Access denied" });
    next();
  };
