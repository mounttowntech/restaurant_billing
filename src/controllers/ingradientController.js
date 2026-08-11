
const mongoose = require("mongoose");

const Ingredient = require("../models/Ingredient");
const Restaurant = require("../models/Restaurant");
const Store = require("../models/storeModel");
const Unit = require("../models/unitModel");
const Supplier = require("../models/Supplier");
const Category = require("../models/Category");

/* ==========================================================
   Helper - Calculate Stock Status
========================================================== */

const calculateStockStatus = (
  currentStock,
  reorderLevel,
  maximumStock
) => {
  const stock = Number(currentStock || 0);
  const reorder = Number(reorderLevel || 0);
  const maximum = Number(maximumStock || 0);

  if (stock <= 0) {
    return "Out of Stock";
  }

  if (maximum > 0 && stock > maximum) {
    return "Over Stock";
  }

  if (stock <= reorder) {
    return "Low Stock";
  }

  return "Available";
};

/* ==========================================================
   Helper - Populate Ingredient
========================================================== */

const populateIngredient = (query) => {
  return query
    .populate(
      "restaurant",
      "restaurantName restaurantCode"
    )
    .populate(
      "store",
      "storeName storeCode"
    )
    .populate(
      "category",
      "categoryName categoryCode"
    )
    .populate(
      "supplier",
      "supplierName supplierCode phone"
    )
    .populate(
      "unit",
      "unitName unitCode"
    )
    .populate(
      "purchaseUnit",
      "unitName unitCode"
    )
    .populate(
      "createdBy",
      "name email"
    )
    .populate(
      "updatedBy",
      "name email"
    );
};

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
      displayName = "",
      category,
      supplier,
      unit,
      purchaseUnit,
      purchaseUnitConversion = 1,
      barcode = "",
      hsnCode = "",
      gstPercentage = 5,
      purchasePrice = 0,
      lastPurchasePrice = 0,
      averageCost = 0,
      sellingPrice = 0,
      currentStock = 0,
      minimumStock = 0,
      maximumStock = 0,
      reorderLevel = 0,
      storageLocation = "",
      expiryApplicable = false,
      shelfLifeDays = 0,
      isVeg = true,
      isPerishable = false,
      isAvailable = true,
      isActive = true,
      remarks = "",
    } = req.body;

    /* ======================================================
       Required Fields
    ====================================================== */

    if (
      !restaurant ||
      !store ||
      !ingredientCode ||
      !ingredientName ||
      !unit
    ) {
      return res.status(400).json({
        success: false,
        message:
          "restaurant, store, ingredientCode, ingredientName and unit are required.",
      });
    }

    /* ======================================================
       Validate ObjectIds
    ====================================================== */

    const objectIds = [
      { value: restaurant, name: "restaurant" },
      { value: store, name: "store" },
      { value: unit, name: "unit" },
    ];

    if (category) {
      objectIds.push({
        value: category,
        name: "category",
      });
    }

    if (supplier) {
      objectIds.push({
        value: supplier,
        name: "supplier",
      });
    }

    if (purchaseUnit) {
      objectIds.push({
        value: purchaseUnit,
        name: "purchaseUnit",
      });
    }

    for (const item of objectIds) {
      if (!mongoose.Types.ObjectId.isValid(item.value)) {
        return res.status(400).json({
          success: false,
          message: `Invalid ${item.name} ID.`,
        });
      }
    }

    /* ======================================================
       Validate Restaurant
    ====================================================== */

    const restaurantExists =
      await Restaurant.findById(restaurant);

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
       Validate Unit
    ====================================================== */

    const unitExists =
      await Unit.findById(unit);

    if (!unitExists) {
      return res.status(404).json({
        success: false,
        message: "Unit not found.",
      });
    }

    /* ======================================================
       Validate Purchase Unit
    ====================================================== */

    if (purchaseUnit) {
      const purchaseUnitExists =
        await Unit.findById(purchaseUnit);

      if (!purchaseUnitExists) {
        return res.status(404).json({
          success: false,
          message: "Purchase unit not found.",
        });
      }
    }

    /* ======================================================
       Validate Supplier
    ====================================================== */

    if (supplier) {
      const supplierExists =
        await Supplier.findById(supplier);

      if (!supplierExists) {
        return res.status(404).json({
          success: false,
          message: "Supplier not found.",
        });
      }
    }

    /* ======================================================
       Validate Category
    ====================================================== */

    if (category) {
      const categoryExists =
        await Category.findById(category);

      if (!categoryExists) {
        return res.status(404).json({
          success: false,
          message: "Category not found.",
        });
      }
    }

    /* ======================================================
       Duplicate Ingredient Code
    ====================================================== */

    const normalizedCode =
      ingredientCode.trim().toUpperCase();

    const existingCode =
      await Ingredient.findOne({
        restaurant,
        ingredientCode: normalizedCode,
        isDeleted: false,
      });

    if (existingCode) {
      return res.status(400).json({
        success: false,
        message:
          "Ingredient code already exists in this restaurant.",
      });
    }

    /* ======================================================
       Duplicate Barcode
    ====================================================== */

    if (barcode && barcode.trim()) {
      const existingBarcode =
        await Ingredient.findOne({
          restaurant,
          barcode: barcode.trim(),
          isDeleted: false,
        });

      if (existingBarcode) {
        return res.status(400).json({
          success: false,
          message:
            "Barcode already exists in this restaurant.",
        });
      }
    }

    /* ======================================================
       Number Validation
    ====================================================== */

    const stock = Number(currentStock);
    const avgCost = Number(averageCost);

    if (stock < 0) {
      return res.status(400).json({
        success: false,
        message: "Current stock cannot be negative.",
      });
    }

    if (Number(purchaseUnitConversion) <= 0) {
      return res.status(400).json({
        success: false,
        message:
          "Purchase unit conversion must be greater than 0.",
      });
    }

    /* ======================================================
       Create Ingredient
    ====================================================== */

    const ingredient =
      await Ingredient.create({
        restaurant,
        store,

        ingredientCode: normalizedCode,

        ingredientName:
          ingredientName.trim(),

        displayName,

        category: category || null,

        supplier: supplier || null,

        unit,

        purchaseUnit:
          purchaseUnit || null,

        purchaseUnitConversion:
          Number(purchaseUnitConversion),

        barcode:
          barcode?.trim() || "",

        hsnCode:
          hsnCode?.trim() || "",

        gstPercentage:
          Number(gstPercentage),

        purchasePrice:
          Number(purchasePrice),

        lastPurchasePrice:
          Number(lastPurchasePrice),

        averageCost: avgCost,

        sellingPrice:
          Number(sellingPrice),

        currentStock: stock,

        minimumStock:
          Number(minimumStock),

        maximumStock:
          Number(maximumStock),

        reorderLevel:
          Number(reorderLevel),

        stockValue:
          stock * avgCost,

        storageLocation,

        expiryApplicable,

        shelfLifeDays:
          Number(shelfLifeDays),

        isVeg,

        isPerishable,

        isAvailable,

        isActive,

        remarks,

        createdBy:
          req.user?.id ||
          req.user?._id ||
          null,
      });

    /* ======================================================
       Populate
    ====================================================== */

    const populated =
      await populateIngredient(
        Ingredient.findById(ingredient._id)
      );

    return res.status(201).json({
      success: true,
      message:
        "Ingredient created successfully.",
      data: populated,
    });
  } catch (error) {
    console.error(
      "createIngredient:",
      error
    );

    /* Duplicate Key */
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message:
          "Ingredient code or barcode already exists.",
        error: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Failed to create ingredient.",
      error: error.message,
    });
  }
};

