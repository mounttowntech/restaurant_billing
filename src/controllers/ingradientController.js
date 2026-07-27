const Ingredient = require("../models/Ingredient");

/* ==========================================================
   Create Ingredient
========================================================== */

exports.createIngredient = async (req, res) => {
  try {
    const {
      restaurant,
      store,
      ingredientCode,
      ingredientName,
      displayName,
      category,
      supplier,
      unit,
      purchaseUnit,
      barcode,
      hsnCode,
      gstPercentage,
      purchasePrice,
      averageCost,
      currentStock,
      minimumStock,
      maximumStock,
      reorderLevel,
      storageLocation,
      expiryApplicable,
      shelfLifeDays,
      isVeg,
      isPerishable,
      remarks,
    } = req.body;

    // Duplicate Ingredient Code
    const codeExists = await Ingredient.findOne({
      ingredientCode: ingredientCode.trim().toUpperCase(),
      isDeleted: false,
    });

    if (codeExists) {
      return res.status(400).json({
        success: false,
        message: "Ingredient code already exists.",
      });
    }

    // Duplicate Ingredient Name
    const nameExists = await Ingredient.findOne({
      ingredientName: {
        $regex: new RegExp(`^${ingredientName}$`, "i"),
      },
      restaurant,
      store,
      isDeleted: false,
    });

    if (nameExists) {
      return res.status(400).json({
        success: false,
        message: "Ingredient name already exists.",
      });
    }

    const ingredient = await Ingredient.create({
      restaurant,
      store,
      ingredientCode,
      ingredientName,
      displayName,
      category,
      supplier,
      unit,
      purchaseUnit,
      barcode,
      hsnCode,
      gstPercentage,
      purchasePrice,
      averageCost,
      currentStock,
      minimumStock,
      maximumStock,
      reorderLevel,
      storageLocation,
      expiryApplicable,
      shelfLifeDays,
      isVeg,
      isPerishable,
      remarks,
      createdBy: req.user?._id,
      updatedBy: req.user?._id,
    });

    return res.status(201).json({
      success: true,
      message: "Ingredient created successfully.",
      data: ingredient,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
   Get All Ingredients
========================================================== */

exports.getAllIngredients = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const {
      search,
      restaurant,
      store,
      category,
      supplier,
      isActive,
      isAvailable,
      isVeg,
    } = req.query;

    let query = {
      isDeleted: false,
    };

    if (restaurant) query.restaurant = restaurant;
    if (store) query.store = store;
    if (category) query.category = category;
    if (supplier) query.supplier = supplier;

    if (isActive !== undefined)
      query.isActive = isActive === "true";

    if (isAvailable !== undefined)
      query.isAvailable = isAvailable === "true";

    if (isVeg !== undefined)
      query.isVeg = isVeg === "true";

    if (search) {
      query.$or = [
        {
          ingredientCode: {
            $regex: search,
            $options: "i",
          },
        },
        {
          ingredientName: {
            $regex: search,
            $options: "i",
          },
        },
        {
          displayName: {
            $regex: search,
            $options: "i",
          },
        },
        {
          barcode: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const total = await Ingredient.countDocuments(query);

    const ingredients = await Ingredient.find(query)
      .populate("restaurant", "restaurantName")
      .populate("store", "storeName")
      .populate("category", "categoryName")
      .populate("supplier", "supplierName")
      .populate("unit", "unitName unitCode")
      .populate("purchaseUnit", "unitName unitCode")
      .populate("createdBy", "name")
      .populate("updatedBy", "name")
      .sort({
        ingredientName: 1,
      })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      count: ingredients.length,
      data: ingredients,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
   Get Ingredient By ID
========================================================== */

exports.getIngredientById = async (req, res) => {
  try {
    const ingredient = await Ingredient.findOne({
      _id: req.params.id,
      isDeleted: false,
    })
      .populate("restaurant")
      .populate("store")
      .populate("category")
      .populate("supplier")
      .populate("unit")
      .populate("purchaseUnit")
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email");

    if (!ingredient) {
      return res.status(404).json({
        success: false,
        message: "Ingredient not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: ingredient,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
   Update Ingredient
========================================================== */

exports.updateIngredient = async (req, res) => {
  try {
    const ingredient = await Ingredient.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!ingredient) {
      return res.status(404).json({
        success: false,
        message: "Ingredient not found.",
      });
    }

    // Duplicate Code
    if (req.body.ingredientCode) {
      const exists = await Ingredient.findOne({
        _id: { $ne: req.params.id },
        ingredientCode: req.body.ingredientCode
          .trim()
          .toUpperCase(),
        isDeleted: false,
      });

      if (exists) {
        return res.status(400).json({
          success: false,
          message: "Ingredient code already exists.",
        });
      }
    }

    // Duplicate Name
    if (req.body.ingredientName) {
      const exists = await Ingredient.findOne({
        _id: { $ne: req.params.id },
        restaurant:
          req.body.restaurant || ingredient.restaurant,
        store: req.body.store || ingredient.store,
        ingredientName: {
          $regex: new RegExp(
            `^${req.body.ingredientName}$`,
            "i"
          ),
        },
        isDeleted: false,
      });

      if (exists) {
        return res.status(400).json({
          success: false,
          message: "Ingredient name already exists.",
        });
      }
    }

    Object.keys(req.body).forEach((key) => {
      ingredient[key] = req.body[key];
    });

    ingredient.updatedBy = req.user?._id;

    await ingredient.save();

    return res.status(200).json({
      success: true,
      message: "Ingredient updated successfully.",
      data: ingredient,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
/* ==========================================================
   Delete Ingredient (Soft Delete)
========================================================== */

exports.deleteIngredient = async (req, res) => {
  try {
    const ingredient = await Ingredient.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!ingredient) {
      return res.status(404).json({
        success: false,
        message: "Ingredient not found.",
      });
    }

    ingredient.isDeleted = true;
    ingredient.updatedBy = req.user?._id;

    await ingredient.save();

    return res.status(200).json({
      success: true,
      message: "Ingredient deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
   Restore Ingredient
========================================================== */

exports.restoreIngredient = async (req, res) => {
  try {
    const ingredient = await Ingredient.findOne({
      _id: req.params.id,
      isDeleted: true,
    });

    if (!ingredient) {
      return res.status(404).json({
        success: false,
        message: "Deleted ingredient not found.",
      });
    }

    ingredient.isDeleted = false;
    ingredient.updatedBy = req.user?._id;

    await ingredient.save();

    return res.status(200).json({
      success: true,
      message: "Ingredient restored successfully.",
      data: ingredient,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
   Activate Ingredient
========================================================== */

exports.activateIngredient = async (req, res) => {
  try {
    const ingredient = await Ingredient.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!ingredient) {
      return res.status(404).json({
        success: false,
        message: "Ingredient not found.",
      });
    }

    if (ingredient.isActive) {
      return res.status(400).json({
        success: false,
        message: "Ingredient is already active.",
      });
    }

    ingredient.isActive = true;
    ingredient.updatedBy = req.user?._id;

    await ingredient.save();

    return res.status(200).json({
      success: true,
      message: "Ingredient activated successfully.",
      data: ingredient,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
   Deactivate Ingredient
========================================================== */

exports.deactivateIngredient = async (req, res) => {
  try {
    const ingredient = await Ingredient.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!ingredient) {
      return res.status(404).json({
        success: false,
        message: "Ingredient not found.",
      });
    }

    if (!ingredient.isActive) {
      return res.status(400).json({
        success: false,
        message: "Ingredient is already inactive.",
      });
    }

    ingredient.isActive = false;
    ingredient.updatedBy = req.user?._id;

    await ingredient.save();

    return res.status(200).json({
      success: true,
      message: "Ingredient deactivated successfully.",
      data: ingredient,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
/* ==========================================================
   Get Available Ingredients
========================================================== */

exports.getAvailableIngredients = async (req, res) => {
  try {
    const ingredients = await Ingredient.find({
      isDeleted: false,
      isActive: true,
      isAvailable: true,
    })
      .populate("category", "categoryName")
      .populate("supplier", "supplierName")
      .populate("unit", "unitName unitCode")
      .sort({ ingredientName: 1 });

    return res.status(200).json({
      success: true,
      count: ingredients.length,
      data: ingredients,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
   Get Low Stock Ingredients
========================================================== */

exports.getLowStockIngredients = async (req, res) => {
  try {
    const ingredients = await Ingredient.find({
      isDeleted: false,
      isActive: true,
      $expr: {
        $and: [
          { $gt: ["$currentStock", 0] },
          { $lte: ["$currentStock", "$reorderLevel"] },
        ],
      },
    })
      .populate("category", "categoryName")
      .populate("supplier", "supplierName")
      .populate("unit", "unitName")
      .sort({ currentStock: 1 });

    return res.status(200).json({
      success: true,
      count: ingredients.length,
      data: ingredients,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
   Get Out Of Stock Ingredients
========================================================== */

exports.getOutOfStockIngredients = async (req, res) => {
  try {
    const ingredients = await Ingredient.find({
      isDeleted: false,
      isActive: true,
      currentStock: 0,
    })
      .populate("category", "categoryName")
      .populate("supplier", "supplierName")
      .populate("unit", "unitName")
      .sort({ ingredientName: 1 });

    return res.status(200).json({
      success: true,
      count: ingredients.length,
      data: ingredients,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
   Get Ingredients By Category
========================================================== */

exports.getCategoryIngredients = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const ingredients = await Ingredient.find({
      category: categoryId,
      isDeleted: false,
      isActive: true,
    })
      .populate("category", "categoryName")
      .populate("supplier", "supplierName")
      .populate("unit", "unitName")
      .sort({ ingredientName: 1 });

    return res.status(200).json({
      success: true,
      count: ingredients.length,
      data: ingredients,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
   Get Ingredients By Supplier
========================================================== */

exports.getSupplierIngredients = async (req, res) => {
  try {
    const { supplierId } = req.params;

    const ingredients = await Ingredient.find({
      supplier: supplierId,
      isDeleted: false,
      isActive: true,
    })
      .populate("category", "categoryName")
      .populate("supplier", "supplierName")
      .populate("unit", "unitName")
      .sort({ ingredientName: 1 });

    return res.status(200).json({
      success: true,
      count: ingredients.length,
      data: ingredients,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
   Get Veg Ingredients
========================================================== */

exports.getVegIngredients = async (req, res) => {
  try {
    const ingredients = await Ingredient.find({
      isVeg: true,
      isDeleted: false,
      isActive: true,
    })
      .populate("category", "categoryName")
      .populate("supplier", "supplierName")
      .populate("unit", "unitName")
      .sort({ ingredientName: 1 });

    return res.status(200).json({
      success: true,
      count: ingredients.length,
      data: ingredients,
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
    const summary = await Ingredient.aggregate([
      {
        $match: {
          isDeleted: false,
          isActive: true,
        },
      },
      {
        $group: {
          _id: null,
          totalIngredients: { $sum: 1 },
          totalStock: { $sum: "$currentStock" },
          totalStockValue: { $sum: "$stockValue" },
          totalPurchaseValue: {
            $sum: {
              $multiply: [
                "$currentStock",
                "$purchasePrice",
              ],
            },
          },
          availableIngredients: {
            $sum: {
              $cond: [
                { $gt: ["$currentStock", 0] },
                1,
                0,
              ],
            },
          },
          outOfStockIngredients: {
            $sum: {
              $cond: [
                { $eq: ["$currentStock", 0] },
                1,
                0,
              ],
            },
          },
          lowStockIngredients: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gt: ["$currentStock", 0] },
                    {
                      $lte: [
                        "$currentStock",
                        "$reorderLevel",
                      ],
                    },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalIngredients: 1,
          availableIngredients: 1,
          lowStockIngredients: 1,
          outOfStockIngredients: 1,
          totalStock: 1,
          totalStockValue: 1,
          totalPurchaseValue: 1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: summary.length
        ? summary[0]
        : {
            totalIngredients: 0,
            availableIngredients: 0,
            lowStockIngredients: 0,
            outOfStockIngredients: 0,
            totalStock: 0,
            totalStockValue: 0,
            totalPurchaseValue: 0,
          },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};