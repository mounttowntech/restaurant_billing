const mongoose = require("mongoose");

// ============================================================
// MODELS
// ============================================================

const Order = require("../models/Order");
const Purchase = require("../models/Purchase");
const Expense = require("../models/Expense");
const Product = require("../models/productModel");
const Payment = require("../models/Payment");

// ============================================================
// HELPER - TODAY DATE RANGE
// ============================================================

const getTodayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

// ============================================================
// HELPER - USER FILTER
// ============================================================

const getUserFilter = (req) => {
  const filter = {};

  /*
   * If your models contain companyId/storeId,
   * you can enable these filters.
   *
   * Example:
   *
   * if (req.user.companyId) {
   *   filter.companyId = req.user.companyId;
   * }
   *
   * if (req.user.storeId) {
   *   filter.storeId = req.user.storeId;
   * }
   */

  return filter;
};

// ============================================================
// 1. SALES SUMMARY
// GET /api/dashboard/sales-summary
// ============================================================

exports.getSalesSummary = async (req, res) => {
  try {
    const { start, end } = getTodayRange();

    const userFilter = getUserFilter(req);

    const match = {
      ...userFilter,
      createdAt: {
        $gte: start,
        $lte: end,
      },
    };

    const result = await Order.aggregate([
      {
        $match: match,
      },
      {
        $group: {
          _id: null,

          totalSales: {
            $sum: {
              $ifNull: ["$grandTotal", 0],
            },
          },

          totalOrders: {
            $sum: 1,
          },

          totalDiscount: {
            $sum: {
              $ifNull: ["$discountAmount", 0],
            },
          },

          totalTax: {
            $sum: {
              $ifNull: ["$gstAmount", 0],
            },
          },

          totalPaid: {
            $sum: {
              $ifNull: ["$paidAmount", 0],
            },
          },
        },
      },
    ]);

    const summary = result[0] || {
      totalSales: 0,
      totalOrders: 0,
      totalDiscount: 0,
      totalTax: 0,
      totalPaid: 0,
    };

    res.status(200).json({
      success: true,
      message: "Sales summary fetched successfully",
      data: summary,
    });
  } catch (error) {
    console.error("Sales Summary Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch sales summary",
      error: error.message,
    });
  }
};

// ============================================================
// 2. TODAY'S SALES
// GET /api/dashboard/today-sales
// ============================================================

exports.getTodaySales = async (req, res) => {
  try {
    const { start, end } = getTodayRange();

    const userFilter = getUserFilter(req);

    const result = await Order.aggregate([
      {
        $match: {
          ...userFilter,
          createdAt: {
            $gte: start,
            $lte: end,
          },
        },
      },
      {
        $group: {
          _id: null,

          sales: {
            $sum: {
              $ifNull: ["$grandTotal", 0],
            },
          },

          orders: {
            $sum: 1,
          },
        },
      },
    ]);

    const data = result[0] || {
      sales: 0,
      orders: 0,
    };

    res.status(200).json({
      success: true,
      message: "Today's sales fetched successfully",
      data,
    });
  } catch (error) {
    console.error("Today's Sales Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch today's sales",
      error: error.message,
    });
  }
};

// ============================================================
// 3. TODAY'S ORDERS
// GET /api/dashboard/today-orders
// ============================================================

exports.getTodayOrders = async (req, res) => {
  try {
    const { start, end } = getTodayRange();

    const userFilter = getUserFilter(req);

    const totalOrders = await Order.countDocuments({
      ...userFilter,
      createdAt: {
        $gte: start,
        $lte: end,
      },
    });

    res.status(200).json({
      success: true,
      message: "Today's orders fetched successfully",
      data: {
        totalOrders,
      },
    });
  } catch (error) {
    console.error("Today's Orders Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch today's orders",
      error: error.message,
    });
  }
};

// ============================================================
// 4. TODAY'S PURCHASES
// GET /api/dashboard/today-purchases
// ============================================================

exports.getTodayPurchases = async (req, res) => {
  try {
    const { start, end } = getTodayRange();

    const userFilter = getUserFilter(req);

    const result = await Purchase.aggregate([
      {
        $match: {
          ...userFilter,
          createdAt: {
            $gte: start,
            $lte: end,
          },
        },
      },
      {
        $group: {
          _id: null,

          totalPurchases: {
            $sum: {
              $ifNull: ["$grandTotal", 0],
            },
          },

          totalPurchaseOrders: {
            $sum: 1,
          },
        },
      },
    ]);

    const data = result[0] || {
      totalPurchases: 0,
      totalPurchaseOrders: 0,
    };

    res.status(200).json({
      success: true,
      message: "Today's purchases fetched successfully",
      data,
    });
  } catch (error) {
    console.error("Today's Purchases Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch today's purchases",
      error: error.message,
    });
  }
};