/* ==========================================================
   Get All Ingredients
========================================================== */

exports.getIngredients = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      restaurant,
      store,
      category,
      supplier,
      unit,
      purchaseUnit,
      isActive,
      isAvailable,
      isPerishable,
    } = req.query;

    const filter = {
      isDeleted: false,
    };

    if (restaurant) {
      filter.restaurant = restaurant;
    }

    if (store) {
      filter.store = store;
    }

    if (category) {
      filter.category = category;
    }

    if (supplier) {
      filter.supplier = supplier;
    }

    if (unit) {
      filter.unit = unit;
    }

    if (purchaseUnit) {
      filter.purchaseUnit =
        purchaseUnit;
    }

    if (isActive !== undefined) {
      filter.isActive =
        isActive === "true";
    }

    if (isAvailable !== undefined) {
      filter.isAvailable =
        isAvailable === "true";
    }

    if (isPerishable !== undefined) {
      filter.isPerishable =
        isPerishable === "true";
    }

    const pageNumber =
      Math.max(1, Number(page));

    const pageLimit =
      Math.max(1, Number(limit));

    const skip =
      (pageNumber - 1) *
      pageLimit;

    const [
      totalRecords,
      ingredients,
    ] = await Promise.all([
      Ingredient.countDocuments(filter),

      populateIngredient(
        Ingredient.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(pageLimit)
      ),
    ]);

    return res.status(200).json({
      success: true,
      totalRecords,
      currentPage: pageNumber,
      totalPages:
        Math.ceil(
          totalRecords / pageLimit
        ),
      count: ingredients.length,
      data: ingredients,
    });
  } catch (error) {
    console.error(
      "getIngredients:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch ingredients.",
      error: error.message,
    });
  }
};

