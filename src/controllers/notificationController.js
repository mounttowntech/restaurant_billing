const Notification = require("../models/notificationModel");

// ==========================================================
// Create Notification
// ==========================================================

exports.createNotification = async (req, res) => {
  try {
    const notification = await Notification.create({
      ...req.body,

      createdBy: req.user?.id,
    });

    res.status(201).json({
      success: true,

      message: "Notification created successfully",

      data: notification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// ==========================================================
// Get All Notifications
// ==========================================================

exports.getNotifications = async (req, res) => {
  try {
    const {
      page = 1,

      limit = 10,

      search = "",

      status,

      type,

      priority,
    } = req.query;

    const filter = {};

    if (search) {
      filter.$text = {
        $search: search,
      };
    }

    if (status) {
      filter.deliveryStatus = status;
    }

    if (type) {
      filter.notificationType = type;
    }

    if (priority) {
      filter.priority = priority;
    }

    const skip = (page - 1) * limit;

    const total = await Notification.countDocuments(filter);

    const notifications = await Notification.find(filter)

      .populate("sender", "name email")

      .populate("store", "storeName")

      .sort({
        createdAt: -1,
      })

      .skip(skip)

      .limit(Number(limit));

    res.json({
      success: true,

      total,

      page: Number(page),

      pages: Math.ceil(total / limit),

      data: notifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// ==========================================================
// Get Notification By ID
// ==========================================================

exports.getNotificationById = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id)

      .populate("sender")

      .populate("store")

      .populate("recipients.user");

    if (!notification) {
      return res.status(404).json({
        success: false,

        message: "Notification not found",
      });
    }

    res.json({
      success: true,

      data: notification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// ==========================================================
// Update Notification
// ==========================================================

exports.updateNotification = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
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

    res.json({
      success: true,

      message: "Notification updated successfully",

      data: notification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// ==========================================================
// Archive Notification
// ==========================================================

exports.archiveNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    await notification.archiveNotification(req.user.id);

    res.json({
      success: true,

      message: "Notification archived",
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// ==========================================================
// Restore Notification
// ==========================================================

exports.restoreNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    await notification.restoreNotification();

    res.json({
      success: true,

      message: "Notification restored",

      data: notification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// ==========================================================
// Mark Read
// ==========================================================

exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    await notification.markAsRead(req.user.id);

    res.json({
      success: true,

      message: "Notification marked as read",

      data: notification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// ==========================================================
// Mark Delivered
// ==========================================================

exports.markAsDelivered = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    await notification.markAsDelivered(req.user.id);

    res.json({
      success: true,

      message: "Notification delivered",

      data: notification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// ==========================================================
// Mark Failed
// ==========================================================

exports.markAsFailed = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    await notification.markAsFailed(
      req.user.id,

      req.body.reason,
    );

    res.json({
      success: true,

      message: "Notification failed",

      data: notification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

// ==========================================================
// Unread Notifications
// ==========================================================

exports.getUnreadNotifications = async (req, res) => {
  try {
    const data = await Notification.getUnreadNotifications(
      req.params.restaurantId,

      req.params.userId,
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
// User Notifications
// ==========================================================

exports.getUserNotifications = async (req, res) => {
  try {
    const data = await Notification.getUserNotifications(
      req.params.restaurantId,

      req.params.userId,
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
// Today's Notifications
// ==========================================================

exports.getTodayNotifications = async (req, res) => {
  try {
    const data = await Notification.getTodayNotifications(
      req.params.restaurantId,
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
// Notification Summary
// ==========================================================

exports.getNotificationSummary = async (req, res) => {
  try {
    const data = await Notification.getNotificationSummary(
      req.params.restaurantId,

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
// Module Notifications
// ==========================================================

exports.getModuleNotifications = async (req, res) => {
  try {
    const data = await Notification.getModuleNotifications(
      req.params.restaurantId,

      req.params.moduleName,
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
// Restaurant Notifications
// ==========================================================

exports.getRestaurantNotifications = async (req, res) => {
  try {
    const data = await Notification.getRestaurantNotifications(
      req.params.restaurantId,

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
