exports.taxAmount = (amount, percent) =>
  Number((((Number(amount) || 0) * (Number(percent) || 0)) / 100).toFixed(2));
exports.discountAmount = (amount, type, value) =>
  type === "flat"
    ? Number(value || 0)
    : Number((((Number(amount) || 0) * (Number(value) || 0)) / 100).toFixed(2));
exports.paymentStatus = (total, paid) =>
  paid >= total ? "paid" : paid > 0 ? "partial" : "pending";
