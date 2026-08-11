const mongoose = require("mongoose");

const POSBill = require("../models/POSBillModel");
const Product = require("../models/productModel");
const Restaurant = require("../models/Restaurant");
const Store = require("../models/storeModel");

// --------------------------------------------------
// HELPER: Generate Bill Number
// --------------------------------------------------

const generateBillNo = async (restaurantId, storeId) => {
  const count = await POSBill.countDocuments({
    restaurant: restaurantId,
    store: storeId,
  });

  const number = count + 1;

  return `POS-${String(number).padStart(6, "0")}`;
};

// --------------------------------------------------
// HELPER: Recalculate Bill
// --------------------------------------------------

const calculateBill = (bill) => {
  let subTotal = 0;
  let itemDiscount = 0;

  bill.items.forEach((item) => {
    const gross = item.quantity * item.price;

    const discount =
      gross * ((item.discountPercentage || 0) / 100);

    const taxableAmount = gross - discount;

    const tax =
      taxableAmount * ((item.taxPercentage || 0) / 100);

    const total = taxableAmount + tax;

    item.discountAmount = Number(discount.toFixed(2));
    item.taxableAmount = Number(taxableAmount.toFixed(2));
    item.taxAmount = Number(tax.toFixed(2));
    item.totalAmount = Number(total.toFixed(2));

    subTotal += gross;
    itemDiscount += discount;
  });

  bill.subTotal = Number(subTotal.toFixed(2));
  bill.itemDiscount = Number(itemDiscount.toFixed(2));

  const billDiscount =
    (bill.subTotal - bill.itemDiscount) *
    ((bill.billDiscountPercentage || 0) / 100);

  bill.billDiscountAmount = Number(billDiscount.toFixed(2));

  const couponDiscount = bill.couponDiscount || 0;

  const taxableAmount = Math.max(
    0,
    bill.subTotal -
      bill.itemDiscount -
      bill.billDiscountAmount -
      couponDiscount
  );

  bill.taxableAmount = Number(taxableAmount.toFixed(2));

  // ------------------------------------------------
  // GST
  // ------------------------------------------------

  const cgstPercentage = bill.cgstPercentage || 0;
  const sgstPercentage = bill.sgstPercentage || 0;
  const igstPercentage = bill.igstPercentage || 0;

  bill.cgstAmount = Number(
    (taxableAmount * cgstPercentage / 100).toFixed(2)
  );

  bill.sgstAmount = Number(
    (taxableAmount * sgstPercentage / 100).toFixed(2)
  );

  bill.igstAmount = Number(
    (taxableAmount * igstPercentage / 100).toFixed(2)
  );

  bill.totalTax = Number(
    (
      bill.cgstAmount +
      bill.sgstAmount +
      bill.igstAmount
    ).toFixed(2)
  );

  bill.grandTotal = Number(
    (taxableAmount + bill.totalTax).toFixed(2)
  );

  // ------------------------------------------------
  // Round Off
  // ------------------------------------------------

  bill.netAmount = Math.round(bill.grandTotal);

  bill.roundOff = Number(
    (bill.netAmount - bill.grandTotal).toFixed(2)
  );

  // ------------------------------------------------
  // Payment
  // ------------------------------------------------

  bill.paidAmount = bill.payments.reduce(
    (sum, payment) => sum + Number(payment.amount || 0),
    0
  );

  bill.paidAmount = Number(bill.paidAmount.toFixed(2));

  bill.balanceAmount = Number(
    Math.max(0, bill.netAmount - bill.paidAmount).toFixed(2)
  );

  if (bill.paidAmount <= 0) {
    bill.paymentStatus = "PENDING";
  } else if (bill.paidAmount < bill.netAmount) {
    bill.paymentStatus = "PARTIAL";
  } else {
    bill.paymentStatus = "PAID";
  }

  return bill;
};

// ==================================================
// CREATE POS BILL
// POST /api/pos-billing
// ==================================================

