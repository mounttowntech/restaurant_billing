const StockAdjustment = require("../models/StockAdjustment");
const Ingredient = require("../models/Ingredient");

/* ==========================================================
   Create Stock Adjustment
========================================================== */

exports.createStockAdjustment = async (req, res) => {
  try {
    const { adjustmentNo, ingredient, adjustmentType, quantity, reason } =
      req.body;

    // Check duplicate adjustment number
    const existingAdjustment = await StockAdjustment.findOne({
      adjustmentNo: adjustmentNo.trim().toUpperCase(),
    });

    if (existingAdjustment) {
      return res.status(400).json({
        success: false,
        message: "Adjustment number already exists.",
      });
    }

    // Check ingredient
    const ingredientDoc = await Ingredient.findById(ingredient);

    if (!ingredientDoc) {
      return res.status(404).json({
        success: false,
        message: "Ingredient not found.",
      });
    }

    const beforeStock = Number(ingredientDoc.currentStock || 0);

    let afterStock = beforeStock;

    if (adjustmentType === "increase") {
      afterStock = beforeStock + Number(quantity);
    } else {
      if (beforeStock < quantity) {
        return res.status(400).json({
          success: false,
          message: "Insufficient stock.",
        });
      }

      afterStock = beforeStock - Number(quantity);
    }

    // Update Ingredient Stock
    ingredientDoc.currentStock = afterStock;
    await ingredientDoc.save();

    // Create Adjustment
    const adjustment = await StockAdjustment.create({
      adjustmentNo: adjustmentNo.trim().toUpperCase(),
      ingredient,
      adjustmentType,
      quantity,
      beforeStock,
      afterStock,
      reason,
      createdBy: req.user?.id || req.body.createdBy,
    });

    const populatedAdjustment = await StockAdjustment.findById(adjustment._id)
      .populate("ingredient", "ingredientName ingredientCode")
      .populate("createdBy", "name email");

    return res.status(201).json({
      success: true,
      message: "Stock adjustment created successfully.",
      data: populatedAdjustment,
    });
  } catch (error) {
    console.error("createStockAdjustment:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create stock adjustment.",
      error: error.message,
    });
  }
};

/* ==========================================================
   Get All Stock Adjustments
========================================================== */

exports.getStockAdjustments = async (req, res) => {
  try {
    const { page = 1, limit = 10, adjustmentType, ingredient } = req.query;

    const filter = {};

    if (adjustmentType) filter.adjustmentType = adjustmentType;

    if (ingredient) filter.ingredient = ingredient;

    const total = await StockAdjustment.countDocuments(filter);

    const adjustments = await StockAdjustment.find(filter)
      .populate("ingredient", "ingredientName ingredientCode currentStock")
      .populate("createdBy", "name")
      .sort({
        createdAt: -1,
      })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      totalRecords: total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      count: adjustments.length,
      data: adjustments,
    });
  } catch (error) {
    console.error("getStockAdjustments:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch stock adjustments.",
      error: error.message,
    });
  }
};

/* ==========================================================
   Get Stock Adjustment By Id
========================================================== */

exports.getStockAdjustmentById = async (req, res) => {
  try {
    const adjustment = await StockAdjustment.findById(req.params.id)
      .populate("ingredient", "ingredientName ingredientCode currentStock")
      .populate("createdBy", "name email");

    if (!adjustment) {
      return res.status(404).json({
        success: false,
        message: "Stock adjustment not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: adjustment,
    });
  } catch (error) {
    console.error("getStockAdjustmentById:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch stock adjustment.",
      error: error.message,
    });
  }
};

/* ==========================================================
   Update Stock Adjustment
========================================================== */

exports.updateStockAdjustment = async (req, res) => {
  try {
    const adjustment = await StockAdjustment.findById(req.params.id);

    if (!adjustment) {
      return res.status(404).json({
        success: false,
        message: "Stock adjustment not found.",
      });
    }

    const ingredient = await Ingredient.findById(adjustment.ingredient);

    if (!ingredient) {
      return res.status(404).json({
        success: false,
        message: "Ingredient not found.",
      });
    }

    // -----------------------------------------
    // Rollback Previous Adjustment
    // -----------------------------------------

    if (adjustment.adjustmentType === "increase") {
      ingredient.currentStock -= adjustment.quantity;
    } else {
      ingredient.currentStock += adjustment.quantity;
    }

    // -----------------------------------------
    // Update Fields
    // -----------------------------------------

    if (req.body.adjustmentNo) {
      const exists = await StockAdjustment.findOne({
        adjustmentNo: req.body.adjustmentNo.trim().toUpperCase(),
        _id: { $ne: adjustment._id },
      });

      if (exists) {
        return res.status(400).json({
          success: false,
          message: "Adjustment number already exists.",
        });
      }

      adjustment.adjustmentNo = req.body.adjustmentNo.trim().toUpperCase();
    }

    if (req.body.adjustmentType)
      adjustment.adjustmentType = req.body.adjustmentType;

    if (req.body.quantity !== undefined)
      adjustment.quantity = Number(req.body.quantity);

    if (req.body.reason !== undefined) adjustment.reason = req.body.reason;

    // -----------------------------------------
    // Apply New Adjustment
    // -----------------------------------------

    adjustment.beforeStock = ingredient.currentStock;

    if (adjustment.adjustmentType === "increase") {
      ingredient.currentStock += adjustment.quantity;
    } else {
      if (ingredient.currentStock < adjustment.quantity) {
        return res.status(400).json({
          success: false,
          message: "Insufficient stock.",
        });
      }

      ingredient.currentStock -= adjustment.quantity;
    }

    adjustment.afterStock = ingredient.currentStock;

    await ingredient.save();

    await adjustment.save();

    const updated = await StockAdjustment.findById(adjustment._id)
      .populate("ingredient", "ingredientName ingredientCode currentStock")
      .populate("createdBy", "name");

    return res.status(200).json({
      success: true,
      message: "Stock adjustment updated successfully.",
      data: updated,
    });
  } catch (error) {
    console.error("updateStockAdjustment:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update stock adjustment.",
      error: error.message,
    });
  }
};

