const PurchaseReturn = require("../models/purchaseReturnModel");

// ==========================================================
// Create Purchase Return
// ==========================================================

exports.createPurchaseReturn = async (req, res) => {
  try {
    const {
      returnNo,
      purchase,
      supplier,
      restaurant,
      store,
      warehouse,
      returnType,
      refundMethod,
      items,
      remarks,
    } = req.body;

    const existingReturn = await PurchaseReturn.findOne({
      returnNo,
    });

    if (existingReturn) {
      return res.status(400).json({
        success: false,
        message: "Return number already exists",
      });
    }

    const purchaseReturn = await PurchaseReturn.create({
      returnNo,
      purchase,
      supplier,
      restaurant,
      store,
      warehouse,

      returnType,
      refundMethod,

      items,

      remarks,

      createdBy: req.user?.id,
    });

    res.status(201).json({
      success: true,
      message: "Purchase return created successfully",
      data: purchaseReturn,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================================
// Get All Purchase Returns
// ==========================================================

exports.getPurchaseReturns = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    const skip = (page - 1) * limit;

    const filter = {};

    if (search) {
      filter.$or = [
        {
          returnNo: {
            $regex: search,
            $options: "i",
          },
        },

        {
          remarks: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const returns = await PurchaseReturn.find(filter)

      .populate("supplier", "supplierName phone")

      .populate("store", "storeName")

      .populate("purchase", "purchaseNo")

      .sort({
        createdAt: -1,
      })

      .skip(skip)

      .limit(Number(limit));

    const total = await PurchaseReturn.countDocuments(filter);

    res.json({
      success: true,

      total,

      page: Number(page),

      pages: Math.ceil(total / limit),

      data: returns,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================================
// Get Purchase Return By ID
// ==========================================================

exports.getPurchaseReturnById = async (req, res) => {
  try {
    const data = await PurchaseReturn.findById(req.params.id)

      .populate("supplier")

      .populate("purchase")

      .populate("store")

      .populate("warehouse");

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Purchase return not found",
      });
    }

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
// Update Purchase Return
// ==========================================================

exports.updatePurchaseReturn = async (req, res) => {
  try {
    const data = await PurchaseReturn.findByIdAndUpdate(
      req.params.id,

      {
        ...req.body,

        updatedBy: req.user?.id,
      },

      {
        new: true,
        runValidators: true,
      },
    );

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Purchase return not found",
      });
    }

    res.json({
      success: true,

      message: "Purchase return updated",

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
// Delete Purchase Return (Soft Delete)
// ==========================================================

exports.deletePurchaseReturn = async (req, res) => {
  try {
    const data = await PurchaseReturn.findById(req.params.id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Record not found",
      });
    }

    await data.softDelete(req.user?.id);

    res.json({
      success: true,

      message: "Purchase return deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================================
// Restore Purchase Return
// ==========================================================

exports.restorePurchaseReturn = async (req, res) => {
  try {
    const data = await PurchaseReturn.findById(req.params.id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Record not found",
      });
    }

    await data.restore();

    res.json({
      success: true,

      message: "Purchase return restored",

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
// Update Return Status
// ==========================================================

exports.updateReturnStatus = async (req, res) => {
  try {
    const { returnStatus } = req.body;

    const data = await PurchaseReturn.findByIdAndUpdate(
      req.params.id,

      {
        returnStatus,
        updatedBy: req.user?.id,
      },

      {
        new: true,
      },
    );

    res.json({
      success: true,

      message: "Return status updated",

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
// Get Supplier Wise Returns
// ==========================================================

exports.getSupplierReturns = async (req, res) => {
  try {
    const data = await PurchaseReturn.find({
      supplier: req.params.supplierId,
    })

      .populate("supplier", "supplierName")

      .sort({
        returnDate: -1,
      });

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
// Get Store Returns
// ==========================================================

exports.getStoreReturns = async (req, res) => {
  try {
    const data = await PurchaseReturn.find({
      store: req.params.storeId,
    })

      .sort({
        returnDate: -1,
      });

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
// Return Summary
// ==========================================================

exports.getPurchaseReturnSummary = async (req, res) => {
  try {
    const result = await PurchaseReturn.aggregate([
      {
        $match: {
          isDeleted: false,
        },
      },

      {
        $group: {
          _id: null,

          totalReturns: {
            $sum: 1,
          },

          totalQuantity: {
            $sum: "$totalQuantity",
          },

          totalRefund: {
            $sum: "$refundAmount",
          },
        },
      },
    ]);

    res.json({
      success: true,

      data: result[0] || {
        totalReturns: 0,
        totalQuantity: 0,
        totalRefund: 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
