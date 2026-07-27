const Expense = require("../models/Expense");

/* ==========================================================
   Create Expense
========================================================== */

exports.createExpense = async (req, res) => {
  try {
    const {
      expenseNo,
      expenseDate,
      dueDate,
      restaurant,
      store,
      category,
      expenseName,
      description,
      supplier,
      purchase,
      payment,
      quantity,
      unitPrice,
      discountPercentage,
      gstPercentage,
      cgstPercentage,
      sgstPercentage,
      igstPercentage,
      paymentMethod,
      paidAmount,
      transactionId,
      referenceNo,
      attachments,
      remarks,
    } = req.body;

    // Check Duplicate Expense Number
    const exists = await Expense.findOne({
      expenseNo: expenseNo.trim().toUpperCase(),
      isDeleted: false,
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Expense Number already exists.",
      });
    }

    const expense = await Expense.create({
      expenseNo,
      expenseDate,
      dueDate,
      restaurant,
      store,
      category,
      expenseName,
      description,
      supplier,
      purchase,
      payment,
      quantity,
      unitPrice,
      discountPercentage,
      gstPercentage,
      cgstPercentage,
      sgstPercentage,
      igstPercentage,
      paymentMethod,
      paidAmount,
      transactionId,
      referenceNo,
      attachments,
      remarks,
      createdBy: req.user?._id,
      updatedBy: req.user?._id,
    });

    return res.status(201).json({
      success: true,
      message: "Expense created successfully.",
      data: expense,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};


/* ==========================================================
   Get All Expenses
========================================================== */

exports.getAllExpenses = async (req, res) => {

  try {

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const search = req.query.search || "";
    const store = req.query.store;
    const category = req.query.category;
    const paymentStatus = req.query.paymentStatus;
    const approvalStatus = req.query.approvalStatus;
    const supplier = req.query.supplier;

    let query = {
      isDeleted: false,
    };

    if (store) query.store = store;

    if (category) query.category = category;

    if (supplier) query.supplier = supplier;

    if (paymentStatus)
      query.paymentStatus = paymentStatus;

    if (approvalStatus)
      query.approvalStatus = approvalStatus;

    if (search) {

      query.$or = [
        {
          expenseNo: {
            $regex: search,
            $options: "i",
          },
        },
        {
          expenseName: {
            $regex: search,
            $options: "i",
          },
        },
        {
          description: {
            $regex: search,
            $options: "i",
          },
        },
      ];

    }

    const total = await Expense.countDocuments(query);

    const expenses = await Expense.find(query)
      .populate("restaurant", "restaurantName")
      .populate("store", "storeName")
      .populate("category", "categoryName")
      .populate("supplier", "supplierName")
      .populate("purchase", "purchaseNo")
      .populate("payment", "paymentNo")
      .populate("approvedBy", "name")
      .populate("createdBy", "name")
      .populate("updatedBy", "name")
      .sort({
        expenseDate: -1,
        createdAt: -1,
      })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      count: expenses.length,
      data: expenses,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};


/* ==========================================================
   Get Expense By ID
========================================================== */

exports.getExpenseById = async (req, res) => {

  try {

    const expense = await Expense.findOne({
      _id: req.params.id,
      isDeleted: false,
    })
      .populate("restaurant")
      .populate("store")
      .populate("category")
      .populate("supplier")
      .populate("purchase")
      .populate("payment")
      .populate("approvedBy", "name email")
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email");

    if (!expense) {

      return res.status(404).json({
        success: false,
        message: "Expense not found.",
      });

    }

    return res.status(200).json({
      success: true,
      data: expense,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};


/* ==========================================================
   Update Expense
========================================================== */

exports.updateExpense = async (req, res) => {

  try {

    const expense = await Expense.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!expense) {

      return res.status(404).json({
        success: false,
        message: "Expense not found.",
      });

    }

    // Duplicate Expense Number
    if (req.body.expenseNo) {

      const exists = await Expense.findOne({
        _id: {
          $ne: req.params.id,
        },
        expenseNo: req.body.expenseNo
          .trim()
          .toUpperCase(),
        isDeleted: false,
      });

      if (exists) {

        return res.status(400).json({
          success: false,
          message: "Expense Number already exists.",
        });

      }

    }

    Object.keys(req.body).forEach((key) => {
      expense[key] = req.body[key];
    });

    expense.updatedBy = req.user?._id;

    await expense.save();

    return res.status(200).json({
      success: true,
      message: "Expense updated successfully.",
      data: expense,
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};
/* ==========================================================
   Delete Expense (Soft Delete)
========================================================== */

exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found.",
      });
    }

    // Soft Delete using Instance Method
    await expense.softDelete(req.user?._id);

    return res.status(200).json({
      success: true,
      message: "Expense deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
   Restore Expense
========================================================== */

exports.restoreExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      isDeleted: true,
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Deleted expense not found.",
      });
    }

    await expense.restore();

    expense.updatedBy = req.user?._id;
    await expense.save();

    return res.status(200).json({
      success: true,
      message: "Expense restored successfully.",
      data: expense,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
   Mark Expense as Paid
========================================================== */

exports.markPaid = async (req, res) => {
  try {
    const { paymentMethod, transactionId } = req.body;

    const expense = await Expense.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found.",
      });
    }

    if (expense.paymentStatus === "Paid") {
      return res.status(400).json({
        success: false,
        message: "Expense is already paid.",
      });
    }

    await expense.markPaid(paymentMethod, transactionId);

    expense.updatedBy = req.user?._id;
    await expense.save();

    return res.status(200).json({
      success: true,
      message: "Expense marked as paid successfully.",
      data: expense,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
   Cancel Expense
========================================================== */

exports.cancelExpense = async (req, res) => {
  try {
    const { remarks } = req.body;

    const expense = await Expense.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found.",
      });
    }

    if (expense.paymentStatus === "Cancelled") {
      return res.status(400).json({
        success: false,
        message: "Expense is already cancelled.",
      });
    }

    await expense.cancelExpense(remarks);

    expense.updatedBy = req.user?._id;
    await expense.save();

    return res.status(200).json({
      success: true,
      message: "Expense cancelled successfully.",
      data: expense,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
   Approve Expense
========================================================== */

exports.approveExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found.",
      });
    }

    if (expense.approvalStatus === "Approved") {
      return res.status(400).json({
        success: false,
        message: "Expense is already approved.",
      });
    }

    await expense.approveExpense(req.user?._id);

    expense.updatedBy = req.user?._id;
    await expense.save();

    return res.status(200).json({
      success: true,
      message: "Expense approved successfully.",
      data: expense,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
   Reject Expense
========================================================== */

exports.rejectExpense = async (req, res) => {
  try {
    const { rejectionReason } = req.body;

    const expense = await Expense.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found.",
      });
    }

    if (expense.approvalStatus === "Rejected") {
      return res.status(400).json({
        success: false,
        message: "Expense is already rejected.",
      });
    }

    await expense.rejectExpense(rejectionReason);

    expense.updatedBy = req.user?._id;
    await expense.save();

    return res.status(200).json({
      success: true,
      message: "Expense rejected successfully.",
      data: expense,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
   Get Today's Expenses
========================================================== */

exports.getTodayExpenses = async (req, res) => {
  try {
    const expenses = await Expense.getTodayExpenses();

    return res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
   Get Expense Summary
========================================================== */

exports.getExpenseSummary = async (req, res) => {
  try {
    const summary = await Expense.getExpenseSummary();

    return res.status(200).json({
      success: true,
      data: summary,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
   Get Store Expenses
========================================================== */

exports.getStoreExpenses = async (req, res) => {
  try {
    const { storeId } = req.params;

    const expenses = await Expense.getStoreExpenses(storeId);

    return res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
   Get Pending Approval Expenses
========================================================== */

exports.getPendingApprovals = async (req, res) => {
  try {
    const expenses = await Expense.getPendingApprovals();

    return res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
   Get Category Wise Expense
========================================================== */

exports.getCategoryWiseExpense = async (req, res) => {
  try {
    const result = await Expense.getCategoryWiseExpense();

    return res.status(200).json({
      success: true,
      count: result.length,
      data: result,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};