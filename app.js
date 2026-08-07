const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.get("/", (req, res) =>
  res.json({ success: true, message: "Restaurant Billing API running" }),
);
app.use("/api/auth", require("./src/routes/authRoutes"));
app.use("/api/cashregister",require("./src/routes/cashRegisterRoutes"));
// app.use("/api/users", require("./src/routes/userRoutes"));
app.use("/api/roles", require("./src/routes/roleRoutes"));
app.use("/api/restaurants", require("./src/routes/restaurantRoutes"));
app.use("/api/tables", require("./src/routes/tableRoutes"));
app.use("/api/categories", require("./src/routes/categoryRoutes"));
app.use("/api/menu-items", require("./src/routes/menuItemRoutes"));
app.use("/api/addons", require("./src/routes/addonRoutes"));
app.use("/api/customers", require("./src/routes/customerRoutes"));
app.use("/api/orders", require("./src/routes/orderRoutes"));
app.use("/api/kot", require("./src/routes/kotRoutes"));
app.use("/api/invoices", require("./src/routes/invoiceRoutes"));
app.use("/api/payments", require("./src/routes/paymentRoutes"));
app.use("/api/ingredientstock", require("./src/routes/ingredientStockRoutes"));
app.use("/api/suppliers", require("./src/routes/supplierRoutes"));
app.use("/api/purchases", require("./src/routes/purchaseRoutes"));
app.use("/api/stock-ledgers", require("./src/routes/stockLedgerRoutes"));
app.use("/api/stock-adjustments", require("./src/routes/stockAdjustmentRoutes"));
app.use("/api/expenses", require("./src/routes/expenseRoutes"));
app.use("/api/coupons", require("./src/routes/couponRoutes"));
app.use("/api/taxes", require("./src/routes/taxRoutes"));
app.use("/api/dashboard", require("./src/routes/dashboardRoutes"));
app.use("/api/reports", require("./src/routes/reportRoutes"));
app.use("/api/deliveryPartners", require("./src/routes/deliveryPartnerRoutes"));
app.use("/api/discounts",require("./src/routes/discountRoutes"));
app.use("/api/ingradients",require("./src/routes/ingradientRoutes"));
app.use("/api/kitchenwastes",require("./src/routes/kitchenWasteRoutes"));
app.use("/api/menucategories",require("./src/routes/menuCategoryRoutes"));
app.use("/api/notifications",require("./src/routes/notificationRoutes"));
app.use("/api/purchase-returns",require("./src/routes/purchaseReturnRoutes"));
app.use("/api/receipes",require("./src/routes/receipeRoutes"));
app.use("/api/restaurant-settings",require("./src/routes/restaurantSettingRoutes"));
app.use("/api/shifts",require("./src/routes/shiftRoutes"));
app.use("/api/store",require("./src/routes/storeRoutes"));
app.use("/api/combomeals",require("./src/routes/comboMealRoutes"));
app.use( "/api/companies",require("./src/routes/companyRoutes"));
app.use("/api/products",require("./src/routes/productRoutes"));
app.use("/api/reservations",require("./src/routes/reservationRoutes"));
app.use( "/api/inventory",require("./src/routes/inventoryRoutes"));
app.use((req, res) =>
  res.status(404).json({ success: false, message: "Route not found" }),
);
app.use((err, req, res, next) =>
  res
    .status(err.statusCode || 500)
    .json({ success: false, message: err.message || "Server error" }),
);
module.exports = app;
