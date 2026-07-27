const Supplier = require("../models/Supplier");
const Restaurant = require("../models/Restaurant");
const Store = require("../models/storeModel");

/* ==========================================================
   Create Supplier
========================================================== */

exports.createSupplier = async (req, res) => {
  try {
    const {
      restaurant,
      store,
      supplierCode,
      supplierName,
      companyName,
      contactPerson,
      mobile,
      alternateMobile,
      email,
      website,
      gstNumber,
      panNumber,
      licenseNumber,
      address,
      bankDetails,
      paymentTerms,
      creditLimit,
      outstandingAmount,
      totalPurchaseAmount,
      totalOrders,
      supplierType,
      rating,
      isPreferredSupplier,
      remarks,
    } = req.body;

    // Restaurant Validation
    const restaurantExists = await Restaurant.findById(restaurant);

    if (!restaurantExists) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found.",
      });
    }

    // Store Validation
    const storeExists = await Store.findById(store);

    if (!storeExists) {
      return res.status(404).json({
        success: false,
        message: "Store not found.",
      });
    }

    // Duplicate Supplier Code
    const existingSupplier = await Supplier.findOne({
      supplierCode: supplierCode.toUpperCase(),
    });

    if (existingSupplier) {
      return res.status(400).json({
        success: false,
        message: "Supplier code already exists.",
      });
    }

    const supplier = await Supplier.create({
      restaurant,
      store,
      supplierCode: supplierCode.toUpperCase(),
      supplierName,
      companyName,
      contactPerson,
      mobile,
      alternateMobile,
      email,
      website,
      gstNumber,
      panNumber,
      licenseNumber,
      address,
      bankDetails,
      paymentTerms,
      creditLimit,
      outstandingAmount,
      totalPurchaseAmount,
      totalOrders,
      supplierType,
      rating,
      isPreferredSupplier,
      remarks,
      createdBy: req.user?.id,
    });

    const populatedSupplier = await Supplier.findById(supplier._id)
      .populate("restaurant", "restaurantName restaurantCode")
      .populate("store", "storeName storeCode");

    return res.status(201).json({
      success: true,
      message: "Supplier created successfully.",
      data: populatedSupplier,
    });
  } catch (error) {
    console.error("createSupplier:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create supplier.",
      error: error.message,
    });
  }
};

/* ==========================================================
   Get All Suppliers
========================================================== */

exports.getSuppliers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      restaurant,
      store,
      supplierType,
      isActive,
    } = req.query;

    const filter = {
      isDeleted: false,
    };

    if (restaurant) filter.restaurant = restaurant;
    if (store) filter.store = store;
    if (supplierType) filter.supplierType = supplierType;

    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    const totalRecords = await Supplier.countDocuments(filter);

    const suppliers = await Supplier.find(filter)
      .populate("restaurant", "restaurantName restaurantCode")
      .populate("store", "storeName storeCode")
      .sort({ createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      totalRecords,
      currentPage: Number(page),
      totalPages: Math.ceil(totalRecords / Number(limit)),
      count: suppliers.length,
      data: suppliers,
    });
  } catch (error) {
    console.error("getSuppliers:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch suppliers.",
      error: error.message,
    });
  }
};

/* ==========================================================
   Get Supplier By ID
========================================================== */

exports.getSupplierById = async (req, res) => {
  try {
    const supplier = await Supplier.findOne({
      _id: req.params.id,
      isDeleted: false,
    })
      .populate("restaurant", "restaurantName restaurantCode ownerName phone")
      .populate("store", "storeName storeCode managerName phone")
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email");

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: supplier,
    });
  } catch (error) {
    console.error("getSupplierById:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch supplier.",
      error: error.message,
    });
  }
};

