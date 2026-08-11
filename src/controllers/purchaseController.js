const mongoose = require("mongoose");

const Purchase = require("../models/Purchase");
const Supplier = require("../models/Supplier");
const Restaurant = require("../models/Restaurant");
const Store = require("../models/storeModel");
const Warehouse = require("../models/wareHouseModel");
const Ingredient = require("../models/Ingredient");
const Unit = require("../models/unitModel");

/* ==========================================================
   Helper - Validate ObjectId
========================================================== */

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

/* ==========================================================
   CREATE PURCHASE
========================================================== */

exports.createPurchase = async (req, res) => {
  try {
    const {
      purchaseNo,
      supplier,
      restaurant,
      store,
      warehouse,
      items,
    } = req.body;

    /* Required fields */

    if (
      !purchaseNo ||
      !supplier ||
      !restaurant ||
      !store ||
      !items ||
      !items.length
    ) {
      return res.status(400).json({
        success: false,
        message:
          "purchaseNo, supplier, restaurant, store and items are required.",
      });
    }

    /* Validate IDs */

    if (!isValidObjectId(supplier)) {
      return res.status(400).json({
        success: false,
        message: "Invalid supplier ID.",
      });
    }

    if (!isValidObjectId(restaurant)) {
      return res.status(400).json({
        success: false,
        message: "Invalid restaurant ID.",
      });
    }

    if (!isValidObjectId(store)) {
      return res.status(400).json({
        success: false,
        message: "Invalid store ID.",
      });
    }

    if (
      warehouse &&
      !isValidObjectId(warehouse)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid warehouse ID.",
      });
    }

    /* ======================================================
       Validate Supplier
    ====================================================== */

    const supplierExists =
      await Supplier.findOne({
        _id: supplier,
        isDeleted: false,
      });

    if (!supplierExists) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found.",
      });
    }

    /* ======================================================
       Validate Restaurant
    ====================================================== */

    const restaurantExists =
      await Restaurant.findById(
        restaurant
      );

    if (!restaurantExists) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found.",
      });
    }

    /* ======================================================
       Validate Store
    ====================================================== */

    const storeExists =
      await Store.findById(store);

    if (!storeExists) {
      return res.status(404).json({
        success: false,
        message: "Store not found.",
      });
    }

    /* ======================================================
       Validate Warehouse
    ====================================================== */

    if (warehouse) {
      const warehouseExists =
        await Warehouse.findOne({
          _id: warehouse,
          isDeleted: false,
        });

      if (!warehouseExists) {
        return res.status(404).json({
          success: false,
          message:
            "Warehouse not found.",
        });
      }
    }

    /* ======================================================
       Validate Items
    ====================================================== */

    for (const item of items) {
      if (!item.ingredient) {
        return res.status(400).json({
          success: false,
          message:
            "Ingredient is required for every purchase item.",
        });
      }

      if (!isValidObjectId(item.ingredient)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid ingredient ID.",
        });
      }

      if (!item.unit) {
        return res.status(400).json({
          success: false,
          message:
            "Unit is required for every purchase item.",
        });
      }

      if (!isValidObjectId(item.unit)) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid unit ID.",
        });
      }

      const ingredient =
        await Ingredient.findOne({
          _id: item.ingredient,
          isDeleted: false,
        });

      if (!ingredient) {
        return res.status(404).json({
          success: false,
          message:
            `Ingredient ${item.ingredient} not found.`,
        });
      }

      const unit =
        await Unit.findById(
          item.unit
        );

      if (!unit) {
        return res.status(404).json({
          success: false,
          message:
            `Unit ${item.unit} not found.`,
        });
      }
    }

    /* ======================================================
       Duplicate Purchase Number
    ====================================================== */

    const existingPurchase =
      await Purchase.findOne({
        purchaseNo:
          purchaseNo.toUpperCase(),
      });

    if (existingPurchase) {
      return res.status(400).json({
        success: false,
        message:
          "Purchase number already exists.",
      });
    }

    /* ======================================================
       Create Purchase
    ====================================================== */

    const purchase =
      await Purchase.create({
        ...req.body,

        purchaseNo:
          purchaseNo.toUpperCase(),

        createdBy:
          req.user?.id ||
          req.user?._id ||
          null,
      });

    /* ======================================================
       Populate
    ====================================================== */

    const populatedPurchase =
      await Purchase.findById(
        purchase._id
      )
        .populate(
          "supplier",
          "supplierName supplierCode phone"
        )
        .populate(
          "restaurant",
          "restaurantName restaurantCode"
        )
        .populate(
          "store",
          "storeName storeCode"
        )
        .populate(
          "warehouse",
          "warehouseName warehouseCode"
        )
        .populate(
          "items.ingredient",
          "ingredientName ingredientCode"
        )
        .populate(
          "items.unit",
          "unitName shortName"
        )
        .populate(
          "items.purchaseUnit",
          "unitName shortName"
        );

    return res.status(201).json({
      success: true,
      message:
        "Purchase created successfully.",
      data: populatedPurchase,
    });
  } catch (error) {
    console.error(
      "createPurchase:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create purchase.",
      error: error.message,
    });
  }
};

