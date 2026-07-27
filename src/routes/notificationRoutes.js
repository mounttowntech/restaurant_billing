const express = require("express");

const router = express.Router();

const controller = require("../controllers/notificationController");

// Create

router.post("/create", controller.createNotification);

// Get All

router.get("/all", controller.getNotifications);

// Single

router.get("/:id", controller.getNotificationById);

// Update

router.put("/:id", controller.updateNotification);

// Archive

router.patch("/:id/archive", controller.archiveNotification);

// Restore

router.patch("/:id/restore", controller.restoreNotification);

// Read

router.patch("/:id/read", controller.markAsRead);

// Delivered

router.patch("/:id/delivered", controller.markAsDelivered);

// Failed

router.patch("/:id/failed", controller.markAsFailed);

// User unread

router.get("/unread/:restaurantId/:userId", controller.getUnreadNotifications);

// User notifications

router.get("/user/:restaurantId/:userId", controller.getUserNotifications);

// Today

router.get("/today/:restaurantId", controller.getTodayNotifications);

// Summary

router.get("/summary/:restaurantId", controller.getNotificationSummary);

// Module

router.get(
  "/module/:restaurantId/:moduleName",
  controller.getModuleNotifications,
);

// Restaurant

router.get("/restaurant/:restaurantId", controller.getRestaurantNotifications);

module.exports = router;
