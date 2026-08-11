const mongoose = require("mongoose");

const ComboMeal = require("../models/comboMeals");
const Store = require("../models/storeModel");
const Restaurant = require("../models/Restaurant");

// =====================================================
// Helper: Get Company From Logged-In User
// =====================================================

const getCompanyFromUser = async (user) => {
  if (!user) {
    throw new Error("Authentication required");
  }

  if (!user.store) {
    throw new Error("Store not assigned to this user");
  }

  // -----------------------------------------------
  // Find Store
  // -----------------------------------------------

  const store = await Store.findById(user.store);

  if (!store) {
    throw new Error(
      `Store does not exist for this user: ${user.store}`
    );
  }

  // -----------------------------------------------
  // Check Restaurant
  // -----------------------------------------------

  if (!store.restaurant) {
    throw new Error(
      "Restaurant not assigned to this store"
    );
  }

  // -----------------------------------------------
  // Find Restaurant
  // -----------------------------------------------

  const restaurant = await Restaurant.findById(
    store.restaurant
  );

  if (!restaurant) {
    throw new Error(
      `Restaurant does not exist: ${store.restaurant}`
    );
  }

  // -----------------------------------------------
  // Check Company
  // -----------------------------------------------

  if (!restaurant.companyId) {
    throw new Error(
      "Company not assigned to this restaurant"
    );
  }

  return {
    store,
    restaurant,
    companyId: restaurant.companyId,
  };
};

// =====================================================
// Create Combo
// =====================================================

