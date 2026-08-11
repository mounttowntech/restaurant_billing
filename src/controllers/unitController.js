const mongoose = require("mongoose");

const Unit = require("../models/unitModel");
const Restaurant = require("../models/Restaurant");

/* ==========================================================
   Create Unit
========================================================== */

exports.createUnit = async (req, res) => {
  try {
    const {
      restaurant,
      unitName,
      unitCode,
      description = "",
      unitType = "Quantity",
      conversionValue = 1,
      baseUnit = null,
    } = req.body;

    /* ======================================================
       Required Fields
    ====================================================== */

    if (!restaurant) {
      return res.status(400).json({
        success: false,
        message: "Restaurant is required.",
      });
    }

    if (!unitName) {
      return res.status(400).json({
        success: false,
        message: "Unit name is required.",
      });
    }

    if (!unitCode) {
      return res.status(400).json({
        success: false,
        message: "Unit code is required.",
      });
    }

    /* ======================================================
       Validate Restaurant
    ====================================================== */

    if (!mongoose.Types.ObjectId.isValid(restaurant)) {
      return res.status(400).json({
        success: false,
        message: "Invalid restaurant ID.",
      });
    }

    const restaurantExists =
      await Restaurant.findById(restaurant);

    if (!restaurantExists) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found.",
      });
    }

    /* ======================================================
       Validate Base Unit
    ====================================================== */

    if (baseUnit) {
      if (!mongoose.Types.ObjectId.isValid(baseUnit)) {
        return res.status(400).json({
          success: false,
          message: "Invalid base unit ID.",
        });
      }

      const baseUnitExists = await Unit.findOne({
        _id: baseUnit,
        restaurant,
        isDeleted: false,
      });

      if (!baseUnitExists) {
        return res.status(404).json({
          success: false,
          message: "Base unit not found.",
        });
      }
    }

    /* ======================================================
       Check Duplicate Unit Name
    ====================================================== */

    const existingName = await Unit.findOne({
      restaurant,
      unitName: unitName.trim(),
      isDeleted: false,
    });

    if (existingName) {
      return res.status(400).json({
        success: false,
        message: "Unit name already exists.",
      });
    }

    /* ======================================================
       Check Duplicate Unit Code
    ====================================================== */

    const existingCode = await Unit.findOne({
      restaurant,
      unitCode: unitCode.trim().toUpperCase(),
      isDeleted: false,
    });

    if (existingCode) {
      return res.status(400).json({
        success: false,
        message: "Unit code already exists.",
      });
    }

    /* ======================================================
       Conversion Validation
    ====================================================== */

    const conversion = Number(conversionValue);

    if (conversion <= 0) {
      return res.status(400).json({
        success: false,
        message: "Conversion value must be greater than 0.",
      });
    }

    /* ======================================================
       Create Unit
    ====================================================== */

    const unit = await Unit.create({
      restaurant,
      unitName: unitName.trim(),
      unitCode: unitCode.trim().toUpperCase(),
      description,
      unitType,
      conversionValue: conversion,
      baseUnit,
      createdBy: req.user?.id || req.user?._id,
    });

    /* ======================================================
       Populate
    ====================================================== */

    const populatedUnit = await Unit.findById(unit._id)
      .populate(
        "restaurant",
        "restaurantName restaurantCode"
      )
      .populate(
        "baseUnit",
        "unitName unitCode unitType"
      )
      .populate(
        "createdBy",
        "name email"
      );

    return res.status(201).json({
      success: true,
      message: "Unit created successfully.",
      data: populatedUnit,
    });
  } catch (error) {
    console.error("createUnit:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create unit.",
      error: error.message,
    });
  }
};

/* ==========================================================
   Get All Units
========================================================== */

