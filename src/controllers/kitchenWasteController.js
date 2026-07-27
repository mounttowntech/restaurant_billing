const KitchenWaste = require("../models/kitchenWasteModel");

// ==========================================================
// Create Kitchen Waste
// ==========================================================

exports.createKitchenWaste = async (req, res) => {
  try {
    const waste = new KitchenWaste({
      ...req.body,

      createdBy: req.user.id,

      reportedBy: req.body.reportedBy || req.user.id,
    });

    const savedWaste = await waste.save();

    res.status(201).json({
      success: true,

      message: "Kitchen waste created successfully",

      data: savedWaste,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// ==========================================================
// Get All Kitchen Waste
// ==========================================================

exports.getKitchenWaste = async (req, res) => {
  try {
    const wastes = await KitchenWaste.find()

      .populate("restaurant", "name")

      .populate("store", "storeName")

      .populate("kitchen", "kitchenName")

      .populate("reportedBy", "firstName lastName")

      .sort({
        wasteDate: -1,
      });

    res.json({
      success: true,

      count: wastes.length,

      data: wastes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// ==========================================================
// Get Waste By ID
// ==========================================================

exports.getKitchenWasteById = async (req, res) => {
  try {
    const waste = await KitchenWaste.findById(req.params.id)

      .populate("wasteItems.ingredient")

      .populate("wasteItems.menuItem")

      .populate("store")

      .populate("kitchen")

      .populate("reportedBy");

    if (!waste) {
      return res.status(404).json({
        success: false,

        message: "Waste record not found",
      });
    }

    res.json({
      success: true,

      data: waste,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// ==========================================================
// Update Kitchen Waste
// ==========================================================

exports.updateKitchenWaste = async (req, res) => {
  try {
    const waste = await KitchenWaste.findById(req.params.id);

    if (!waste) {
      return res.status(404).json({
        success: false,

        message: "Waste record not found",
      });
    }

    Object.assign(waste, req.body);

    waste.updatedBy = req.user.id;

    await waste.save();

    res.json({
      success: true,

      message: "Kitchen waste updated successfully",

      data: waste,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// ==========================================================
// Soft Delete
// ==========================================================

exports.deleteKitchenWaste = async (req, res) => {
  try {
    const waste = await KitchenWaste.findById(req.params.id);

    await waste.softDelete(req.user.id);

    res.json({
      success: true,

      message: "Waste deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// ==========================================================
// Restore Waste
// ==========================================================

exports.restoreKitchenWaste = async (req, res) => {
  try {
    const waste = await KitchenWaste.findById(req.params.id);

    await waste.restore();

    res.json({
      success: true,

      message: "Waste restored successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// ==========================================================
// Approve Waste
// ==========================================================

exports.approveWaste = async (req, res) => {
  try {
    const waste = await KitchenWaste.findById(req.params.id);

    await waste.approveWaste(req.user.id);

    res.json({
      success: true,

      message: "Waste approved successfully",

      data: waste,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// ==========================================================
// Reject Waste
// ==========================================================

exports.rejectWaste = async (req, res) => {
  try {
    const waste = await KitchenWaste.findById(req.params.id);

    await waste.rejectWaste(
      req.user.id,

      req.body.reason,
    );

    res.json({
      success: true,

      message: "Waste rejected successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// ==========================================================
// Complete Waste
// ==========================================================

exports.completeWaste = async (req, res) => {
  try {
    const waste = await KitchenWaste.findById(req.params.id);

    await waste.completeWaste();

    res.json({
      success: true,

      message: "Waste completed successfully",

      data: waste,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// ==========================================================
// Cancel Waste
// ==========================================================

exports.cancelWaste = async (req, res) => {
  try {
    const waste = await KitchenWaste.findById(req.params.id);

    await waste.cancelWaste();

    res.json({
      success: true,

      message: "Waste cancelled successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// ==========================================================
// Pending Waste
// ==========================================================

exports.getPendingWaste = async (req, res) => {
  try {
    const data = await KitchenWaste.getPendingWaste(req.user.restaurant);

    res.json({
      success: true,

      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// ==========================================================
// Approved Waste
// ==========================================================

exports.getApprovedWaste = async (req, res) => {
  try {
    const data = await KitchenWaste.getApprovedWaste(req.user.restaurant);

    res.json({
      success: true,

      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// ==========================================================
// Today Waste
// ==========================================================

exports.getTodayWaste = async (req, res) => {
  try {
    const data = await KitchenWaste.getTodayWaste(req.user.restaurant);

    res.json({
      success: true,

      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// ==========================================================
// Waste Summary
// ==========================================================

exports.getWasteSummary = async (req, res) => {
  try {
    const data = await KitchenWaste.getWasteSummary(
      req.user.restaurant,

      req.query.fromDate,

      req.query.toDate,
    );

    res.json({
      success: true,

      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// ==========================================================
// Category Wise Waste
// ==========================================================

exports.getCategoryWiseWaste = async (req, res) => {
  try {
    const data = await KitchenWaste.getCategoryWiseWaste(req.user.restaurant);

    res.json({
      success: true,

      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// ==========================================================
// Store Wise Waste
// ==========================================================

exports.getStoreWaste = async (req, res) => {
  try {
    const data = await KitchenWaste.getStoreWaste(
      req.user.restaurant,

      req.query.storeId,
    );

    res.json({
      success: true,

      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};
