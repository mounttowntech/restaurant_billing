const express = require("express");

const router = express.Router();

const orderController = require("../controllers/orderController");

const {verifyToken} = require("../middleware/auth");

// Create
router.post("/create", verifyToken, orderController.createOrder);

// Get All
router.get("/all", verifyToken, orderController.getOrders);

// Today's Orders
router.get("/today", verifyToken, orderController.getTodayOrders);

// Kitchen Queue
router.get("/kitchen-queue", verifyToken, orderController.getKitchenQueue);

// Table Orders
router.get("/table/:tableId", verifyToken, orderController.getActiveTableOrders);

// Summary
router.get("/summary", verifyToken, orderController.orderSummary);

// Single
router.get("/:id", verifyToken, orderController.getOrderById);

// Update
router.put("/:id", verifyToken, orderController.updateOrder);

// Delete
router.delete("/:id", verifyToken, orderController.deleteOrder);

// Restore
router.put("/restore/:id", verifyToken, orderController.restoreOrder);

// Order Workflow

router.put("/accept/:id", verifyToken, orderController.acceptOrder);

router.put("/prepare/:id", verifyToken, orderController.startPreparing);

router.put("/ready/:id", verifyToken, orderController.markReady);

router.put("/complete/:id", verifyToken, orderController.completeOrder);

router.put("/cancel/:id", verifyToken, orderController.cancelOrder);

// Payment

router.put("/paid/:id", verifyToken, orderController.markPaid);

module.exports = router;