exports.getUnits = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      restaurant,
      unitType,
      isActive,
      search,
    } = req.query;

    const filter = {
      isDeleted: false,
    };

    /* ======================================================
       Restaurant Filter
    ====================================================== */

    if (restaurant) {
      filter.restaurant = restaurant;
    }

    /* ======================================================
       Unit Type Filter
    ====================================================== */

    if (unitType) {
      filter.unitType = unitType;
    }

    /* ======================================================
       Active Filter
    ====================================================== */

    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    /* ======================================================
       Search
    ====================================================== */

    if (search) {
      filter.$or = [
        {
          unitName: {
            $regex: search,
            $options: "i",
          },
        },
        {
          unitCode: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    /* ======================================================
       Pagination
    ====================================================== */

    const pageNumber = Math.max(
      1,
      Number(page)
    );

    const pageLimit = Math.max(
      1,
      Number(limit)
    );

    const skip =
      (pageNumber - 1) * pageLimit;

    /* ======================================================
       Count
    ====================================================== */

    const totalRecords =
      await Unit.countDocuments(filter);

    /* ======================================================
       Get Units
    ====================================================== */

    const units = await Unit.find(filter)
      .populate(
        "restaurant",
        "restaurantName restaurantCode"
      )
      .populate(
        "baseUnit",
        "unitName unitCode unitType"
      )
      .populate(
        "createdBy",
        "name email"
      )
      .populate(
        "updatedBy",
        "name email"
      )
      .sort({
        unitName: 1,
      })
      .skip(skip)
      .limit(pageLimit);

    return res.status(200).json({
      success: true,

      totalRecords,

      currentPage: pageNumber,

      totalPages: Math.ceil(
        totalRecords / pageLimit
      ),

      count: units.length,

      data: units,
    });
  } catch (error) {
    console.error("getUnits:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch units.",
      error: error.message,
    });
  }
};

/* ==========================================================
   Get Unit By ID
========================================================== */

exports.getUnitById = async (req, res) => {
  try {
    const { id } = req.params;

    /* ======================================================
       Validate ObjectId
    ====================================================== */

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid unit ID.",
      });
    }

    /* ======================================================
       Find Unit
    ====================================================== */

    const unit = await Unit.findOne({
      _id: id,
      isDeleted: false,
    })
      .populate(
        "restaurant",
        "restaurantName restaurantCode"
      )
      .populate(
        "baseUnit",
        "unitName unitCode unitType conversionValue"
      )
      .populate(
        "createdBy",
        "name email"
      )
      .populate(
        "updatedBy",
        "name email"
      );

    if (!unit) {
      return res.status(404).json({
        success: false,
        message: "Unit not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: unit,
    });
  } catch (error) {
    console.error("getUnitById:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch unit.",
      error: error.message,
    });
  }
};

/* ==========================================================
   Update Unit
========================================================== */

exports.updateUnit = async (req, res) => {
  try {
    const { id } = req.params;

    /* ======================================================
       Validate ObjectId
    ====================================================== */

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid unit ID.",
      });
    }

    /* ======================================================
       Find Unit
    ====================================================== */

    const unit = await Unit.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!unit) {
      return res.status(404).json({
        success: false,
        message: "Unit not found.",
      });
    }

    /* ======================================================
       Unit Name
    ====================================================== */

    if (req.body.unitName !== undefined) {
      const unitName =
        req.body.unitName.trim();

      const duplicateName =
        await Unit.findOne({
          _id: { $ne: id },
          restaurant: unit.restaurant,
          unitName,
          isDeleted: false,
        });

      if (duplicateName) {
        return res.status(400).json({
          success: false,
          message: "Unit name already exists.",
        });
      }

      unit.unitName = unitName;
    }

    /* ======================================================
       Unit Code
    ====================================================== */

    if (req.body.unitCode !== undefined) {
      const unitCode =
        req.body.unitCode
          .trim()
          .toUpperCase();

      const duplicateCode =
        await Unit.findOne({
          _id: { $ne: id },
          restaurant: unit.restaurant,
          unitCode,
          isDeleted: false,
        });

      if (duplicateCode) {
        return res.status(400).json({
          success: false,
          message: "Unit code already exists.",
        });
      }

      unit.unitCode = unitCode;
    }

    /* ======================================================
       Other Fields
    ====================================================== */

    const allowedFields = [
      "description",
      "unitType",
      "conversionValue",
      "baseUnit",
      "isActive",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        unit[field] = req.body[field];
      }
    });

    /* ======================================================
       Conversion Validation
    ====================================================== */

    if (
      Number(unit.conversionValue) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Conversion value must be greater than 0.",
      });
    }

    /* ======================================================
       Base Unit Validation
    ====================================================== */

    if (unit.baseUnit) {
      if (
        unit.baseUnit.toString() ===
        unit._id.toString()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "A unit cannot be its own base unit.",
        });
      }

      const baseUnitExists =
        await Unit.findOne({
          _id: unit.baseUnit,
          restaurant: unit.restaurant,
          isDeleted: false,
        });

      if (!baseUnitExists) {
        return res.status(404).json({
          success: false,
          message: "Base unit not found.",
        });
      }
    }

    unit.updatedBy =
      req.user?.id ||
      req.user?._id;

    await unit.save();

    /* ======================================================
       Populate
    ====================================================== */

    const updatedUnit =
      await Unit.findById(unit._id)
        .populate(
          "restaurant",
          "restaurantName restaurantCode"
        )
        .populate(
          "baseUnit",
          "unitName unitCode unitType"
        )
        .populate(
          "createdBy",
          "name email"
        )
        .populate(
          "updatedBy",
          "name email"
        );

    return res.status(200).json({
      success: true,
      message: "Unit updated successfully.",
      data: updatedUnit,
    });
  } catch (error) {
    console.error("updateUnit:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update unit.",
      error: error.message,
    });
  }
};

