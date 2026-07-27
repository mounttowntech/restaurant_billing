const IngredientStockLedger = require("../models/ingradientStockLedger");

/* ==========================================================
   Create Ingredient Stock Ledger
========================================================== */

exports.createIngredientStockLedger = async (req, res) => {
  try {
    const {
      ledgerNo,
      ingredient,
      batch,
      unit,
      restaurant,
      store,
      warehouse,
      transactionType,
      referenceModel,
      referenceId,
      referenceNo,
      stockIn,
      stockOut,
      balanceStock,
      purchasePrice,
      remarks,
      transactionDate,
      status,
    } = req.body;

    // Check Duplicate Ledger Number
    const existingLedger = await IngredientStockLedger.findOne({
      ledgerNo: ledgerNo.trim().toUpperCase(),
      isDeleted: false,
    });

    if (existingLedger) {
      return res.status(400).json({
        success: false,
        message: "Ledger number already exists.",
      });
    }

    const ledger = await IngredientStockLedger.create({
      ledgerNo,
      ingredient,
      batch,
      unit,
      restaurant,
      store,
      warehouse,
      transactionType,
      referenceModel,
      referenceId,
      referenceNo,
      stockIn,
      stockOut,
      balanceStock,
      purchasePrice,
      remarks,
      transactionDate,
      status,
      createdBy: req.user?._id,
      updatedBy: req.user?._id,
    });

    return res.status(201).json({
      success: true,
      message: "Ingredient stock ledger created successfully.",
      data: ledger,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
   Get All Ingredient Stock Ledgers
========================================================== */

exports.getAllIngredientStockLedgers = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const {
      search,
      ingredient,
      restaurant,
      store,
      warehouse,
      transactionType,
      status,
    } = req.query;

    let query = {
      isDeleted: false,
    };

    if (ingredient) query.ingredient = ingredient;
    if (restaurant) query.restaurant = restaurant;
    if (store) query.store = store;
    if (warehouse) query.warehouse = warehouse;
    if (transactionType)
      query.transactionType = transactionType;
    if (status) query.status = status;

    if (search) {
      query.$or = [
        {
          ledgerNo: {
            $regex: search,
            $options: "i",
          },
        },
        {
          referenceNo: {
            $regex: search,
            $options: "i",
          },
        },
        {
          remarks: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const total =
      await IngredientStockLedger.countDocuments(query);

    const ledgers =
      await IngredientStockLedger.find(query)
        .populate("ingredient", "ingredientName")
        .populate("batch", "batchNo")
        .populate("unit", "unitName unitCode")
        .populate("restaurant", "restaurantName")
        .populate("store", "storeName")
        .populate("warehouse", "warehouseName")
        .populate("createdBy", "name")
        .populate("updatedBy", "name")
        .sort({
          transactionDate: -1,
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit);

    return res.status(200).json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      count: ledgers.length,
      data: ledgers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
   Get Ingredient Stock Ledger By ID
========================================================== */

exports.getIngredientStockLedgerById = async (
  req,
  res
) => {
  try {
    const ledger =
      await IngredientStockLedger.findOne({
        _id: req.params.id,
        isDeleted: false,
      })
        .populate("ingredient")
        .populate("batch")
        .populate("unit")
        .populate("restaurant")
        .populate("store")
        .populate("warehouse")
        .populate("createdBy", "name email")
        .populate("updatedBy", "name email");

    if (!ledger) {
      return res.status(404).json({
        success: false,
        message: "Ingredient stock ledger not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: ledger,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
   Update Ingredient Stock Ledger
========================================================== */

exports.updateIngredientStockLedger = async (
  req,
  res
) => {
  try {
    const ledger =
      await IngredientStockLedger.findOne({
        _id: req.params.id,
        isDeleted: false,
      });

    if (!ledger) {
      return res.status(404).json({
        success: false,
        message: "Ingredient stock ledger not found.",
      });
    }

    // Duplicate Ledger Number Check
    if (req.body.ledgerNo) {
      const exists =
        await IngredientStockLedger.findOne({
          _id: { $ne: req.params.id },
          ledgerNo: req.body.ledgerNo
            .trim()
            .toUpperCase(),
          isDeleted: false,
        });

      if (exists) {
        return res.status(400).json({
          success: false,
          message:
            "Ledger number already exists.",
        });
      }
    }

    Object.keys(req.body).forEach((key) => {
      ledger[key] = req.body[key];
    });

    ledger.updatedBy = req.user?._id;

    await ledger.save();

    return res.status(200).json({
      success: true,
      message:
        "Ingredient stock ledger updated successfully.",
      data: ledger,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
/* ==========================================================
   Delete Ingredient Stock Ledger (Soft Delete)
========================================================== */

exports.deleteIngredientStockLedger = async (req, res) => {
  try {
    const ledger = await IngredientStockLedger.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!ledger) {
      return res.status(404).json({
        success: false,
        message: "Ingredient stock ledger not found.",
      });
    }

    await ledger.softDelete(req.user?._id);

    return res.status(200).json({
      success: true,
      message: "Ingredient stock ledger deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
   Restore Ingredient Stock Ledger
========================================================== */

exports.restoreIngredientStockLedger = async (req, res) => {
  try {
    const ledger = await IngredientStockLedger.findOne({
      _id: req.params.id,
      isDeleted: true,
    });

    if (!ledger) {
      return res.status(404).json({
        success: false,
        message: "Deleted ingredient stock ledger not found.",
      });
    }

    ledger.isDeleted = false;
    ledger.updatedBy = req.user?._id;

    await ledger.save();

    return res.status(200).json({
      success: true,
      message: "Ingredient stock ledger restored successfully.",
      data: ledger,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
   Get Ingredient Ledger History
========================================================== */

exports.getIngredientLedgerHistory = async (req, res) => {
  try {
    const { ingredientId } = req.params;

    const history = await IngredientStockLedger.find({
      ingredient: ingredientId,
      isDeleted: false,
    })
      .populate("ingredient", "ingredientName ingredientCode")
      .populate("batch", "batchNo")
      .populate("unit", "unitName unitCode")
      .populate("restaurant", "restaurantName")
      .populate("store", "storeName")
      .populate("warehouse", "warehouseName")
      .populate("createdBy", "name")
      .sort({
        transactionDate: -1,
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: history.length,
      data: history,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
   Get Store Ledger
========================================================== */

exports.getStoreLedger = async (req, res) => {
  try {
    const { storeId } = req.params;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const total = await IngredientStockLedger.countDocuments({
      store: storeId,
      isDeleted: false,
    });

    const ledgers = await IngredientStockLedger.find({
      store: storeId,
      isDeleted: false,
    })
      .populate("ingredient", "ingredientName ingredientCode")
      .populate("batch", "batchNo")
      .populate("unit", "unitName")
      .populate("warehouse", "warehouseName")
      .populate("createdBy", "name")
      .sort({
        transactionDate: -1,
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      count: ledgers.length,
      data: ledgers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
/* ==========================================================
   Get Warehouse Ledger
========================================================== */

exports.getWarehouseLedger = async (req, res) => {
  try {
    const { warehouseId } = req.params;

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = {
      warehouse: warehouseId,
      isDeleted: false,
    };

    const total = await IngredientStockLedger.countDocuments(query);

    const ledgers = await IngredientStockLedger.find(query)
      .populate("ingredient", "ingredientName ingredientCode")
      .populate("batch", "batchNo")
      .populate("unit", "unitName")
      .populate("store", "storeName")
      .populate("warehouse", "warehouseName")
      .sort({
        transactionDate: -1,
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      count: ledgers.length,
      data: ledgers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
   Get Transaction Type Ledger
========================================================== */

exports.getTransactionTypeLedger = async (req, res) => {
  try {
    const { transactionType } = req.params;

    const ledgers = await IngredientStockLedger.find({
      transactionType,
      isDeleted: false,
    })
      .populate("ingredient", "ingredientName ingredientCode")
      .populate("store", "storeName")
      .populate("warehouse", "warehouseName")
      .sort({
        transactionDate: -1,
      });

    return res.status(200).json({
      success: true,
      count: ledgers.length,
      data: ledgers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
   Stock In Report
========================================================== */

exports.getStockInReport = async (req, res) => {
  try {
    const query = {
      stockIn: { $gt: 0 },
      isDeleted: false,
    };

    if (req.query.store)
      query.store = req.query.store;

    if (req.query.restaurant)
      query.restaurant = req.query.restaurant;

    if (req.query.ingredient)
      query.ingredient = req.query.ingredient;

    const report = await IngredientStockLedger.find(query)
      .populate("ingredient", "ingredientName ingredientCode")
      .populate("unit", "unitName")
      .populate("store", "storeName")
      .populate("warehouse", "warehouseName")
      .sort({
        transactionDate: -1,
      });

    return res.status(200).json({
      success: true,
      count: report.length,
      data: report,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
   Stock Out Report
========================================================== */

exports.getStockOutReport = async (req, res) => {
  try {
    const query = {
      stockOut: { $gt: 0 },
      isDeleted: false,
    };

    if (req.query.store)
      query.store = req.query.store;

    if (req.query.restaurant)
      query.restaurant = req.query.restaurant;

    if (req.query.ingredient)
      query.ingredient = req.query.ingredient;

    const report = await IngredientStockLedger.find(query)
      .populate("ingredient", "ingredientName ingredientCode")
      .populate("unit", "unitName")
      .populate("store", "storeName")
      .populate("warehouse", "warehouseName")
      .sort({
        transactionDate: -1,
      });

    return res.status(200).json({
      success: true,
      count: report.length,
      data: report,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
   Today's Transactions
========================================================== */

exports.getTodayTransactions = async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const transactions =
      await IngredientStockLedger.find({
        transactionDate: {
          $gte: start,
          $lte: end,
        },
        isDeleted: false,
      })
        .populate("ingredient", "ingredientName ingredientCode")
        .populate("store", "storeName")
        .populate("warehouse", "warehouseName")
        .sort({
          transactionDate: -1,
        });

    return res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
   Stock Summary
========================================================== */

exports.getStockSummary = async (req, res) => {
  try {
    const summary =
      await IngredientStockLedger.aggregate([
        {
          $match: {
            isDeleted: false,
          },
        },
        {
          $group: {
            _id: "$ingredient",
            totalStockIn: {
              $sum: "$stockIn",
            },
            totalStockOut: {
              $sum: "$stockOut",
            },
            currentBalance: {
              $max: "$balanceStock",
            },
            totalValue: {
              $max: "$totalValue",
            },
            totalTransactions: {
              $sum: 1,
            },
          },
        },
        {
          $lookup: {
            from: "ingredients",
            localField: "_id",
            foreignField: "_id",
            as: "ingredient",
          },
        },
        {
          $unwind: "$ingredient",
        },
        {
          $project: {
            ingredientId: "$ingredient._id",
            ingredientName:
              "$ingredient.ingredientName",
            ingredientCode:
              "$ingredient.ingredientCode",
            totalStockIn: 1,
            totalStockOut: 1,
            currentBalance: 1,
            totalValue: 1,
            totalTransactions: 1,
          },
        },
        {
          $sort: {
            ingredientName: 1,
          },
        },
      ]);

    return res.status(200).json({
      success: true,
      count: summary.length,
      data: summary,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};