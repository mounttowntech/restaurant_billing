const Purchase = require("../models/Purchase");

// ==========================================================
// Create Purchase
// ==========================================================

exports.createPurchase = async (req, res) => {
  try {
    const purchase = await Purchase.create({
      ...req.body,

      createdBy: req.user?.id,
    });

    res.status(201).json({
      success: true,

      message: "Purchase created successfully",

      data: purchase,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// ==========================================================
// Get All Purchases
// ==========================================================

exports.getPurchases = async (req, res) => {
  try {
    const purchases = await Purchase.find()

      .populate("supplier", "supplierName phone")
      .populate("store", "storeName")
      .populate("warehouse", "warehouseName")

      .sort({
        createdAt: -1,
      });

    res.json({
      success: true,

      count: purchases.length,

      data: purchases,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// ==========================================================
// Get Purchase By ID
// ==========================================================

exports.getPurchaseById = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id)

      .populate("supplier")
      .populate("store")
      .populate("warehouse")
      .populate("items.ingredient");

    if (!purchase) {
      return res.status(404).json({
        success: false,

        message: "Purchase not found",
      });
    }

    res.json({
      success: true,

      data: purchase,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// ==========================================================
// Update Purchase
// ==========================================================

exports.updatePurchase = async (req, res) => {
  try {
    const purchase = await Purchase.findByIdAndUpdate(
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

    if (!purchase) {
      return res.status(404).json({
        success: false,

        message: "Purchase not found",
      });
    }

    res.json({
      success: true,

      message: "Purchase updated successfully",

      data: purchase,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// ==========================================================
// Soft Delete Purchase
// ==========================================================

exports.deletePurchase = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);

    if (!purchase) {
      return res.status(404).json({
        success: false,

        message: "Purchase not found",
      });
    }

    purchase.isDeleted = true;

    purchase.updatedBy = req.user?.id;

    await purchase.save();

    res.json({
      success: true,

      message: "Purchase deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// ==========================================================
// Restore Purchase
// ==========================================================

exports.restorePurchase = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);

    purchase.isDeleted = false;

    await purchase.save();

    res.json({
      success: true,

      message: "Purchase restored successfully",

      data: purchase,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// ==========================================================
// Receive Purchase
// ==========================================================

exports.receivePurchase = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);

    if (!purchase) {
      return res.status(404).json({
        success: false,

        message: "Purchase not found",
      });
    }

    purchase.purchaseStatus = "Received";

    await purchase.save();

    res.json({
      success: true,

      message: "Purchase received",

      data: purchase,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// ==========================================================
// Cancel Purchase
// ==========================================================

exports.cancelPurchase = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);

    purchase.purchaseStatus = "Cancelled";

    await purchase.save();

    res.json({
      success: true,

      message: "Purchase cancelled",

      data: purchase,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// ==========================================================
// Update Payment Status
// ==========================================================

exports.updatePaymentStatus = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);

    purchase.paidAmount = req.body.paidAmount;

    await purchase.save();

    res.json({
      success: true,

      message: "Payment updated",

      data: purchase,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// ==========================================================
// Today Purchases
// ==========================================================

exports.todayPurchases = async (req, res) => {
  try {
    const start = new Date();

    start.setHours(0, 0, 0, 0);

    const end = new Date();

    end.setHours(23, 59, 59, 999);

    const purchases = await Purchase.find({
      purchaseDate: {
        $gte: start,
        $lte: end,
      },
    });

    res.json({
      success: true,

      count: purchases.length,

      data: purchases,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// ==========================================================
// Supplier Wise Purchase
// ==========================================================

exports.supplierWisePurchase = async (req, res) => {
  try {
    const purchases = await Purchase.find({
      supplier: req.params.supplierId,
    })

      .sort({
        purchaseDate: -1,
      });

    res.json({
      success: true,

      data: purchases,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// ==========================================================
// Store Wise Purchase
// ==========================================================

exports.storeWisePurchase = async (req, res) => {
  try {
    const purchases = await Purchase.find({
      store: req.params.storeId,
    })

      .sort({
        purchaseDate: -1,
      });

    res.json({
      success: true,

      data: purchases,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// ==========================================================
// Purchase Summary
// ==========================================================

exports.purchaseSummary = async (req, res) => {
  try {
    const summary = await Purchase.aggregate([
      {
        $match: {
          isDeleted: false,
        },
      },

      {
        $group: {
          _id: null,

          totalPurchase: {
            $sum: "$grandTotal",
          },

          totalPaid: {
            $sum: "$paidAmount",
          },

          totalDue: {
            $sum: "$dueAmount",
          },

          count: {
            $sum: 1,
          },
        },
      },
    ]);

    res.json({
      success: true,

      data: summary[0] || {
        totalPurchase: 0,
        totalPaid: 0,
        totalDue: 0,
        count: 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// ==========================================================
// Search Purchase
// ==========================================================

exports.searchPurchase = async (req, res) => {
  try {
    const keyword = req.query.search;

    const purchases = await Purchase.find({
      $or: [
        {
          purchaseNo: {
            $regex: keyword,
            $options: "i",
          },
        },

        {
          invoiceNumber: {
            $regex: keyword,
            $options: "i",
          },
        },
      ],
    });

    res.json({
      success: true,

      data: purchases,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};
