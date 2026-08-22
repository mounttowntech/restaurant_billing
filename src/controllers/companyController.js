const Company = require("../models/companyModel");

// =====================================================
// CREATE COMPANY
// =====================================================

exports.createCompany = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const {
      companyCode,
      companyName,
      legalName,
      ownerName,
      email,
      phone,
      alternatePhone,
      gstNumber,
      panNumber,
      address,
      area,
      city,
      state,
      country,
      pincode,
      currency,
      currencySymbol,
      timezone,
      logo,
      status,
    } = req.body;

    // ==========================================
    // Required Fields
    // ==========================================

    if (!companyCode) {
      return res.status(400).json({
        success: false,
        message: "Company code is required",
      });
    }

    if (!companyName) {
      return res.status(400).json({
        success: false,
        message: "Company name is required",
      });
    }

    if (!ownerName) {
      return res.status(400).json({
        success: false,
        message: "Owner name is required",
      });
    }

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone is required",
      });
    }

    // ==========================================
    // Check Duplicate Code
    // ==========================================

    const existingCompany = await Company.findOne({
      companyCode: companyCode.toUpperCase(),
    });

    if (existingCompany) {
      return res.status(400).json({
        success: false,
        message: "Company code already exists",
      });
    }

    // ==========================================
    // Create Company
    // ==========================================

    const company = await Company.create({
      companyCode: companyCode.toUpperCase(),

      companyName,

      legalName: legalName || "",

      ownerName,

      email: email || "",

      phone,

      alternatePhone: alternatePhone || "",

      gstNumber: gstNumber || "",

      panNumber: panNumber || "",

      address: address || "",

      area: area || "",

      city: city || "",

      state: state || "",

      country: country || "India",

      pincode: pincode || "",

      currency: currency || "INR",

      currencySymbol: currencySymbol || "₹",

      timezone: timezone || "Asia/Kolkata",

      logo: logo || "",

      status: status || "Active",

      createdBy: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: "Company created successfully",
      data: company,
    });
  } catch (error) {
    console.error("CREATE COMPANY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// GET ALL COMPANIES
// =====================================================

exports.getAllCompanies = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const filter = {
      isDeleted: false,
    };

    // Search
    if (req.query.search) {
      filter.$or = [
        {
          companyName: {
            $regex: req.query.search,
            $options: "i",
          },
        },
        {
          companyCode: {
            $regex: req.query.search,
            $options: "i",
          },
        },
      ];
    }

    // Status
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const companies = await Company.find(filter)
      .populate("createdBy", "firstName lastName email")
      .populate("updatedBy", "firstName lastName email")
      .sort({
        createdAt: -1,
      });

    return res.json({
      success: true,
      count: companies.length,
      data: companies,
    });
  } catch (error) {
    console.error("GET COMPANIES ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// GET COMPANY BY ID
// =====================================================

exports.getCompanyById = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const company = await Company.findOne({
      _id: req.params.id,
      isDeleted: false,
    })
      .populate("createdBy", "firstName lastName email")
      .populate("updatedBy", "firstName lastName email");

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    return res.json({
      success: true,
      data: company,
    });
  } catch (error) {
    console.error("GET COMPANY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// UPDATE COMPANY
// =====================================================

exports.updateCompany = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const company = await Company.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    // Don't allow companyCode modification
    if (req.body.companyCode) {
      return res.status(400).json({
        success: false,
        message: "Company code cannot be changed",
      });
    }

    const allowedFields = [
      "companyName",
      "legalName",
      "ownerName",
      "email",
      "phone",
      "alternatePhone",
      "gstNumber",
      "panNumber",
      "address",
      "area",
      "city",
      "state",
      "country",
      "pincode",
      "currency",
      "currencySymbol",
      "timezone",
      "logo",
      "status",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        company[field] = req.body[field];
      }
    });

    company.updatedBy = req.user._id;

    await company.save();

    return res.json({
      success: true,
      message: "Company updated successfully",
      data: company,
    });
  } catch (error) {
    console.error("UPDATE COMPANY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// DELETE COMPANY
// =====================================================

exports.deleteCompany = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const company = await Company.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    company.isDeleted = true;

    company.updatedBy = req.user._id;

    await company.save();

    return res.json({
      success: true,
      message: "Company deleted successfully",
    });
  } catch (error) {
    console.error("DELETE COMPANY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// RESTORE COMPANY
// =====================================================

exports.restoreCompany = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    company.isDeleted = false;

    company.updatedBy = req.user._id;

    await company.save();

    return res.json({
      success: true,
      message: "Company restored successfully",
      data: company,
    });
  } catch (error) {
    console.error("RESTORE COMPANY ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =====================================================
// TOGGLE COMPANY STATUS
// =====================================================

exports.toggleCompanyStatus = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    company.status = company.status === "Active" ? "Inactive" : "Active";

    company.updatedBy = req.user._id;

    await company.save();

    return res.json({
      success: true,
      message: "Company status updated successfully",
      data: company,
    });
  } catch (error) {
    console.error("TOGGLE COMPANY STATUS ERROR:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
