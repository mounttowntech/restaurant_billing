const express = require("express");

const router = express.Router();

const orderController = require("../controllers/orderController");

const {verifyToken} = require("../middleware/auth");

// Create
router.post("/create", orderController.createOrder);

// Get All
router.get("/all", orderController.getOrders);

// Today's Orders
router.get("/today",  orderController.getTodayOrders);

// Kitchen Queue
router.get("/kitchen-queue",  orderController.getKitchenQueue);

// Table Orders
router.get("/table/:tableId",  orderController.getActiveTableOrders);

// Summary
router.get("/summary", orderController.orderSummary);

// Single
router.get("/:id",  orderController.getOrderById);

// Update
router.put("/update/:id",  orderController.updateOrder);

// Delete
router.delete("/delete/:id",  orderController.deleteOrder);

// Restore
router.put("/restore/:id",  orderController.restoreOrder);

// Order Workflow

router.put("/accept/:id", orderController.acceptOrder);

router.put("/prepare/:id",  orderController.startPreparing);

router.put("/ready/:id",orderController.markReady);

router.put("/complete/:id",  orderController.completeOrder);

router.put("/cancel/:id",  orderController.cancelOrder);

// Payment

router.put("/paid/:id", verifyToken, orderController.markPaid);

module.exports = router;
