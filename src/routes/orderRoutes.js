const express = require("express");

const router = express.Router();

const orderController = require("../controllers/orderController");
const posOrderController = require("../controllers/posOrderController");

const { verifyToken } = require("../middleware/auth");

// Create
router.post("/create", orderController.createOrder);

// Get All
router.get("/all", orderController.getOrders);

// Today's Orders
router.get("/today", orderController.getTodayOrders);

// Kitchen Queue
router.get("/kitchen-queue", orderController.getKitchenQueue);

// Table Orders
router.get("/table/:tableId", orderController.getActiveTableOrders);

// Summary
router.get("/summary", orderController.orderSummary);

// Single
router.get("/:id", orderController.getOrderById);
   
// Update
router.put("/update/:id", orderController.updateOrder);

// Delete
router.delete("/delete/:id", orderController.deleteOrder);

// Restore
router.put("/restore/:id", orderController.restoreOrder);

// Order Workflow

router.put("/accept/:id", orderController.acceptOrder);

router.put("/prepare/:id", orderController.startPreparing);

router.put("/ready/:id", orderController.markReady);

router.put("/complete/:id", orderController.completeOrder);

router.put("/cancel/:id", orderController.cancelOrder);

// Payment

router.put("/paid/:id", verifyToken, orderController.markPaid);



/* ==========================================================
   POS
========================================================== */

router.post(
  "/pos/create",
  posOrderController.createPOSOrder
);

/* ==========================================================
   ORDERS
========================================================== */

router.post(
  "/create",
  orderController.createOrder
);

router.get(
  "/all",
  orderController.getOrders
);

router.get(
  "/today",
  orderController.getTodayOrders
);

router.get(
  "/kitchen-queue",
  orderController.getKitchenQueue
);

router.get(
  "/table/:tableId",
  orderController.getActiveTableOrders
);

router.get(
  "/summary",
  orderController.orderSummary
);

router.get(
  "/:id",
  orderController.getOrderById
);

router.put(
  "/update/:id",
  orderController.updateOrder
);

router.delete(
  "/delete/:id",
  orderController.deleteOrder
);

router.patch(
  "/restore/:id",
  orderController.restoreOrder
);

/* ==========================================================
   ORDER STATUS
========================================================== */

router.patch(
  "/:id/accept",
  orderController.acceptOrder
);

router.patch(
  "/:id/preparing",
  orderController.startPreparing
);

router.patch(
  "/:id/ready",
  orderController.markReady
);

router.patch(
  "/:id/complete",
  orderController.completeOrder
);

router.patch(
  "/:id/cancel",
  orderController.cancelOrder
);

router.patch(
  "/:id/paid",
  orderController.markPaid
);

module.exports = router;