/* ==========================================================
   Get Ingredient By ID
========================================================== */

exports.getIngredientById = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ingredient ID.",
      });
    }

    const ingredient =
      await populateIngredient(
        Ingredient.findOne({
          _id: id,
          isDeleted: false,
        })
      );

    if (!ingredient) {
      return res.status(404).json({
        success: false,
        message:
          "Ingredient not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: ingredient,
    });
  } catch (error) {
    console.error(
      "getIngredientById:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch ingredient.",
      error: error.message,
    });
  }
};

/* ==========================================================
   Update Ingredient
========================================================== */

exports.updateIngredient = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ingredient ID.",
      });
    }

    const ingredient =
      await Ingredient.findOne({
        _id: id,
        isDeleted: false,
      });

    if (!ingredient) {
      return res.status(404).json({
        success: false,
        message:
          "Ingredient not found.",
      });
    }

    const allowedFields = [
      "restaurant",
      "store",
      "ingredientCode",
      "ingredientName",
      "displayName",
      "category",
      "supplier",
      "unit",
      "purchaseUnit",
      "purchaseUnitConversion",
      "barcode",
      "hsnCode",
      "gstPercentage",
      "purchasePrice",
      "lastPurchasePrice",
      "averageCost",
      "sellingPrice",
      "currentStock",
      "minimumStock",
      "maximumStock",
      "reorderLevel",
      "storageLocation",
      "expiryApplicable",
      "shelfLifeDays",
      "isVeg",
      "isPerishable",
      "isAvailable",
      "isActive",
      "remarks",
    ];

    /* ======================================================
       Update Fields
    ====================================================== */

    for (const field of allowedFields) {
      if (
        req.body[field] !== undefined
      ) {
        if (
          field ===
          "ingredientCode"
        ) {
          ingredient[field] =
            String(
              req.body[field]
            )
              .trim()
              .toUpperCase();
        } else {
          ingredient[field] =
            req.body[field];
        }
      }
    }

    /* ======================================================
       Validate Duplicate Code
    ====================================================== */

    if (req.body.ingredientCode) {
      const duplicate =
        await Ingredient.findOne({
          _id: { $ne: id },
          restaurant:
            ingredient.restaurant,
          ingredientCode:
            ingredient.ingredientCode,
          isDeleted: false,
        });

      if (duplicate) {
        return res.status(400).json({
          success: false,
          message:
            "Ingredient code already exists.",
        });
      }
    }

    /* ======================================================
       Validate Duplicate Barcode
    ====================================================== */

    if (
      req.body.barcode &&
      String(req.body.barcode).trim()
    ) {
      const duplicateBarcode =
        await Ingredient.findOne({
          _id: { $ne: id },
          restaurant:
            ingredient.restaurant,
          barcode:
            String(
              req.body.barcode
            ).trim(),
          isDeleted: false,
        });

      if (duplicateBarcode) {
        return res.status(400).json({
          success: false,
          message:
            "Barcode already exists.",
        });
      }
    }

    /* ======================================================
       Convert Number Fields
    ====================================================== */

    const numberFields = [
      "purchaseUnitConversion",
      "gstPercentage",
      "purchasePrice",
      "lastPurchasePrice",
      "averageCost",
      "sellingPrice",
      "currentStock",
      "minimumStock",
      "maximumStock",
      "reorderLevel",
      "shelfLifeDays",
    ];

    numberFields.forEach(
      (field) => {
        if (
          ingredient[field] !==
          undefined
        ) {
          ingredient[field] =
            Number(
              ingredient[field]
            );
        }
      }
    );

    if (
      ingredient.currentStock < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Current stock cannot be negative.",
      });
    }

    if (
      ingredient.purchaseUnitConversion <=
      0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Purchase unit conversion must be greater than 0.",
      });
    }

    /* ======================================================
       Recalculate Stock Value
    ====================================================== */

    ingredient.stockValue =
      ingredient.currentStock *
      ingredient.averageCost;

    ingredient.updatedBy =
      req.user?.id ||
      req.user?._id ||
      null;

    await ingredient.save();

    const updated =
      await populateIngredient(
        Ingredient.findById(
          ingredient._id
        )
      );

    return res.status(200).json({
      success: true,
      message:
        "Ingredient updated successfully.",
      data: updated,
    });
  } catch (error) {
    console.error(
      "updateIngredient:",
      error
    );

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message:
          "Ingredient code or barcode already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Failed to update ingredient.",
      error: error.message,
    });
  }
};

