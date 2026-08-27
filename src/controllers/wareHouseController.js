const Warehouse = require("../models/warehouseModel");
const Restaurant = require("../models/Restaurant");
const Store = require("../models/storeModel");
const User = require("../models/User");

/* ==========================================================
   Helper - Populate Warehouse
========================================================== */

const populateWarehouse = (query) => {
  return query
    .populate("restaurant", "restaurantName restaurantCode")
    .populate("store", "storeName storeCode")
    .populate("manager", "name email phone")
    .populate("createdBy", "name email")
    .populate("updatedBy", "name email");
};

/* ==========================================================
   Create Warehouse
========================================================== */

exports.createWarehouse = async (req, res) => {
  try {
    const {
      restaurant,
      store,
      warehouseCode,
      warehouseName,
      warehouseType,
      manager,
      contactPerson,
      phone,
      email,
      address,
      city,
      state,
      country,
      pincode,
      capacity,
      capacityUnit,
      isDefault,
      isActive,
      description,
      remarks,
    } = req.body;

    /* ======================================================
       Required Fields
    ====================================================== */

    if (!restaurant || !store || !warehouseCode || !warehouseName) {
      return res.status(400).json({
        success: false,
        message:
          "restaurant, store, warehouseCode and warehouseName are required.",
      });
    }

    /* ======================================================
       Validate Restaurant
    ====================================================== */

    const restaurantExists = await Restaurant.findById(restaurant);

    if (!restaurantExists) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found.",
      });
    }

    /* ======================================================
       Validate Store
    ====================================================== */

    const storeExists = await Store.findById(store);

    if (!storeExists) {
      return res.status(404).json({
        success: false,
        message: "Store not found.",
      });
    }

    /* ======================================================
       Validate Manager
    ====================================================== */

    if (manager) {
      const managerExists = await User.findById(manager);

      if (!managerExists) {
        return res.status(404).json({
          success: false,
          message: "Manager/User not found.",
        });
      }
    }

    /* ======================================================
       Duplicate Warehouse Code
    ====================================================== */

    const existingWarehouse = await Warehouse.findOne({
      restaurant,
      warehouseCode: warehouseCode.toUpperCase(),
      isDeleted: false,
    });

    if (existingWarehouse) {
      return res.status(400).json({
        success: false,
        message: "Warehouse code already exists for this restaurant.",
      });
    }

    /* ======================================================
       Check Duplicate Warehouse Name
    ====================================================== */

    const existingName = await Warehouse.findOne({
      restaurant,
      store,
      warehouseName: warehouseName.trim(),
      isDeleted: false,
    });

    if (existingName) {
      return res.status(400).json({
        success: false,
        message: "Warehouse with this name already exists in this store.",
      });
    }

    /* ======================================================
       Default Warehouse
    ====================================================== */

    if (isDefault === true) {
      await Warehouse.updateMany(
        {
          restaurant,
          store,
          isDeleted: false,
        },
        {
          $set: {
            isDefault: false,
          },
        },
      );
    }

    /* ======================================================
       Create Warehouse
    ====================================================== */

    const warehouse = await Warehouse.create({
      restaurant,
      store,

      warehouseCode: warehouseCode.toUpperCase(),

      warehouseName: warehouseName.trim(),

      warehouseType,

      manager: manager || null,

      contactPerson,
      phone,
      email,
      address,
      city,
      state,
      country,
      pincode,

      capacity: Number(capacity || 0),

      capacityUnit,

      isDefault: Boolean(isDefault),

      isActive: isActive !== undefined ? Boolean(isActive) : true,

      description,
      remarks,

      createdBy: req.user?.id || req.user?._id || null,
    });

    /* ======================================================
       Populate
    ====================================================== */

    const populatedWarehouse = await populateWarehouse(
      Warehouse.findById(warehouse._id),
    );

    return res.status(201).json({
      success: true,
      message: "Warehouse created successfully.",
      data: populatedWarehouse,
    });
  } catch (error) {
    console.error("createWarehouse:", error);

    /* ======================================================
       Duplicate Key
    ====================================================== */

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Warehouse code already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to create warehouse.",
      error: error.message,
    });
  }
};

