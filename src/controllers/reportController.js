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
// HELPER - DATE RANGE
// ============================================================

const getDateRange = (req) => {
  const { fromDate, toDate } = req.query;

  let from;
  let to;

  if (fromDate) {
    from = new Date(fromDate);
  } else {
    from = new Date();
    from.setDate(from.getDate() - 30);
  }

  if (toDate) {
    to = new Date(toDate);
    to.setHours(23, 59, 59, 999);
  } else {
    to = new Date();
    to.setHours(23, 59, 59, 999);
  }

  if (isNaN(from.getTime())) {
    throw new Error("Invalid fromDate");
  }

  if (isNaN(to.getTime())) {
    throw new Error("Invalid toDate");
  }

  return {
    from,
    to,
  };
};


// ============================================================
// HELPER - RESTAURANT / STORE FILTER
// ============================================================

const getBaseFilter = (req) => {
  const filter = {};

  // From logged-in user
  if (req.user?.restaurant) {
    if (
      mongoose.Types.ObjectId.isValid(
        req.user.restaurant
      )
    ) {
      filter.restaurant =
        new mongoose.Types.ObjectId(
          req.user.restaurant
        );
    }
  }

  // Query restaurant
  if (req.query.restaurant) {
    if (
      mongoose.Types.ObjectId.isValid(
        req.query.restaurant
      )
    ) {
      filter.restaurant =
        new mongoose.Types.ObjectId(
          req.query.restaurant
        );
    }
  }

  // Store
  if (req.query.store) {
    if (
      mongoose.Types.ObjectId.isValid(
        req.query.store
      )
    ) {
      filter.store =
        new mongoose.Types.ObjectId(
          req.query.store
        );
    }
  }

  return filter;
};


// ============================================================
// HELPER - ORDER STATUS
// ============================================================

const completedOrderStatus = {
  $in: [
    "Completed",
    "completed",
    "PAID",
    "Paid",
    "paid",
    "Delivered",
  ],
};


// ============================================================
// 1. SALES REPORT
// ============================================================

