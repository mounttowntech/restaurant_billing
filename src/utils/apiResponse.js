exports.ok = (res, message, data = null) =>
  res.json({ success: true, message, data });
exports.created = (res, message, data = null) =>
  res.status(201).json({ success: true, message, data });