/* ==========================================================
   Delete Ingredient
========================================================== */

exports.deleteIngredient = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ingredient ID.",
      });
    }

    const ingredient =
      await Ingredient.findOne({
        _id: id,
        isDeleted: false,
      });

    if (!ingredient) {
      return res.status(404).json({
        success: false,
        message:
          "Ingredient not found.",
      });
    }

    ingredient.isDeleted = true;

    ingredient.isActive = false;

    ingredient.updatedBy =
      req.user?.id ||
      req.user?._id ||
      null;

    await ingredient.save();

    return res.status(200).json({
      success: true,
      message:
        "Ingredient deleted successfully.",
    });
  } catch (error) {
    console.error(
      "deleteIngredient:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete ingredient.",
      error: error.message,
    });
  }
};

/* ==========================================================
   Restore Ingredient
========================================================== */

exports.restoreIngredient = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ingredient ID.",
      });
    }

    const ingredient =
      await Ingredient.findOne({
        _id: id,
        isDeleted: true,
      });

    if (!ingredient) {
      return res.status(404).json({
        success: false,
        message:
          "Deleted ingredient not found.",
      });
    }

    ingredient.isDeleted = false;

    ingredient.isActive = true;

    ingredient.updatedBy =
      req.user?.id ||
      req.user?._id ||
      null;

    await ingredient.save();

    const restored =
      await populateIngredient(
        Ingredient.findById(
          ingredient._id
        )
      );

    return res.status(200).json({
      success: true,
      message:
        "Ingredient restored successfully.",
      data: restored,
    });
  } catch (error) {
    console.error(
      "restoreIngredient:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to restore ingredient.",
      error: error.message,
    });
  }
};

/* ==========================================================
   Add Stock
========================================================== */