// ============================================================
// 5. TODAY'S EXPENSES
// GET /api/dashboard/today-expenses
// ============================================================

exports.getTodayExpenses = async (req, res) => {
  try {
    const { start, end } = getTodayRange();

    const userFilter = getUserFilter(req);

    const result = await Expense.aggregate([
      {
        $match: {
          ...userFilter,
          createdAt: {
            $gte: start,
            $lte: end,
          },
        },
      },
      {
        $group: {
          _id: null,

          totalExpenses: {
            $sum: {
              $ifNull: ["$amount", 0],
            },
          },

          expenseCount: {
            $sum: 1,
          },
        },
      },
    ]);

    const data = result[0] || {
      totalExpenses: 0,
      expenseCount: 0,
    };

    res.status(200).json({
      success: true,
      message: "Today's expenses fetched successfully",
      data,
    });
  } catch (error) {
    console.error("Today's Expenses Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch today's expenses",
      error: error.message,
    });
  }
};

// ============================================================
// 6. LOW STOCK PRODUCTS
// GET /api/dashboard/low-stock
// ============================================================

exports.getLowStock = async (req, res) => {
  try {
    const userFilter = getUserFilter(req);

    const limit = Number(req.query.limit) || 10;

    const products = await Product.find({
      ...userFilter,

      $expr: {
        $lte: ["$stock", "$lowStockThreshold"],
      },
    })
      .select(
        "productName skuCode barcode stock lowStockThreshold sellingPrice"
      )
      .sort({
        stock: 1,
      })
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      message: "Low stock products fetched successfully",
      count: products.length,
      data: products,
    });
  } catch (error) {
    console.error("Low Stock Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch low stock products",
      error: error.message,
    });
  }
};

// ============================================================
// 7. TOP PRODUCTS
// GET /api/dashboard/top-products
// ============================================================

exports.getTopProducts = async (req, res) => {
  try {
    const { start, end } = getTodayRange();

    const userFilter = getUserFilter(req);

    const limit = Number(req.query.limit) || 10;

    const products = await Order.aggregate([
      {
        $match: {
          ...userFilter,
          createdAt: {
            $gte: start,
            $lte: end,
          },
        },
      },

      {
        $unwind: "$items",
      },

      {
        $group: {
          _id: "$items.product",

          productName: {
            $first: "$items.productName",
          },

          skuCode: {
            $first: "$items.skuCode",
          },

          quantitySold: {
            $sum: {
              $ifNull: ["$items.quantity", 0],
            },
          },

          totalSales: {
            $sum: {
              $ifNull: ["$items.totalAmount", 0],
            },
          },
        },
      },

      {
        $sort: {
          quantitySold: -1,
        },
      },

      {
        $limit: limit,
      },
    ]);

    res.status(200).json({
      success: true,
      message: "Top products fetched successfully",
      data: products,
    });
  } catch (error) {
    console.error("Top Products Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch top products",
      error: error.message,
    });
  }
};

// ============================================================
// 8. RECENT ORDERS
// GET /api/dashboard/recent-orders
// ============================================================

