const Order = require("../models/Order");

// ==========================================================
// Create Order
// ==========================================================

exports.createOrder = async (req, res) => {
  try {
    const order = await Order.create({
      ...req.body,
      createdBy: req.user?.id,
    });

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================================
// Get All Orders
// ==========================================================

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("customer")
      .populate("table")
      .populate("waiter")
      .populate("items.menuItem")
      .sort({
        createdAt: -1,
      });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================================
// Get Single Order
// ==========================================================

exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("customer")
      .populate("table")
      .populate("waiter")
      .populate("chef")
      .populate("items.menuItem");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================================
// Update Order
// ==========================================================

exports.updateOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
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

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Order updated successfully",
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================================
// Delete Order (Soft Delete)
// ==========================================================

exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    await order.softDelete(req.user?.id);

    res.status(200).json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================================
// Restore Order
// ==========================================================

exports.restoreOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    await order.restore();

    res.status(200).json({
      success: true,
      message: "Order restored successfully",
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================================
// Today's Orders
// ==========================================================

exports.getTodayOrders = async (req, res) => {
  try {
    const orders = await Order.getTodayOrders();

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================================
// Kitchen Queue
// ==========================================================

exports.getKitchenQueue = async (req, res) => {
  try {
    const orders = await Order.getKitchenQueue();

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================================
// Active Table Orders
// ==========================================================

exports.getActiveTableOrders = async (req, res) => {
  try {
    const orders = await Order.getActiveTableOrders(req.params.tableId);

    res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================================
// Accept Order
// ==========================================================

exports.acceptOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,

      {
        orderStatus: "Accepted",
        updatedBy: req.user?.id,
      },

      {
        new: true,
      },
    );

    res.status(200).json({
      success: true,
      message: "Order accepted",
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================================
// Start Preparing
// ==========================================================

exports.startPreparing = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,

      {
        orderStatus: "Preparing",
        kitchenStatus: "Cooking",
        updatedBy: req.user?.id,
      },

      {
        new: true,
      },
    );

    res.status(200).json({
      success: true,
      message: "Order moved to preparing",
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================================
// Mark Ready
// ==========================================================

exports.markReady = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,

      {
        orderStatus: "Ready",
        kitchenStatus: "Ready",
      },

      {
        new: true,
      },
    );

    res.status(200).json({
      success: true,
      message: "Order ready",
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================================
// Complete Order
// ==========================================================

exports.completeOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,

      {
        orderStatus: "Completed",
        kitchenStatus: "Served",
      },

      {
        new: true,
      },
    );

    res.status(200).json({
      success: true,
      message: "Order completed",
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================================
// Cancel Order
// ==========================================================

exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    await order.cancelOrder();

    res.status(200).json({
      success: true,
      message: "Order cancelled",
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================================
// Mark Paid
// ==========================================================

exports.markPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    await order.markPaid();

    res.status(200).json({
      success: true,
      message: "Payment completed",
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================================================
// Order Summary
// ==========================================================

exports.orderSummary = async (req, res) => {
  try {
    const summary = await Order.aggregate([
      {
        $match: {
          isDeleted: false,
        },
      },

      {
        $group: {
          _id: null,

          totalOrders: {
            $sum: 1,
          },

          totalSales: {
            $sum: "$grandTotal",
          },

          paidOrders: {
            $sum: {
              $cond: [
                {
                  $eq: ["$paymentStatus", "Paid"],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: summary[0] || {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