/* ==========================================================
   GET ALL PURCHASES
========================================================== */

exports.getPurchases = async (
  req,
  res
) => {
  try {
    const {
      page = 1,
      limit = 10,
      supplier,
      restaurant,
      store,
      warehouse,
      paymentStatus,
      purchaseStatus,
    } = req.query;

    const filter = {
      isDeleted: false,
    };

    if (supplier) {
      filter.supplier = supplier;
    }

    if (restaurant) {
      filter.restaurant = restaurant;
    }

    if (store) {
      filter.store = store;
    }

    if (warehouse) {
      filter.warehouse = warehouse;
    }

    if (paymentStatus) {
      filter.paymentStatus =
        paymentStatus;
    }

    if (purchaseStatus) {
      filter.purchaseStatus =
        purchaseStatus;
    }

    const pageNumber =
      Number(page);

    const pageLimit =
      Number(limit);

    const totalRecords =
      await Purchase.countDocuments(
        filter
      );

    const purchases =
      await Purchase.find(filter)
        .populate(
          "supplier",
          "supplierName supplierCode phone"
        )
        .populate(
          "restaurant",
          "restaurantName restaurantCode"
        )
        .populate(
          "store",
          "storeName storeCode"
        )
        .populate(
          "warehouse",
          "warehouseName warehouseCode"
        )
        .sort({
          purchaseDate: -1,
        })
        .skip(
          (pageNumber - 1) *
            pageLimit
        )
        .limit(pageLimit);

    return res.status(200).json({
      success: true,
      totalRecords,
      currentPage: pageNumber,
      totalPages:
        Math.ceil(
          totalRecords /
            pageLimit
        ),
      count: purchases.length,
      data: purchases,
    });
  } catch (error) {
    console.error(
      "getPurchases:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch purchases.",
      error: error.message,
    });
  }
};

/* ==========================================================
   GET PURCHASE BY ID
========================================================== */

exports.getPurchaseById = async (
  req,
  res
) => {
  try {
    if (
      !isValidObjectId(
        req.params.id
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid purchase ID.",
      });
    }

    const purchase =
      await Purchase.findOne({
        _id: req.params.id,
        isDeleted: false,
      })
        .populate("supplier")
        .populate("restaurant")
        .populate("store")
        .populate("warehouse")
        .populate(
          "items.ingredient"
        )
        .populate(
          "items.unit"
        )
        .populate(
          "items.purchaseUnit"
        );

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message:
          "Purchase not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: purchase,
    });
  } catch (error) {
    console.error(
      "getPurchaseById:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch purchase.",
      error: error.message,
    });
  }
};

/* ==========================================================
   UPDATE PURCHASE
========================================================== */

