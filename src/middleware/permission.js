module.exports =
  (moduleName, action = "canView") =>
  (req, res, next) => {
    const role = req.user?.role;
    if (role?.roleName === "super_admin") return next();
    const p = role?.permissions?.find((x) => x.module === moduleName);
    if (!p || !p[action])
      return res
        .status(403)
        .json({ success: false, message: "Permission denied" });
    next();
  };
