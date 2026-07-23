const mongoose = require("mongoose");

const chefSchema = new mongoose.Schema(
  {
    restaurant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
    },

    store: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Store",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    chefCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    chefName: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
      default: "Male",
    },

    designation: {
      type: String,
      enum: [
        "Head Chef",
        "Sous Chef",
        "Senior Chef",
        "Chef",
        "Assistant Chef",
        "Kitchen Helper",
      ],
      default: "Chef",
    },

    kitchenSection: {
      type: String,
      enum: [
        "Main Kitchen",
        "Chinese",
        "South Indian",
        "North Indian",
        "Tandoor",
        "Bakery",
        "Dessert",
        "Beverage",
        "Fast Food",
      ],
      default: "Main Kitchen",
    },

    specialization: [
      {
        type: String,
      },
    ],

    shift: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shift",
    },

    assignedKOTs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "KOT",
      },
    ],

    currentOrders: {
      type: Number,
      default: 0,
    },

    completedOrders: {
      type: Number,
      default: 0,
    },

    cancelledOrders: {
      type: Number,
      default: 0,
    },

    averageCookingTime: {
      type: Number,
      default: 0,
    },

    rating: {
      type: Number,
      default: 5,
      min: 0,
      max: 5,
    },

    salary: {
      type: Number,
      default: 0,
    },

    joiningDate: {
      type: Date,
      default: Date.now,
    },

    profileImage: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: [
        "Active",
        "Inactive",
        "On Leave",
      ],
      default: "Active",
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    notes: {
      type: String,
      trim: true,
      default: "",
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

/* =====================================
   Virtual Fields
===================================== */

chefSchema.virtual("pendingOrders").get(function () {
  return this.currentOrders;
});

chefSchema.virtual("completionRate").get(function () {
  const total = this.completedOrders + this.cancelledOrders;

  if (total === 0) return 0;

  return Number(
    ((this.completedOrders / total) * 100).toFixed(2)
  );
});

/* =====================================
   Indexes
===================================== */

chefSchema.index({ restaurant: 1 });

chefSchema.index({ store: 1 });

chefSchema.index({ chefCode: 1 });

chefSchema.index({ chefName: 1 });

chefSchema.index({ kitchenSection: 1 });

chefSchema.index({ designation: 1 });

chefSchema.index({ status: 1 });

chefSchema.index({ isAvailable: 1 });

chefSchema.index({ isDeleted: 1 });

/* =====================================
   JSON
===================================== */

chefSchema.set("toJSON", {
  virtuals: true,
});

chefSchema.set("toObject", {
  virtuals: true,
});



module.exports = mongoose.model("Chef", chefSchema);