exports.updatePurchase = async (
  req,
  res
) => {
  try {
    const purchase =
      await Purchase.findOne({
        _id: req.params.id,
        isDeleted: false,
      });

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message:
          "Purchase not found.",
      });
    }

    /* Prevent changing generated totals manually */

    const allowedFields = [
      "purchaseDate",
      "supplier",
      "restaurant",
      "store",
      "warehouse",
      "invoiceNumber",
      "invoiceDate",
      "items",
      "discountAmount",
      "shippingCharge",
      "otherCharges",
      "roundOffAmount",
      "paidAmount",
      "paymentMethod",
      "purchaseStatus",
      "remarks",
    ];

    allowedFields.forEach(
      (field) => {
        if (
          req.body[field] !==
          undefined
        ) {
          purchase[field] =
            req.body[field];
        }
      }
    );

    purchase.updatedBy =
      req.user?.id ||
      req.user?._id ||
      null;

    /* pre save recalculates totals */

    await purchase.save();

    return res.status(200).json({
      success: true,
      message:
        "Purchase updated successfully.",
      data: purchase,
    });
  } catch (error) {
    console.error(
      "updatePurchase:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to update purchase.",
      error: error.message,
    });
  }
};

/* ==========================================================
   DELETE PURCHASE
========================================================== */

exports.deletePurchase = async (
  req,
  res
) => {
  try {
    const purchase =
      await Purchase.findOne({
        _id: req.params.id,
        isDeleted: false,
      });

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message:
          "Purchase not found.",
      });
    }

    purchase.isDeleted = true;

    purchase.updatedBy =
      req.user?.id ||
      req.user?._id ||
      null;

    await purchase.save();

    return res.status(200).json({
      success: true,
      message:
        "Purchase deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        "Failed to delete purchase.",
      error: error.message,
    });
  }
};

/* ==========================================================
   RESTORE PURCHASE
========================================================== */

exports.restorePurchase = async (
  req,
  res
) => {
  try {
    const purchase =
      await Purchase.findOne({
        _id: req.params.id,
        isDeleted: true,
      });

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message:
          "Deleted purchase not found.",
      });
    }

    purchase.isDeleted = false;

    purchase.updatedBy =
      req.user?.id ||
      req.user?._id ||
      null;

    await purchase.save();

    return res.status(200).json({
      success: true,
      message:
        "Purchase restored successfully.",
      data: purchase,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        "Failed to restore purchase.",
      error: error.message,
    });
  }
};

/* ==========================================================
   RECEIVE PURCHASE
========================================================== */

exports.receivePurchase = async (
  req,
  res
) => {
  try {
    const purchase =
      await Purchase.findOne({
        _id: req.params.id,
        isDeleted: false,
      });

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message:
          "Purchase not found.",
      });
    }

    if (
      purchase.purchaseStatus ===
      "Cancelled"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Cancelled purchase cannot be received.",
      });
    }

    purchase.purchaseStatus =
      "Received";

    purchase.updatedBy =
      req.user?.id ||
      req.user?._id ||
      null;

    await purchase.save();

    return res.status(200).json({
      success: true,
      message:
        "Purchase received successfully.",
      data: purchase,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        "Failed to receive purchase.",
      error: error.message,
    });
  }
};

/* ==========================================================
   CANCEL PURCHASE
========================================================== */

exports.cancelPurchase = async (
  req,
  res
) => {
  try {
    const purchase =
      await Purchase.findOne({
        _id: req.params.id,
        isDeleted: false,
      });

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message:
          "Purchase not found.",
      });
    }

    if (
      purchase.purchaseStatus ===
      "Received"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Received purchase cannot be cancelled.",
      });
    }

    purchase.purchaseStatus =
      "Cancelled";

    purchase.updatedBy =
      req.user?.id ||
      req.user?._id ||
      null;

    await purchase.save();

    return res.status(200).json({
      success: true,
      message:
        "Purchase cancelled successfully.",
      data: purchase,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        "Failed to cancel purchase.",
      error: error.message,
    });
  }
};

/* ==========================================================
   UPDATE PAYMENT
========================================================== */

exports.updatePaymentStatus = async (
  req,
  res
) => {
  try {
    const {
      paidAmount,
      paymentMethod,
    } = req.body;

    if (
      paidAmount === undefined ||
      Number(paidAmount) < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Valid paidAmount is required.",
      });
    }

    const purchase =
      await Purchase.findOne({
        _id: req.params.id,
        isDeleted: false,
      });

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message:
          "Purchase not found.",
      });
    }

    if (
      Number(paidAmount) >
      Number(purchase.grandTotal)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Paid amount cannot be greater than grand total.",
      });
    }

    purchase.paidAmount =
      Number(paidAmount);

    if (paymentMethod) {
      purchase.paymentMethod =
        paymentMethod;
    }

    purchase.updatedBy =
      req.user?.id ||
      req.user?._id ||
      null;

    await purchase.save();

    return res.status(200).json({
      success: true,
      message:
        "Payment updated successfully.",
      data: purchase,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        "Failed to update payment.",
      error: error.message,
    });
  }
};

