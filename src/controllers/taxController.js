const Tax = require("../models/Tax");

/* ==========================================================
   Create Tax
========================================================== */

exports.createTax = async (req, res) => {
  try {
    const { taxName, taxPercent, isDefault } = req.body;

    if (!taxName || taxPercent === undefined) {
      return res.status(400).json({
        success: false,
        message: "Tax name and tax percentage are required.",
      });
    }

    const existingTax = await Tax.findOne({
      taxName: {
        $regex: new RegExp(`^${taxName}$`, "i"),
      },
    });

    if (existingTax) {
      return res.status(400).json({
        success: false,
        message: "Tax already exists.",
      });
    }

    // Only one default tax
    if (isDefault) {
      await Tax.updateMany({}, { isDefault: false });
    }

    const tax = await Tax.create({
      taxName,
      taxPercent,
      isDefault: isDefault || false,
    });

    res.status(201).json({
      success: true,
      message: "Tax created successfully.",
      data: tax,
    });
  } catch (error) {
    console.error("createTax:", error);

    res.status(500).json({
      success: false,
      message: "Failed to create tax.",
      error: error.message,
    });
  }
};

/* ==========================================================
   Get All Taxes
========================================================== */

exports.getTaxes = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const filter = {};

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const totalRecords = await Tax.countDocuments(filter);

    const taxes = await Tax.find(filter)
      .sort({
        isDefault: -1,
        taxPercent: 1,
      })
      .skip((page - 1) * limit)
      .limit(limit);

    res.status(200).json({
      success: true,
      totalRecords,
      currentPage: page,
      totalPages: Math.ceil(totalRecords / limit),
      count: taxes.length,
      data: taxes,
    });
  } catch (error) {
    console.error("getTaxes:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch taxes.",
      error: error.message,
    });
  }
};

/* ==========================================================
   Get Tax By Id
========================================================== */

exports.getTaxById = async (req, res) => {
  try {
    const tax = await Tax.findById(req.params.id);

    if (!tax) {
      return res.status(404).json({
        success: false,
        message: "Tax not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: tax,
    });
  } catch (error) {
    console.error("getTaxById:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch tax.",
      error: error.message,
    });
  }
};

exports.updateTax = async (req, res) => {
  try {
    const { id } = req.params;

    const { taxName, taxPercent, isDefault, status } = req.body;

    const tax = await Tax.findById(id);

    if (!tax) {
      return res.status(404).json({
        success: false,

        message: "Tax not found.",
      });
    }

    // Check duplicate tax name

    if (taxName) {
      const existingTax = await Tax.findOne({
        _id: { $ne: id },

        taxName: {
          $regex: new RegExp(`^${taxName}$`, "i"),
        },
      });

      if (existingTax) {
        return res.status(400).json({
          success: false,

          message: "Tax name already exists.",
        });
      }

      tax.taxName = taxName;
    }

    if (taxPercent !== undefined) {
      tax.taxPercent = taxPercent;
    }

    if (status) {
      tax.status = status;
    }

    if (isDefault !== undefined) {
      if (isDefault) {
        await Tax.updateMany({}, { isDefault: false });
      }

      tax.isDefault = isDefault;
    }

    await tax.save();

    res.status(200).json({
      success: true,

      message: "Tax updated successfully.",

      data: tax,
    });
  } catch (error) {
    console.error("updateTax:", error);

    res.status(500).json({
      success: false,

      message: "Failed to update tax.",

      error: error.message,
    });
  }
};

/* ==========================================================

   Delete Tax

========================================================== */

exports.deleteTax = async (req, res) => {
  try {
    const { id } = req.params;

    const tax = await Tax.findById(id);

    if (!tax) {
      return res.status(404).json({
        success: false,

        message: "Tax not found.",
      });
    }

    await Tax.findByIdAndDelete(id);

    res.status(200).json({
      success: true,

      message: "Tax deleted successfully.",
    });
  } catch (error) {
    console.error("deleteTax:", error);

    res.status(500).json({
      success: false,

      message: "Failed to delete tax.",

      error: error.message,
    });
  }
};

/* ==========================================================

   Update Tax Status

========================================================== */

exports.updateTaxStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const { status } = req.body;

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({
        success: false,

        message: "Invalid status.",
      });
    }

    const tax = await Tax.findById(id);

    if (!tax) {
      return res.status(404).json({
        success: false,

        message: "Tax not found.",
      });
    }

    tax.status = status;

    await tax.save();

    res.status(200).json({
      success: true,

      message: `Tax ${status} successfully.`,

      data: tax,
    });
  } catch (error) {
    console.error("updateTaxStatus:", error);

    res.status(500).json({
      success: false,

      message: "Failed to update tax status.",

      error: error.message,
    });
  }
};

