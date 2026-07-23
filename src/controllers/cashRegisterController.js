const CashRegister = require("../models/cashRegisterModel");


exports.createCashRegister = async (req, res) => {
  try {
    const {
      registerNumber,
      registerName,
      terminalName,
      terminalCode,
      restaurant,
      store,
      shift,
      cashier,
      openingBalance,
      openingRemarks,
    } = req.body;

    // Check duplicate register number
    const exists = await CashRegister.findOne({
      registerNumber: registerNumber.toUpperCase(),
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Register number already exists.",
      });
    }

    const register = await CashRegister.create({
      registerNumber,
      registerName,
      terminalName,
      terminalCode,
      restaurant,
      store,
      shift,
      cashier,
      openingBalance,
      openingRemarks,
      createdBy: req.user?._id,
    });

    const data = await CashRegister.findById(register._id)
      .populate("restaurant", "restaurantName")
      .populate("store", "storeName")
      .populate("shift", "shiftName")
      .populate("cashier", "name email");

    res.status(201).json({
      success: true,
      message: "Cash register created successfully.",
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


exports.getAllCashRegisters = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};

    if (req.query.restaurant)
      filter.restaurant = req.query.restaurant;

    if (req.query.store)
      filter.store = req.query.store;

    if (req.query.cashier)
      filter.cashier = req.query.cashier;

    if (req.query.shift)
      filter.shift = req.query.shift;

    if (req.query.status)
      filter.status = req.query.status;

    if (req.query.search) {
      filter.$or = [
        {
          registerNumber: {
            $regex: req.query.search,
            $options: "i",
          },
        },
        {
          registerName: {
            $regex: req.query.search,
            $options: "i",
          },
        },
      ];
    }

    const total = await CashRegister.countDocuments(filter);

    const registers = await CashRegister.find(filter)
      .populate("restaurant", "restaurantName")
      .populate("store", "storeName")
      .populate("shift", "shiftName")
      .populate("cashier", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      count: registers.length,
      data: registers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getCashRegisterById = async (req, res) => {
  try {
    const register = await CashRegister.findById(req.params.id)
      .populate("restaurant", "restaurantName")
      .populate("store", "storeName")
      .populate("shift", "shiftName")
      .populate("cashier", "name email")
      .populate("createdBy", "name")
      .populate("updatedBy", "name");

    if (!register) {
      return res.status(404).json({
        success: false,
        message: "Cash register not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: register,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateCashRegister = async (req, res) => {
  try {
    const register = await CashRegister.findById(req.params.id);

    if (!register) {
      return res.status(404).json({
        success: false,
        message: "Cash register not found.",
      });
    }

    if (register.status === "Closed") {
      return res.status(400).json({
        success: false,
        message: "Closed register cannot be updated.",
      });
    }

    Object.assign(register, req.body);

    register.updatedBy = req.user?._id;

    await register.save();

    const data = await CashRegister.findById(register._id)
      .populate("restaurant", "restaurantName")
      .populate("store", "storeName")
      .populate("shift", "shiftName")
      .populate("cashier", "name email");

    res.status(200).json({
      success: true,
      message: "Cash register updated successfully.",
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.deleteCashRegister = async (req, res) => {
  try {
    const register = await CashRegister.findById(req.params.id);

    if (!register) {
      return res.status(404).json({
        success: false,
        message: "Cash register not found.",
      });
    }

    await register.softDelete(req.user?._id);

    res.status(200).json({
      success: true,
      message: "Cash register deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.openCashRegister = async (req, res) => {
  try {
    const register = await CashRegister.findById(req.params.id);

    if (!register) {
      return res.status(404).json({
        success: false,
        message: "Cash register not found.",
      });
    }

    if (register.status === "Open") {
      return res.status(400).json({
        success: false,
        message: "Cash register is already open.",
      });
    }

    register.updatedBy = req.user?._id;

    await register.openRegister();

    const data = await CashRegister.findById(register._id)
      .populate("restaurant", "restaurantName")
      .populate("store", "storeName")
      .populate("shift", "shiftName")
      .populate("cashier", "name email");

    res.status(200).json({
      success: true,
      message: "Cash register opened successfully.",
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


exports.closeCashRegister = async (req, res) => {
  try {
    const { actualClosingCash, closingRemarks } = req.body;

    if (actualClosingCash === undefined) {
      return res.status(400).json({
        success: false,
        message: "Actual closing cash is required.",
      });
    }

    const register = await CashRegister.findById(req.params.id);

    if (!register) {
      return res.status(404).json({
        success: false,
        message: "Cash register not found.",
      });
    }

    if (register.status === "Closed") {
      return res.status(400).json({
        success: false,
        message: "Cash register is already closed.",
      });
    }

    register.updatedBy = req.user?._id;
    register.closingRemarks = closingRemarks || "";

    await register.closeRegister(Number(actualClosingCash));

    const data = await CashRegister.findById(register._id)
      .populate("restaurant", "restaurantName")
      .populate("store", "storeName")
      .populate("shift", "shiftName")
      .populate("cashier", "name email");

    res.status(200).json({
      success: true,
      message: "Cash register closed successfully.",
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


exports.addCashIn = async (req, res) => {
  try {
    const {
      amount,
      reason,
      referenceNo,
      paymentMode,
      remarks,
    } = req.body;

    if (!amount || !reason) {
      return res.status(400).json({
        success: false,
        message: "Amount and reason are required.",
      });
    }

    const register = await CashRegister.findById(req.params.id);

    if (!register) {
      return res.status(404).json({
        success: false,
        message: "Cash register not found.",
      });
    }

    if (register.status !== "Open") {
      return res.status(400).json({
        success: false,
        message: "Cash register is closed.",
      });
    }

    register.cashMovements.push({
      movementType: "Cash In",
      amount,
      reason,
      referenceNo,
      paymentMode,
      remarks,
      createdBy: req.user?._id,
    });

    register.updatedBy = req.user?._id;

    await register.save();

    res.status(200).json({
      success: true,
      message: "Cash added successfully.",
      data: register,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


exports.addCashOut = async (req, res) => {
  try {
    const {
      amount,
      reason,
      referenceNo,
      paymentMode,
      remarks,
    } = req.body;

    if (!amount || !reason) {
      return res.status(400).json({
        success: false,
        message: "Amount and reason are required.",
      });
    }

    const register = await CashRegister.findById(req.params.id);

    if (!register) {
      return res.status(404).json({
        success: false,
        message: "Cash register not found.",
      });
    }

    if (register.status !== "Open") {
      return res.status(400).json({
        success: false,
        message: "Cash register is closed.",
      });
    }

    register.cashMovements.push({
      movementType: "Cash Out",
      amount,
      reason,
      referenceNo,
      paymentMode,
      remarks,
      createdBy: req.user?._id,
    });

    register.updatedBy = req.user?._id;

    await register.save();

    res.status(200).json({
      success: true,
      message: "Cash paid out successfully.",
      data: register,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


exports.restoreCashRegister = async (req, res) => {
  try {
    const register = await CashRegister.findOne({
      _id: req.params.id,
      isDeleted: true,
    });

    if (!register) {
      return res.status(404).json({
        success: false,
        message: "Deleted cash register not found.",
      });
    }

    await register.restore();

    res.status(200).json({
      success: true,
      message: "Cash register restored successfully.",
      data: register,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


exports.getOpenRegisters = async (req, res) => {
  try {
    const restaurantId =
      req.query.restaurant || req.user.restaurant;

    const registers =
      await CashRegister.getOpenRegisters(restaurantId);

    res.status(200).json({
      success: true,
      count: registers.length,
      data: registers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getClosedRegisters = async (req, res) => {
  try {
    const restaurantId =
      req.query.restaurant || req.user.restaurant;

    const registers =
      await CashRegister.getClosedRegisters(restaurantId);

    res.status(200).json({
      success: true,
      count: registers.length,
      data: registers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


exports.getTodayRegisters = async (req, res) => {
  try {
    const restaurantId =
      req.query.restaurant || req.user.restaurant;

    const registers =
      await CashRegister.getTodayRegisters(restaurantId);

    res.status(200).json({
      success: true,
      count: registers.length,
      data: registers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


exports.getStoreRegisters = async (req, res) => {
  try {
    const registers =
      await CashRegister.getStoreRegisters(
        req.params.storeId
      );

    res.status(200).json({
      success: true,
      count: registers.length,
      data: registers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getCashSummary = async (req, res) => {
  try {
    const {
      restaurant,
      fromDate,
      toDate,
    } = req.query;

    const restaurantId =
      restaurant || req.user.restaurant;

    const summary =
      await CashRegister.getCashSummary(
        restaurantId,
        fromDate,
        toDate
      );

    res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getDashboardSummary = async (req, res) => {
  try {
    const restaurantId =
      req.query.restaurant || req.user.restaurant;

    const [
      openRegisters,
      closedRegisters,
      todayRegisters,
      summary,
    ] = await Promise.all([
      CashRegister.getOpenRegisters(
        restaurantId
      ),
      CashRegister.getClosedRegisters(
        restaurantId
      ),
      CashRegister.getTodayRegisters(
        restaurantId
      ),
      CashRegister.getCashSummary(
        restaurantId
      ),
    ]);

    res.status(200).json({
      success: true,
      data: {
        openRegisters: openRegisters.length,
        closedRegisters: closedRegisters.length,
        todayRegisters: todayRegisters.length,
        summary,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

