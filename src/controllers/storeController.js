const mongoose = require("mongoose");
const Store = require("../models/storeModel");
const Restaurant = require("../models/Restaurant");

// =====================================================
// CREATE STORE
// POST /api/stores/create
//
// Authentication is NOT required.
// This allows initial setup.
// =====================================================

exports.createStore = async (req, res) => {
  try {
    const {
      restaurant,
      storeCode,
      storeName,
      branchName,
      managerName,
      email,
      phone,
      alternatePhone,
      gstNumber,
      fssaiNumber,
      address,
      area,
      city,
      state,
      country,
      pincode,
      latitude,
      longitude,
      openingTime,
      closingTime,
      totalTables,
      totalSeats,
      serviceChargePercentage,
      gstEnabled,
      serviceChargeEnabled,
      dineInEnabled,
      takeawayEnabled,
      deliveryEnabled,
      onlineOrderEnabled,
      printerName,
      kitchenPrinter,
      billingPrinter,
      logo,
      status,
    } = req.body;

    // =====================================================
    // VALIDATION
    // =====================================================

    if (!restaurant) {
      return res.status(400).json({
        success: false,
        message: "Restaurant ID is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(restaurant)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Restaurant ID",
      });
    }

    if (!storeCode) {
      return res.status(400).json({
        success: false,
        message: "Store code is required",
      });
    }

    if (!storeName) {
      return res.status(400).json({
        success: false,
        message: "Store name is required",
      });
    }

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone is required",
      });
    }

    // =====================================================
    // CHECK RESTAURANT
    // =====================================================

    const restaurantExists = await Restaurant.findOne({
      _id: restaurant,
      isDeleted: false,
    });

    if (!restaurantExists) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
        restaurantId: restaurant,
      });
    }

    // =====================================================
    // CHECK DUPLICATE STORE CODE
    // =====================================================

    const existingStore = await Store.findOne({
      storeCode: storeCode.toUpperCase(),
    });

    if (existingStore) {
      return res.status(400).json({
        success: false,
        message: "Store code already exists",
        storeCode: storeCode.toUpperCase(),
      });
    }

    // =====================================================
    // CREATE STORE
    // =====================================================

    const store = await Store.create({
      restaurant,

      storeCode: storeCode.toUpperCase(),

      storeName,

      branchName: branchName || "",

      managerName: managerName || "",

      email: email || "",

      phone,

      alternatePhone: alternatePhone || "",

      gstNumber: gstNumber || "",

      fssaiNumber: fssaiNumber || "",

      address: address || "",

      area: area || "",

      city: city || "",

      state: state || "",

      country: country || "India",

      pincode: pincode || "",

      latitude:
        latitude !== undefined
          ? latitude
          : null,

      longitude:
        longitude !== undefined
          ? longitude
          : null,

      openingTime:
        openingTime || "09:00",

      closingTime:
        closingTime || "23:00",

      totalTables:
        totalTables !== undefined
          ? totalTables
          : 0,

      totalSeats:
        totalSeats !== undefined
          ? totalSeats
          : 0,

      serviceChargePercentage:
        serviceChargePercentage !== undefined
          ? serviceChargePercentage
          : 0,

      gstEnabled:
        gstEnabled !== undefined
          ? gstEnabled
          : true,

      serviceChargeEnabled:
        serviceChargeEnabled !== undefined
          ? serviceChargeEnabled
          : false,

      dineInEnabled:
        dineInEnabled !== undefined
          ? dineInEnabled
          : true,

      takeawayEnabled:
        takeawayEnabled !== undefined
          ? takeawayEnabled
          : true,

      deliveryEnabled:
        deliveryEnabled !== undefined
          ? deliveryEnabled
          : true,

      onlineOrderEnabled:
        onlineOrderEnabled !== undefined
          ? onlineOrderEnabled
          : false,

      printerName: printerName || "",

      kitchenPrinter:
        kitchenPrinter || "",

      billingPrinter:
        billingPrinter || "",

      logo: logo || "",

      status: status || "Active",

      // Initial setup does not require req.user
      createdBy: null,
      updatedBy: null,
    });

    // =====================================================
    // RESPONSE
    // =====================================================

    const populatedStore =
      await Store.findById(store._id)
        .populate(
          "restaurant",
          "restaurantCode restaurantName companyId"
        );

    return res.status(201).json({
      success: true,
      message: "Store created successfully",
      data: populatedStore,
    });

  } catch (error) {
    console.error(
      "CREATE STORE ERROR:",
      error
    );

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Store code already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// GET ALL STORES
// GET /api/stores
// =====================================================

exports.getAllStores = async (req, res) => {
  try {
    const filter = {
      isDeleted: false,
    };

    // Optional restaurant filter
    if (req.query.restaurant) {
      if (
        !mongoose.Types.ObjectId.isValid(
          req.query.restaurant
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid restaurant ID",
        });
      }

      filter.restaurant =
        req.query.restaurant;
    }

    // Optional search
    if (req.query.search) {
      filter.$or = [
        {
          storeName: {
            $regex: req.query.search,
            $options: "i",
          },
        },
        {
          storeCode: {
            $regex: req.query.search,
            $options: "i",
          },
        },
      ];
    }

    // Optional status
    if (req.query.status) {
      filter.status =
        req.query.status;
    }

    const stores =
      await Store.find(filter)
        .populate(
          "restaurant",
          "restaurantCode restaurantName companyId"
        )
        .sort({
          createdAt: -1,
        });

    return res.status(200).json({
      success: true,
      count: stores.length,
      data: stores,
    });

  } catch (error) {
    console.error(
      "GET STORES ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// GET STORE BY ID
// GET /api/stores/:id
// =====================================================

exports.getStoreById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid store ID",
      });
    }

    const store =
      await Store.findOne({
        _id: id,
        isDeleted: false,
      }).populate(
        "restaurant",
        "restaurantCode restaurantName companyId"
      );

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: store,
    });

  } catch (error) {
    console.error(
      "GET STORE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// UPDATE STORE
// PUT /api/stores/:id
// =====================================================

exports.updateStore = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid store ID",
      });
    }

    const store =
      await Store.findOne({
        _id: id,
        isDeleted: false,
      });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    // Restaurant cannot be changed
    if (req.body.restaurant) {
      return res.status(400).json({
        success: false,
        message:
          "Restaurant cannot be changed from this endpoint",
      });
    }

    const allowedFields = [
      "storeName",
      "branchName",
      "managerName",
      "email",
      "phone",
      "alternatePhone",
      "gstNumber",
      "fssaiNumber",
      "address",
      "area",
      "city",
      "state",
      "country",
      "pincode",
      "latitude",
      "longitude",
      "openingTime",
      "closingTime",
      "totalTables",
      "totalSeats",
      "serviceChargePercentage",
      "gstEnabled",
      "serviceChargeEnabled",
      "dineInEnabled",
      "takeawayEnabled",
      "deliveryEnabled",
      "onlineOrderEnabled",
      "printerName",
      "kitchenPrinter",
      "billingPrinter",
      "logo",
      "status",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        store[field] =
          req.body[field];
      }
    });

    // Only set updatedBy if authentication exists
    if (req.user && req.user._id) {
      store.updatedBy =
        req.user._id;
    }

    await store.save();

    return res.status(200).json({
      success: true,
      message: "Store updated successfully",
      data: store,
    });

  } catch (error) {
    console.error(
      "UPDATE STORE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// DELETE STORE
// DELETE /api/stores/:id
// =====================================================

exports.deleteStore = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid store ID",
      });
    }

    const store =
      await Store.findOne({
        _id: id,
        isDeleted: false,
      });

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    store.isDeleted = true;

    if (req.user && req.user._id) {
      store.updatedBy =
        req.user._id;
    }

    await store.save();

    return res.status(200).json({
      success: true,
      message: "Store deleted successfully",
    });

  } catch (error) {
    console.error(
      "DELETE STORE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// RESTORE STORE
// PATCH /api/stores/:id/restore
// =====================================================

exports.restoreStore = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid store ID",
      });
    }

    const store =
      await Store.findById(id);

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    store.isDeleted = false;

    if (req.user && req.user._id) {
      store.updatedBy =
        req.user._id;
    }

    await store.save();

    return res.status(200).json({
      success: true,
      message: "Store restored successfully",
      data: store,
    });

  } catch (error) {
    console.error(
      "RESTORE STORE ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// TOGGLE STORE STATUS
// PATCH /api/stores/:id/toggle-status
// =====================================================

exports.toggleStoreStatus =
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid store ID",
        });
      }

      const store =
        await Store.findById(id);

      if (!store) {
        return res.status(404).json({
          success: false,
          message: "Store not found",
        });
      }

      store.status =
        store.status === "Active"
          ? "Inactive"
          : "Active";

      if (req.user && req.user._id) {
        store.updatedBy =
          req.user._id;
      }

      await store.save();

      return res.status(200).json({
        success: true,
        message:
          "Store status updated successfully",
        data: store,
      });

    } catch (error) {
      console.error(
        "TOGGLE STORE STATUS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };