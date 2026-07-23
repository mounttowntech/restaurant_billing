const Customer = require("../models/Customer");

/* ===========================================
   Create Customer
=========================================== */
exports.createCustomer = async (req, res) => {
  try {
    const customerCode = req.body.customerCode.toUpperCase();

    const exists = await Customer.findOne({
      customerCode,
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Customer code already exists.",
      });
    }

    const mobileExists = await Customer.findOne({
      mobile: req.body.mobile,
    });

    if (mobileExists) {
      return res.status(400).json({
        success: false,
        message: "Mobile number already exists.",
      });
    }

    const customer = await Customer.create({
      ...req.body,
      customerCode,
      email: req.body.email?.toLowerCase(),
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Customer created successfully.",
      data: customer,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* ===========================================
   Get All Customers
=========================================== */
exports.getAllCustomers = async (req, res) => {
  try {
    const customers = await Customer.find()
      .populate("restaurant", "restaurantName")
      .populate("store", "storeName")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: customers.length,
      data: customers,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* ===========================================
   Get Customer By Id
=========================================== */
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id)
      .populate("restaurant")
      .populate("store");

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }

    res.json({
      success: true,
      data: customer,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* ===========================================
   Update Customer
=========================================== */
exports.updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }

    if (req.body.customerCode) {
      const exists = await Customer.findOne({
        customerCode: req.body.customerCode.toUpperCase(),
        _id: { $ne: req.params.id },
      });

      if (exists) {
        return res.status(400).json({
          success: false,
          message: "Customer code already exists.",
        });
      }

      req.body.customerCode =
        req.body.customerCode.toUpperCase();
    }

    if (req.body.mobile) {
      const mobileExists = await Customer.findOne({
        mobile: req.body.mobile,
        _id: { $ne: req.params.id },
      });

      if (mobileExists) {
        return res.status(400).json({
          success: false,
          message: "Mobile already exists.",
        });
      }
    }

    if (req.body.email) {
      req.body.email = req.body.email.toLowerCase();
    }

    req.body.updatedBy = req.user._id;

    const updated = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.json({
      success: true,
      message: "Customer updated successfully.",
      data: updated,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* ===========================================
   Delete Customer (Soft Delete)
=========================================== */
exports.deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }

    customer.isDeleted = true;
    customer.updatedBy = req.user._id;

    await customer.save();

    res.json({
      success: true,
      message: "Customer deleted successfully.",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* ===========================================
   Change Status
=========================================== */
exports.changeCustomerStatus = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }

    customer.status = req.body.status;
    customer.updatedBy = req.user._id;

    await customer.save();

    res.json({
      success: true,
      message: "Customer status updated.",
      data: customer,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* ===========================================
   Customer Dropdown
=========================================== */
exports.customerDropdown = async (req, res) => {
  try {
    const customers = await Customer.find({
      status: "Active",
    })
      .select("_id customerName mobile customerCode")
      .sort({ customerName: 1 });

    res.json({
      success: true,
      data: customers,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* ===========================================
   Search Customer
=========================================== */
exports.searchCustomer = async (req, res) => {
  try {
    const keyword = req.query.keyword || "";

    const customers = await Customer.find({
      $or: [
        {
          customerName: {
            $regex: keyword,
            $options: "i",
          },
        },
        {
          mobile: {
            $regex: keyword,
            $options: "i",
          },
        },
        {
          customerCode: {
            $regex: keyword,
            $options: "i",
          },
        },
      ],
    });

    res.json({
      success: true,
      data: customers,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* ===========================================
   Add Loyalty Points
=========================================== */
exports.addLoyaltyPoints = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }

    customer.loyaltyPoints += Number(req.body.points || 0);

    await customer.save();

    res.json({
      success: true,
      message: "Loyalty points updated.",
      data: customer,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};