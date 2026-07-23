
const express = require("express");
const router = express.Router();

const {
  createCashRegister,
  getAllCashRegisters,
  getCashRegisterById,
  updateCashRegister,
  deleteCashRegister,

  openCashRegister,
  closeCashRegister,
  addCashIn,
  addCashOut,

  restoreCashRegister,
  getOpenRegisters,
  getClosedRegisters,
  getTodayRegisters,
  getStoreRegisters,
  getCashSummary,
  getDashboardSummary,
} = require("../controllers/cashRegisterController");

const { verifyToken } = require("../middleware/auth");



router.post("/create", verifyToken, createCashRegister);

router.get("/all", verifyToken, getAllCashRegisters);

router.get("/:id", verifyToken, getCashRegisterById);

router.put("/update/:id", verifyToken, updateCashRegister);

router.delete("/delete/:id", verifyToken, deleteCashRegister);

/* ==========================================================
   Register Operations
========================================================== */

router.put("/open/:id", verifyToken, openCashRegister);

router.put("/close/:id", verifyToken, closeCashRegister);

router.put("/restore/:id", verifyToken, restoreCashRegister);

/* ==========================================================
   Cash Movement
========================================================== */

router.post("/cashin/:id", verifyToken, addCashIn);

router.post("/cashout/:id", verifyToken, addCashOut);

/* ==========================================================
   Reports
========================================================== */

router.get("/reports/open", verifyToken, getOpenRegisters);

router.get("/reports/closed", verifyToken, getClosedRegisters);

router.get("/reports/today", verifyToken, getTodayRegisters);

router.get("/reports/store/:storeId", verifyToken, getStoreRegisters);

router.get("/reports/summary", verifyToken, getCashSummary);

router.get("/reports/dashboard", verifyToken, getDashboardSummary);

module.exports = router;