/* ==========================================================

   Set Default Tax

========================================================== */

exports.setDefaultTax = async (req, res) => {
  try {
    const { id } = req.params;

    const tax = await Tax.findById(id);

    if (!tax) {
      return res.status(404).json({
        success: false,

        message: "Tax not found.",
      });
    }

    // Remove default from all taxes

    await Tax.updateMany({}, { isDefault: false });

    // Set selected tax as default

    tax.isDefault = true;

    await tax.save();

    res.status(200).json({
      success: true,

      message: "Default tax updated successfully.",

      data: tax,
    });
  } catch (error) {
    console.error("setDefaultTax:", error);

    res.status(500).json({
      success: false,

      message: "Failed to set default tax.",

      error: error.message,
    });
  }
};




exports.searchTaxes = async (req, res) => {

  try {

    const {

      keyword,

      status,

      isDefault,

      page = 1,

      limit = 10,

    } = req.query;



    const filter = {};



    if (keyword) {

      filter.taxName = {

        $regex: keyword,

        $options: "i",

      };

    }



    if (status) {

      filter.status = status;

    }



    if (isDefault !== undefined) {

      filter.isDefault = isDefault === "true";

    }



    const totalRecords = await Tax.countDocuments(filter);



    const taxes = await Tax.find(filter)

      .sort({

        isDefault: -1,

        taxPercent: 1,

      })

      .skip((page - 1) * limit)

      .limit(Number(limit));



    res.status(200).json({

      success: true,

      totalRecords,

      currentPage: Number(page),

      totalPages: Math.ceil(totalRecords / limit),

      count: taxes.length,

      data: taxes,

    });

  } catch (error) {

    console.error("searchTaxes:", error);



    res.status(500).json({

      success: false,

      message: "Failed to search taxes.",

      error: error.message,

    });

  }

};



/* ==========================================================

   Get Active Taxes

========================================================== */



exports.getActiveTaxes = async (req, res) => {

  try {

    const taxes = await Tax.find({

      status: "active",

    }).sort({

      taxPercent: 1,

    });



    res.status(200).json({

      success: true,

      count: taxes.length,

      data: taxes,

    });

  } catch (error) {

    console.error("getActiveTaxes:", error);



    res.status(500).json({

      success: false,

      message: "Failed to fetch active taxes.",

      error: error.message,

    });

  }

};



/* ==========================================================

   Get Inactive Taxes

========================================================== */



exports.getInactiveTaxes = async (req, res) => {

  try {

    const taxes = await Tax.find({

      status: "inactive",

    }).sort({

      taxPercent: 1,

    });



    res.status(200).json({

      success: true,

      count: taxes.length,

      data: taxes,

    });

  } catch (error) {

    console.error("getInactiveTaxes:", error);



    res.status(500).json({

      success: false,

      message: "Failed to fetch inactive taxes.",

      error: error.message,

    });

  }

};



/* ==========================================================

   Get Default Tax

========================================================== */



exports.getDefaultTax = async (req, res) => {

  try {

    const tax = await Tax.findOne({

      isDefault: true,

    });



    if (!tax) {

      return res.status(404).json({

        success: false,

        message: "Default tax not found.",

      });

    }



    res.status(200).json({

      success: true,

      data: tax,

    });

  } catch (error) {

    console.error("getDefaultTax:", error);



    res.status(500).json({

      success: false,

      message: "Failed to fetch default tax.",

      error: error.message,

    });

  }

};



/* ==========================================================

   Get Tax Summary

========================================================== */



exports.getTaxSummary = async (req, res) => {

  try {

    const [

      totalTaxes,

      activeTaxes,

      inactiveTaxes,

      defaultTaxes,

      averageTax,

      highestTax,

      lowestTax,

    ] = await Promise.all([

      Tax.countDocuments(),



      Tax.countDocuments({

        status: "active",

      }),



      Tax.countDocuments({

        status: "inactive",

      }),



      Tax.countDocuments({

        isDefault: true,

      }),



      Tax.aggregate([

        {

          $group: {

            _id: null,

            averageTax: {

              $avg: "$taxPercent",

            },

          },

        },

      ]),



      Tax.findOne().sort({

        taxPercent: -1,

      }),



      Tax.findOne().sort({

        taxPercent: 1,

      }),

    ]);



    res.status(200).json({

      success: true,

      data: {

        totalTaxes,

        activeTaxes,

        inactiveTaxes,

        defaultTaxes,



        averageTax:

          averageTax.length > 0

            ? Number(averageTax[0].averageTax.toFixed(2))

            : 0,



        highestTax,



        lowestTax,

      },

    });

  } catch (error) {

    console.error("getTaxSummary:", error);



    res.status(500).json({

      success: false,

      message: "Failed to fetch tax summary.",

      error: error.message,

    });

  }

};