exports.addStock = async (
  req,
  res
) => {
  try {
    const { id } = req.params;
    const {
      quantity,
      purchasePrice,
    } = req.body;

    const qty = Number(quantity);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ingredient ID.",
      });
    }

    if (!qty || qty <= 0) {
      return res.status(400).json({
        success: false,
        message:
          "Quantity must be greater than 0.",
      });
    }

    const ingredient =
      await Ingredient.findOne({
        _id: id,
        isDeleted: false,
      });

    if (!ingredient) {
      return res.status(404).json({
        success: false,
        message:
          "Ingredient not found.",
      });
    }

    /* ======================================================
       Calculate New Average Cost
    ====================================================== */

    if (
      purchasePrice !== undefined
    ) {
      const newPrice =
        Number(purchasePrice);

      if (newPrice < 0) {
        return res.status(400).json({
          success: false,
          message:
            "Purchase price cannot be negative.",
        });
      }

      const oldStock =
        Number(
          ingredient.currentStock || 0
        );

      const oldAverage =
        Number(
          ingredient.averageCost || 0
        );

      const newAverage =
        oldStock + qty > 0
          ? (
              oldStock *
                oldAverage +
              qty * newPrice
            ) /
            (oldStock + qty)
          : newPrice;

      ingredient.averageCost =
        Number(
          newAverage.toFixed(4)
        );

      ingredient.purchasePrice =
        newPrice;

      ingredient.lastPurchasePrice =
        newPrice;

      ingredient.lastPurchaseDate =
        new Date();
    }

    ingredient.currentStock +=
      qty;

    ingredient.stockValue =
      ingredient.currentStock *
      ingredient.averageCost;

    ingredient.updatedBy =
      req.user?.id ||
      req.user?._id ||
      null;

    await ingredient.save();

    const updated =
      await populateIngredient(
        Ingredient.findById(id)
      );

    return res.status(200).json({
      success: true,
      message:
        "Ingredient stock added successfully.",
      data: updated,
    });
  } catch (error) {
    console.error(
      "addStock:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to add ingredient stock.",
      error: error.message,
    });
  }
};

/* ==========================================================
   Remove Stock
========================================================== */

exports.removeStock = async (
  req,
  res
) => {
  try {
    const { id } = req.params;
    const { quantity } =
      req.body;

    const qty = Number(quantity);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ingredient ID.",
      });
    }

    if (!qty || qty <= 0) {
      return res.status(400).json({
        success: false,
        message:
          "Quantity must be greater than 0.",
      });
    }

    const ingredient =
      await Ingredient.findOne({
        _id: id,
        isDeleted: false,
      });

    if (!ingredient) {
      return res.status(404).json({
        success: false,
        message:
          "Ingredient not found.",
      });
    }

    if (
      ingredient.currentStock <
      qty
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Insufficient ingredient stock.",
        currentStock:
          ingredient.currentStock,
        requestedQuantity: qty,
      });
    }

    ingredient.currentStock -=
      qty;

    ingredient.stockValue =
      ingredient.currentStock *
      ingredient.averageCost;

    ingredient.updatedBy =
      req.user?.id ||
      req.user?._id ||
      null;

    await ingredient.save();

    const updated =
      await populateIngredient(
        Ingredient.findById(id)
      );

    return res.status(200).json({
      success: true,
      message:
        "Ingredient stock removed successfully.",
      data: updated,
    });
  } catch (error) {
    console.error(
      "removeStock:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to remove ingredient stock.",
      error: error.message,
    });
  }
};

/* ==========================================================
   Adjust Stock
========================================================== */

