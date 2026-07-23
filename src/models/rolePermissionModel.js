const mongoose = require("mongoose");

/* =====================================================
   Permission Schema
===================================================== */

const permissionSchema = new mongoose.Schema(
  {
    module: {
      type: String,
      required: true,
      trim: true,
    },

    canView: {
      type: Boolean,
      default: false,
    },

    canCreate: {
      type: Boolean,
      default: false,
    },

    canEdit: {
      type: Boolean,
      default: false,
    },

    canDelete: {
      type: Boolean,
      default: false,
    },

    canApprove: {
      type: Boolean,
      default: false,
    },

    canReject: {
      type: Boolean,
      default: false,
    },

    canPrint: {
      type: Boolean,
      default: false,
    },

    canExport: {
      type: Boolean,
      default: false,
    },

    canImport: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: false,
  }
);

/* =====================================================
   Role Permission Schema
===================================================== */

const rolePermissionSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
    },

    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
    },

    roleCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    roleName: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    permissions: {
      type: [permissionSchema],
      default: [],
    },

    isDefault: {
      type: Boolean,
      default: false,
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/* =====================================================
   Indexes
===================================================== */

rolePermissionSchema.index({ restaurant: 1 });
rolePermissionSchema.index({ store: 1 });
rolePermissionSchema.index({ roleCode: 1 });
rolePermissionSchema.index({ roleName: 1 });
rolePermissionSchema.index({ status: 1 });

/* =====================================================
   Export
===================================================== */

module.exports = mongoose.model(
  "RolePermission",
  rolePermissionSchema
);