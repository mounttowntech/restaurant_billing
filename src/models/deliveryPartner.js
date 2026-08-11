const mongoose = require("mongoose");

// =====================================
// Delivery Partner Schema
// =====================================

const deliveryPartnerSchema = new mongoose.Schema(
  {
    // =====================================
    // Restaurant Mapping
    // =====================================

    restaurant: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "Restaurant",

      required: true,

      index: true,
    },

    // =====================================
    // Store Mapping
    // =====================================

    store: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "Store",

      index: true,
    },

    // =====================================
    // Personal Details
    // =====================================

    personalDetails: {
      firstName: {
        type: String,

        required: true,

        trim: true,
      },

      lastName: {
        type: String,

        trim: true,
      },

      profileImage: {
        type: String,

        default: null,
      },

      email: {
        type: String,

        lowercase: true,

        trim: true,
      },

      phone: {
        type: String,

        required: true,

        trim: true,
      },

      alternatePhone: {
        type: String,

        trim: true,
      },

      dateOfBirth: {
        type: Date,
      },

      gender: {
        type: String,

        enum: ["male", "female", "other"],
      },

      emergencyContact: {
        name: {
          type: String,

          trim: true,
        },

        phone: {
          type: String,

          trim: true,
        },

        relation: {
          type: String,

          trim: true,
        },
      },
    },

    // =====================================
    // Vehicle Details
    // =====================================

    vehicleDetails: {
      vehicleType: {
        type: String,

        enum: ["bike", "scooter", "car", "van", "cycle"],

        required: true,
      },

      vehicleNumber: {
        type: String,

        uppercase: true,

        trim: true,
      },

      brand: String,

      model: String,

      color: String,

      drivingLicense: {
        number: String,

        expiryDate: Date,

        document: String,
      },

      insurance: {
        number: String,

        expiryDate: Date,

        document: String,
      },
    },

    // =====================================
    // Bank Details
    // =====================================

    bankDetails: {
      accountHolderName: {
        type: String,

        trim: true,
      },

      accountNumber: {
        type: String,
      },

      bankName: String,

      branchName: String,

      ifscCode: {
        type: String,

        uppercase: true,

        trim: true,
      },

      upiId: String,
    },

    // =====================================
    // Address
    // =====================================

    address: {
      addressLine1: String,

      addressLine2: String,

      city: String,

      state: String,

      country: {
        type: String,

        default: "India",
      },

      pincode: String,

      location: {
        latitude: Number,

        longitude: Number,
      },
    },

    // =====================================
    // Availability
    // =====================================

    availability: {
      isOnline: {
        type: Boolean,

        default: false,
      },

      currentStatus: {
        type: String,

        enum: ["available", "busy", "offline", "break"],

        default: "offline",
      },

      workingDays: [
        {
          type: String,

          enum: [
            "Monday",

            "Tuesday",

            "Wednesday",

            "Thursday",

            "Friday",

            "Saturday",

            "Sunday",
          ],
        },
      ],

      shiftTiming: {
        startTime: String,

        endTime: String,
      },

      lastOnlineAt: Date,

      currentLocation: {
        latitude: Number,

        longitude: Number,
      },
    },

    // =====================================
    // Performance
    // =====================================

    performance: {
      totalOrdersAssigned: {
        type: Number,

        default: 0,
      },

      totalOrdersDelivered: {
        type: Number,

        default: 0,
      },

      totalOrdersCancelled: {
        type: Number,

        default: 0,
      },

      averageDeliveryTime: {
        type: Number,

        default: 0,

        // Minutes
      },

      customerRating: {
        type: Number,

        default: 0,

        min: 0,

        max: 5,
      },

      totalRatings: {
        type: Number,

        default: 0,
      },

      successRate: {
        type: Number,

        default: 0,
      },
    },

    // =====================================
    // Status
    // =====================================

    status: {
      type: String,

      enum: [
        "pending",

        "approved",

        "rejected",

        "active",

        "inactive",

        "blocked",
      ],

      default: "pending",
    },

    verificationStatus: {
      type: String,

      enum: ["pending", "verified", "failed"],

      default: "pending",
    },

    // =====================================
    // Audit Fields
    // =====================================

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "User",
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "User",
    },

    isDeleted: {
      type: Boolean,

      default: false,
    },

    deletedAt: {
      type: Date,

      default: null,
    },
  },

  {
    timestamps: true,

    versionKey: false,

    minimize: false,
  },
);

// =====================================
// Pre Save Validation
// =====================================

