const mongoose = require("mongoose");
const permissionSchema = new mongoose.Schema(
  {
    module: String,
    canView: { type: Boolean, default: false },
    canCreate: { type: Boolean, default: false },
    canEdit: { type: Boolean, default: false },
    canDelete: { type: Boolean, default: false },
    canPrint: { type: Boolean, default: false },
    canExport: { type: Boolean, default: false },
  },
  { _id: false },
);
module.exports = mongoose.model(
  "Role",
  new mongoose.Schema(
    {
      roleName: { type: String, required: true, unique: true },
      permissions: [permissionSchema],
      status: { type: String, enum: ["active", "inactive"], default: "active" },
    },
    { timestamps: true, versionKey: false },
  ),
);