exports.adjustStock = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    const {
      quantity,
      adjustmentType,
      remarks,
    } = req.body;

    const qty = Number(quantity);

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ingredient ID.",
      });
    }

    if (!qty || qty <= 0) {
      return res.status(400).json({
        success: false,
        message:
          "Quantity must be greater than 0.",
      });
    }

    if (
      !["ADD", "REMOVE"].includes(
        adjustmentType
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "adjustmentType must be ADD or REMOVE.",
      });
    }

    const ingredient =
      await Ingredient.findOne({
        _id: id,
        isDeleted: false,
      });

    if (!ingredient) {
      return res.status(404).json({
        success: false,
        message:
          "Ingredient not found.",
      });
    }

    if (
      adjustmentType === "ADD"
    ) {
      ingredient.currentStock +=
        qty;
    }

    if (
      adjustmentType === "REMOVE"
    ) {
      if (
        ingredient.currentStock <
        qty
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Insufficient ingredient stock.",
        });
      }

      ingredient.currentStock -=
        qty;
    }

    if (remarks !== undefined) {
      ingredient.remarks =
        remarks;
    }

    ingredient.stockValue =
      ingredient.currentStock *
      ingredient.averageCost;

    ingredient.updatedBy =
      req.user?.id ||
      req.user?._id ||
      null;

    await ingredient.save();

    const updated =
      await populateIngredient(
        Ingredient.findById(id)
      );

    return res.status(200).json({
      success: true,
      message:
        "Ingredient stock adjusted successfully.",
      data: updated,
    });
  } catch (error) {
    console.error(
      "adjustStock:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to adjust ingredient stock.",
      error: error.message,
    });
  }
};

/* ==========================================================
   Low Stock
========================================================== */

exports.getLowStock = async (
  req,
  res
) => {
  try {
    const filter = {
      isDeleted: false,
      isActive: true,
      $expr: {
        $lte: [
          "$currentStock",
          "$reorderLevel",
        ],
      },
    };

    if (req.query.restaurant) {
      filter.restaurant =
        req.query.restaurant;
    }

    if (req.query.store) {
      filter.store =
        req.query.store;
    }

    const ingredients =
      await populateIngredient(
        Ingredient.find(filter)
          .sort({
            currentStock: 1,
          })
      );

    return res.status(200).json({
      success: true,
      count: ingredients.length,
      data: ingredients,
    });
  } catch (error) {
    console.error(
      "getLowStock:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch low stock ingredients.",
      error: error.message,
    });
  }
};

/* ==========================================================
   Out Of Stock
========================================================== */

exports.getOutOfStock = async (
  req,
  res
) => {
  try {
    const filter = {
      currentStock: {
        $lte: 0,
      },
      isDeleted: false,
      isActive: true,
    };

    if (req.query.restaurant) {
      filter.restaurant =
        req.query.restaurant;
    }

    if (req.query.store) {
      filter.store =
        req.query.store;
    }

    const ingredients =
      await populateIngredient(
        Ingredient.find(filter)
          .sort({
            ingredientName: 1,
          })
      );

    return res.status(200).json({
      success: true,
      count: ingredients.length,
      data: ingredients,
    });
  } catch (error) {
    console.error(
      "getOutOfStock:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch out of stock ingredients.",
      error: error.message,
    });
  }
};

/* ==========================================================
   Ingredient Summary
========================================================== */