/* ==========================================================
   Get All Warehouses
========================================================== */

exports.getWarehouses = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      restaurant,
      store,
      warehouseType,
      manager,
      isDefault,
      isActive,
    } = req.query;

    const filter = {
      isDeleted: false,
    };

    /* ======================================================
       Filters
    ====================================================== */

    if (restaurant) {
      filter.restaurant = restaurant;
    }

    if (store) {
      filter.store = store;
    }

    if (warehouseType) {
      filter.warehouseType = warehouseType;
    }

    if (manager) {
      filter.manager = manager;
    }

    if (isDefault !== undefined) {
      filter.isDefault = isDefault === "true";
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    /* ======================================================
       Pagination
    ====================================================== */

    const pageNumber = Math.max(1, Number(page));

    const pageLimit = Math.max(1, Number(limit));

    const skip = (pageNumber - 1) * pageLimit;

    const totalRecords = await Warehouse.countDocuments(filter);

    const warehouses = await populateWarehouse(
      Warehouse.find(filter)
        .sort({
          createdAt: -1,
        })
        .skip(skip)
        .limit(pageLimit),
    );

    return res.status(200).json({
      success: true,

      totalRecords,

      currentPage: pageNumber,

      totalPages: Math.ceil(totalRecords / pageLimit),

      count: warehouses.length,

      data: warehouses,
    });
  } catch (error) {
    console.error("getWarehouses:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch warehouses.",
      error: error.message,
    });
  }
};

/* ==========================================================
   Get Warehouse By ID
========================================================== */

exports.getWarehouseById = async (req, res) => {
  try {
    const warehouse = await populateWarehouse(
      Warehouse.findOne({
        _id: req.params.id,
        isDeleted: false,
      }),
    );

    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: "Warehouse not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: warehouse,
    });
  } catch (error) {
    console.error("getWarehouseById:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch warehouse.",
      error: error.message,
    });
  }
};

/* ==========================================================
   Update Warehouse
========================================================== */