exports.createPOSBill = async (req, res) => {
  try {
    const {
      restaurant,
      store,
      customer,
      customerName,
      customerPhone,
      waiter,
      table,
      orderType,
      items,
      cgstPercentage,
      sgstPercentage,
      igstPercentage,
      createdBy,
    } = req.body;

    if (!restaurant || !store) {
      return res.status(400).json({
        success: false,
        message: "Restaurant and store are required",
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one item is required",
      });
    }

    const restaurantExists = await Restaurant.findById(restaurant);

    if (!restaurantExists) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    const storeExists = await Store.findById(store);

    if (!storeExists) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    const billNo = await generateBillNo(
      restaurant,
      store
    );

    const bill = new POSBill({
      restaurant,
      store,
      billNo,
      customer: customer || null,
      customerName,
      customerPhone,
      waiter: waiter || null,
      table: table || null,
      orderType: orderType || "DINE_IN",

      items,

      cgstPercentage: cgstPercentage || 0,
      sgstPercentage: sgstPercentage || 0,
      igstPercentage: igstPercentage || 0,

      createdBy: createdBy || req.user?._id,
      payments: [],
    });

    calculateBill(bill);

    await bill.save();

    const populatedBill = await POSBill.findById(bill._id)
      .populate("restaurant")
      .populate("store")
      .populate("customer")
      .populate("waiter")
      .populate("table")
      .populate("items.product");

    return res.status(201).json({
      success: true,
      message: "POS bill created successfully",
      data: populatedBill,
    });
  } catch (error) {
    console.error("Create POS Bill Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create POS bill",
      error: error.message,
    });
  }
};

// ==================================================
// GET ALL BILLS
// GET /api/pos-billing
// ==================================================

exports.getPOSBills = async (req, res) => {
  try {
    const {
      restaurant,
      store,
      status,
      paymentStatus,
      orderType,
      fromDate,
      toDate,
      page = 1,
      limit = 20,
      search,
    } = req.query;

    const filter = {};

    if (restaurant) {
      filter.restaurant = restaurant;
    }

    if (store) {
      filter.store = store;
    }

    if (status) {
      filter.status = status;
    }

    if (paymentStatus) {
      filter.paymentStatus = paymentStatus;
    }

    if (orderType) {
      filter.orderType = orderType;
    }

    if (search) {
      filter.$or = [
        {
          billNo: {
            $regex: search,
            $options: "i",
          },
        },
        {
          customerName: {
            $regex: search,
            $options: "i",
          },
        },
        {
          customerPhone: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    if (fromDate || toDate) {
      filter.createdAt = {};

      if (fromDate) {
        filter.createdAt.$gte = new Date(fromDate);
      }

      if (toDate) {
        const endDate = new Date(toDate);
        endDate.setHours(23, 59, 59, 999);

        filter.createdAt.$lte = endDate;
      }
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [bills, total] = await Promise.all([
      POSBill.find(filter)
        .populate("restaurant")
        .populate("store")
        .populate("customer")
        .populate("waiter")
        .populate("table")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),

      POSBill.countDocuments(filter),
    ]);

    return res.json({
      success: true,
      count: bills.length,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / Number(limit)),
      data: bills,
    });
  } catch (error) {
    console.error("Get POS Bills Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch POS bills",
      error: error.message,
    });
  }
};

// ==================================================
// GET BILL BY ID
// GET /api/pos-billing/:id
// ==================================================

exports.getPOSBillById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid bill ID",
      });
    }

    const bill = await POSBill.findById(id)
      .populate("restaurant")
      .populate("store")
      .populate("customer")
      .populate("waiter")
      .populate("table")
      .populate("items.product");

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "POS bill not found",
      });
    }

    return res.json({
      success: true,
      data: bill,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch POS bill",
      error: error.message,
    });
  }
};

// ==================================================
// HOLD BILL
// PATCH /api/pos-billing/:id/hold
// ==================================================

exports.holdBill = async (req, res) => {
  try {
    const bill = await POSBill.findById(req.params.id);

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "POS bill not found",
      });
    }

    if (
      bill.status === "COMPLETED" ||
      bill.status === "CANCELLED"
    ) {
      return res.status(400).json({
        success: false,
        message: `Cannot hold a ${bill.status.toLowerCase()} bill`,
      });
    }

    bill.status = "HOLD";
    bill.heldAt = new Date();

    await bill.save();

    return res.json({
      success: true,
      message: "Bill placed on hold successfully",
      data: bill,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to hold bill",
      error: error.message,
    });
  }
};

// ==================================================
// RESUME BILL
// PATCH /api/pos-billing/:id/resume
// ==================================================