exports.getIngredientSummary = async (
  req,
  res
) => {
  try {
    const match = {
      isDeleted: false,
    };

    if (req.query.restaurant) {
      match.restaurant =
        new mongoose.Types.ObjectId(
          req.query.restaurant
        );
    }

    if (req.query.store) {
      match.store =
        new mongoose.Types.ObjectId(
          req.query.store
        );
    }

    const summary =
      await Ingredient.aggregate([
        {
          $match: match,
        },

        {
          $group: {
            _id: null,

            totalIngredients: {
              $sum: 1,
            },

            totalStock: {
              $sum: "$currentStock",
            },

            totalStockValue: {
              $sum: "$stockValue",
            },

            outOfStock: {
              $sum: {
                $cond: [
                  {
                    $lte: [
                      "$currentStock",
                      0,
                    ],
                  },
                  1,
                  0,
                ],
              },
            },

            lowStock: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      {
                        $gt: [
                          "$currentStock",
                          0,
                        ],
                      },
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

            overStock: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      {
                        $gt: [
                          "$maximumStock",
                          0,
                        ],
                      },
                      {
                        $gt: [
                          "$currentStock",
                          "$maximumStock",
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
      ]);

    return res.status(200).json({
      success: true,
      data: summary[0] || {
        totalIngredients: 0,
        totalStock: 0,
        totalStockValue: 0,
        outOfStock: 0,
        lowStock: 0,
        overStock: 0,
      },
    });
  } catch (error) {
    console.error(
      "getIngredientSummary:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch ingredient summary.",
      error: error.message,
    });
  }
};

/* ==========================================================
   Search Ingredients
========================================================== */

exports.searchIngredients = async (
  req,
  res
) => {
  try {
    const keyword =
      req.query.keyword || "";

    const filter = {
      isDeleted: false,

      $or: [
        {
          ingredientCode: {
            $regex: keyword,
            $options: "i",
          },
        },
        {
          ingredientName: {
            $regex: keyword,
            $options: "i",
          },
        },
        {
          displayName: {
            $regex: keyword,
            $options: "i",
          },
        },
        {
          barcode: {
            $regex: keyword,
            $options: "i",
          },
        },
        {
          hsnCode: {
            $regex: keyword,
            $options: "i",
          },
        },
      ],
    };

    if (req.query.restaurant) {
      filter.restaurant =
        req.query.restaurant;
    }

    if (req.query.store) {
      filter.store =
        req.query.store;
    }

    const ingredients =
      await populateIngredient(
        Ingredient.find(filter)
          .sort({
            ingredientName: 1,
          })
          .limit(50)
      );

    return res.status(200).json({
      success: true,
      count: ingredients.length,
      data: ingredients,
    });
  } catch (error) {
    console.error(
      "searchIngredients:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to search ingredients.",
      error: error.message,
    });
  }
};

/* ==========================================================
   Available Ingredients
========================================================== */

exports.getAvailableIngredients = async (
  req,
  res
) => {
  try {
    const filter = {
      isDeleted: false,
      isActive: true,
      isAvailable: true,
      currentStock: {
        $gt: 0,
      },
    };

    if (req.query.restaurant) {
      filter.restaurant =
        req.query.restaurant;
    }

    if (req.query.store) {
      filter.store =
        req.query.store;
    }

    const ingredients =
      await populateIngredient(
        Ingredient.find(filter)
          .sort({
            ingredientName: 1,
          })
      );

    return res.status(200).json({
      success: true,
      count: ingredients.length,
      data: ingredients,
    });
  } catch (error) {
    console.error(
      "getAvailableIngredients:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch available ingredients.",
      error: error.message,
    });
  }
};

/* ==========================================================
   Activate Ingredient
========================================================== */

exports.activateIngredient = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ingredient ID.",
      });
    }

    const ingredient =
      await Ingredient.findOne({
        _id: id,
        isDeleted: false,
      });

    if (!ingredient) {
      return res.status(404).json({
        success: false,
        message:
          "Ingredient not found.",
      });
    }

    ingredient.isActive = true;

    ingredient.updatedBy =
      req.user?.id ||
      req.user?._id ||
      null;

    await ingredient.save();

    return res.status(200).json({
      success: true,
      message:
        "Ingredient activated successfully.",
      data: ingredient,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        "Failed to activate ingredient.",
      error: error.message,
    });
  }
};

/* ==========================================================
   Deactivate Ingredient
========================================================== */

exports.deactivateIngredient = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ingredient ID.",
      });
    }

    const ingredient =
      await Ingredient.findOne({
        _id: id,
        isDeleted: false,
      });

    if (!ingredient) {
      return res.status(404).json({
        success: false,
        message:
          "Ingredient not found.",
      });
    }

    ingredient.isActive = false;

    ingredient.updatedBy =
      req.user?.id ||
      req.user?._id ||
      null;

    await ingredient.save();

    return res.status(200).json({
      success: true,
      message:
        "Ingredient deactivated successfully.",
      data: ingredient,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message:
        "Failed to deactivate ingredient.",
      error: error.message,
    });
  }
};