exports.createCombo = async (req, res) => {
  try {
    // -----------------------------------------------
    // Authentication
    // -----------------------------------------------

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    // -----------------------------------------------
    // Get Company
    // -----------------------------------------------

    const {
      store,
      restaurant,
      companyId,
    } = await getCompanyFromUser(req.user);

    // -----------------------------------------------
    // Validate Body
    // -----------------------------------------------

    const {
      name,
      code,
      image,
      description,
      items,
      sellingPrice,
      costPrice,
      tax,
      category,
      availableFrom,
      availableTo,
      isAvailable,
      isActive,
    } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Combo name is required",
      });
    }

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Combo code is required",
      });
    }

    if (
      !items ||
      !Array.isArray(items) ||
      items.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "At least one product is required in combo",
      });
    }

    if (
      sellingPrice === undefined ||
      sellingPrice === null
    ) {
      return res.status(400).json({
        success: false,
        message: "Selling price is required",
      });
    }

    // -----------------------------------------------
    // Validate Products
    // -----------------------------------------------

    for (const item of items) {
      if (!item.productId) {
        return res.status(400).json({
          success: false,
          message: "productId is required for every item",
        });
      }

      if (
        !mongoose.Types.ObjectId.isValid(
          item.productId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            `Invalid productId: ${item.productId}`,
        });
      }

      if (
        item.quantity === undefined ||
        item.quantity < 1
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Product quantity must be at least 1",
        });
      }
    }

    // -----------------------------------------------
    // Check Duplicate Combo Code
    // -----------------------------------------------

    const existingCombo = await ComboMeal.findOne({
      code: code.toUpperCase(),
      companyId,
      isDeleted: false,
    });

    if (existingCombo) {
      return res.status(400).json({
        success: false,
        message: "Combo code already exists",
      });
    }

    // -----------------------------------------------
    // Create Combo
    // -----------------------------------------------

    const combo = await ComboMeal.create({
      companyId,

      name: name.trim(),

      code: code.toUpperCase().trim(),

      image: image || "",

      description: description || "",

      items,

      sellingPrice: Number(sellingPrice),

      costPrice:
        costPrice !== undefined
          ? Number(costPrice)
          : 0,

      tax:
        tax !== undefined
          ? Number(tax)
          : 0,

      category: category || null,

      availableFrom: availableFrom || "",

      availableTo: availableTo || "",

      isAvailable:
        isAvailable !== undefined
          ? Boolean(isAvailable)
          : true,

      isActive:
        isActive !== undefined
          ? Boolean(isActive)
          : true,

      createdBy: req.user._id,
    });

    // -----------------------------------------------
    // Populate
    // -----------------------------------------------

    const populatedCombo =
      await ComboMeal.findById(combo._id)
        .populate(
          "items.productId",
          "name sellingPrice costPrice"
        )
        .populate(
          "category",
          "name"
        );

    // -----------------------------------------------
    // Response
    // -----------------------------------------------

    return res.status(201).json({
      success: true,
      message: "Combo meal created successfully",

      companyId,

      restaurantId: restaurant._id,

      storeId: store._id,

      data: populatedCombo,
    });

  } catch (error) {
    console.error(
      "CREATE COMBO ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// Get All Combos
// =====================================================

exports.getCombos = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { companyId } =
      await getCompanyFromUser(req.user);

    const combos = await ComboMeal.find({
      companyId,
      isDeleted: false,
    })
      .populate(
        "items.productId",
        "name sellingPrice costPrice"
      )
      .populate(
        "category",
        "name"
      )
      .sort({
        createdAt: -1,
      });

    return res.json({
      success: true,
      count: combos.length,
      data: combos,
    });

  } catch (error) {
    console.error(
      "GET COMBOS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// Get Single Combo
// =====================================================

exports.getCombo = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { companyId } =
      await getCompanyFromUser(req.user);

    const combo = await ComboMeal.findOne({
      _id: req.params.id,
      companyId,
      isDeleted: false,
    })
      .populate(
        "items.productId",
        "name sellingPrice costPrice"
      )
      .populate(
        "category",
        "name"
      );

    if (!combo) {
      return res.status(404).json({
        success: false,
        message: "Combo not found",
      });
    }

    return res.json({
      success: true,
      data: combo,
    });

  } catch (error) {
    console.error(
      "GET COMBO ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// Update Combo
// =====================================================

exports.updateCombo = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { companyId } =
      await getCompanyFromUser(req.user);

    const combo = await ComboMeal.findOne({
      _id: req.params.id,
      companyId,
      isDeleted: false,
    });

    if (!combo) {
      return res.status(404).json({
        success: false,
        message: "Combo not found",
      });
    }

    // -----------------------------------------------
    // Code
    // -----------------------------------------------

    if (req.body.code) {
      const newCode =
        req.body.code.toUpperCase().trim();

      const duplicate = await ComboMeal.findOne({
        code: newCode,
        companyId,
        _id: {
          $ne: combo._id,
        },
        isDeleted: false,
      });

      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: "Combo code already exists",
        });
      }

      combo.code = newCode;
    }

    // -----------------------------------------------
    // Update Allowed Fields
    // -----------------------------------------------

    if (req.body.name !== undefined)
      combo.name = req.body.name;

    if (req.body.image !== undefined)
      combo.image = req.body.image;

    if (req.body.description !== undefined)
      combo.description = req.body.description;

    if (req.body.items !== undefined)
      combo.items = req.body.items;

    if (req.body.sellingPrice !== undefined)
      combo.sellingPrice =
        Number(req.body.sellingPrice);

    if (req.body.costPrice !== undefined)
      combo.costPrice =
        Number(req.body.costPrice);

    if (req.body.tax !== undefined)
      combo.tax =
        Number(req.body.tax);

    if (req.body.category !== undefined)
      combo.category =
        req.body.category || null;

    if (req.body.availableFrom !== undefined)
      combo.availableFrom =
        req.body.availableFrom;

    if (req.body.availableTo !== undefined)
      combo.availableTo =
        req.body.availableTo;

    if (req.body.isAvailable !== undefined)
      combo.isAvailable =
        Boolean(req.body.isAvailable);

    if (req.body.isActive !== undefined)
      combo.isActive =
        Boolean(req.body.isActive);

    combo.updatedBy = req.user._id;

    await combo.save();

    const updatedCombo =
      await ComboMeal.findById(combo._id)
        .populate(
          "items.productId",
          "name sellingPrice costPrice"
        )
        .populate(
          "category",
          "name"
        );

    return res.json({
      success: true,
      message: "Combo updated successfully",
      data: updatedCombo,
    });

  } catch (error) {
    console.error(
      "UPDATE COMBO ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// Delete Combo - Soft Delete
// =====================================================

exports.deleteCombo = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { companyId } =
      await getCompanyFromUser(req.user);

    const combo = await ComboMeal.findOne({
      _id: req.params.id,
      companyId,
      isDeleted: false,
    });

    if (!combo) {
      return res.status(404).json({
        success: false,
        message: "Combo not found",
      });
    }

    combo.isDeleted = true;
    combo.updatedBy = req.user._id;

    await combo.save();

    return res.json({
      success: true,
      message: "Combo deleted successfully",
    });

  } catch (error) {
    console.error(
      "DELETE COMBO ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// Restore Combo
// =====================================================

exports.restoreCombo = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { companyId } =
      await getCompanyFromUser(req.user);

    const combo = await ComboMeal.findOne({
      _id: req.params.id,
      companyId,
    });

    if (!combo) {
      return res.status(404).json({
        success: false,
        message: "Combo not found",
      });
    }

    combo.isDeleted = false;
    combo.updatedBy = req.user._id;

    await combo.save();

    return res.json({
      success: true,
      message: "Combo restored successfully",
      data: combo,
    });

  } catch (error) {
    console.error(
      "RESTORE COMBO ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// Toggle Availability
// =====================================================

exports.toggleAvailability = async (
  req,
  res
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { companyId } =
      await getCompanyFromUser(req.user);

    const combo = await ComboMeal.findOne({
      _id: req.params.id,
      companyId,
      isDeleted: false,
    });

    if (!combo) {
      return res.status(404).json({
        success: false,
        message: "Combo not found",
      });
    }

    combo.isAvailable =
      !combo.isAvailable;

    combo.updatedBy = req.user._id;

    await combo.save();

    return res.json({
      success: true,
      message:
        "Combo availability updated successfully",
      data: combo,
    });

  } catch (error) {
    console.error(
      "TOGGLE AVAILABILITY ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// Toggle Active
// =====================================================

exports.toggleActive = async (
  req,
  res
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { companyId } =
      await getCompanyFromUser(req.user);

    const combo = await ComboMeal.findOne({
      _id: req.params.id,
      companyId,
      isDeleted: false,
    });

    if (!combo) {
      return res.status(404).json({
        success: false,
        message: "Combo not found",
      });
    }

    combo.isActive =
      !combo.isActive;

    combo.updatedBy = req.user._id;

    await combo.save();

    return res.json({
      success: true,
      message:
        "Combo active status updated successfully",
      data: combo,
    });

  } catch (error) {
    console.error(
      "TOGGLE ACTIVE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};