/* ==========================================================
   Delete Unit
========================================================== */

exports.deleteUnit = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid unit ID.",
      });
    }

    const unit = await Unit.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!unit) {
      return res.status(404).json({
        success: false,
        message: "Unit not found.",
      });
    }

    unit.isDeleted = true;

    unit.isActive = false;

    unit.updatedBy =
      req.user?.id ||
      req.user?._id;

    await unit.save();

    return res.status(200).json({
      success: true,
      message: "Unit deleted successfully.",
    });
  } catch (error) {
    console.error("deleteUnit:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete unit.",
      error: error.message,
    });
  }
};

/* ==========================================================
   Restore Unit
========================================================== */

exports.restoreUnit = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid unit ID.",
      });
    }

    const unit = await Unit.findOne({
      _id: id,
      isDeleted: true,
    });

    if (!unit) {
      return res.status(404).json({
        success: false,
        message:
          "Deleted unit not found.",
      });
    }

    /* ======================================================
       Check Duplicate Name
    ====================================================== */

    const duplicateName =
      await Unit.findOne({
        _id: { $ne: id },
        restaurant: unit.restaurant,
        unitName: unit.unitName,
        isDeleted: false,
      });

    if (duplicateName) {
      return res.status(400).json({
        success: false,
        message:
          "Another active unit already uses this unit name.",
      });
    }

    /* ======================================================
       Check Duplicate Code
    ====================================================== */

    const duplicateCode =
      await Unit.findOne({
        _id: { $ne: id },
        restaurant: unit.restaurant,
        unitCode: unit.unitCode,
        isDeleted: false,
      });

    if (duplicateCode) {
      return res.status(400).json({
        success: false,
        message:
          "Another active unit already uses this unit code.",
      });
    }

    unit.isDeleted = false;

    unit.isActive = true;

    unit.updatedBy =
      req.user?.id ||
      req.user?._id;

    await unit.save();

    return res.status(200).json({
      success: true,
      message: "Unit restored successfully.",
      data: unit,
    });
  } catch (error) {
    console.error("restoreUnit:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to restore unit.",
      error: error.message,
    });
  }
};

/* ==========================================================
   Activate Unit
========================================================== */

exports.activateUnit = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid unit ID.",
      });
    }

    const unit = await Unit.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!unit) {
      return res.status(404).json({
        success: false,
        message: "Unit not found.",
      });
    }

    unit.isActive = true;

    unit.updatedBy =
      req.user?.id ||
      req.user?._id;

    await unit.save();

    return res.status(200).json({
      success: true,
      message: "Unit activated successfully.",
      data: unit,
    });
  } catch (error) {
    console.error("activateUnit:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
   Deactivate Unit
========================================================== */

exports.deactivateUnit = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid unit ID.",
      });
    }

    const unit = await Unit.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!unit) {
      return res.status(404).json({
        success: false,
        message: "Unit not found.",
      });
    }

    unit.isActive = false;

    unit.updatedBy =
      req.user?.id ||
      req.user?._id;

    await unit.save();

    return res.status(200).json({
      success: true,
      message:
        "Unit deactivated successfully.",
      data: unit,
    });
  } catch (error) {
    console.error("deactivateUnit:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
   Search Unit
========================================================== */

exports.searchUnit = async (req, res) => {
  try {
    const {
      keyword = "",
      restaurant,
    } = req.query;

    const filter = {
      isDeleted: false,
      $or: [
        {
          unitName: {
            $regex: keyword,
            $options: "i",
          },
        },
        {
          unitCode: {
            $regex: keyword,
            $options: "i",
          },
        },
      ],
    };

    if (restaurant) {
      filter.restaurant = restaurant;
    }

    const units = await Unit.find(filter)
      .populate(
        "restaurant",
        "restaurantName restaurantCode"
      )
      .populate(
        "baseUnit",
        "unitName unitCode"
      )
      .sort({
        unitName: 1,
      });

    return res.status(200).json({
      success: true,
      count: units.length,
      data: units,
    });
  } catch (error) {
    console.error("searchUnit:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to search units.",
      error: error.message,
    });
  }
};