deliveryPartnerSchema.pre("save", function () {
  try {
    // Vehicle Number Uppercase

    if (this.vehicleDetails?.vehicleNumber) {
      this.vehicleDetails.vehicleNumber = this.vehicleDetails.vehicleNumber
        .toUpperCase()
        .trim();
    }

    // IFSC Uppercase

    if (this.bankDetails?.ifscCode) {
      this.bankDetails.ifscCode = this.bankDetails.ifscCode
        .toUpperCase()
        .trim();
    }

    // Email Lowercase

    if (this.personalDetails?.email) {
      this.personalDetails.email = this.personalDetails.email
        .toLowerCase()
        .trim();
    }

    // Calculate Success Rate

    const assigned = this.performance.totalOrdersAssigned;

    if (assigned > 0) {
      this.performance.successRate =
        Number(
          (this.performance.totalOrdersDelivered / assigned) * 100,
        ).toFixed(2) * 1;
    }

   
  } catch (error) {
    return error;
  }
});
// =====================================
// Virtual Fields
// =====================================

// Full Name

deliveryPartnerSchema.virtual("fullName").get(function () {
  return `${this.personalDetails.firstName || ""} ${
    this.personalDetails.lastName || ""
  }`.trim();
});

// Delivery Completion Percentage

deliveryPartnerSchema.virtual("deliveryCompletionPercentage").get(function () {
  const assigned = this.performance.totalOrdersAssigned || 0;

  if (assigned === 0) {
    return 0;
  }

  return (
    Number((this.performance.totalOrdersDelivered / assigned) * 100).toFixed(
      2,
    ) * 1
  );
});

// =====================================
// Database Indexes
// =====================================

// Restaurant based search

deliveryPartnerSchema.index({
  restaurant: 1,

  status: 1,
});

// Store based search

deliveryPartnerSchema.index({
  store: 1,

  status: 1,
});

// Online partner search

deliveryPartnerSchema.index({
  "availability.isOnline": 1,

  "availability.currentStatus": 1,
});

// Rating sorting

deliveryPartnerSchema.index({
  "performance.customerRating": -1,
});

// Phone unique

deliveryPartnerSchema.index(
  {
    "personalDetails.phone": 1,
  },
  {
    unique: true,
  },
);

// Email search

deliveryPartnerSchema.index(
  {
    "personalDetails.email": 1,
  },
  {
    sparse: true,
  },
);

// Soft delete filtering

deliveryPartnerSchema.index({
  isDeleted: 1,

  status: 1,
});

// Geo location search
// Used for nearest delivery partner

deliveryPartnerSchema.index({
  "availability.currentLocation": "2dsphere",
});

// =====================================
// Query Middleware
// Soft Delete
// =====================================

// Find queries

deliveryPartnerSchema.pre(/^find/, function () {
  const filter = this.getFilter();

  // Allow admin to get deleted records

  if (!filter.includeDeleted) {
    this.where({
      isDeleted: false,
    });
  }

  delete filter.includeDeleted;

 
});

// Count Queries

deliveryPartnerSchema.pre("countDocuments", function () {
  const filter = this.getFilter();

  if (!filter.includeDeleted) {
    this.where({
      isDeleted: false,
    });
  }

  delete filter.includeDeleted;


});

// Aggregate Queries

deliveryPartnerSchema.pre("aggregate", function () {
  this.pipeline().unshift({
    $match: {
      isDeleted: false,
    },
  });


});

// =====================================
// Instance Methods
// =====================================

// =====================================
// Partner Goes Online
// =====================================

deliveryPartnerSchema.methods.goOnline = async function () {
  this.availability.isOnline = true;

  this.availability.currentStatus = "available";

  this.availability.lastOnlineAt = new Date();

  return await this.save();
};

// =====================================
// Partner Goes Offline
// =====================================

deliveryPartnerSchema.methods.goOffline = async function () {
  this.availability.isOnline = false;

  this.availability.currentStatus = "offline";

  return await this.save();
};

// =====================================
// Mark Partner Busy
// =====================================

deliveryPartnerSchema.methods.markBusy = async function () {
  this.availability.currentStatus = "busy";

  return await this.save();
};

// =====================================
// Mark Partner Available
// =====================================

deliveryPartnerSchema.methods.markAvailable = async function () {
  this.availability.currentStatus = "available";

  return await this.save();
};

// =====================================
// Complete Delivery
// =====================================

