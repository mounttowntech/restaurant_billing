const mongoose = require("mongoose");

const Product = require("../models/productModel");
const Store = require("../models/storeModel");
const Restaurant = require("../models/Restaurant");

// =====================================================
// Helper
// Get Store + Restaurant + Company
// =====================================================

const getStoreDetails = async (storeId) => {
  if (!storeId) {
    throw new Error("Store ID is required");
  }

  if (!mongoose.Types.ObjectId.isValid(storeId)) {
    throw new Error("Invalid Store ID");
  }

  const store = await Store.findOne({
    _id: storeId,
    isDeleted: false,
  });

  if (!store) {
    throw new Error("Store not found");
  }

  if (!store.restaurant) {
    throw new Error(
      "Restaurant not assigned to this store"
    );
  }

  const restaurant = await Restaurant.findOne({
    _id: store.restaurant,
    isDeleted: false,
  });

  if (!restaurant) {
    throw new Error(
      "Restaurant not found for this store"
    );
  }

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
// CREATE PRODUCT
// POST /api/products/create
// =====================================================

exports.createProduct = async (req, res) => {
  try {
    const {
      storeId,
      productCode,
      productName,
      description,
      category,
      purchasePrice,
      sellingPrice,
      mrp,
      taxPercentage,
      taxInclusive,
      unit,
      openingStock,
      currentStock,
      minimumStock,
      trackInventory,
      productType,
      kitchenName,
      preparationTime,
      image,
      isAvailable,
      isActive,
    } = req.body;

    // ==========================================
    // VALIDATION
    // ==========================================

    if (!storeId) {
      return res.status(400).json({
        success: false,
        message: "Store ID is required",
      });
    }

    if (!productCode) {
      return res.status(400).json({
        success: false,
        message: "Product code is required",
      });
    }

    if (!productName) {
      return res.status(400).json({
        success: false,
        message: "Product name is required",
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

    // ==========================================
    // GET STORE DETAILS
    // ==========================================

    const {
      store,
      restaurant,
      companyId,
    } = await getStoreDetails(storeId);

    // ==========================================
    // CHECK DUPLICATE PRODUCT
    // ==========================================

    const existingProduct =
      await Product.findOne({
        store: store._id,
        productCode:
          productCode.toUpperCase(),
        isDeleted: false,
      });

    if (existingProduct) {
      return res.status(400).json({
        success: false,
        message:
          "Product code already exists in this store",
      });
    }

    // ==========================================
    // CREATE PRODUCT
    // ==========================================

    const product =
      await Product.create({
        companyId,

        restaurant: restaurant._id,

        store: store._id,

        productCode:
          productCode.toUpperCase(),

        productName,

        description:
          description || "",

        category:
          category || null,

        purchasePrice:
          purchasePrice || 0,

        sellingPrice,

        mrp:
          mrp || 0,

        taxPercentage:
          taxPercentage || 0,

        taxInclusive:
          taxInclusive !== undefined
            ? taxInclusive
            : false,

        unit:
          unit || "PCS",

        openingStock:
          openingStock || 0,

        currentStock:
          currentStock !== undefined
            ? currentStock
            : openingStock || 0,

        minimumStock:
          minimumStock || 0,

        trackInventory:
          trackInventory !== undefined
            ? trackInventory
            : true,

        productType:
          productType || "Food",

        kitchenName:
          kitchenName || "",

        preparationTime:
          preparationTime || 0,

        image:
          image || "",

        isAvailable:
          isAvailable !== undefined
            ? isAvailable
            : true,

        isActive:
          isActive !== undefined
            ? isActive
            : true,

        createdBy:
          req.user?._id || null,
      });

    return res.status(201).json({
      success: true,
      message:
        "Product created successfully",
      data: product,
    });
  } catch (error) {
    console.error(
      "CREATE PRODUCT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// GET ALL PRODUCTS
// GET /api/products
// =====================================================

exports.getAllProducts = async (req, res) => {
  try {
    // Get store from logged-in user's token
    const storeId = req.user?.store;

    if (!storeId) {
      return res.status(400).json({
        success: false,
        message: "Store is not assigned to this user",
      });
    }

    const {
      search,
      category,
      productType,
      isAvailable,
      isActive,
    } = req.query;

    const filter = {
      store: storeId,
      isDeleted: false,
    };

    // SEARCH
    if (search) {
      filter.$or = [
        {
          productName: {
            $regex: search,
            $options: "i",
          },
        },
        {
          productCode: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    // CATEGORY
    if (category) {
      filter.category = category;
    }

    // PRODUCT TYPE
    if (productType) {
      filter.productType = productType;
    }

    // AVAILABLE
    if (isAvailable !== undefined) {
      filter.isAvailable = isAvailable === "true";
    }

    // ACTIVE
    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    const products = await Product.find(filter)
      .populate(
        "category",
        "categoryName categoryCode"
      )
      .populate(
        "store",
        "storeName storeCode"
      )
      .populate(
        "restaurant",
        "restaurantName restaurantCode"
      )
      .sort({
        createdAt: -1,
      });

    return res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });

  } catch (error) {
    console.error(
      "GET PRODUCTS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// GET PRODUCT BY ID
// GET /api/products/:id
// =====================================================

exports.getProductById = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid Product ID",
      });
    }

    const product =
      await Product.findOne({
        _id: id,
        isDeleted: false,
      })
        .populate(
          "category",
          "categoryName categoryCode"
        )
        .populate(
          "store",
          "storeName storeCode"
        )
        .populate(
          "restaurant",
          "restaurantName restaurantCode"
        )
        .populate(
          "companyId",
          "companyName companyCode"
        );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error) {
    console.error(
      "GET PRODUCT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// UPDATE PRODUCT
// PUT /api/products/:id
// =====================================================

exports.updateProduct = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid Product ID",
      });
    }

    const product =
      await Product.findOne({
        _id: id,
        isDeleted: false,
      });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // ==========================================
    // Do not change hierarchy
    // ==========================================

    if (
      req.body.companyId ||
      req.body.restaurant ||
      req.body.store
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Company, restaurant and store cannot be changed",
      });
    }

    // ==========================================
    // Allowed Fields
    // ==========================================

    const allowedFields = [
      "productName",
      "description",
      "category",
      "purchasePrice",
      "sellingPrice",
      "mrp",
      "taxPercentage",
      "taxInclusive",
      "unit",
      "openingStock",
      "currentStock",
      "minimumStock",
      "trackInventory",
      "productType",
      "kitchenName",
      "preparationTime",
      "image",
      "isAvailable",
      "isActive",
    ];

    allowedFields.forEach(
      (field) => {
        if (
          req.body[field] !== undefined
        ) {
          product[field] =
            req.body[field];
        }
      }
    );

    product.updatedBy =
      req.user?._id || null;

    await product.save();

    return res.status(200).json({
      success: true,
      message:
        "Product updated successfully",
      data: product,
    });
  } catch (error) {
    console.error(
      "UPDATE PRODUCT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// DELETE PRODUCT
// DELETE /api/products/:id
// =====================================================

exports.deleteProduct = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid Product ID",
      });
    }

    const product =
      await Product.findOne({
        _id: id,
        isDeleted: false,
      });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    product.isDeleted = true;

    product.updatedBy =
      req.user?._id || null;

    await product.save();

    return res.status(200).json({
      success: true,
      message:
        "Product deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE PRODUCT ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// TOGGLE PRODUCT AVAILABILITY
// PATCH /api/products/:id/toggle-availability
// =====================================================

exports.toggleProductAvailability =
  async (req, res) => {
    try {
      const { id } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid Product ID",
        });
      }

      const product =
        await Product.findOne({
          _id: id,
          isDeleted: false,
        });

      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      product.isAvailable =
        !product.isAvailable;

      product.updatedBy =
        req.user?._id || null;

      await product.save();

      return res.status(200).json({
        success: true,
        message:
          "Product availability updated",
        data: product,
      });
    } catch (error) {
      console.error(
        "TOGGLE PRODUCT ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };