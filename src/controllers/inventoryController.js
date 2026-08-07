const Inventory = require("../models/inventoryModel");
const Restaurant = require("../models/Restaurant");
const Store = require("../models/storeModel");
const Product = require("../models/productModel");
const Supplier = require("../models/Supplier");

/* ==========================================================
   Helper - Update Stock Status
========================================================== */

const calculateStockStatus = (
  currentStock,
  minimumStock,
  reorderLevel,
  maximumStock
) => {
  if (currentStock <= 0) {
    return "Out of Stock";
  }

  if (
    maximumStock > 0 &&
    currentStock > maximumStock
  ) {
    return "Over Stock";
  }

  if (
    currentStock <= minimumStock ||
    currentStock <= reorderLevel
  ) {
    return "Low Stock";
  }

  return "In Stock";
};

/* ==========================================================
   Create Inventory
========================================================== */

exports.createInventory = async (req, res) => {
  try {
    const {
      restaurant,
      store,
      product,
      inventoryCode,
      openingStock = 0,
      currentStock,
      reservedStock = 0,
      damagedStock = 0,
      minimumStock = 0,
      reorderLevel = 0,
      maximumStock = 0,
      purchasePrice = 0,
      sellingPrice = 0,
      unit,
      batchNumber,
      manufacturingDate,
      expiryDate,
      supplier,
      remarks,
    } = req.body;

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
       Validate Product
    ====================================================== */

    const productExists =
      await Product.findById(product);

    if (!productExists) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    /* ======================================================
       Validate Supplier
    ====================================================== */

    if (supplier) {
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
    }

    /* ======================================================
       Duplicate Inventory Code
    ====================================================== */

    const existingInventory =
      await Inventory.findOne({
        inventoryCode: inventoryCode.toUpperCase(),
      });

    if (existingInventory) {
      return res.status(400).json({
        success: false,
        message: "Inventory code already exists.",
      });
    }

    /* ======================================================
       Check Existing Product Inventory
    ====================================================== */

    const existingProductInventory =
      await Inventory.findOne({
        restaurant,
        store,
        product,
        isDeleted: false,
      });

    if (existingProductInventory) {
      return res.status(400).json({
        success: false,
        message:
          "Inventory already exists for this product and store.",
      });
    }

    /* ======================================================
       Stock
    ====================================================== */

    const stock =
      currentStock !== undefined
        ? Number(currentStock)
        : Number(openingStock);

    const availableStock = Math.max(
      0,
      stock - Number(reservedStock)
    );

    const stockStatus =
      calculateStockStatus(
        stock,
        Number(minimumStock),
        Number(reorderLevel),
        Number(maximumStock)
      );

    /* ======================================================
       Stock Value
    ====================================================== */

    const stockValue =
      stock * Number(purchasePrice);

    /* ======================================================
       Create Inventory
    ====================================================== */

    const inventory =
      await Inventory.create({
        restaurant,
        store,
        product,

        inventoryCode:
          inventoryCode.toUpperCase(),

        openingStock: Number(openingStock),

        currentStock: stock,

        reservedStock:
          Number(reservedStock),

        availableStock,

        damagedStock:
          Number(damagedStock),

        minimumStock:
          Number(minimumStock),

        reorderLevel:
          Number(reorderLevel),

        maximumStock:
          Number(maximumStock),

        purchasePrice:
          Number(purchasePrice),

        sellingPrice:
          Number(sellingPrice),

        stockValue,

        unit,

        batchNumber,

        manufacturingDate,

        expiryDate,

        supplier,

        stockStatus,

        remarks,

        createdBy:
          req.user?.id || req.user?._id,
      });

    /* ======================================================
       Populate
    ====================================================== */

    const populatedInventory =
      await Inventory.findById(
        inventory._id
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
          "product",
          "productName productCode"
        )
        .populate(
          "supplier",
          "supplierName supplierCode"
        );

    return res.status(201).json({
      success: true,
      message: "Inventory created successfully.",
      data: populatedInventory,
    });
  } catch (error) {
    console.error(
      "createInventory:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create inventory.",
      error: error.message,
    });
  }
};

/* ==========================================================
   Get All Inventory
========================================================== */

exports.getInventories = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      restaurant,
      store,
      product,
      supplier,
      stockStatus,
      isActive,
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

    if (product) {
      filter.product = product;
    }

    if (supplier) {
      filter.supplier = supplier;
    }

    if (stockStatus) {
      filter.stockStatus = stockStatus;
    }

    if (isActive !== undefined) {
      filter.isActive =
        isActive === "true";
    }

    const pageNumber = Number(page);
    const pageLimit = Number(limit);

    const totalRecords =
      await Inventory.countDocuments(
        filter
      );

    const inventories =
      await Inventory.find(filter)
        .populate(
          "restaurant",
          "restaurantName restaurantCode"
        )
        .populate(
          "store",
          "storeName storeCode"
        )
        .populate(
          "product",
          "productName productCode"
        )
        .populate(
          "supplier",
          "supplierName supplierCode"
        )
        .sort({ createdAt: -1 })
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
          totalRecords / pageLimit
        ),
      count: inventories.length,
      data: inventories,
    });
  } catch (error) {
    console.error(
      "getInventories:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch inventory.",
      error: error.message,
    });
  }
};

/* ==========================================================
   Get Inventory By ID
========================================================== */

exports.getInventoryById = async (
  req,
  res
) => {
  try {
    const inventory =
      await Inventory.findOne({
        _id: req.params.id,
        isDeleted: false,
      })
        .populate(
          "restaurant",
          "restaurantName restaurantCode ownerName phone"
        )
        .populate(
          "store",
          "storeName storeCode managerName phone"
        )
        .populate(
          "product",
          "productName productCode"
        )
        .populate(
          "supplier",
          "supplierName supplierCode mobile"
        )
        .populate(
          "createdBy",
          "name email"
        )
        .populate(
          "updatedBy",
          "name email"
        );

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: inventory,
    });
  } catch (error) {
    console.error(
      "getInventoryById:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch inventory.",
      error: error.message,
    });
  }
};

/* ==========================================================
   Update Inventory
========================================================== */

exports.updateInventory = async (
  req,
  res
) => {
  try {
    const inventory =
      await Inventory.findOne({
        _id: req.params.id,
        isDeleted: false,
      });

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory not found.",
      });
    }

    const allowedFields = [
      "restaurant",
      "store",
      "product",
      "inventoryCode",
      "openingStock",
      "currentStock",
      "reservedStock",
      "damagedStock",
      "minimumStock",
      "reorderLevel",
      "maximumStock",
      "purchasePrice",
      "sellingPrice",
      "unit",
      "batchNumber",
      "manufacturingDate",
      "expiryDate",
      "supplier",
      "remarks",
    ];

    allowedFields.forEach(
      (field) => {
        if (
          req.body[field] !==
          undefined
        ) {
          inventory[field] =
            field === "inventoryCode"
              ? req.body[field].toUpperCase()
              : req.body[field];
        }
      }
    );

    /* ======================================================
       Recalculate Stock
    ====================================================== */

    inventory.currentStock =
      Number(inventory.currentStock || 0);

    inventory.reservedStock =
      Number(inventory.reservedStock || 0);

    inventory.availableStock =
      Math.max(
        0,
        inventory.currentStock -
          inventory.reservedStock
      );

    inventory.stockValue =
      inventory.currentStock *
      Number(
        inventory.purchasePrice || 0
      );

    inventory.stockStatus =
      calculateStockStatus(
        inventory.currentStock,
        Number(
          inventory.minimumStock || 0
        ),
        Number(
          inventory.reorderLevel || 0
        ),
        Number(
          inventory.maximumStock || 0
        )
      );

    inventory.updatedBy =
      req.user?.id ||
      req.user?._id;

    await inventory.save();

    const updated =
      await Inventory.findById(
        inventory._id
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
          "product",
          "productName productCode"
        )
        .populate(
          "supplier",
          "supplierName supplierCode"
        );

    return res.status(200).json({
      success: true,
      message:
        "Inventory updated successfully.",
      data: updated,
    });
  } catch (error) {
    console.error(
      "updateInventory:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update inventory.",
      error: error.message,
    });
  }
};