exports.updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findOne({
      _id: req.params.id,

      isDeleted: false,
    });

    if (!supplier) {
      return res.status(404).json({
        success: false,

        message: "Supplier not found.",
      });
    }

    const fields = [
      "restaurant",

      "store",

      "supplierCode",

      "supplierName",

      "companyName",

      "contactPerson",

      "mobile",

      "alternateMobile",

      "email",

      "website",

      "gstNumber",

      "panNumber",

      "licenseNumber",

      "paymentTerms",

      "creditLimit",

      "outstandingAmount",

      "totalPurchaseAmount",

      "totalOrders",

      "supplierType",

      "rating",

      "remarks",
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        supplier[field] =
          field === "supplierCode"
            ? req.body[field].toUpperCase()
            : req.body[field];
      }
    });

    if (req.body.address)
      supplier.address = {
        ...supplier.address.toObject(),

        ...req.body.address,
      };

    if (req.body.bankDetails)
      supplier.bankDetails = {
        ...supplier.bankDetails.toObject(),

        ...req.body.bankDetails,
      };

    supplier.updatedBy = req.user?.id;

    await supplier.save();

    const updated = await Supplier.findById(supplier._id)

      .populate("restaurant", "restaurantName restaurantCode")

      .populate("store", "storeName storeCode");

    res.status(200).json({
      success: true,

      message: "Supplier updated successfully.",

      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

/* ==========================================================

   Delete Supplier (Soft Delete)

========================================================== */

exports.deleteSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findOne({
      _id: req.params.id,

      isDeleted: false,
    });

    if (!supplier) {
      return res.status(404).json({
        success: false,

        message: "Supplier not found.",
      });
    }

    supplier.isDeleted = true;

    supplier.updatedBy = req.user?.id;

    await supplier.save();

    res.status(200).json({
      success: true,

      message: "Supplier deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

/* ==========================================================

   Restore Supplier

========================================================== */

exports.restoreSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findOne({
      _id: req.params.id,

      isDeleted: true,
    });

    if (!supplier) {
      return res.status(404).json({
        success: false,

        message: "Deleted supplier not found.",
      });
    }

    supplier.isDeleted = false;

    supplier.updatedBy = req.user?.id;

    await supplier.save();

    res.status(200).json({
      success: true,

      message: "Supplier restored successfully.",

      data: supplier,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

/* ==========================================================

   Activate Supplier

========================================================== */

exports.activateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findOneAndUpdate(
      {
        _id: req.params.id,

        isDeleted: false,
      },

      {
        isActive: true,

        updatedBy: req.user?.id,
      },

      {
        new: true,
      },
    );

    if (!supplier) {
      return res.status(404).json({
        success: false,

        message: "Supplier not found.",
      });
    }

    res.status(200).json({
      success: true,

      message: "Supplier activated successfully.",

      data: supplier,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

/* ==========================================================

   Deactivate Supplier

========================================================== */

exports.deactivateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findOneAndUpdate(
      {
        _id: req.params.id,

        isDeleted: false,
      },

      {
        isActive: false,

        updatedBy: req.user?.id,
      },

      {
        new: true,
      },
    );

    if (!supplier) {
      return res.status(404).json({
        success: false,

        message: "Supplier not found.",
      });
    }

    res.status(200).json({
      success: true,

      message: "Supplier deactivated successfully.",

      data: supplier,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

/* ==========================================================

   Update Supplier Status

========================================================== */

exports.updateSupplierStatus = async (req, res) => {
  try {
    const { isActive } = req.body;

    const supplier = await Supplier.findOneAndUpdate(
      {
        _id: req.params.id,

        isDeleted: false,
      },

      {
        isActive,

        updatedBy: req.user?.id,
      },

      {
        new: true,
      },
    );

    if (!supplier) {
      return res.status(404).json({
        success: false,

        message: "Supplier not found.",
      });
    }

    res.status(200).json({
      success: true,

      message: "Supplier status updated successfully.",

      data: supplier,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

/* ==========================================================

   Mark Preferred Supplier

========================================================== */

exports.markPreferredSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findOneAndUpdate(
      {
        _id: req.params.id,

        isDeleted: false,
      },

      {
        isPreferredSupplier: true,

        updatedBy: req.user?.id,
      },

      {
        new: true,
      },
    );

    if (!supplier) {
      return res.status(404).json({
        success: false,

        message: "Supplier not found.",
      });
    }

    res.status(200).json({
      success: true,

      message: "Supplier marked as preferred.",

      data: supplier,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

/* ==========================================================

   Remove Preferred Supplier

========================================================== */

exports.removePreferredSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findOneAndUpdate(
      {
        _id: req.params.id,

        isDeleted: false,
      },

      {
        isPreferredSupplier: false,

        updatedBy: req.user?.id,
      },

      {
        new: true,
      },
    );

    if (!supplier) {
      return res.status(404).json({
        success: false,

        message: "Supplier not found.",
      });
    }

    res.status(200).json({
      success: true,

      message: "Supplier removed from preferred list.",

      data: supplier,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};
exports.searchSuppliers = async (req, res) => {
  try {
    const { keyword = "" } = req.query;

    const suppliers = await Supplier.find({
      isDeleted: false,
      $or: [
        { supplierCode: { $regex: keyword, $options: "i" } },
        { supplierName: { $regex: keyword, $options: "i" } },
        { companyName: { $regex: keyword, $options: "i" } },
        { contactPerson: { $regex: keyword, $options: "i" } },
        { mobile: { $regex: keyword, $options: "i" } },
        { email: { $regex: keyword, $options: "i" } },
      ],
    })
      .populate("restaurant", "restaurantName restaurantCode")
      .populate("store", "storeName storeCode");

    res.status(200).json({
      success: true,
      count: suppliers.length,
      data: suppliers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
   Active Suppliers
========================================================== */

exports.getActiveSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find({
      isActive: true,
      isDeleted: false,
    })
      .populate("restaurant", "restaurantName")
      .populate("store", "storeName");

    res.status(200).json({
      success: true,
      count: suppliers.length,
      data: suppliers,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ==========================================================
   Inactive Suppliers
========================================================== */

exports.getInactiveSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find({
      isActive: false,
      isDeleted: false,
    })
      .populate("restaurant", "restaurantName")
      .populate("store", "storeName");

    res.status(200).json({
      success: true,
      count: suppliers.length,
      data: suppliers,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ==========================================================
   Deleted Suppliers
========================================================== */

exports.getDeletedSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find({
      isDeleted: true,
    })
      .populate("restaurant", "restaurantName")
      .populate("store", "storeName");

    res.status(200).json({
      success: true,
      count: suppliers.length,
      data: suppliers,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ==========================================================
   Preferred Suppliers
========================================================== */

exports.getPreferredSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find({
      isPreferredSupplier: true,
      isDeleted: false,
    })
      .populate("restaurant", "restaurantName")
      .populate("store", "storeName");

    res.status(200).json({
      success: true,
      count: suppliers.length,
      data: suppliers,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ==========================================================
   Restaurant Suppliers
========================================================== */

exports.getSupplierByRestaurant = async (req, res) => {
  try {
    const suppliers = await Supplier.find({
      restaurant: req.params.restaurantId,
      isDeleted: false,
    }).populate("store", "storeName");

    res.status(200).json({
      success: true,
      count: suppliers.length,
      data: suppliers,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ==========================================================
   Store Suppliers
========================================================== */

exports.getSupplierByStore = async (req, res) => {
  try {
    const suppliers = await Supplier.find({
      store: req.params.storeId,
      isDeleted: false,
    }).populate("restaurant", "restaurantName");

    res.status(200).json({
      success: true,
      count: suppliers.length,
      data: suppliers,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ==========================================================
   Supplier Type
========================================================== */

exports.getSupplierByType = async (req, res) => {
  try {
    const suppliers = await Supplier.find({
      supplierType: req.params.type,
      isDeleted: false,
    });

    res.status(200).json({
      success: true,
      count: suppliers.length,
      data: suppliers,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ==========================================================
   Top Rated Suppliers
========================================================== */

exports.getTopRatedSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find({
      isDeleted: false,
    })
      .sort({ rating: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      count: suppliers.length,
      data: suppliers,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ==========================================================
   Outstanding Suppliers
========================================================== */

exports.getOutstandingSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find({
      outstandingAmount: { $gt: 0 },
      isDeleted: false,
    });

    res.status(200).json({
      success: true,
      count: suppliers.length,
      data: suppliers,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ==========================================================
   Paid Suppliers
========================================================== */

exports.getPaidSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find({
      outstandingAmount: 0,
      isDeleted: false,
    });

    res.status(200).json({
      success: true,
      count: suppliers.length,
      data: suppliers,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ==========================================================
   Credit Limit Suppliers
========================================================== */

exports.getCreditLimitSuppliers = async (req, res) => {
  try {
    const { amount = 0 } = req.query;

    const suppliers = await Supplier.find({
      creditLimit: { $gte: Number(amount) },
      isDeleted: false,
    });

    res.status(200).json({
      success: true,
      count: suppliers.length,
      data: suppliers,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ==========================================================
   Payment Term Suppliers
========================================================== */

exports.getPaymentTermSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find({
      paymentTerms: req.params.term,
      isDeleted: false,
    });

    res.status(200).json({
      success: true,
      count: suppliers.length,
      data: suppliers,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ==========================================================
   Supplier Summary
========================================================== */

exports.getSupplierSummary = async (req, res) => {
  try {
    const [
      totalSuppliers,
      activeSuppliers,
      inactiveSuppliers,
      preferredSuppliers,
      outstandingSuppliers,
      totalOutstanding,
      totalPurchase,
    ] = await Promise.all([
      Supplier.countDocuments({ isDeleted: false }),
      Supplier.countDocuments({ isActive: true, isDeleted: false }),
      Supplier.countDocuments({ isActive: false, isDeleted: false }),
      Supplier.countDocuments({
        isPreferredSupplier: true,
        isDeleted: false,
      }),
      Supplier.countDocuments({
        outstandingAmount: { $gt: 0 },
        isDeleted: false,
      }),
      Supplier.aggregate([
        {
          $match: { isDeleted: false },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$outstandingAmount" },
          },
        },
      ]),
      Supplier.aggregate([
        {
          $match: { isDeleted: false },
        },
        {
          $group: {
            _id: null,
            total: { $sum: "$totalPurchaseAmount" },
          },
        },
      ]),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalSuppliers,
        activeSuppliers,
        inactiveSuppliers,
        preferredSuppliers,
        outstandingSuppliers,
        totalOutstanding:
          totalOutstanding[0]?.total || 0,
        totalPurchase:
          totalPurchase[0]?.total || 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
   Supplier Analytics
========================================================== */

exports.getSupplierAnalytics = async (req, res) => {
  try {
    const analytics = await Supplier.aggregate([
      {
        $facet: {
          supplierTypes: [
            {
              $group: {
                _id: "$supplierType",
                total: { $sum: 1 },
              },
            },
          ],

          paymentTerms: [
            {
              $group: {
                _id: "$paymentTerms",
                total: { $sum: 1 },
              },
            },
          ],

          ratingWise: [
            {
              $group: {
                _id: "$rating",
                total: { $sum: 1 },
              },
            },
            {
              $sort: { _id: -1 },
            },
          ],

          monthlySuppliers: [
            {
              $group: {
                _id: {
                  year: { $year: "$createdAt" },
                  month: { $month: "$createdAt" },
                },
                total: { $sum: 1 },
              },
            },
            {
              $sort: {
                "_id.year": 1,
                "_id.month": 1,
              },
            },
          ],
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: analytics[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};