exports.getRecentOrders = async (req, res) => {
  try {
    const userFilter = getUserFilter(req);

    const limit = Number(req.query.limit) || 10;

    const orders = await Order.find(userFilter)
      .sort({
        createdAt: -1,
      })
      .limit(limit)
      .populate("customer", "name phone email")
      .lean();

    res.status(200).json({
      success: true,
      message: "Recent orders fetched successfully",
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error("Recent Orders Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch recent orders",
      error: error.message,
    });
  }
};

// ============================================================
// 9. COMPLETE DASHBOARD
// GET /api/dashboard
// ============================================================

exports.getDashboard = async (req, res) => {
  try {
    const { start, end } = getTodayRange();

    const userFilter = getUserFilter(req);

    // --------------------------------------------------------
    // SALES
    // --------------------------------------------------------

    const salesResult = await Order.aggregate([
      {
        $match: {
          ...userFilter,
          createdAt: {
            $gte: start,
            $lte: end,
          },
        },
      },
      {
        $group: {
          _id: null,

          totalSales: {
            $sum: {
              $ifNull: ["$grandTotal", 0],
            },
          },

          totalOrders: {
            $sum: 1,
          },

          totalDiscount: {
            $sum: {
              $ifNull: ["$discountAmount", 0],
            },
          },

          totalTax: {
            $sum: {
              $ifNull: ["$gstAmount", 0],
            },
          },
        },
      },
    ]);

    // --------------------------------------------------------
    // PURCHASES
    // --------------------------------------------------------

    const purchaseResult = await Purchase.aggregate([
      {
        $match: {
          ...userFilter,
          createdAt: {
            $gte: start,
            $lte: end,
          },
        },
      },
      {
        $group: {
          _id: null,

          totalPurchases: {
            $sum: {
              $ifNull: ["$grandTotal", 0],
            },
          },

          purchaseCount: {
            $sum: 1,
          },
        },
      },
    ]);

    // --------------------------------------------------------
    // EXPENSES
    // --------------------------------------------------------

    const expenseResult = await Expense.aggregate([
      {
        $match: {
          ...userFilter,
          createdAt: {
            $gte: start,
            $lte: end,
          },
        },
      },
      {
        $group: {
          _id: null,

          totalExpenses: {
            $sum: {
              $ifNull: ["$amount", 0],
            },
          },

          expenseCount: {
            $sum: 1,
          },
        },
      },
    ]);

    // --------------------------------------------------------
    // LOW STOCK
    // --------------------------------------------------------

    const lowStockProducts = await Product.find({
      ...userFilter,

      $expr: {
        $lte: ["$stock", "$lowStockThreshold"],
      },
    })
      .select(
        "productName skuCode barcode stock lowStockThreshold sellingPrice"
      )
      .sort({
        stock: 1,
      })
      .limit(10)
      .lean();

    // --------------------------------------------------------
    // TOP PRODUCTS
    // --------------------------------------------------------

    const topProducts = await Order.aggregate([
      {
        $match: {
          ...userFilter,
          createdAt: {
            $gte: start,
            $lte: end,
          },
        },
      },

      {
        $unwind: "$items",
      },

      {
        $group: {
          _id: "$items.product",

          productName: {
            $first: "$items.productName",
          },

          skuCode: {
            $first: "$items.skuCode",
          },

          quantitySold: {
            $sum: {
              $ifNull: ["$items.quantity", 0],
            },
          },

          totalSales: {
            $sum: {
              $ifNull: ["$items.totalAmount", 0],
            },
          },
        },
      },

      {
        $sort: {
          quantitySold: -1,
        },
      },

      {
        $limit: 10,
      },
    ]);

    // --------------------------------------------------------
    // RECENT ORDERS
    // --------------------------------------------------------

    const recentOrders = await Order.find(userFilter)
      .sort({
        createdAt: -1,
      })
      .limit(10)
      .populate("customer", "name phone email")
      .lean();

    // --------------------------------------------------------
    // RESPONSE
    // --------------------------------------------------------

    const sales = salesResult[0] || {
      totalSales: 0,
      totalOrders: 0,
      totalDiscount: 0,
      totalTax: 0,
    };

    const purchases = purchaseResult[0] || {
      totalPurchases: 0,
      purchaseCount: 0,
    };

    const expenses = expenseResult[0] || {
      totalExpenses: 0,
      expenseCount: 0,
    };

    const netProfit =
      sales.totalSales -
      purchases.totalPurchases -
      expenses.totalExpenses;

    res.status(200).json({
      success: true,
      message: "Dashboard data fetched successfully",

      data: {
        salesSummary: {
          totalSales: sales.totalSales,
          totalOrders: sales.totalOrders,
          totalDiscount: sales.totalDiscount,
          totalTax: sales.totalTax,
        },

        todaySales: {
          amount: sales.totalSales,
          orders: sales.totalOrders,
        },

        todayOrders: {
          count: sales.totalOrders,
        },

        todayPurchases: {
          amount: purchases.totalPurchases,
          count: purchases.purchaseCount,
        },

        todayExpenses: {
          amount: expenses.totalExpenses,
          count: expenses.expenseCount,
        },

        netProfit,

        lowStock: {
          count: lowStockProducts.length,
          products: lowStockProducts,
        },

        topProducts,

        recentOrders,
      },
    });
  } catch (error) {
    console.error("Dashboard Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard data",
      error: error.message,
    });
  }
};

// ============================================================
// 10. SALES TREND
// GET /api/dashboard/sales-trend
// ============================================================

exports.getSalesTrend = async (req, res) => {
  try {
    const days = Number(req.query.days) || 7;

    const startDate = new Date();

    startDate.setHours(0, 0, 0, 0);

    startDate.setDate(startDate.getDate() - (days - 1));

    const userFilter = getUserFilter(req);

    const trend = await Order.aggregate([
      {
        $match: {
          ...userFilter,

          createdAt: {
            $gte: startDate,
            $lte: new Date(),
          },
        },
      },

      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
            },
          },

          sales: {
            $sum: {
              $ifNull: ["$grandTotal", 0],
            },
          },

          orders: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      message: "Sales trend fetched successfully",
      data: trend,
    });
  } catch (error) {
    console.error("Sales Trend Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch sales trend",
      error: error.message,
    });
  }
};