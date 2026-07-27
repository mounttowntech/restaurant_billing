const Recipe = require("../models/receipeModel");
const mongoose = require("mongoose");
/* ==========================================================
   Create Recipe
========================================================== */

exports.createRecipe = async (req, res) => {
  try {
    const {
      recipeCode,
      recipeName,
      menuItem,
      menuCategory,
      restaurant,
      store,
      preparationTime,
      servingSize,
      items,
      sellingPrice,
      instructions,
      notes,
      status,
    } = req.body;

    // Check Duplicate Recipe Code
    const existingRecipe = await Recipe.findOne({
      recipeCode: recipeCode.trim().toUpperCase(),
    });

    if (existingRecipe) {
      return res.status(400).json({
        success: false,
        message: "Recipe code already exists.",
      });
    }

    // Check Duplicate Menu Item
    const existingMenuRecipe = await Recipe.findOne({
      menuItem,
      restaurant,
      isDeleted: false,
    });

    if (existingMenuRecipe) {
      return res.status(400).json({
        success: false,
        message: "Recipe already created for this menu item.",
      });
    }

    const recipe = await Recipe.create({
      recipeCode,
      recipeName,
      menuItem,
      menuCategory,
      restaurant,
      store,
      preparationTime,
      servingSize,
      items,
      sellingPrice,
      instructions,
      notes,
      status,
      createdBy: req.user?.id || req.user?.userId,
    });

    const data = await Recipe.findById(recipe._id)
      .populate("menuItem", "menuCode menuName")
      .populate("menuCategory", "categoryName")
      .populate("restaurant", "restaurantName")
      .populate("store", "storeName")
      .populate("items.ingredient", "ingredientCode ingredientName")
      .populate("items.unit", "unitName");

    return res.status(201).json({
      success: true,
      message: "Recipe created successfully.",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
   Get All Recipes
========================================================== */

exports.getRecipes = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { search, restaurant, store, menuItem, menuCategory, status } =
      req.query;

    const filter = {
      isDeleted: false,
    };

    if (restaurant) filter.restaurant = restaurant;

    if (store) filter.store = store;

    if (menuItem) filter.menuItem = menuItem;

    if (menuCategory) filter.menuCategory = menuCategory;

    if (status) filter.status = status;

    if (search) {
      filter.$or = [
        {
          recipeCode: {
            $regex: search,
            $options: "i",
          },
        },
        {
          recipeName: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const totalRecords = await Recipe.countDocuments(filter);

    const recipes = await Recipe.find(filter)
      .populate("menuItem", "menuCode menuName")
      .populate("menuCategory", "categoryName")
      .populate("restaurant", "restaurantName")
      .populate("store", "storeName")
      .populate("items.ingredient", "ingredientCode ingredientName")
      .populate("items.unit", "unitName")
      .sort({
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      totalRecords,
      currentPage: page,
      totalPages: Math.ceil(totalRecords / limit),
      count: recipes.length,
      data: recipes,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
   Get Recipe By Id
========================================================== */

exports.getRecipeById = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate("menuItem")
      .populate("menuCategory")
      .populate("restaurant")
      .populate("store")
      .populate("items.ingredient")
      .populate("items.unit")
      .populate("createdBy", "name employeeCode")
      .populate("updatedBy", "name employeeCode");

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: "Recipe not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: recipe,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateRecipe = async (req, res) => {
  try {
    const recipeId = req.params.id;

    const recipe = await Recipe.findById(recipeId);

    if (!recipe) {
      return res.status(404).json({
        success: false,

        message: "Recipe not found.",
      });
    }

    // Duplicate Recipe Code Check

    if (
      req.body.recipeCode &&
      req.body.recipeCode.toUpperCase() !== recipe.recipeCode
    ) {
      const exists = await Recipe.findOne({
        recipeCode: req.body.recipeCode.trim().toUpperCase(),

        _id: { $ne: recipeId },

        isDeleted: false,
      });

      if (exists) {
        return res.status(400).json({
          success: false,

          message: "Recipe code already exists.",
        });
      }
    }

    // Duplicate Menu Item Check

    if (req.body.menuItem) {
      const menuExists = await Recipe.findOne({
        menuItem: req.body.menuItem,

        restaurant: req.body.restaurant || recipe.restaurant,

        _id: { $ne: recipeId },

        isDeleted: false,
      });

      if (menuExists) {
        return res.status(400).json({
          success: false,

          message: "Recipe already exists for this menu item.",
        });
      }
    }

    Object.assign(recipe, req.body);

    recipe.updatedBy = req.user?.id || req.user?.userId;

    await recipe.save();

    const updatedRecipe = await Recipe.findById(recipe._id)

      .populate("menuItem", "menuCode menuName")

      .populate("menuCategory", "categoryName")

      .populate("restaurant", "restaurantName")

      .populate("store", "storeName")

      .populate(
        "items.ingredient",

        "ingredientCode ingredientName",
      )

      .populate("items.unit", "unitName");

    return res.status(200).json({
      success: true,

      message: "Recipe updated successfully.",

      data: updatedRecipe,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

/* ==========================================================

   Soft Delete Recipe

========================================================== */

exports.deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({
        success: false,

        message: "Recipe not found.",
      });
    }

    recipe.isDeleted = true;

    recipe.updatedBy = req.user?.id || req.user?.userId;

    await recipe.save();

    return res.status(200).json({
      success: true,

      message: "Recipe deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

/* ==========================================================

   Restore Recipe

========================================================== */

exports.restoreRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findOne({
      _id: req.params.id,

      isDeleted: true,
    });

    if (!recipe) {
      return res.status(404).json({
        success: false,

        message: "Deleted recipe not found.",
      });
    }

    recipe.isDeleted = false;

    recipe.updatedBy = req.user?.id || req.user?.userId;

    await recipe.save();

    return res.status(200).json({
      success: true,

      message: "Recipe restored successfully.",

      data: recipe,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

/* ==========================================================

   Update Recipe Status

========================================================== */

exports.updateRecipeStatus = async (
  req,

  res,
) => {
  try {
    const { status } = req.body;

    if (!["Active", "Inactive"].includes(status)) {
      return res.status(400).json({
        success: false,

        message: "Status must be Active or Inactive.",
      });
    }

    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({
        success: false,

        message: "Recipe not found.",
      });
    }

    recipe.status = status;

    recipe.updatedBy = req.user?.id || req.user?.userId;

    await recipe.save();

    return res.status(200).json({
      success: true,

      message: "Recipe status updated successfully.",

      data: recipe,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

exports.searchRecipes = async (req, res) => {
  try {
    const { keyword = "" } = req.query;

    const recipes = await Recipe.find({
      $or: [
        { recipeCode: { $regex: keyword, $options: "i" } },

        { recipeName: { $regex: keyword, $options: "i" } },
      ],
    })

      .populate("menuItem", "menuName")

      .populate("menuCategory", "categoryName")

      .populate("restaurant", "restaurantName")

      .populate("store", "storeName")

      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,

      count: recipes.length,

      data: recipes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

/* ==========================================================

   Recipe Summary

========================================================== */

exports.getRecipeSummary = async (req, res) => {
  try {
    const summary = await Recipe.aggregate([
      {
        $match: {
          isDeleted: false,
        },
      },

      {
        $group: {
          _id: null,

          totalRecipes: {
            $sum: 1,
          },

          activeRecipes: {
            $sum: {
              $cond: [{ $eq: ["$status", "Active"] }, 1, 0],
            },
          },

          inactiveRecipes: {
            $sum: {
              $cond: [{ $eq: ["$status", "Inactive"] }, 1, 0],
            },
          },

          totalRecipeCost: {
            $sum: "$totalCost",
          },

          averageRecipeCost: {
            $avg: "$totalCost",
          },

          averageSellingPrice: {
            $avg: "$sellingPrice",
          },

          totalProfit: {
            $sum: "$profitAmount",
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,

      data: summary[0] || {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

/* ==========================================================

   Recipe Cost Analysis

========================================================== */

exports.getRecipeCostAnalysis = async (req, res) => {
  try {
    const recipes = await Recipe.find()

      .select(
        "recipeCode recipeName totalCost sellingPrice profitAmount profitPercentage",
      )

      .sort({
        profitPercentage: -1,
      });

    res.status(200).json({
      success: true,

      count: recipes.length,

      data: recipes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

/* ==========================================================

   Get Recipes By Menu Item

========================================================== */

exports.getRecipesByMenuItem = async (req, res) => {
  try {
    const recipes = await Recipe.find({
      menuItem: req.params.menuItemId,
    })

      .populate("menuItem")

      .populate("menuCategory")

      .sort({
        recipeName: 1,
      });

    res.status(200).json({
      success: true,

      count: recipes.length,

      data: recipes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

/* ==========================================================

   Get Recipes By Category

========================================================== */

exports.getRecipesByCategory = async (req, res) => {
  try {
    const recipes = await Recipe.find({
      menuCategory: req.params.categoryId,
    })

      .populate("menuItem")

      .populate("menuCategory")

      .sort({
        recipeName: 1,
      });

    res.status(200).json({
      success: true,

      count: recipes.length,

      data: recipes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

/* ==========================================================

   Restaurant Recipes

========================================================== */

exports.getRestaurantRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find({
      restaurant: req.params.restaurantId,
    })

      .populate("menuItem")

      .populate("menuCategory")

      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,

      count: recipes.length,

      data: recipes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

/* ==========================================================

   Store Recipes

========================================================== */

exports.getStoreRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find({
      store: req.params.storeId,
    })

      .populate("menuItem")

      .populate("menuCategory")

      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,

      count: recipes.length,

      data: recipes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

/* ==========================================================

   Most Profitable Recipes

========================================================== */

exports.getTopProfitableRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find()

      .sort({
        profitPercentage: -1,
      })

      .limit(10)

      .select(
        "recipeCode recipeName sellingPrice totalCost profitAmount profitPercentage",
      );

    res.status(200).json({
      success: true,

      data: recipes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

/* ==========================================================

   Lowest Profit Recipes

========================================================== */

exports.getLowestProfitRecipes = async (req, res) => {
  try {
    const recipes = await Recipe.find()

      .sort({
        profitPercentage: 1,
      })

      .limit(10)

      .select(
        "recipeCode recipeName sellingPrice totalCost profitAmount profitPercentage",
      );

    res.status(200).json({
      success: true,

      data: recipes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

/* ==========================================================

   Recipes By Status

========================================================== */

exports.getRecipesByStatus = async (req, res) => {
  try {
    const recipes = await Recipe.find({
      status: req.params.status,
    })

      .populate("menuItem")

      .populate("menuCategory")

      .sort({
        recipeName: 1,
      });

    res.status(200).json({
      success: true,

      count: recipes.length,

      data: recipes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};