/* ==========================================================
   Delete Inventory
========================================================== */

exports.deleteInventory = async (
  req,
  res
) => {
  try {
    const inventory =
      await Inventory.findOne({
        _id: req.params.id,
        isDeleted: false,
      });

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory not found.",
      });
    }

    inventory.isDeleted = true;

    inventory.updatedBy =
      req.user?.id ||
      req.user?._id;

    await inventory.save();

    return res.status(200).json({
      success: true,
      message:
        "Inventory deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
   Restore Inventory
========================================================== */

exports.restoreInventory = async (
  req,
  res
) => {
  try {
    const inventory =
      await Inventory.findOne({
        _id: req.params.id,
        isDeleted: true,
      });

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message:
          "Deleted inventory not found.",
      });
    }

    inventory.isDeleted = false;

    inventory.updatedBy =
      req.user?.id ||
      req.user?._id;

    await inventory.save();

    return res.status(200).json({
      success: true,
      message:
        "Inventory restored successfully.",
      data: inventory,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
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
    const { quantity, purchasePrice } =
      req.body;

    const qty = Number(quantity);

    if (!qty || qty <= 0) {
      return res.status(400).json({
        success: false,
        message:
          "Quantity must be greater than 0.",
      });
    }

    const inventory =
      await Inventory.findOne({
        _id: req.params.id,
        isDeleted: false,
      });

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory not found.",
      });
    }

    inventory.currentStock += qty;

    if (
      purchasePrice !== undefined
    ) {
      inventory.purchasePrice =
        Number(purchasePrice);
    }

    inventory.availableStock =
      Math.max(
        0,
        inventory.currentStock -
          inventory.reservedStock
      );

    inventory.stockValue =
      inventory.currentStock *
      inventory.purchasePrice;

    inventory.stockStatus =
      calculateStockStatus(
        inventory.currentStock,
        inventory.minimumStock,
        inventory.reorderLevel,
        inventory.maximumStock
      );

    inventory.updatedBy =
      req.user?.id ||
      req.user?._id;

    await inventory.save();

    return res.status(200).json({
      success: true,
      message: "Stock added successfully.",
      data: inventory,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
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
    const { quantity } = req.body;

    const qty = Number(quantity);

    if (!qty || qty <= 0) {
      return res.status(400).json({
        success: false,
        message:
          "Quantity must be greater than 0.",
      });
    }

    const inventory =
      await Inventory.findOne({
        _id: req.params.id,
        isDeleted: false,
      });

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory not found.",
      });
    }

    if (
      inventory.currentStock < qty
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Insufficient stock.",
      });
    }

    inventory.currentStock -= qty;

    inventory.availableStock =
      Math.max(
        0,
        inventory.currentStock -
          inventory.reservedStock
      );

    inventory.stockValue =
      inventory.currentStock *
      inventory.purchasePrice;

    inventory.stockStatus =
      calculateStockStatus(
        inventory.currentStock,
        inventory.minimumStock,
        inventory.reorderLevel,
        inventory.maximumStock
      );

    inventory.updatedBy =
      req.user?.id ||
      req.user?._id;

    await inventory.save();

    return res.status(200).json({
      success: true,
      message:
        "Stock removed successfully.",
      data: inventory,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
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
    const {
      quantity,
      adjustmentType,
      remarks,
    } = req.body;

    const qty = Number(quantity);

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

    const inventory =
      await Inventory.findOne({
        _id: req.params.id,
        isDeleted: false,
      });

    if (!inventory) {
      return res.status(404).json({
        success: false,
        message: "Inventory not found.",
      });
    }

    if (
      adjustmentType === "ADD"
    ) {
      inventory.currentStock += qty;
    }

    if (
      adjustmentType === "REMOVE"
    ) {
      if (
        inventory.currentStock <
        qty
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Insufficient stock.",
        });
      }

      inventory.currentStock -= qty;
    }

    if (remarks !== undefined) {
      inventory.remarks = remarks;
    }

    inventory.availableStock =
      Math.max(
        0,
        inventory.currentStock -
          inventory.reservedStock
      );

    inventory.stockValue =
      inventory.currentStock *
      inventory.purchasePrice;

    inventory.stockStatus =
      calculateStockStatus(
        inventory.currentStock,
        inventory.minimumStock,
        inventory.reorderLevel,
        inventory.maximumStock
      );

    inventory.updatedBy =
      req.user?.id ||
      req.user?._id;

    await inventory.save();

    return res.status(200).json({
      success: true,
      message:
        "Stock adjusted successfully.",
      data: inventory,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
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
    const inventories =
      await Inventory.find({
        isDeleted: false,
        isActive: true,
        $expr: {
          $lte: [
            "$currentStock",
            "$reorderLevel",
          ],
        },
      })
        .populate(
          "restaurant",
          "restaurantName"
        )
        .populate(
          "store",
          "storeName"
        )
        .populate(
          "product",
          "productName productCode"
        );

    return res.status(200).json({
      success: true,
      count: inventories.length,
      data: inventories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
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
    const inventories =
      await Inventory.find({
        currentStock: {
          $lte: 0,
        },
        isDeleted: false,
        isActive: true,
      })
        .populate(
          "restaurant",
          "restaurantName"
        )
        .populate(
          "store",
          "storeName"
        )
        .populate(
          "product",
          "productName productCode"
        );

    return res.status(200).json({
      success: true,
      count: inventories.length,
      data: inventories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
   Inventory Summary
========================================================== */

exports.getInventorySummary = async (
  req,
  res
) => {
  try {
    const [
      totalItems,
      inStock,
      lowStock,
      outOfStock,
      overStock,
      stockValue,
    ] = await Promise.all([
      Inventory.countDocuments({
        isDeleted: false,
      }),

      Inventory.countDocuments({
        stockStatus: "In Stock",
        isDeleted: false,
      }),

      Inventory.countDocuments({
        stockStatus: "Low Stock",
        isDeleted: false,
      }),

      Inventory.countDocuments({
        stockStatus: "Out of Stock",
        isDeleted: false,
      }),

      Inventory.countDocuments({
        stockStatus: "Over Stock",
        isDeleted: false,
      }),

      Inventory.aggregate([
        {
          $match: {
            isDeleted: false,
          },
        },
        {
          $group: {
            _id: null,
            total: {
              $sum: "$stockValue",
            },
          },
        },
      ]),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalItems,
        inStock,
        lowStock,
        outOfStock,
        overStock,
        totalStockValue:
          stockValue[0]?.total || 0,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
   Search Inventory
========================================================== */

exports.searchInventory = async (
  req,
  res
) => {
  try {
    const {
      keyword = "",
    } = req.query;

    const inventories =
      await Inventory.find({
        isDeleted: false,
        $or: [
          {
            inventoryCode: {
              $regex: keyword,
              $options: "i",
            },
          },
          {
            batchNumber: {
              $regex: keyword,
              $options: "i",
            },
          },
        ],
      })
        .populate(
          "restaurant",
          "restaurantName"
        )
        .populate(
          "store",
          "storeName"
        )
        .populate(
          "product",
          "productName productCode"
        )
        .populate(
          "supplier",
          "supplierName supplierCode"
        );

    return res.status(200).json({
      success: true,
      count: inventories.length,
      data: inventories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
   Expiring Inventory
========================================================== */

exports.getExpiringInventory = async (
  req,
  res
) => {
  try {
    const days =
      Number(req.query.days) || 30;

    const today = new Date();

    const futureDate = new Date();

    futureDate.setDate(
      today.getDate() + days
    );

    const inventories =
      await Inventory.find({
        isDeleted: false,
        expiryDate: {
          $gte: today,
          $lte: futureDate,
        },
      })
        .populate(
          "product",
          "productName productCode"
        )
        .populate(
          "store",
          "storeName storeCode"
        );

    return res.status(200).json({
      success: true,
      count: inventories.length,
      data: inventories,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};