exports.resumeBill = async (req, res) => {
  try {
    const bill = await POSBill.findById(req.params.id);

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "POS bill not found",
      });
    }

    if (bill.status !== "HOLD") {
      return res.status(400).json({
        success: false,
        message: "Only held bills can be resumed",
      });
    }

    bill.status = "RESUMED";
    bill.resumedAt = new Date();

    await bill.save();

    return res.json({
      success: true,
      message: "Bill resumed successfully",
      data: bill,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to resume bill",
      error: error.message,
    });
  }
};

// ==================================================
// APPLY DISCOUNT
// PATCH /api/pos-billing/:id/discount
// ==================================================

exports.applyDiscount = async (req, res) => {
  try {
    const { discountPercentage, discountAmount } = req.body;

    const bill = await POSBill.findById(req.params.id);

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "POS bill not found",
      });
    }

    if (
      bill.status === "COMPLETED" ||
      bill.status === "CANCELLED"
    ) {
      return res.status(400).json({
        success: false,
        message: "Cannot modify completed/cancelled bill",
      });
    }

    if (
      discountPercentage !== undefined &&
      (discountPercentage < 0 || discountPercentage > 100)
    ) {
      return res.status(400).json({
        success: false,
        message: "Discount percentage must be between 0 and 100",
      });
    }

    bill.billDiscountPercentage =
      Number(discountPercentage || 0);

    if (discountAmount !== undefined) {
      const baseAmount =
        bill.subTotal - bill.itemDiscount;

      if (discountAmount > baseAmount) {
        return res.status(400).json({
          success: false,
          message: "Discount amount cannot exceed bill amount",
        });
      }

      bill.billDiscountPercentage =
        baseAmount > 0
          ? (discountAmount / baseAmount) * 100
          : 0;
    }

    calculateBill(bill);

    await bill.save();

    return res.json({
      success: true,
      message: "Discount applied successfully",
      data: bill,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to apply discount",
      error: error.message,
    });
  }
};

// ==================================================
// APPLY COUPON
// PATCH /api/pos-billing/:id/coupon
// ==================================================

exports.applyCoupon = async (req, res) => {
  try {
    const { couponCode, couponDiscount } = req.body;

    if (!couponCode) {
      return res.status(400).json({
        success: false,
        message: "Coupon code is required",
      });
    }

    const bill = await POSBill.findById(req.params.id);

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "POS bill not found",
      });
    }

    if (
      bill.status === "COMPLETED" ||
      bill.status === "CANCELLED"
    ) {
      return res.status(400).json({
        success: false,
        message: "Cannot modify completed/cancelled bill",
      });
    }

    const discount = Number(couponDiscount || 0);

    const availableAmount =
      bill.subTotal -
      bill.itemDiscount -
      bill.billDiscountAmount;

    if (discount < 0 || discount > availableAmount) {
      return res.status(400).json({
        success: false,
        message: "Invalid coupon discount amount",
      });
    }

    bill.couponCode = couponCode.toUpperCase();
    bill.couponDiscount = discount;

    calculateBill(bill);

    await bill.save();

    return res.json({
      success: true,
      message: "Coupon applied successfully",
      data: bill,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to apply coupon",
      error: error.message,
    });
  }
};

// ==================================================
// CALCULATE TAX
// PATCH /api/pos-billing/:id/tax
// ==================================================

exports.calculateTax = async (req, res) => {
  try {
    const {
      cgstPercentage = 0,
      sgstPercentage = 0,
      igstPercentage = 0,
    } = req.body;

    const bill = await POSBill.findById(req.params.id);

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "POS bill not found",
      });
    }

    if (
      bill.status === "COMPLETED" ||
      bill.status === "CANCELLED"
    ) {
      return res.status(400).json({
        success: false,
        message: "Cannot modify completed/cancelled bill",
      });
    }

    bill.cgstPercentage = Number(cgstPercentage);
    bill.sgstPercentage = Number(sgstPercentage);
    bill.igstPercentage = Number(igstPercentage);

    calculateBill(bill);

    await bill.save();

    return res.json({
      success: true,
      message: "Tax calculated successfully",
      data: {
        taxableAmount: bill.taxableAmount,
        cgstPercentage: bill.cgstPercentage,
        cgstAmount: bill.cgstAmount,
        sgstPercentage: bill.sgstPercentage,
        sgstAmount: bill.sgstAmount,
        igstPercentage: bill.igstPercentage,
        igstAmount: bill.igstAmount,
        totalTax: bill.totalTax,
        grandTotal: bill.grandTotal,
        roundOff: bill.roundOff,
        netAmount: bill.netAmount,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to calculate tax",
      error: error.message,
    });
  }
};