exports.updateWarehouse = async (req, res) => {
  try {
    const warehouse = await Warehouse.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: "Warehouse not found.",
      });
    }

    const {
      restaurant,
      store,
      warehouseCode,
      warehouseName,
      warehouseType,
      manager,
      contactPerson,
      phone,
      email,
      address,
      city,
      state,
      country,
      pincode,
      capacity,
      capacityUnit,
      isDefault,
      isActive,
      description,
      remarks,
    } = req.body;

    /* ======================================================
       Validate Restaurant
    ====================================================== */

    if (restaurant) {
      const restaurantExists = await Restaurant.findById(restaurant);

      if (!restaurantExists) {
        return res.status(404).json({
          success: false,
          message: "Restaurant not found.",
        });
      }

      warehouse.restaurant = restaurant;
    }

    /* ======================================================
       Validate Store
    ====================================================== */

    if (store) {
      const storeExists = await Store.findById(store);

      if (!storeExists) {
        return res.status(404).json({
          success: false,
          message: "Store not found.",
        });
      }

      warehouse.store = store;
    }

    /* ======================================================
       Validate Manager
    ====================================================== */

    if (manager) {
      const managerExists = await User.findById(manager);

      if (!managerExists) {
        return res.status(404).json({
          success: false,
          message: "Manager/User not found.",
        });
      }

      warehouse.manager = manager;
    }

    /* ======================================================
       Warehouse Code
    ====================================================== */

    if (warehouseCode) {
      const normalizedCode = warehouseCode.trim().toUpperCase();

      const duplicate = await Warehouse.findOne({
        _id: {
          $ne: warehouse._id,
        },
        restaurant: warehouse.restaurant,
        warehouseCode: normalizedCode,
        isDeleted: false,
      });

      if (duplicate) {
        return res.status(400).json({
          success: false,
          message: "Warehouse code already exists.",
        });
      }

      warehouse.warehouseCode = normalizedCode;
    }

    /* ======================================================
       Update Fields
    ====================================================== */

    if (warehouseName !== undefined) {
      warehouse.warehouseName = warehouseName.trim();
    }

    if (warehouseType !== undefined) {
      warehouse.warehouseType = warehouseType;
    }

    if (contactPerson !== undefined) {
      warehouse.contactPerson = contactPerson;
    }

    if (phone !== undefined) {
      warehouse.phone = phone;
    }

    if (email !== undefined) {
      warehouse.email = email.toLowerCase();
    }

    if (address !== undefined) {
      warehouse.address = address;
    }

    if (city !== undefined) {
      warehouse.city = city;
    }

    if (state !== undefined) {
      warehouse.state = state;
    }

    if (country !== undefined) {
      warehouse.country = country;
    }

    if (pincode !== undefined) {
      warehouse.pincode = pincode;
    }

    if (capacity !== undefined) {
      warehouse.capacity = Number(capacity);
    }

    if (capacityUnit !== undefined) {
      warehouse.capacityUnit = capacityUnit;
    }

    if (isActive !== undefined) {
      warehouse.isActive = Boolean(isActive);
    }

    if (description !== undefined) {
      warehouse.description = description;
    }

    if (remarks !== undefined) {
      warehouse.remarks = remarks;
    }

    /* ======================================================
       Default Warehouse
    ====================================================== */

    if (isDefault === true) {
      await Warehouse.updateMany(
        {
          restaurant: warehouse.restaurant,

          store: warehouse.store,

          _id: {
            $ne: warehouse._id,
          },

          isDeleted: false,
        },
        {
          $set: {
            isDefault: false,
          },
        },
      );

      warehouse.isDefault = true;
    }

    if (isDefault === false) {
      warehouse.isDefault = false;
    }

    /* ======================================================
       Audit
    ====================================================== */

    warehouse.updatedBy = req.user?.id || req.user?._id || null;

    await warehouse.save();

    /* ======================================================
       Populate
    ====================================================== */

    const updatedWarehouse = await populateWarehouse(
      Warehouse.findById(warehouse._id),
    );

    return res.status(200).json({
      success: true,
      message: "Warehouse updated successfully.",
      data: updatedWarehouse,
    });
  } catch (error) {
    console.error("updateWarehouse:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update warehouse.",
      error: error.message,
    });
  }
};

/* ==========================================================
   Delete Warehouse
========================================================== */

exports.deleteWarehouse = async (req, res) => {
  try {
    const warehouse = await Warehouse.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: "Warehouse not found.",
      });
    }

    warehouse.isDeleted = true;
    warehouse.isActive = false;
    warehouse.isDefault = false;

    warehouse.updatedBy = req.user?.id || req.user?._id || null;

    await warehouse.save();

    return res.status(200).json({
      success: true,
      message: "Warehouse deleted successfully.",
    });
  } catch (error) {
    console.error("deleteWarehouse:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete warehouse.",
      error: error.message,
    });
  }
};

/* ==========================================================
   Restore Warehouse
========================================================== */

exports.restoreWarehouse = async (req, res) => {
  try {
    const warehouse = await Warehouse.findOne({
      _id: req.params.id,
      isDeleted: true,
    });

    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: "Deleted warehouse not found.",
      });
    }

    warehouse.isDeleted = false;
    warehouse.isActive = true;

    warehouse.updatedBy = req.user?.id || req.user?._id || null;

    await warehouse.save();

    const restoredWarehouse = await populateWarehouse(
      Warehouse.findById(warehouse._id),
    );

    return res.status(200).json({
      success: true,
      message: "Warehouse restored successfully.",
      data: restoredWarehouse,
    });
  } catch (error) {
    console.error("restoreWarehouse:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to restore warehouse.",
      error: error.message,
    });
  }
};