/* ==========================================================
   TODAY PURCHASES
========================================================== */

exports.todayPurchases = async (
  req,
  res
) => {
  try {
    const start = new Date();

    start.setHours(
      0,
      0,
      0,
      0
    );

    const end = new Date();

    end.setHours(
      23,
      59,
      59,
      999
    );

    const purchases =
      await Purchase.find({
        purchaseDate: {
          $gte: start,
          $lte: end,
        },
        isDeleted: false,
      })
        .populate(
          "supplier",
          "supplierName"
        )
        .populate(
          "store",
          "storeName"
        )
        .sort({
          purchaseDate: -1,
        });

    return res.status(200).json({
      success: true,
      count: purchases.length,
      data: purchases,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch today's purchases.",
      error: error.message,
    });
  }
};

/* ==========================================================
   SUPPLIER WISE PURCHASE
========================================================== */

exports.supplierWisePurchase = async (
  req,
  res
) => {
  try {
    const purchases =
      await Purchase.find({
        supplier:
          req.params.supplierId,
        isDeleted: false,
      })
        .populate(
          "supplier",
          "supplierName supplierCode"
        )
        .sort({
          purchaseDate: -1,
        });

    return res.status(200).json({
      success: true,
      count: purchases.length,
      data: purchases,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch supplier purchases.",
      error: error.message,
    });
  }
};

/* ==========================================================
   STORE WISE PURCHASE
========================================================== */

exports.storeWisePurchase = async (
  req,
  res
) => {
  try {
    const purchases =
      await Purchase.find({
        store:
          req.params.storeId,
        isDeleted: false,
      })
        .populate(
          "store",
          "storeName storeCode"
        )
        .sort({
          purchaseDate: -1,
        });

    return res.status(200).json({
      success: true,
      count: purchases.length,
      data: purchases,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch store purchases.",
      error: error.message,
    });
  }
};

/* ==========================================================
   PURCHASE SUMMARY
========================================================== */

exports.purchaseSummary = async (
  req,
  res
) => {
  try {
    const summary =
      await Purchase.aggregate([
        {
          $match: {
            isDeleted: false,
          },
        },

        {
          $group: {
            _id: null,

            totalPurchase: {
              $sum: "$grandTotal",
            },

            totalPaid: {
              $sum: "$paidAmount",
            },

            totalDue: {
              $sum: "$dueAmount",
            },

            count: {
              $sum: 1,
            },
          },
        },
      ]);

    return res.status(200).json({
      success: true,
      data:
        summary[0] || {
          totalPurchase: 0,
          totalPaid: 0,
          totalDue: 0,
          count: 0,
        },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch purchase summary.",
      error: error.message,
    });
  }
};

/* ==========================================================
   SEARCH PURCHASE
========================================================== */

exports.searchPurchase = async (
  req,
  res
) => {
  try {
    const keyword =
      req.query.search?.trim();

    if (!keyword) {
      return res.status(400).json({
        success: false,
        message:
          "Search keyword is required.",
      });
    }

    const purchases =
      await Purchase.find({
        isDeleted: false,

        $or: [
          {
            purchaseNo: {
              $regex: keyword,
              $options: "i",
            },
          },

          {
            invoiceNumber: {
              $regex: keyword,
              $options: "i",
            },
          },

          {
            "items.ingredientName": {
              $regex: keyword,
              $options: "i",
            },
          },
        ],
      })
        .populate(
          "supplier",
          "supplierName supplierCode"
        )
        .populate(
          "store",
          "storeName"
        )
        .sort({
          purchaseDate: -1,
        });

    return res.status(200).json({
      success: true,
      count: purchases.length,
      data: purchases,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        "Failed to search purchases.",
      error: error.message,
    });
  }
};