// ==================================================
// PAYMENT
// POST /api/pos-billing/:id/payment
// ==================================================

exports.makePayment = async (req, res) => {
  try {
    const {
      method,
      amount,
      referenceNo,
    } = req.body;

    if (!method || amount === undefined) {
      return res.status(400).json({
        success: false,
        message: "Payment method and amount are required",
      });
    }

    const paymentAmount = Number(amount);

    if (paymentAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Payment amount must be greater than zero",
      });
    }

    const bill = await POSBill.findById(req.params.id);

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "POS bill not found",
      });
    }

    if (bill.status === "CANCELLED") {
      return res.status(400).json({
        success: false,
        message: "Cannot make payment for cancelled bill",
      });
    }

    if (bill.paymentStatus === "PAID") {
      return res.status(400).json({
        success: false,
        message: "Bill is already fully paid",
      });
    }

    const remainingAmount =
      bill.netAmount - bill.paidAmount;

    if (paymentAmount > remainingAmount) {
      return res.status(400).json({
        success: false,
        message: `Payment exceeds remaining amount. Remaining: ${remainingAmount}`,
      });
    }

    bill.payments.push({
      method,
      amount: paymentAmount,
      referenceNo,
      paidAt: new Date(),
    });

    calculateBill(bill);

    if (bill.paymentStatus === "PAID") {
      bill.status = "COMPLETED";
    }

    await bill.save();

    return res.json({
      success: true,
      message: "Payment recorded successfully",
      data: bill,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to process payment",
      error: error.message,
    });
  }
};

// ==================================================
// PRINT BILL
// GET /api/pos-billing/:id/print
// ==================================================

exports.printBill = async (req, res) => {
  try {
    const bill = await POSBill.findById(req.params.id)
      .populate("restaurant")
      .populate("store")
      .populate("customer")
      .populate("waiter")
      .populate("table")
      .populate("items.product");

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "POS bill not found",
      });
    }

    return res.json({
      success: true,
      message: "Bill print data generated successfully",
      data: {
        restaurant: bill.restaurant,
        store: bill.store,

        billNo: bill.billNo,
        date: bill.createdAt,

        customer: {
          id: bill.customer?._id,
          name: bill.customerName,
          phone: bill.customerPhone,
        },

        orderType: bill.orderType,

        items: bill.items,

        subTotal: bill.subTotal,
        itemDiscount: bill.itemDiscount,
        billDiscount: bill.billDiscountAmount,
        couponDiscount: bill.couponDiscount,

        taxableAmount: bill.taxableAmount,

        cgst: bill.cgstAmount,
        sgst: bill.sgstAmount,
        igst: bill.igstAmount,

        totalTax: bill.totalTax,

        grandTotal: bill.grandTotal,
        roundOff: bill.roundOff,
        netAmount: bill.netAmount,

        paidAmount: bill.paidAmount,
        balanceAmount: bill.balanceAmount,

        paymentStatus: bill.paymentStatus,
        payments: bill.payments,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to generate print data",
      error: error.message,
    });
  }
};

// ==================================================
// CANCEL BILL
// PATCH /api/pos-billing/:id/cancel
// ==================================================

exports.cancelBill = async (req, res) => {
  try {
    const { cancelReason } = req.body;

    if (!cancelReason) {
      return res.status(400).json({
        success: false,
        message: "Cancellation reason is required",
      });
    }

    const bill = await POSBill.findById(req.params.id);

    if (!bill) {
      return res.status(404).json({
        success: false,
        message: "POS bill not found",
      });
    }

    if (bill.status === "CANCELLED") {
      return res.status(400).json({
        success: false,
        message: "Bill is already cancelled",
      });
    }

    if (bill.paymentStatus === "PAID") {
      return res.status(400).json({
        success: false,
        message:
          "Paid bill cannot be cancelled directly. Process a refund first.",
      });
    }

    bill.status = "CANCELLED";
    bill.cancelReason = cancelReason;
    bill.cancelledAt = new Date();
    bill.cancelledBy = req.user?._id || null;

    await bill.save();

    return res.json({
      success: true,
      message: "POS bill cancelled successfully",
      data: bill,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to cancel POS bill",
      error: error.message,
    });
  }
};