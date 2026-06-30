module.exports = async (Model, prefix, field) =>
  `${prefix}-${String((await Model.countDocuments()) + 1).padStart(6, "0")}`;
