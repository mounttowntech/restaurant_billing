const StockLedger = require("../models/StockLedger");
const Ingredient = require("../models/Ingredient");

/* ==========================================================
   Create Stock Ledger
========================================================== */

exports.createStockLedger = async (req, res) => {
  try {
    const {
      ingredient,
      movementType,
      quantity,
      beforeStock,
      afterStock,
      referenceId,
      referenceNumber,
      remarks,
    } = req.body;

    // Validate Ingredient
    const ingredientData = await Ingredient.findById(ingredient);

    if (!ingredientData) {
      return res.status(404).json({
        success: false,
        message: "Ingredient not found.",
      });
    }

    const stockLedger = await StockLedger.create({
      ingredient,
      movementType,
      quantity,
      beforeStock,
      afterStock,
      referenceId,
      referenceNumber,
      remarks,
    });

    const populatedLedger = await StockLedger.findById(
      stockLedger._id,
    ).populate("ingredient", "ingredientCode ingredientName currentStock");

    return res.status(201).json({
      success: true,
      message: "Stock ledger created successfully.",
      data: populatedLedger,
    });
  } catch (error) {
    console.error("createStockLedger:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create stock ledger.",
      error: error.message,
    });
  }
};

/* ==========================================================
   Get All Stock Ledgers
========================================================== */

exports.getStockLedgers = async (req, res) => {
  try {
    const { page = 1, limit = 10, ingredient, movementType } = req.query;

    const filter = {};

    if (ingredient) {
      filter.ingredient = ingredient;
    }

    if (movementType) {
      filter.movementType = movementType;
    }

    const totalRecords = await StockLedger.countDocuments(filter);

    const ledgers = await StockLedger.find(filter)
      .populate("ingredient", "ingredientCode ingredientName currentStock")
      .sort({
        createdAt: -1,
      })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      totalRecords,
      currentPage: Number(page),
      totalPages: Math.ceil(totalRecords / limit),
      count: ledgers.length,
      data: ledgers,
    });
  } catch (error) {
    console.error("getStockLedgers:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch stock ledger.",
      error: error.message,
    });
  }
};

/* ==========================================================
   Get Stock Ledger By ID
========================================================== */

exports.getStockLedgerById = async (req, res) => {
  try {
    const ledger = await StockLedger.findById(req.params.id).populate(
      "ingredient",
      "ingredientCode ingredientName currentStock",
    );

    if (!ledger) {
      return res.status(404).json({
        success: false,
        message: "Stock ledger not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: ledger,
    });
  } catch (error) {
    console.error("getStockLedgerById:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch stock ledger.",
      error: error.message,
    });
  }
};
exports.searchStockLedgers = async (req, res) => {
  try {
    const { keyword = "" } = req.query;

    const ledgers = await StockLedger.find({
      $or: [
        {
          referenceNumber: {
            $regex: keyword,
            $options: "i",
          },
        },
        {
          remarks: {
            $regex: keyword,
            $options: "i",
          },
        },
      ],
    })
      .populate("ingredient", "ingredientCode ingredientName")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: ledgers.length,
      data: ledgers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
   Purchase Movements
========================================================== */

exports.getPurchaseMovements = async (req, res) => {
  try {
    const data = await StockLedger.find({
      movementType: "purchase",
    })
      .populate("ingredient", "ingredientCode ingredientName")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
   Usage Movements
========================================================== */

exports.getUsageMovements = async (req, res) => {
  try {
    const data = await StockLedger.find({
      movementType: "usage",
    })
      .populate("ingredient", "ingredientCode ingredientName")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
   Wastage Movements
========================================================== */

exports.getWastageMovements = async (req, res) => {
  try {
    const data = await StockLedger.find({
      movementType: "wastage",
    })
      .populate("ingredient", "ingredientCode ingredientName")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
   Adjustment In
========================================================== */

exports.getAdjustmentInMovements = async (req, res) => {
  try {
    const data = await StockLedger.find({
      movementType: "adjustment_in",
    })
      .populate("ingredient", "ingredientCode ingredientName")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
   Adjustment Out
========================================================== */

exports.getAdjustmentOutMovements = async (req, res) => {
  try {
    const data = await StockLedger.find({
      movementType: "adjustment_out",
    })
      .populate("ingredient", "ingredientCode ingredientName")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
   Ingredient Ledger
========================================================== */

exports.getIngredientLedger = async (req, res) => {
  try {
    const { ingredientId } = req.params;

    const data = await StockLedger.find({
      ingredient: ingredientId,
    })
      .populate("ingredient", "ingredientCode ingredientName")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
   Today's Movements
========================================================== */

exports.getTodayMovements = async (req, res) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const data = await StockLedger.find({
      createdAt: {
        $gte: start,
        $lte: end,
      },
    })
      .populate("ingredient", "ingredientCode ingredientName")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
   Reference Ledger
========================================================== */

exports.getReferenceLedger = async (req, res) => {
  try {
    const { referenceId } = req.params;

    const data = await StockLedger.find({
      referenceId,
    })
      .populate("ingredient", "ingredientCode ingredientName")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
   Stock Ledger Summary
========================================================== */

exports.getStockLedgerSummary = async (req, res) => {
  try {
    const [total, purchase, usage, wastage, adjustmentIn, adjustmentOut] =
      await Promise.all([
        StockLedger.countDocuments(),
        StockLedger.countDocuments({
          movementType: "purchase",
        }),
        StockLedger.countDocuments({
          movementType: "usage",
        }),
        StockLedger.countDocuments({
          movementType: "wastage",
        }),
        StockLedger.countDocuments({
          movementType: "adjustment_in",
        }),
        StockLedger.countDocuments({
          movementType: "adjustment_out",
        }),
      ]);

    res.json({
      success: true,
      data: {
        totalMovements: total,
        purchaseMovements: purchase,
        usageMovements: usage,
        wastageMovements: wastage,
        adjustmentInMovements: adjustmentIn,
        adjustmentOutMovements: adjustmentOut,
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
   Stock Ledger Analytics
========================================================== */

exports.getStockLedgerAnalytics = async (req, res) => {
  try {
    const analytics = await StockLedger.aggregate([
      {
        $facet: {
          movementWise: [
            {
              $group: {
                _id: "$movementType",
                totalMovements: {
                  $sum: 1,
                },
                totalQuantity: {
                  $sum: "$quantity",
                },
              },
            },
          ],

          monthly: [
            {
              $group: {
                _id: {
                  year: {
                    $year: "$createdAt",
                  },
                  month: {
                    $month: "$createdAt",
                  },
                },
                totalMovements: {
                  $sum: 1,
                },
                totalQuantity: {
                  $sum: "$quantity",
                },
              },
            },
            {
              $sort: {
                "_id.year": 1,
                "_id.month": 1,
              },
            },
          ],

          ingredientWise: [
            {
              $group: {
                _id: "$ingredient",
                totalQuantity: {
                  $sum: "$quantity",
                },
                totalMovements: {
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
                ingredientCode: "$ingredient.ingredientCode",
                ingredientName: "$ingredient.ingredientName",
                totalQuantity: 1,
                totalMovements: 1,
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