/* ==========================================================
   Delete Stock Adjustment
========================================================== */

exports.deleteStockAdjustment = async (req, res) => {
  try {
    const adjustment = await StockAdjustment.findById(req.params.id);

    if (!adjustment) {
      return res.status(404).json({
        success: false,
        message: "Stock adjustment not found.",
      });
    }

    const ingredient = await Ingredient.findById(adjustment.ingredient);

    if (ingredient) {
      // Reverse Stock

      if (adjustment.adjustmentType === "increase") {
        ingredient.currentStock -= adjustment.quantity;
      } else {
        ingredient.currentStock += adjustment.quantity;
      }

      await ingredient.save();
    }

    await StockAdjustment.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      success: true,
      message: "Stock adjustment deleted successfully.",
    });
  } catch (error) {
    console.error("deleteStockAdjustment:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete stock adjustment.",
      error: error.message,
    });
  }
};

exports.searchStockAdjustments = async (req, res) => {
  try {
    const { keyword = "" } = req.query;

    const adjustments = await StockAdjustment.find({
      $or: [
        {
          adjustmentNo: {
            $regex: keyword,

            $options: "i",
          },
        },

        {
          reason: {
            $regex: keyword,

            $options: "i",
          },
        },
      ],
    })

      .populate(
        "ingredient",

        "ingredientName ingredientCode",
      )

      .populate("createdBy", "name")

      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,

      count: adjustments.length,

      data: adjustments,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

/* ==========================================================

   Get Increase Adjustments

========================================================== */

exports.getIncreaseAdjustments = async (req, res) => {
  try {
    const adjustments = await StockAdjustment.find({
      adjustmentType: "increase",
    })

      .populate(
        "ingredient",

        "ingredientName ingredientCode",
      )

      .populate("createdBy", "name")

      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,

      count: adjustments.length,

      data: adjustments,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

/* ==========================================================

   Get Decrease Adjustments

========================================================== */

exports.getDecreaseAdjustments = async (req, res) => {
  try {
    const adjustments = await StockAdjustment.find({
      adjustmentType: "decrease",
    })

      .populate(
        "ingredient",

        "ingredientName ingredientCode",
      )

      .populate("createdBy", "name")

      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,

      count: adjustments.length,

      data: adjustments,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

/* ==========================================================

   Get Ingredient Adjustments

========================================================== */

exports.getIngredientAdjustments = async (req, res) => {
  try {
    const { ingredientId } = req.params;

    const adjustments = await StockAdjustment.find({
      ingredient: ingredientId,
    })

      .populate(
        "ingredient",

        "ingredientName ingredientCode",
      )

      .populate("createdBy", "name")

      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,

      count: adjustments.length,

      data: adjustments,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

/* ==========================================================

   Get Today's Adjustments

========================================================== */

exports.getTodayAdjustments = async (req, res) => {
  try {
    const start = new Date();

    start.setHours(0, 0, 0, 0);

    const end = new Date();

    end.setHours(23, 59, 59, 999);

    const adjustments = await StockAdjustment.find({
      createdAt: {
        $gte: start,

        $lte: end,
      },
    })

      .populate(
        "ingredient",

        "ingredientName ingredientCode",
      )

      .populate("createdBy", "name")

      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,

      date: start.toISOString().split("T")[0],

      count: adjustments.length,

      data: adjustments,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

/* ==========================================================

   Adjustment Summary

========================================================== */

exports.getAdjustmentSummary = async (req, res) => {
  try {
    const [total, increase, decrease, totalIncreaseQty, totalDecreaseQty] =
      await Promise.all([
        StockAdjustment.countDocuments(),

        StockAdjustment.countDocuments({
          adjustmentType: "increase",
        }),

        StockAdjustment.countDocuments({
          adjustmentType: "decrease",
        }),

        StockAdjustment.aggregate([
          {
            $match: {
              adjustmentType: "increase",
            },
          },

          {
            $group: {
              _id: null,

              total: {
                $sum: "$quantity",
              },
            },
          },
        ]),

        StockAdjustment.aggregate([
          {
            $match: {
              adjustmentType: "decrease",
            },
          },

          {
            $group: {
              _id: null,

              total: {
                $sum: "$quantity",
              },
            },
          },
        ]),
      ]);

    return res.status(200).json({
      success: true,

      data: {
        totalAdjustments: total,

        increaseAdjustments: increase,

        decreaseAdjustments: decrease,

        totalIncreaseQuantity: totalIncreaseQty[0]?.total || 0,

        totalDecreaseQuantity: totalDecreaseQty[0]?.total || 0,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

/* ==========================================================

   Adjustment Analytics

========================================================== */

exports.getAdjustmentAnalytics = async (req, res) => {
  try {
    const analytics = await StockAdjustment.aggregate([
      {
        $facet: {
          typeWise: [
            {
              $group: {
                _id: "$adjustmentType",

                totalAdjustments: {
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

                totalAdjustments: {
                  $sum: 1,
                },

                quantity: {
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

                totalAdjustments: {
                  $sum: 1,
                },

                quantity: {
                  $sum: "$quantity",
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
                ingredientName: "$ingredient.ingredientName",

                ingredientCode: "$ingredient.ingredientCode",

                totalAdjustments: 1,

                quantity: 1,
              },
            },
          ],
        },
      },
    ]);

    return res.status(200).json({
      success: true,

      data: analytics[0],
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};