deliveryPartnerSchema.methods.completeDelivery = async function (
  deliveryMinutes = 0,
) {
  this.performance.totalOrdersAssigned += 1;

  this.performance.totalOrdersDelivered += 1;

  const delivered = this.performance.totalOrdersDelivered;

  // Average Delivery Time Calculation

  if (deliveryMinutes > 0) {
    const oldAverage = this.performance.averageDeliveryTime || 0;

    this.performance.averageDeliveryTime =
      (oldAverage * (delivered - 1) + deliveryMinutes) / delivered;
  }

  this.performance.successRate =
    Number(
      (this.performance.totalOrdersDelivered /
        this.performance.totalOrdersAssigned) *
        100,
    ).toFixed(2) * 1;

  this.availability.currentStatus = "available";

  return await this.save();
};

// =====================================
// Cancel Delivery
// =====================================

deliveryPartnerSchema.methods.cancelDelivery = async function () {
  this.performance.totalOrdersAssigned += 1;

  this.performance.totalOrdersCancelled += 1;

  this.performance.successRate =
    Number(
      (this.performance.totalOrdersDelivered /
        this.performance.totalOrdersAssigned) *
        100,
    ).toFixed(2) * 1;

  this.availability.currentStatus = "available";

  return await this.save();
};

// =====================================
// Soft Delete
// =====================================

deliveryPartnerSchema.methods.softDelete = async function () {
  this.isDeleted = true;

  this.deletedAt = new Date();

  this.status = "inactive";

  this.availability.isOnline = false;

  this.availability.currentStatus = "offline";

  return await this.save();
};

// =====================================
// Restore Partner
// =====================================

deliveryPartnerSchema.methods.restore = async function () {
  this.isDeleted = false;

  this.deletedAt = null;

  this.status = "active";

  return await this.save();
};
// =====================================
// Static Methods
// =====================================

// =====================================
// Get Available Partners
// =====================================

deliveryPartnerSchema.statics.getAvailablePartners = function (restaurantId) {
  return this.find({
    restaurant: restaurantId,

    status: "active",

    "availability.isOnline": true,

    "availability.currentStatus": "available",
  }).populate("store", "storeName location");
};

// =====================================
// Get Online Partners
// =====================================

deliveryPartnerSchema.statics.getOnlinePartners = function (restaurantId) {
  return this.find({
    restaurant: restaurantId,

    status: "active",

    "availability.isOnline": true,
  });
};

// =====================================
// Get Top Rated Partners
// =====================================

deliveryPartnerSchema.statics.getTopRatedPartners = function (
  restaurantId,
  limit = 10,
) {
  return this.find({
    restaurant: restaurantId,

    status: "active",
  })
    .sort({
      "performance.customerRating": -1,
    })
    .limit(limit);
};

// =====================================
// Get Store Partners
// =====================================

deliveryPartnerSchema.statics.getStorePartners = function (storeId) {
  return this.find({
    store: storeId,

    status: "active",
  });
};

// =====================================
// Delivery Summary Report
// =====================================

deliveryPartnerSchema.statics.getDeliverySummary = async function (
  restaurantId,
) {
  const result = await this.aggregate([
    {
      $match: {
        restaurant: new mongoose.Types.ObjectId(restaurantId),

        isDeleted: false,
      },
    },

    {
      $group: {
        _id: null,

        totalPartners: {
          $sum: 1,
        },

        totalAssigned: {
          $sum: "$performance.totalOrdersAssigned",
        },

        totalDelivered: {
          $sum: "$performance.totalOrdersDelivered",
        },

        totalCancelled: {
          $sum: "$performance.totalOrdersCancelled",
        },

        averageRating: {
          $avg: "$performance.customerRating",
        },

        averageDeliveryTime: {
          $avg: "$performance.averageDeliveryTime",
        },
      },
    },
  ]);

  return (
    result[0] || {
      totalPartners: 0,

      totalAssigned: 0,

      totalDelivered: 0,

      totalCancelled: 0,

      averageRating: 0,

      averageDeliveryTime: 0,
    }
  );
};

// =====================================
// JSON Settings
// =====================================

deliveryPartnerSchema.set("toJSON", {
  virtuals: true,

  versionKey: false,

  transform: function (doc, ret) {
    // Remove Internal Fields

    delete ret.isDeleted;

    delete ret.deletedAt;

    if (ret.bankDetails) {
      delete ret.bankDetails.accountNumber;
    }

    return ret;
  },
});

deliveryPartnerSchema.set("toObject", {
  virtuals: true,
});

deliveryPartnerSchema.set("id", false);

deliveryPartnerSchema.set("minimize", false);

module.exports = mongoose.model("DeliveryPartner", deliveryPartnerSchema);