/* ==========================================================
   Set Default Warehouse
========================================================== */

exports.setDefaultWarehouse = async (req, res) => {
  try {
    const warehouse = await Warehouse.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: "Warehouse not found.",
      });
    }

    /* ======================================================
       Remove Existing Default
    ====================================================== */

    await Warehouse.updateMany(
      {
        restaurant: warehouse.restaurant,

        store: warehouse.store,

        _id: {
          $ne: warehouse._id,
        },

        isDeleted: false,
      },
      {
        $set: {
          isDefault: false,
        },
      },
    );

    /* ======================================================
       Set Current As Default
    ====================================================== */

    warehouse.isDefault = true;

    warehouse.updatedBy = req.user?.id || req.user?._id || null;

    await warehouse.save();

    return res.status(200).json({
      success: true,
      message: "Default warehouse updated successfully.",
      data: warehouse,
    });
  } catch (error) {
    console.error("setDefaultWarehouse:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to set default warehouse.",
      error: error.message,
    });
  }
};

/* ==========================================================
   Search Warehouse
========================================================== */

exports.searchWarehouse = async (req, res) => {
  try {
    const keyword = req.query.search || "";

    const filter = {
      isDeleted: false,
      $or: [
        {
          warehouseCode: {
            $regex: keyword,
            $options: "i",
          },
        },
        {
          warehouseName: {
            $regex: keyword,
            $options: "i",
          },
        },
        {
          contactPerson: {
            $regex: keyword,
            $options: "i",
          },
        },
        {
          phone: {
            $regex: keyword,
            $options: "i",
          },
        },
        {
          city: {
            $regex: keyword,
            $options: "i",
          },
        },
      ],
    };

    const warehouses = await populateWarehouse(
      Warehouse.find(filter).sort({
        warehouseName: 1,
      }),
    );

    return res.status(200).json({
      success: true,
      count: warehouses.length,
      data: warehouses,
    });
  } catch (error) {
    console.error("searchWarehouse:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to search warehouses.",
      error: error.message,
    });
  }
};

/* ==========================================================
   Get Default Warehouse
========================================================== */

exports.getDefaultWarehouse = async (req, res) => {
  try {
    const { restaurant, store } = req.query;

    if (!restaurant || !store) {
      return res.status(400).json({
        success: false,
        message: "restaurant and store are required.",
      });
    }

    const warehouse = await populateWarehouse(
      Warehouse.findOne({
        restaurant,
        store,
        isDefault: true,
        isActive: true,
        isDeleted: false,
      }),
    );

    if (!warehouse) {
      return res.status(404).json({
        success: false,
        message: "Default warehouse not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: warehouse,
    });
  } catch (error) {
    console.error("getDefaultWarehouse:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch default warehouse.",
      error: error.message,
    });
  }
};

/* ==========================================================
   Warehouse Summary
========================================================== */

exports.getWarehouseSummary = async (req, res) => {
  try {
    const filter = {
      isDeleted: false,
    };

    if (req.query.restaurant) {
      filter.restaurant = req.query.restaurant;
    }

    if (req.query.store) {
      filter.store = req.query.store;
    }

    const [
      totalWarehouses,
      activeWarehouses,
      inactiveWarehouses,
      defaultWarehouses,
    ] = await Promise.all([
      Warehouse.countDocuments(filter),

      Warehouse.countDocuments({
        ...filter,
        isActive: true,
      }),

      Warehouse.countDocuments({
        ...filter,
        isActive: false,
      }),

      Warehouse.countDocuments({
        ...filter,
        isDefault: true,
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        totalWarehouses,
        activeWarehouses,
        inactiveWarehouses,
        defaultWarehouses,
      },
    });
  } catch (error) {
    console.error("getWarehouseSummary:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch warehouse summary.",
      error: error.message,
    });
  }
};