exports.getSalesReport = async (req, res) => {
  try {
    const { from, to } = getDateRange(req);

    const filter = getBaseFilter(req);

    const result = await Order.aggregate([
      {
        $match: {
          ...filter,

          createdAt: {
            $gte: from,
            $lte: to,
          },

          status: completedOrderStatus,
        },
      },

      {
        $group: {
          _id: null,

          totalSales: {
            $sum: {
              $ifNull: [
                "$grandTotal",
                0,
              ],
            },
          },

          totalOrders: {
            $sum: 1,
          },

          subTotal: {
            $sum: {
              $ifNull: [
                "$subTotal",
                0,
              ],
            },
          },

          discount: {
            $sum: {
              $ifNull: [
                "$discount",
                0,
              ],
            },
          },

          tax: {
            $sum: {
              $ifNull: [
                "$taxAmount",
                0,
              ],
            },
          },

          paidAmount: {
            $sum: {
              $ifNull: [
                "$paidAmount",
                0,
              ],
            },
          },
        },
      },
    ]);

    const data = result[0] || {};

    const totalSales =
      data.totalSales || 0;

    const totalOrders =
      data.totalOrders || 0;

    res.status(200).json({
      success: true,

      message:
        "Sales report fetched successfully",

      data: {
        period: {
          from,
          to,
        },

        totalOrders,

        subTotal:
          data.subTotal || 0,

        discount:
          data.discount || 0,

        tax:
          data.tax || 0,

        totalSales,

        paidAmount:
          data.paidAmount || 0,

        pendingAmount:
          totalSales -
          (data.paidAmount || 0),

        averageOrderValue:
          totalOrders > 0
            ? Number(
                (
                  totalSales /
                  totalOrders
                ).toFixed(2)
              )
            : 0,
      },
    });
  } catch (error) {
    console.error(
      "Sales Report Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ============================================================
// 2. PURCHASE REPORT
// ============================================================

exports.getPurchaseReport = async (
  req,
  res
) => {
  try {
    const { from, to } =
      getDateRange(req);

    const filter =
      getBaseFilter(req);

    const result =
      await Purchase.aggregate([
        {
          $match: {
            ...filter,

            createdAt: {
              $gte: from,
              $lte: to,
            },
          },
        },

        {
          $group: {
            _id: null,

            totalPurchases: {
              $sum: {
                $ifNull: [
                  "$grandTotal",
                  "$totalAmount",
                ],
              },
            },

            totalPurchaseCount: {
              $sum: 1,
            },

            paidAmount: {
              $sum: {
                $ifNull: [
                  "$paidAmount",
                  0,
                ],
              },
            },
          },
        },
      ]);

    const data =
      result[0] || {};

    const totalPurchases =
      data.totalPurchases || 0;

    const paidAmount =
      data.paidAmount || 0;

    res.status(200).json({
      success: true,

      message:
        "Purchase report fetched successfully",

      data: {
        period: {
          from,
          to,
        },

        totalPurchaseCount:
          data.totalPurchaseCount ||
          0,

        totalPurchases,

        paidAmount,

        pendingAmount:
          totalPurchases -
          paidAmount,
      },
    });
  } catch (error) {
    console.error(
      "Purchase Report Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ============================================================
// 3. EXPENSE REPORT
// ============================================================

exports.getExpenseReport = async (
  req,
  res
) => {
  try {
    const { from, to } =
      getDateRange(req);

    const filter =
      getBaseFilter(req);

    const result =
      await Expense.aggregate([
        {
          $match: {
            ...filter,

            createdAt: {
              $gte: from,
              $lte: to,
            },
          },
        },

        {
          $group: {
            _id: null,

            totalExpenses: {
              $sum: {
                $ifNull: [
                  "$amount",
                  0,
                ],
              },
            },

            expenseCount: {
              $sum: 1,
            },
          },
        },
      ]);

    const data =
      result[0] || {};

    res.status(200).json({
      success: true,

      message:
        "Expense report fetched successfully",

      data: {
        period: {
          from,
          to,
        },

        expenseCount:
          data.expenseCount || 0,

        totalExpenses:
          data.totalExpenses || 0,
      },
    });
  } catch (error) {
    console.error(
      "Expense Report Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ============================================================
// 4. STOCK REPORT
// ============================================================

exports.getStockReport = async (
  req,
  res
) => {
  try {
    const filter = {};

    // Restaurant
    if (req.user?.restaurant) {
      if (
        mongoose.Types.ObjectId.isValid(
          req.user.restaurant
        )
      ) {
        filter.restaurant =
          new mongoose.Types.ObjectId(
            req.user.restaurant
          );
      }
    }

    if (req.query.restaurant) {
      if (
        mongoose.Types.ObjectId.isValid(
          req.query.restaurant
        )
      ) {
        filter.restaurant =
          new mongoose.Types.ObjectId(
            req.query.restaurant
          );
      }
    }

    // Store
    if (req.query.store) {
      if (
        mongoose.Types.ObjectId.isValid(
          req.query.store
        )
      ) {
        filter.store =
          new mongoose.Types.ObjectId(
            req.query.store
          );
      }
    }

    const products =
      await Product.find(filter)
        .populate(
          "category",
          "name"
        )
        .lean();

    const stock = products.map(
      (product) => {
        const quantity =
          Number(
            product.stock ??
            product.stockQuantity ??
            product.quantity ??
            0
          );

        const purchasePrice =
          Number(
            product.purchasePrice ??
            product.costPrice ??
            0
          );

        const sellingPrice =
          Number(
            product.sellingPrice ??
            product.price ??
            0
          );

        return {
          productId:
            product._id,

          productName:
            product.name ||
            product.productName,

          category:
            product.category?.name ||
            "Uncategorized",

          stockQuantity:
            quantity,

          purchasePrice,

          sellingPrice,

          stockValue:
            quantity *
            purchasePrice,

          sellingValue:
            quantity *
            sellingPrice,

          lowStock:
            quantity <=
            Number(
              product.lowStockAlert ||
              product.minimumStock ||
              5
            ),
        };
      }
    );

    const totalProducts =
      stock.length;

    const totalQuantity =
      stock.reduce(
        (sum, item) =>
          sum +
          item.stockQuantity,
        0
      );

    const totalStockValue =
      stock.reduce(
        (sum, item) =>
          sum +
          item.stockValue,
        0
      );

    const lowStockProducts =
      stock.filter(
        (item) =>
          item.lowStock
      );

    res.status(200).json({
      success: true,

      message:
        "Stock report fetched successfully",

      data: {
        totalProducts,

        totalQuantity,

        totalStockValue,

        lowStockCount:
          lowStockProducts.length,

        lowStockProducts,

        products: stock,
      },
    });
  } catch (error) {
    console.error(
      "Stock Report Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ============================================================
// 5. TAX REPORT
// ============================================================

exports.getTaxReport = async (
  req,
  res
) => {
  try {
    const { from, to } =
      getDateRange(req);

    const filter =
      getBaseFilter(req);

    const result =
      await Order.aggregate([
        {
          $match: {
            ...filter,

            createdAt: {
              $gte: from,
              $lte: to,
            },

            status:
              completedOrderStatus,
          },
        },

        {
          $group: {
            _id: null,

            taxableAmount: {
              $sum: {
                $ifNull: [
                  "$subTotal",
                  0,
                ],
              },
            },

            totalTax: {
              $sum: {
                $ifNull: [
                  "$taxAmount",
                  0,
                ],
              },
            },

            totalSales: {
              $sum: {
                $ifNull: [
                  "$grandTotal",
                  0,
                ],
              },
            },

            orderCount: {
              $sum: 1,
            },
          },
        },
      ]);

    const data =
      result[0] || {};

    res.status(200).json({
      success: true,

      message:
        "Tax report fetched successfully",

      data: {
        period: {
          from,
          to,
        },

        orderCount:
          data.orderCount || 0,

        taxableAmount:
          data.taxableAmount || 0,

        totalTax:
          data.totalTax || 0,

        totalSales:
          data.totalSales || 0,
      },
    });
  } catch (error) {
    console.error(
      "Tax Report Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ============================================================
// 6. PAYMENT REPORT
// ============================================================

exports.getPaymentReport = async (
  req,
  res
) => {
  try {
    const { from, to } =
      getDateRange(req);

    const filter =
      getBaseFilter(req);

    // --------------------------------------------------------
    // First try Payment collection
    // --------------------------------------------------------

    let result = [];

    try {
      result =
        await Payment.aggregate([
          {
            $match: {
              ...filter,

              createdAt: {
                $gte: from,
                $lte: to,
              },
            },
          },

          {
            $group: {
              _id: {
                $ifNull: [
                  "$paymentMethod",
                  "$method",
                ],
              },

              amount: {
                $sum: {
                  $ifNull: [
                    "$amount",
                    "$paidAmount",
                  ],
                },
              },

              count: {
                $sum: 1,
              },
            },
          },

          {
            $sort: {
              amount: -1,
            },
          },
        ]);
    } catch (paymentError) {
      console.log(
        "Payment collection unavailable, using Order payment data"
      );
    }

    // --------------------------------------------------------
    // If Payment model has no data
    // calculate directly from Orders
    // --------------------------------------------------------

    if (!result.length) {
      result =
        await Order.aggregate([
          {
            $match: {
              ...filter,

              createdAt: {
                $gte: from,
                $lte: to,
              },

              status:
                completedOrderStatus,
            },
          },

          {
            $group: {
              _id: {
                $ifNull: [
                  "$paymentMethod",
                  "Unknown",
                ],
              },

              amount: {
                $sum: {
                  $ifNull: [
                    "$paidAmount",
                    0,
                  ],
                },
              },

              count: {
                $sum: 1,
              },
            },
          },

          {
            $sort: {
              amount: -1,
            },
          },
        ]);
    }

    const totalPayment =
      result.reduce(
        (sum, item) =>
          sum +
          Number(
            item.amount || 0
          ),
        0
      );

    res.status(200).json({
      success: true,

      message:
        "Payment report fetched successfully",

      data: {
        period: {
          from,
          to,
        },

        totalPayment,

        methods:
          result.map(
            (item) => ({
              paymentMethod:
                item._id ||
                "Unknown",

              amount:
                item.amount || 0,

              count:
                item.count || 0,
            })
          ),
      },
    });
  } catch (error) {
    console.error(
      "Payment Report Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ============================================================
// 7. PRODUCT REPORT
// ============================================================

exports.getProductReport = async (
  req,
  res
) => {
  try {
    const { from, to } =
      getDateRange(req);

    const filter =
      getBaseFilter(req);

    const result =
      await Order.aggregate([
        {
          $match: {
            ...filter,

            createdAt: {
              $gte: from,
              $lte: to,
            },

            status:
              completedOrderStatus,
          },
        },

        {
          $unwind: "$items",
        },

        {
          $group: {
            _id: {
              product:
                "$items.product",

              productName:
                "$items.productName",
            },

            quantitySold: {
              $sum: {
                $ifNull: [
                  "$items.quantity",
                  0,
                ],
              },
            },

            totalSales: {
              $sum: {
                $ifNull: [
                  "$items.total",
                  "$items.totalAmount",
                ],
              },
            },
          },
        },

        {
          $sort: {
            quantitySold: -1,
          },
        },
      ]);

    res.status(200).json({
      success: true,

      message:
        "Product report fetched successfully",

      data: result.map(
        (item) => ({
          productId:
            item._id.product,

          productName:
            item._id.productName ||
            "Unknown Product",

          quantitySold:
            item.quantitySold,

          totalSales:
            item.totalSales,
        })
      ),
    });
  } catch (error) {
    console.error(
      "Product Report Error:",
      error
    );

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ============================================================
// 8. PROFIT & LOSS
// ============================================================

exports.getProfitLossReport =
  async (req, res) => {
    try {
      const { from, to } =
        getDateRange(req);

      const filter =
        getBaseFilter(req);

      // ------------------------------------------------------
      // SALES
      // ------------------------------------------------------

      const sales =
        await Order.aggregate([
          {
            $match: {
              ...filter,

              createdAt: {
                $gte: from,
                $lte: to,
              },

              status:
                completedOrderStatus,
            },
          },

          {
            $group: {
              _id: null,

              totalSales: {
                $sum: {
                  $ifNull: [
                    "$grandTotal",
                    0,
                  ],
                },
              },
            },
          },
        ]);

      // ------------------------------------------------------
      // PURCHASE
      // ------------------------------------------------------

      const purchases =
        await Purchase.aggregate([
          {
            $match: {
              ...filter,

              createdAt: {
                $gte: from,
                $lte: to,
              },
            },
          },

          {
            $group: {
              _id: null,

              totalPurchases: {
                $sum: {
                  $ifNull: [
                    "$grandTotal",
                    "$totalAmount",
                  ],
                },
              },
            },
          },
        ]);

      // ------------------------------------------------------
      // EXPENSE
      // ------------------------------------------------------

      const expenses =
        await Expense.aggregate([
          {
            $match: {
              ...filter,

              createdAt: {
                $gte: from,
                $lte: to,
              },
            },
          },

          {
            $group: {
              _id: null,

              totalExpenses: {
                $sum: {
                  $ifNull: [
                    "$amount",
                    0,
                  ],
                },
              },
            },
          },
        ]);

      const totalSales =
        sales[0]?.totalSales ||
        0;

      const totalPurchases =
        purchases[0]
          ?.totalPurchases || 0;

      const totalExpenses =
        expenses[0]
          ?.totalExpenses || 0;

      // ------------------------------------------------------
      // PROFIT
      // ------------------------------------------------------

      const grossProfit =
        totalSales -
        totalPurchases;

      const netProfit =
        grossProfit -
        totalExpenses;

      const profitMargin =
        totalSales > 0
          ? Number(
              (
                (netProfit /
                  totalSales) *
                100
              ).toFixed(2)
            )
          : 0;

      res.status(200).json({
        success: true,

        message:
          "Profit and Loss report fetched successfully",

        data: {
          period: {
            from,
            to,
          },

          revenue: {
            sales:
              totalSales,
          },

          cost: {
            purchases:
              totalPurchases,

            expenses:
              totalExpenses,
          },

          grossProfit,

          netProfit,

          profitMargin,
        },
      });
    } catch (error) {
      console.error(
        "Profit Loss Report Error:",
        error
      );

      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };