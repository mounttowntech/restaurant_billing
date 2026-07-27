const InventoryAdjustment = require("../models/inventoryAdjustmentModel");
const Ingredient = require("../models/Ingredient");
const MenuItem = require("../models/MenuItem");
const User = require("../models/User");

/* ==========================================================
   Create Inventory Adjustment
========================================================== */

exports.createInventoryAdjustment = async (req, res) => {
  try {
    const {
      adjustmentNumber,
      adjustmentDate,
      restaurant,
      store,
      warehouse,
      kitchen,
      shift,
      adjustedBy,
      adjustmentType,
      adjustmentReason,
      remarks,
      adjustmentItems,
      attachments,
      approvalRequired,
    } = req.body;

    /* ======================================================
       Required Validation
    ====================================================== */

    if (!adjustmentNumber) {
      return res.status(400).json({
        success: false,
        message: "Adjustment Number is required.",
      });
    }

    if (!restaurant) {
      return res.status(400).json({
        success: false,
        message: "Restaurant is required.",
      });
    }

    if (!store) {
      return res.status(400).json({
        success: false,
        message: "Store is required.",
      });
    }

    if (!adjustedBy) {
      return res.status(400).json({
        success: false,
        message: "Adjusted By is required.",
      });
    }

    if (!adjustmentType) {
      return res.status(400).json({
        success: false,
        message: "Adjustment Type is required.",
      });
    }

    if (!adjustmentReason) {
      return res.status(400).json({
        success: false,
        message: "Adjustment Reason is required.",
      });
    }

    if (!warehouse && !kitchen) {
      return res.status(400).json({
        success: false,
        message:
          "Either Warehouse or Kitchen must be selected.",
      });
    }

    if (
      !adjustmentItems ||
      !Array.isArray(adjustmentItems) ||
      adjustmentItems.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "At least one adjustment item is required.",
      });
    }

    /* ======================================================
       Duplicate Adjustment Number
    ====================================================== */

    const alreadyExists =
      await InventoryAdjustment.findOne({
        adjustmentNumber:
          adjustmentNumber.trim().toUpperCase(),
      });

    if (alreadyExists) {
      return res.status(409).json({
        success: false,
        message:
          "Adjustment Number already exists.",
      });
    }

    /* ======================================================
       Validate Adjusted By User
    ====================================================== */

    const employee = await User.findById(adjustedBy);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Adjusted By user not found.",
      });
    }

    /* ======================================================
       Initialize Arrays
    ====================================================== */

    const processedItems = [];
    const processedAttachments = [];

    let totalStockBefore = 0;
    let totalStockAfter = 0;
    let totalQuantityDifference = 0;

    let totalIncreaseQuantity = 0;
    let totalDecreaseQuantity = 0;

    let totalAdjustmentCost = 0;
    let totalIncreaseCost = 0;
    let totalDecreaseCost = 0;

    let totalUnitCost = 0;

       /* ======================================================
       Process Adjustment Items
    ====================================================== */

    for (const item of adjustmentItems) {
      /* ------------------------------------------
         Basic Validation
      ------------------------------------------ */

      if (!item.itemType) {
        return res.status(400).json({
          success: false,
          message: "Item Type is required.",
        });
      }

      if (!item.itemName) {
        return res.status(400).json({
          success: false,
          message: "Item Name is required.",
        });
      }

      if (!item.unit) {
        return res.status(400).json({
          success: false,
          message: `${item.itemName}: Unit is required.`,
        });
      }

      /* ------------------------------------------
         Validate Item Reference
      ------------------------------------------ */

      if (item.itemType === "Ingredient") {
        if (!item.ingredient) {
          return res.status(400).json({
            success: false,
            message: `${item.itemName}: Ingredient is required.`,
          });
        }

        const ingredient = await Ingredient.findById(
          item.ingredient
        );

        if (!ingredient) {
          return res.status(404).json({
            success: false,
            message: `${item.itemName}: Ingredient not found.`,
          });
        }
      }

      if (item.itemType === "Menu Item") {
        if (!item.menuItem) {
          return res.status(400).json({
            success: false,
            message: `${item.itemName}: Menu Item is required.`,
          });
        }

        const menuItem = await MenuItem.findById(
          item.menuItem
        );

        if (!menuItem) {
          return res.status(404).json({
            success: false,
            message: `${item.itemName}: Menu Item not found.`,
          });
        }
      }

      /* ------------------------------------------
         Stock Validation
      ------------------------------------------ */

      const stockBefore = Number(item.stockBefore || 0);
      const physicalStock = Number(item.physicalStock || 0);
      const unitCost = Number(item.unitCost || 0);

      if (stockBefore < 0 || physicalStock < 0) {
        return res.status(400).json({
          success: false,
          message: `${item.itemName}: Invalid stock value.`,
        });
      }

      if (unitCost < 0) {
        return res.status(400).json({
          success: false,
          message: `${item.itemName}: Invalid unit cost.`,
        });
      }

      /* ------------------------------------------
         Calculate Difference
      ------------------------------------------ */

      const quantityDifference =
        physicalStock - stockBefore;

      const adjustmentQuantity =
        Math.abs(quantityDifference);

      const adjustmentDirection =
        quantityDifference >= 0
          ? "Increase"
          : "Decrease";

      if (
        adjustmentDirection === "Decrease" &&
        adjustmentQuantity > stockBefore
      ) {
        return res.status(400).json({
          success: false,
          message: `${item.itemName}: Insufficient stock.`,
        });
      }

      const stockAfter = physicalStock;

      const totalCost =
        adjustmentQuantity * unitCost;

      /* ------------------------------------------
         Running Totals
      ------------------------------------------ */

      totalStockBefore += stockBefore;
      totalStockAfter += stockAfter;

      totalQuantityDifference +=
        quantityDifference;

      totalAdjustmentCost += totalCost;

      totalUnitCost += unitCost;

      if (adjustmentDirection === "Increase") {
        totalIncreaseQuantity += adjustmentQuantity;
        totalIncreaseCost += totalCost;
      } else {
        totalDecreaseQuantity += adjustmentQuantity;
        totalDecreaseCost += totalCost;
      }

      /* ------------------------------------------
         Push Processed Item
      ------------------------------------------ */

      processedItems.push({
        itemType: item.itemType,
        ingredient: item.ingredient || null,
        menuItem: item.menuItem || null,
        category: item.category || null,
        unit: item.unit,
        itemCode: item.itemCode,
        itemName: item.itemName,
        batchNo: item.batchNo,
        expiryDate: item.expiryDate,

        stockBefore,
        physicalStock,
        stockAfter,

        quantityDifference,
        adjustmentQuantity,
        adjustmentDirection,

        unitCost,
        totalCost,

        remarks: item.remarks || "",
      });
    }

       /* ======================================================
       Process Attachments
    ====================================================== */

    if (
      attachments &&
      Array.isArray(attachments) &&
      attachments.length > 0
    ) {
      for (const file of attachments) {
        if (!file.fileName || !file.fileUrl) {
          return res.status(400).json({
            success: false,
            message:
              "Attachment fileName and fileUrl are required.",
          });
        }

        processedAttachments.push({
          fileName: file.fileName,
          originalName:
            file.originalName || file.fileName,
          fileUrl: file.fileUrl,
          fileType: file.fileType || "other",
          fileSize: Number(file.fileSize || 0),
          description: file.description || "",
          uploadedBy:
            file.uploadedBy || adjustedBy,
          uploadedAt:
            file.uploadedAt || new Date(),
        });
      }
    }

    /* ======================================================
       Calculate Average Unit Cost
    ====================================================== */

    const averageUnitCost =
      processedItems.length > 0
        ? Number(
            (
              totalUnitCost /
              processedItems.length
            ).toFixed(2)
          )
        : 0;

    /* ======================================================
       Determine Initial Approval Status
    ====================================================== */

    let approvalStatus = "Pending";
    let status = "Draft";
    let approvedAt = null;
    let approvedBy = null;

    if (approvalRequired === false) {
      approvalStatus = "Approved";
      status = "Approved";
      approvedAt = new Date();
      approvedBy = adjustedBy;
    } else {
      status = "Pending";
    }

    /* ======================================================
       Round Summary Values
    ====================================================== */

    totalStockBefore = Number(
      totalStockBefore.toFixed(2)
    );

    totalStockAfter = Number(
      totalStockAfter.toFixed(2)
    );

    totalQuantityDifference = Number(
      totalQuantityDifference.toFixed(2)
    );

    totalIncreaseQuantity = Number(
      totalIncreaseQuantity.toFixed(2)
    );

    totalDecreaseQuantity = Number(
      totalDecreaseQuantity.toFixed(2)
    );

    totalAdjustmentCost = Number(
      totalAdjustmentCost.toFixed(2)
    );

    totalIncreaseCost = Number(
      totalIncreaseCost.toFixed(2)
    );

    totalDecreaseCost = Number(
      totalDecreaseCost.toFixed(2)
    );

        /* ======================================================
       Create Inventory Adjustment Document
    ====================================================== */

    const inventoryAdjustment =
      new InventoryAdjustment({
        adjustmentNumber:
          adjustmentNumber
            .trim()
            .toUpperCase(),

        adjustmentDate:
          adjustmentDate || new Date(),

        /* ==========================================
           Restaurant Information
        ========================================== */

        restaurant,
        store,
        warehouse: warehouse || null,
        kitchen: kitchen || null,
        shift: shift || null,

        /* ==========================================
           Employee Information
        ========================================== */

        adjustedBy,

        /* ==========================================
           Adjustment Details
        ========================================== */

        adjustmentType,
        adjustmentReason,
        remarks: remarks || "",

        /* ==========================================
           Items & Attachments
        ========================================== */

        adjustmentItems: processedItems,
        attachments: processedAttachments,

        /* ==========================================
           Stock Summary
        ========================================== */

        totalStockBefore,
        totalStockAfter,
        totalQuantityDifference,
        totalIncreaseQuantity,
        totalDecreaseQuantity,

        /* ==========================================
           Cost Summary
        ========================================== */

        totalAdjustmentCost,
        totalIncreaseCost,
        totalDecreaseCost,
        averageUnitCost,

        /* ==========================================
           Approval
        ========================================== */

        approvalRequired:
          approvalRequired !== undefined
            ? approvalRequired
            : true,

        approvalStatus,
        approvedBy,
        approvedAt,

        rejectionReason: "",

        /* ==========================================
           Status
        ========================================== */

        status,
        stockUpdated: false,
        ledgerUpdated: false,

        /* ==========================================
           Soft Delete
        ========================================== */

        isDeleted: false,
        deletedAt: null,
        deletedBy: null,

        /* ==========================================
           Audit Fields
        ========================================== */

        createdBy:
          req.user?._id ||
          req.user?.userId ||
          adjustedBy,

        updatedBy:
          req.user?._id ||
          req.user?.userId ||
          adjustedBy,
      });

       /* ======================================================
       Save Inventory Adjustment
    ====================================================== */

    await inventoryAdjustment.save();

    /* ======================================================
       Populate References
    ====================================================== */

    const savedAdjustment =
      await InventoryAdjustment.findById(
        inventoryAdjustment._id
      )
        .populate(
          "restaurant",
          "restaurantName"
        )
        .populate(
          "store",
          "storeName"
        )
        .populate(
          "warehouse",
          "warehouseName"
        )
        .populate(
          "kitchen",
          "kitchenName"
        )
        .populate(
          "shift",
          "shiftName"
        )
        .populate(
          "adjustedBy",
          "name employeeCode email"
        )
        .populate(
          "approvedBy",
          "name employeeCode"
        )
        .populate(
          "createdBy",
          "name"
        )
        .populate(
          "updatedBy",
          "name"
        )
        .populate({
          path: "adjustmentItems.ingredient",
          select:
            "ingredientName ingredientCode currentStock",
        })
        .populate({
          path: "adjustmentItems.menuItem",
          select:
            "itemName itemCode sellingPrice",
        })
        .populate({
          path: "adjustmentItems.category",
          select: "categoryName",
        })
        .populate({
          path: "adjustmentItems.unit",
          select: "unitName unitCode",
        });

    /* ======================================================
       Success Response
    ====================================================== */

    return res.status(201).json({
      success: true,
      message:
        "Inventory Adjustment created successfully.",
      data: savedAdjustment,
    });

  } catch (error) {

    console.error(
      "Create Inventory Adjustment Error:",
      error
    );

    /* ===============================================
       Duplicate Key Error
    =============================================== */

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "Adjustment Number already exists.",
      });
    }

    /* ===============================================
       Mongoose Validation Error
    =============================================== */

    if (error.name === "ValidationError") {

      const errors = Object.values(
        error.errors
      ).map((err) => err.message);

      return res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors,
      });

    }

    /* ===============================================
       Cast Error
    =============================================== */

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message:
          `Invalid ${error.path}.`,
      });
    }

    /* ===============================================
       Default Server Error
    =============================================== */

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Internal Server Error.",
    });

  }
};
/* ==========================================================
   Get All Inventory Adjustments
========================================================== */

exports.getAllInventoryAdjustments = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      restaurant,
      store,
      warehouse,
      kitchen,
      adjustmentType,
      adjustmentReason,
      approvalStatus,
      status,
      adjustedBy,
      fromDate,
      toDate,
      sortBy = "adjustmentDate",
      order = "desc",
    } = req.query;

    /* ======================================================
       Pagination
    ====================================================== */

    const currentPage = Math.max(parseInt(page) || 1, 1);
    const perPage = Math.max(parseInt(limit) || 10, 1);
    const skip = (currentPage - 1) * perPage;

    /* ======================================================
       Build Filter
    ====================================================== */

    const filter = {
      isDeleted: false,
    };

    if (restaurant) filter.restaurant = restaurant;
    if (store) filter.store = store;
    if (warehouse) filter.warehouse = warehouse;
    if (kitchen) filter.kitchen = kitchen;
    if (adjustmentType) filter.adjustmentType = adjustmentType;
    if (adjustmentReason)
      filter.adjustmentReason = adjustmentReason;
    if (approvalStatus)
      filter.approvalStatus = approvalStatus;
    if (status) filter.status = status;
    if (adjustedBy) filter.adjustedBy = adjustedBy;

    /* ======================================================
       Date Filter
    ====================================================== */

    if (fromDate || toDate) {
      filter.adjustmentDate = {};

      if (fromDate) {
        filter.adjustmentDate.$gte = new Date(fromDate);
      }

      if (toDate) {
        const endDate = new Date(toDate);
        endDate.setHours(23, 59, 59, 999);

        filter.adjustmentDate.$lte = endDate;
      }
    }

    /* ======================================================
       Search
    ====================================================== */

    if (search) {
      filter.$or = [
        {
          adjustmentNumber: {
            $regex: search,
            $options: "i",
          },
        },
        {
          remarks: {
            $regex: search,
            $options: "i",
          },
        },
        {
          "adjustmentItems.itemName": {
            $regex: search,
            $options: "i",
          },
        },
        {
          "adjustmentItems.itemCode": {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    /* ======================================================
       Sorting
    ====================================================== */

    const sort = {
      [sortBy]: order === "asc" ? 1 : -1,
    };

    /* ======================================================
       Query
    ====================================================== */

    const adjustments =
      await InventoryAdjustment.find(filter)
        .populate("restaurant", "restaurantName")
        .populate("store", "storeName")
        .populate("warehouse", "warehouseName")
        .populate("kitchen", "kitchenName")
        .populate("shift", "shiftName")
        .populate(
          "adjustedBy",
          "name employeeCode"
        )
        .populate(
          "approvedBy",
          "name employeeCode"
        )
        .populate(
          "createdBy",
          "name"
        )
        .populate(
          "updatedBy",
          "name"
        )
        .sort(sort)
        .skip(skip)
        .limit(perPage);

    /* ======================================================
       Count
    ====================================================== */

    const totalRecords =
      await InventoryAdjustment.countDocuments(
        filter
      );

    const totalPages = Math.ceil(
      totalRecords / perPage
    );

    /* ======================================================
       Response
    ====================================================== */

    return res.status(200).json({
      success: true,
      message:
        "Inventory Adjustments fetched successfully.",
      pagination: {
        totalRecords,
        totalPages,
        currentPage,
        perPage,
        hasNextPage:
          currentPage < totalPages,
        hasPrevPage:
          currentPage > 1,
      },
      data: adjustments,
    });
  } catch (error) {
    console.error(
      "Get Inventory Adjustments Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Internal Server Error.",
    });
  }
};
/* ==========================================================
   Get Inventory Adjustment By ID
========================================================== */

exports.getInventoryAdjustmentById = async (req, res) => {
  try {
    const { id } = req.params;

    /* ======================================================
       Validate ID
    ====================================================== */

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Inventory Adjustment ID is required.",
      });
    }

    /* ======================================================
       Find Inventory Adjustment
    ====================================================== */

    const adjustment = await InventoryAdjustment.findOne({
      _id: id,
      isDeleted: false,
    })
      .populate("restaurant", "restaurantName restaurantCode")
      .populate("store", "storeName storeCode")
      .populate("warehouse", "warehouseName warehouseCode")
      .populate("kitchen", "kitchenName kitchenCode")
      .populate("shift", "shiftName")

      .populate(
        "adjustedBy",
        "name employeeCode email phone"
      )

      .populate(
        "approvedBy",
        "name employeeCode"
      )

      .populate(
        "createdBy",
        "name employeeCode"
      )

      .populate(
        "updatedBy",
        "name employeeCode"
      )

      .populate({
        path: "adjustmentItems.ingredient",
        select:
          "ingredientCode ingredientName currentStock averageCost",
      })

      .populate({
        path: "adjustmentItems.menuItem",
        select:
          "itemCode itemName sellingPrice",
      })

      .populate({
        path: "adjustmentItems.category",
        select: "categoryName",
      })

      .populate({
        path: "adjustmentItems.unit",
        select: "unitName shortName",
      })

      .lean();

    /* ======================================================
       Not Found
    ====================================================== */

    if (!adjustment) {
      return res.status(404).json({
        success: false,
        message:
          "Inventory Adjustment not found.",
      });
    }

    /* ======================================================
       Additional Information
    ====================================================== */

    adjustment.totalItems =
      adjustment.adjustmentItems.length;

    adjustment.totalAttachments =
      adjustment.attachments.length;

    adjustment.canApprove =
      adjustment.approvalStatus === "Pending";

    adjustment.canReject =
      adjustment.approvalStatus === "Pending";

    adjustment.canComplete =
      adjustment.approvalStatus === "Approved" &&
      !adjustment.stockUpdated;

    adjustment.canCancel =
      adjustment.status !== "Completed" &&
      adjustment.status !== "Cancelled";

    /* ======================================================
       Success Response
    ====================================================== */

    return res.status(200).json({
      success: true,
      message:
        "Inventory Adjustment fetched successfully.",
      data: adjustment,
    });

  } catch (error) {

    console.error(
      "Get Inventory Adjustment By ID Error:",
      error
    );

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message:
          "Invalid Inventory Adjustment ID.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Internal Server Error.",
    });

  }
};

/* ==========================================================
   Update Inventory Adjustment
========================================================== */

exports.updateInventoryAdjustment = async (req, res) => {
  try {
    const { id } = req.params;

    /* ======================================================
       Find Inventory Adjustment
    ====================================================== */

    const adjustment =
      await InventoryAdjustment.findOne({
        _id: id,
        isDeleted: false,
      });

    if (!adjustment) {
      return res.status(404).json({
        success: false,
        message:
          "Inventory Adjustment not found.",
      });
    }

    /* ======================================================
       Completed / Cancelled Validation
    ====================================================== */

    if (
      adjustment.status === "Completed" ||
      adjustment.status === "Cancelled"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Completed/Cancelled adjustment cannot be updated.",
      });
    }

    /* ======================================================
       Extract Body
    ====================================================== */

    const {
      adjustmentDate,
      warehouse,
      kitchen,
      shift,
      adjustmentType,
      adjustmentReason,
      remarks,
      adjustmentItems,
      attachments,
      approvalRequired,
      updatedBy,
    } = req.body;

    /* ======================================================
       Header Update
    ====================================================== */

    if (adjustmentDate)
      adjustment.adjustmentDate =
        adjustmentDate;

    if (warehouse !== undefined)
      adjustment.warehouse = warehouse;

    if (kitchen !== undefined)
      adjustment.kitchen = kitchen;

    if (shift !== undefined)
      adjustment.shift = shift;

    if (adjustmentType)
      adjustment.adjustmentType =
        adjustmentType;

    if (adjustmentReason)
      adjustment.adjustmentReason =
        adjustmentReason;

    if (remarks !== undefined)
      adjustment.remarks = remarks;

    if (
      approvalRequired !== undefined
    ) {
      adjustment.approvalRequired =
        approvalRequired;
    }

    adjustment.updatedBy =
      updatedBy ||
      req.user?._id ||
      req.user?.userId;

    /* ======================================================
       Initialize Totals
    ====================================================== */

    let processedItems = [];

    let totalStockBefore = 0;
    let totalStockAfter = 0;
    let totalQuantityDifference = 0;

    let totalIncreaseQuantity = 0;
    let totalDecreaseQuantity = 0;

    let totalAdjustmentCost = 0;
    let totalIncreaseCost = 0;
    let totalDecreaseCost = 0;

    let totalUnitCost = 0;

    /* ======================================================
       Update Items
    ====================================================== */

    if (
      adjustmentItems &&
      adjustmentItems.length > 0
    ) {

      for (const item of adjustmentItems) {

        if (!item.itemType) {
          return res.status(400).json({
            success: false,
            message:
              "Item Type is required.",
          });
        }

        if (!item.itemName) {
          return res.status(400).json({
            success: false,
            message:
              "Item Name is required.",
          });
        }

        if (!item.unit) {
          return res.status(400).json({
            success: false,
            message:
              `${item.itemName} unit is required.`,
          });
        }

        /* ==========================================
           Validate Ingredient/Menu Item
        ========================================== */

        if (
          item.itemType === "Ingredient"
        ) {

          if (!item.ingredient) {
            return res.status(400).json({
              success: false,
              message:
                "Ingredient is required.",
            });
          }

          const ingredient =
            await Ingredient.findById(
              item.ingredient
            );

          if (!ingredient) {
            return res.status(404).json({
              success: false,
              message:
                "Ingredient not found.",
            });
          }

        }

        if (
          item.itemType === "Menu Item"
        ) {

          if (!item.menuItem) {
            return res.status(400).json({
              success: false,
              message:
                "Menu Item is required.",
            });
          }

          const menu =
            await MenuItem.findById(
              item.menuItem
            );

          if (!menu) {
            return res.status(404).json({
              success: false,
              message:
                "Menu Item not found.",
            });
          }

        }

        /* ==========================================
           Quantity Calculation
        ========================================== */

        const stockBefore =
          Number(item.stockBefore || 0);

        const physicalStock =
          Number(item.physicalStock || 0);

        const quantityDifference =
          physicalStock - stockBefore;

        const adjustmentQuantity =
          Math.abs(quantityDifference);

        const adjustmentDirection =
          quantityDifference >= 0
            ? "Increase"
            : "Decrease";

        const stockAfter =
          physicalStock;

        const unitCost =
          Number(item.unitCost || 0);

        const totalCost =
          adjustmentQuantity *
          unitCost;

        /* ==========================================
           Running Totals
        ========================================== */

        totalStockBefore += stockBefore;
        totalStockAfter += stockAfter;
        totalQuantityDifference +=
          quantityDifference;

        totalAdjustmentCost += totalCost;
        totalUnitCost += unitCost;

        if (
          adjustmentDirection ===
          "Increase"
        ) {
          totalIncreaseQuantity +=
            adjustmentQuantity;

          totalIncreaseCost +=
            totalCost;

        } else {

          totalDecreaseQuantity +=
            adjustmentQuantity;

          totalDecreaseCost +=
            totalCost;

        }

        /* ==========================================
           Push Item
        ========================================== */

        processedItems.push({
          itemType: item.itemType,
          ingredient:
            item.ingredient || null,
          menuItem:
            item.menuItem || null,
          category:
            item.category || null,
          unit: item.unit,
          itemCode: item.itemCode,
          itemName: item.itemName,
          batchNo: item.batchNo,
          expiryDate:
            item.expiryDate,

          stockBefore,
          physicalStock,
          stockAfter,

          quantityDifference,
          adjustmentQuantity,
          adjustmentDirection,

          unitCost,
          totalCost,

          remarks:
            item.remarks || "",
        });

      }

      adjustment.adjustmentItems =
        processedItems;

    }

    /* ======================================================
       Update Attachments
    ====================================================== */

    if (attachments && Array.isArray(attachments)) {
      const processedAttachments = [];

      for (const file of attachments) {
        if (!file.fileName || !file.fileUrl) {
          return res.status(400).json({
            success: false,
            message:
              "Attachment fileName and fileUrl are required.",
          });
        }

        processedAttachments.push({
          fileName: file.fileName,
          originalName:
            file.originalName || file.fileName,
          fileUrl: file.fileUrl,
          fileType: file.fileType || "other",
          fileSize: Number(file.fileSize || 0),
          description: file.description || "",
          uploadedBy:
            file.uploadedBy ||
            req.user?._id ||
            req.user?.userId,
          uploadedAt:
            file.uploadedAt || new Date(),
        });
      }

      adjustment.attachments = processedAttachments;
    }

    /* ======================================================
       Update Summary
    ====================================================== */

    adjustment.totalStockBefore = Number(
      totalStockBefore.toFixed(2)
    );

    adjustment.totalStockAfter = Number(
      totalStockAfter.toFixed(2)
    );

    adjustment.totalQuantityDifference = Number(
      totalQuantityDifference.toFixed(2)
    );

    adjustment.totalIncreaseQuantity = Number(
      totalIncreaseQuantity.toFixed(2)
    );

    adjustment.totalDecreaseQuantity = Number(
      totalDecreaseQuantity.toFixed(2)
    );

    adjustment.totalAdjustmentCost = Number(
      totalAdjustmentCost.toFixed(2)
    );

    adjustment.totalIncreaseCost = Number(
      totalIncreaseCost.toFixed(2)
    );

    adjustment.totalDecreaseCost = Number(
      totalDecreaseCost.toFixed(2)
    );

    adjustment.averageUnitCost =
      processedItems.length > 0
        ? Number(
            (
              totalUnitCost /
              processedItems.length
            ).toFixed(2)
          )
        : 0;

    /* ======================================================
       Approval Status
    ====================================================== */

    if (!adjustment.approvalRequired) {
      adjustment.approvalStatus = "Approved";

      if (!adjustment.approvedAt) {
        adjustment.approvedAt = new Date();
      }

      if (!adjustment.approvedBy) {
        adjustment.approvedBy =
          req.user?._id ||
          req.user?.userId;
      }

      if (
        adjustment.stockUpdated &&
        adjustment.ledgerUpdated
      ) {
        adjustment.status = "Completed";
      } else {
        adjustment.status = "Approved";
      }
    } else {
      if (
        adjustment.approvalStatus === "Pending"
      ) {
        adjustment.status = "Pending";
      }
    }

    /* ======================================================
       Save
    ====================================================== */

    await adjustment.save();

    /* ======================================================
       Populate
    ====================================================== */

    const updatedAdjustment =
      await InventoryAdjustment.findById(
        adjustment._id
      )
        .populate(
          "restaurant",
          "restaurantName"
        )
        .populate(
          "store",
          "storeName"
        )
        .populate(
          "warehouse",
          "warehouseName"
        )
        .populate(
          "kitchen",
          "kitchenName"
        )
        .populate(
          "shift",
          "shiftName"
        )
        .populate(
          "adjustedBy",
          "name employeeCode"
        )
        .populate(
          "approvedBy",
          "name employeeCode"
        )
        .populate(
          "createdBy",
          "name"
        )
        .populate(
          "updatedBy",
          "name"
        )
        .populate({
          path: "adjustmentItems.ingredient",
          select:
            "ingredientCode ingredientName",
        })
        .populate({
          path: "adjustmentItems.menuItem",
          select:
            "itemCode itemName",
        })
        .populate({
          path: "adjustmentItems.category",
          select: "categoryName",
        })
        .populate({
          path: "adjustmentItems.unit",
          select: "unitName shortName",
        });

    /* ======================================================
       Response
    ====================================================== */

    return res.status(200).json({
      success: true,
      message:
        "Inventory Adjustment updated successfully.",
      data: updatedAdjustment,
    });

  } catch (error) {
    console.error(
      "Update Inventory Adjustment Error:",
      error
    );

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message:
          "Invalid Inventory Adjustment ID.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Internal Server Error.",
    });
  }
};

/* ==========================================================
   Delete Inventory Adjustment (Soft Delete)
========================================================== */

exports.deleteInventoryAdjustment = async (req, res) => {
  try {
    const { id } = req.params;

    /* ======================================================
       Validate ID
    ====================================================== */

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Inventory Adjustment ID is required.",
      });
    }

    /* ======================================================
       Find Inventory Adjustment
    ====================================================== */

    const adjustment = await InventoryAdjustment.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!adjustment) {
      return res.status(404).json({
        success: false,
        message: "Inventory Adjustment not found.",
      });
    }

    /* ======================================================
       Prevent Delete if Completed
    ====================================================== */

    if (adjustment.status === "Completed") {
      return res.status(400).json({
        success: false,
        message:
          "Completed Inventory Adjustment cannot be deleted.",
      });
    }

    /* ======================================================
       Prevent Delete if Stock Already Updated
    ====================================================== */

    if (
      adjustment.stockUpdated ||
      adjustment.ledgerUpdated
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Inventory Adjustment cannot be deleted because stock/ledger has already been updated.",
      });
    }

    /* ======================================================
       Soft Delete
    ====================================================== */

    adjustment.isDeleted = true;
    adjustment.deletedAt = new Date();
    adjustment.deletedBy =
      req.user?._id ||
      req.user?.userId ||
      null;

    adjustment.updatedBy =
      req.user?._id ||
      req.user?.userId ||
      adjustment.updatedBy;

    await adjustment.save();

    /* ======================================================
       Response
    ====================================================== */

    return res.status(200).json({
      success: true,
      message:
        "Inventory Adjustment deleted successfully.",
      data: {
        _id: adjustment._id,
        adjustmentNumber:
          adjustment.adjustmentNumber,
        status: adjustment.status,
        isDeleted: adjustment.isDeleted,
        deletedAt: adjustment.deletedAt,
      },
    });
  } catch (error) {
    console.error(
      "Delete Inventory Adjustment Error:",
      error
    );

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message:
          "Invalid Inventory Adjustment ID.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Internal Server Error.",
    });
  }
};

/* ==========================================================
   Restore Inventory Adjustment
========================================================== */

exports.restoreInventoryAdjustment = async (req, res) => {
  try {
    const { id } = req.params;

    /* ======================================================
       Validate ID
    ====================================================== */

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Inventory Adjustment ID is required.",
      });
    }

    /* ======================================================
       Find Deleted Inventory Adjustment
    ====================================================== */

    const adjustment = await InventoryAdjustment.findOne({
      _id: id,
      isDeleted: true,
    });

    if (!adjustment) {
      return res.status(404).json({
        success: false,
        message: "Deleted Inventory Adjustment not found.",
      });
    }

    /* ======================================================
       Restore Inventory Adjustment
    ====================================================== */

    adjustment.isDeleted = false;
    adjustment.deletedAt = null;
    adjustment.deletedBy = null;

    adjustment.updatedBy =
      req.user?._id ||
      req.user?.userId ||
      adjustment.updatedBy;

    await adjustment.save();

    /* ======================================================
       Populate Response
    ====================================================== */

    const restoredAdjustment =
      await InventoryAdjustment.findById(adjustment._id)
        .populate(
          "restaurant",
          "restaurantName restaurantCode"
        )
        .populate(
          "store",
          "storeName storeCode"
        )
        .populate(
          "warehouse",
          "warehouseName"
        )
        .populate(
          "kitchen",
          "kitchenName"
        )
        .populate(
          "adjustedBy",
          "name employeeCode"
        )
        .populate(
          "approvedBy",
          "name employeeCode"
        )
        .populate(
          "createdBy",
          "name"
        )
        .populate(
          "updatedBy",
          "name"
        );

    /* ======================================================
       Success Response
    ====================================================== */

    return res.status(200).json({
      success: true,
      message:
        "Inventory Adjustment restored successfully.",
      data: restoredAdjustment,
    });

  } catch (error) {

    console.error(
      "Restore Inventory Adjustment Error:",
      error
    );

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message:
          "Invalid Inventory Adjustment ID.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Internal Server Error.",
    });

  }
};
/* ==========================================================
   Approve Inventory Adjustment
========================================================== */

exports.approveInventoryAdjustment = async (req, res) => {
  try {
    const { id } = req.params;

    /* ======================================================
       Find Inventory Adjustment
    ====================================================== */

    const adjustment =
      await InventoryAdjustment.findOne({
        _id: id,
        isDeleted: false,
      });

    if (!adjustment) {
      return res.status(404).json({
        success: false,
        message:
          "Inventory Adjustment not found.",
      });
    }

    /* ======================================================
       Already Approved
    ====================================================== */

    if (
      adjustment.approvalStatus === "Approved"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Inventory Adjustment is already approved.",
      });
    }

    /* ======================================================
       Rejected Validation
    ====================================================== */

    if (
      adjustment.approvalStatus === "Rejected"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Rejected Inventory Adjustment cannot be approved.",
      });
    }

    /* ======================================================
       Cancelled Validation
    ====================================================== */

    if (
      adjustment.status === "Cancelled"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Cancelled Inventory Adjustment cannot be approved.",
      });
    }

    /* ======================================================
       Validate Adjustment Items
    ====================================================== */

    if (
      !adjustment.adjustmentItems ||
      adjustment.adjustmentItems.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Adjustment Items not found.",
      });
    }

    /* ======================================================
       Validate Every Item
    ====================================================== */

    for (const item of adjustment.adjustmentItems) {

      if (
        item.itemType === "Ingredient"
      ) {

        const ingredient =
          await Ingredient.findById(
            item.ingredient
          );

        if (!ingredient) {
          return res.status(404).json({
            success: false,
            message:
              `${item.itemName} ingredient not found.`,
          });
        }

      }

      if (
        item.itemType === "Menu Item"
      ) {

        const menuItem =
          await MenuItem.findById(
            item.menuItem
          );

        if (!menuItem) {
          return res.status(404).json({
            success: false,
            message:
              `${item.itemName} menu item not found.`,
          });
        }

      }

    }

    /* ======================================================
       Approval
    ====================================================== */

    adjustment.approvalStatus = "Approved";
    adjustment.status = "Approved";

    adjustment.approvedBy =
      req.user?._id ||
      req.user?.userId;

    adjustment.approvedAt =
      new Date();

    adjustment.updatedBy =
      req.user?._id ||
      req.user?.userId;

    adjustment.rejectionReason = "";

    /* ======================================================
       Auto Complete Check
    ====================================================== */

    if (
      adjustment.stockUpdated &&
      adjustment.ledgerUpdated
    ) {
      adjustment.status = "Completed";
    }

    await adjustment.save();

    /* ======================================================
       Populate
    ====================================================== */

    const approvedAdjustment =
      await InventoryAdjustment.findById(
        adjustment._id
      )
        .populate(
          "restaurant",
          "restaurantName"
        )
        .populate(
          "store",
          "storeName"
        )
        .populate(
          "warehouse",
          "warehouseName"
        )
        .populate(
          "kitchen",
          "kitchenName"
        )
        .populate(
          "shift",
          "shiftName"
        )
        .populate(
          "adjustedBy",
          "name employeeCode"
        )
        .populate(
          "approvedBy",
          "name employeeCode"
        )
        .populate(
          "createdBy",
          "name"
        )
        .populate(
          "updatedBy",
          "name"
        )
        .populate({
          path: "adjustmentItems.ingredient",
          select:
            "ingredientCode ingredientName",
        })
        .populate({
          path: "adjustmentItems.menuItem",
          select:
            "itemCode itemName",
        })
        .populate({
          path: "adjustmentItems.unit",
          select:
            "unitName shortName",
        });

    /* ======================================================
       Response
    ====================================================== */

    return res.status(200).json({
      success: true,
      message:
        "Inventory Adjustment approved successfully.",
      data: approvedAdjustment,
    });

  } catch (error) {

    console.error(
      "Approve Inventory Adjustment Error:",
      error
    );

    if (
      error.name === "CastError"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid Inventory Adjustment ID.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Internal Server Error.",
    });

  }
};
/* ==========================================================
   Reject Inventory Adjustment
========================================================== */

exports.rejectInventoryAdjustment = async (req, res) => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    /* ======================================================
       Find Inventory Adjustment
    ====================================================== */

    const adjustment =
      await InventoryAdjustment.findOne({
        _id: id,
        isDeleted: false,
      });

    if (!adjustment) {
      return res.status(404).json({
        success: false,
        message: "Inventory Adjustment not found.",
      });
    }

    /* ======================================================
       Already Rejected
    ====================================================== */

    if (adjustment.approvalStatus === "Rejected") {
      return res.status(400).json({
        success: false,
        message:
          "Inventory Adjustment is already rejected.",
      });
    }

    /* ======================================================
       Completed Validation
    ====================================================== */

    if (adjustment.status === "Completed") {
      return res.status(400).json({
        success: false,
        message:
          "Completed Inventory Adjustment cannot be rejected.",
      });
    }

    /* ======================================================
       Cancelled Validation
    ====================================================== */

    if (adjustment.status === "Cancelled") {
      return res.status(400).json({
        success: false,
        message:
          "Cancelled Inventory Adjustment cannot be rejected.",
      });
    }

    /* ======================================================
       Reason Validation
    ====================================================== */

    if (
      !rejectionReason ||
      rejectionReason.trim() === ""
    ) {
      return res.status(400).json({
        success: false,
        message: "Rejection reason is required.",
      });
    }

    /* ======================================================
       Update Approval Details
    ====================================================== */

    adjustment.approvalStatus = "Rejected";
    adjustment.status = "Rejected";

    adjustment.rejectionReason =
      rejectionReason.trim();

    adjustment.approvedBy =
      req.user?._id ||
      req.user?.userId;

    adjustment.approvedAt = new Date();

    adjustment.updatedBy =
      req.user?._id ||
      req.user?.userId;

    /* ======================================================
       Reset Stock/Ledger Flags
    ====================================================== */

    adjustment.stockUpdated = false;
    adjustment.ledgerUpdated = false;

    await adjustment.save();

    /* ======================================================
       Populate Response
    ====================================================== */

    const rejectedAdjustment =
      await InventoryAdjustment.findById(
        adjustment._id
      )
        .populate(
          "restaurant",
          "restaurantName"
        )
        .populate(
          "store",
          "storeName"
        )
        .populate(
          "warehouse",
          "warehouseName"
        )
        .populate(
          "kitchen",
          "kitchenName"
        )
        .populate(
          "shift",
          "shiftName"
        )
        .populate(
          "adjustedBy",
          "name employeeCode"
        )
        .populate(
          "approvedBy",
          "name employeeCode"
        )
        .populate(
          "createdBy",
          "name"
        )
        .populate(
          "updatedBy",
          "name"
        )
        .populate({
          path: "adjustmentItems.ingredient",
          select:
            "ingredientCode ingredientName",
        })
        .populate({
          path: "adjustmentItems.menuItem",
          select:
            "itemCode itemName",
        })
        .populate({
          path: "adjustmentItems.unit",
          select:
            "unitName shortName",
        });

    /* ======================================================
       Success Response
    ====================================================== */

    return res.status(200).json({
      success: true,
      message:
        "Inventory Adjustment rejected successfully.",
      data: rejectedAdjustment,
    });

  } catch (error) {

    console.error(
      "Reject Inventory Adjustment Error:",
      error
    );

    /* ======================================================
       Invalid ObjectId
    ====================================================== */

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message:
          "Invalid Inventory Adjustment ID.",
      });
    }

    /* ======================================================
       Server Error
    ====================================================== */

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Internal Server Error.",
    });

  }
};
/* ==========================================================
   Complete Inventory Adjustment
========================================================== */

exports.completeInventoryAdjustment = async (req, res) => {
  try {
    const { id } = req.params;

    /* ======================================================
       Find Inventory Adjustment
    ====================================================== */

    const adjustment =
      await InventoryAdjustment.findOne({
        _id: id,
        isDeleted: false,
      });

    if (!adjustment) {
      return res.status(404).json({
        success: false,
        message:
          "Inventory Adjustment not found.",
      });
    }

    /* ======================================================
       Approval Validation
    ====================================================== */

    if (
      adjustment.approvalStatus !== "Approved"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Inventory Adjustment must be approved before completion.",
      });
    }

    /* ======================================================
       Already Completed
    ====================================================== */

    if (adjustment.status === "Completed") {
      return res.status(400).json({
        success: false,
        message:
          "Inventory Adjustment is already completed.",
      });
    }

    /* ======================================================
       Cancelled Validation
    ====================================================== */

    if (adjustment.status === "Cancelled") {
      return res.status(400).json({
        success: false,
        message:
          "Cancelled Inventory Adjustment cannot be completed.",
      });
    }

    /* ======================================================
       Update Stock
    ====================================================== */

    for (const item of adjustment.adjustmentItems) {

      if (item.itemType === "Ingredient") {

        const ingredient =
          await Ingredient.findById(item.ingredient);

        if (!ingredient) {
          return res.status(404).json({
            success: false,
            message: `${item.itemName} ingredient not found.`,
          });
        }

        ingredient.currentStock = item.stockAfter;
        ingredient.stockValue =
          Number(item.stockAfter) *
          Number(ingredient.averageCost || 0);

        await ingredient.save();
      }

      if (item.itemType === "Menu Item") {

        const menuItem =
          await MenuItem.findById(item.menuItem);

        if (!menuItem) {
          return res.status(404).json({
            success: false,
            message: `${item.itemName} menu item not found.`,
          });
        }

        if ("currentStock" in menuItem) {
          menuItem.currentStock = item.stockAfter;
          await menuItem.save();
        }
      }

      /* ==============================================
         Optional:
         Create IngredientStockLedger /
         MenuStockLedger entries here.
      ============================================== */
    }

    /* ======================================================
       Update Adjustment Status
    ====================================================== */

    adjustment.stockUpdated = true;
    adjustment.ledgerUpdated = true;
    adjustment.status = "Completed";

    adjustment.updatedBy =
      req.user?._id ||
      req.user?.userId;

    await adjustment.save();

    /* ======================================================
       Populate
    ====================================================== */

    const completedAdjustment =
      await InventoryAdjustment.findById(
        adjustment._id
      )
        .populate(
          "restaurant",
          "restaurantName"
        )
        .populate(
          "store",
          "storeName"
        )
        .populate(
          "warehouse",
          "warehouseName"
        )
        .populate(
          "kitchen",
          "kitchenName"
        )
        .populate(
          "shift",
          "shiftName"
        )
        .populate(
          "adjustedBy",
          "name employeeCode"
        )
        .populate(
          "approvedBy",
          "name employeeCode"
        )
        .populate(
          "createdBy",
          "name"
        )
        .populate(
          "updatedBy",
          "name"
        )
        .populate({
          path: "adjustmentItems.ingredient",
          select:
            "ingredientCode ingredientName currentStock",
        })
        .populate({
          path: "adjustmentItems.menuItem",
          select:
            "itemCode itemName currentStock",
        })
        .populate({
          path: "adjustmentItems.category",
          select: "categoryName",
        })
        .populate({
          path: "adjustmentItems.unit",
          select:
            "unitName shortName",
        });

    /* ======================================================
       Response
    ====================================================== */

    return res.status(200).json({
      success: true,
      message:
        "Inventory Adjustment completed successfully.",
      data: completedAdjustment,
    });

  } catch (error) {

    console.error(
      "Complete Inventory Adjustment Error:",
      error
    );

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message:
          "Invalid Inventory Adjustment ID.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Internal Server Error.",
    });

  }
};
/* ==========================================================
   Cancel Inventory Adjustment
========================================================== */

exports.cancelInventoryAdjustment = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    /* ======================================================
       Find Inventory Adjustment
    ====================================================== */

    const adjustment = await InventoryAdjustment.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!adjustment) {
      return res.status(404).json({
        success: false,
        message: "Inventory Adjustment not found.",
      });
    }

    /* ======================================================
       Already Cancelled
    ====================================================== */

    if (adjustment.status === "Cancelled") {
      return res.status(400).json({
        success: false,
        message: "Inventory Adjustment is already cancelled.",
      });
    }

    /* ======================================================
       Completed Validation
    ====================================================== */

    if (adjustment.status === "Completed") {
      return res.status(400).json({
        success: false,
        message:
          "Completed Inventory Adjustment cannot be cancelled.",
      });
    }

    /* ======================================================
       Stock Updated Validation
    ====================================================== */

    if (
      adjustment.stockUpdated ||
      adjustment.ledgerUpdated
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Inventory Adjustment cannot be cancelled because stock or ledger has already been updated.",
      });
    }

    /* ======================================================
       Approval Validation
    ====================================================== */

    if (
      adjustment.approvalStatus === "Approved" &&
      adjustment.stockUpdated
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Approved Inventory Adjustment cannot be cancelled after stock update.",
      });
    }

    /* ======================================================
       Update Status
    ====================================================== */

    adjustment.status = "Cancelled";

    adjustment.updatedBy =
      req.user?._id ||
      req.user?.userId ||
      adjustment.updatedBy;

    /* ======================================================
       Remarks
    ====================================================== */

    if (remarks && remarks.trim()) {
      adjustment.remarks = adjustment.remarks
        ? `${adjustment.remarks}\n\nCancellation Remarks:\n${remarks.trim()}`
        : `Cancellation Remarks:\n${remarks.trim()}`;
    }

    await adjustment.save();

    /* ======================================================
       Populate Response
    ====================================================== */

    const cancelledAdjustment =
      await InventoryAdjustment.findById(adjustment._id)
        .populate(
          "restaurant",
          "restaurantName restaurantCode"
        )
        .populate(
          "store",
          "storeName storeCode"
        )
        .populate(
          "warehouse",
          "warehouseName"
        )
        .populate(
          "kitchen",
          "kitchenName"
        )
        .populate(
          "shift",
          "shiftName"
        )
        .populate(
          "adjustedBy",
          "name employeeCode"
        )
        .populate(
          "approvedBy",
          "name employeeCode"
        )
        .populate(
          "createdBy",
          "name"
        )
        .populate(
          "updatedBy",
          "name"
        )
        .populate({
          path: "adjustmentItems.ingredient",
          select:
            "ingredientCode ingredientName",
        })
        .populate({
          path: "adjustmentItems.menuItem",
          select:
            "itemCode itemName",
        })
        .populate({
          path: "adjustmentItems.category",
          select: "categoryName",
        })
        .populate({
          path: "adjustmentItems.unit",
          select:
            "unitName shortName",
        });

    /* ======================================================
       Success Response
    ====================================================== */

    return res.status(200).json({
      success: true,
      message:
        "Inventory Adjustment cancelled successfully.",
      data: cancelledAdjustment,
    });
  } catch (error) {
    console.error(
      "Cancel Inventory Adjustment Error:",
      error
    );

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message:
          "Invalid Inventory Adjustment ID.",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Internal Server Error.",
    });
  }
};
/* ==========================================================
   Get Pending Inventory Adjustments
========================================================== */

exports.getPendingAdjustments = async (req, res) => {
  try {
    /* ======================================================
       Restaurant Validation
    ====================================================== */

    const restaurantId =
      req.user?.restaurant ||
      req.user?.restaurantId ||
      req.query.restaurant;

    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message: "Restaurant is required.",
      });
    }

    /* ======================================================
       Pagination
    ====================================================== */

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    /* ======================================================
       Optional Filters
    ====================================================== */

    const filter = {
      restaurant: restaurantId,
      approvalStatus: "Pending",
      isDeleted: false,
    };

    if (req.query.store) {
      filter.store = req.query.store;
    }

    if (req.query.warehouse) {
      filter.warehouse = req.query.warehouse;
    }

    if (req.query.kitchen) {
      filter.kitchen = req.query.kitchen;
    }

    if (req.query.adjustmentType) {
      filter.adjustmentType =
        req.query.adjustmentType;
    }

    if (req.query.fromDate && req.query.toDate) {
      filter.adjustmentDate = {
        $gte: new Date(req.query.fromDate),
        $lte: new Date(req.query.toDate),
      };
    }

    /* ======================================================
       Total Records
    ====================================================== */

    const totalRecords =
      await InventoryAdjustment.countDocuments(
        filter
      );

    /* ======================================================
       Fetch Pending Adjustments
    ====================================================== */

    const adjustments =
      await InventoryAdjustment.find(filter)
        .populate(
          "restaurant",
          "restaurantName restaurantCode"
        )
        .populate(
          "store",
          "storeName storeCode"
        )
        .populate(
          "warehouse",
          "warehouseName warehouseCode"
        )
        .populate(
          "kitchen",
          "kitchenName kitchenCode"
        )
        .populate(
          "shift",
          "shiftName"
        )
        .populate(
          "adjustedBy",
          "name employeeCode"
        )
        .populate(
          "createdBy",
          "name"
        )
        .populate({
          path: "adjustmentItems.ingredient",
          select:
            "ingredientCode ingredientName currentStock",
        })
        .populate({
          path: "adjustmentItems.menuItem",
          select:
            "itemCode itemName",
        })
        .populate({
          path: "adjustmentItems.unit",
          select:
            "unitName shortName",
        })
        .sort({
          adjustmentDate: -1,
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit);

    /* ======================================================
       Response
    ====================================================== */

    return res.status(200).json({
      success: true,
      message:
        "Pending Inventory Adjustments fetched successfully.",
      totalRecords,
      currentPage: page,
      totalPages: Math.ceil(
        totalRecords / limit
      ),
      count: adjustments.length,
      data: adjustments,
    });

  } catch (error) {

    console.error(
      "Get Pending Inventory Adjustments Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Internal Server Error.",
    });

  }
};
/* ==========================================================
   Get Approved Inventory Adjustments
========================================================== */

exports.getApprovedAdjustments = async (req, res) => {
  try {
    /* ======================================================
       Restaurant Validation
    ====================================================== */

    const restaurantId =
      req.user?.restaurant ||
      req.user?.restaurantId ||
      req.query.restaurant;

    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message: "Restaurant is required.",
      });
    }

    /* ======================================================
       Pagination
    ====================================================== */

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    /* ======================================================
       Filters
    ====================================================== */

    const filter = {
      restaurant: restaurantId,
      approvalStatus: "Approved",
      isDeleted: false,
    };

    if (req.query.store) {
      filter.store = req.query.store;
    }

    if (req.query.warehouse) {
      filter.warehouse = req.query.warehouse;
    }

    if (req.query.kitchen) {
      filter.kitchen = req.query.kitchen;
    }

    if (req.query.adjustmentType) {
      filter.adjustmentType =
        req.query.adjustmentType;
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (
      req.query.fromDate &&
      req.query.toDate
    ) {
      filter.adjustmentDate = {
        $gte: new Date(req.query.fromDate),
        $lte: new Date(req.query.toDate),
      };
    }

    /* ======================================================
       Total Records
    ====================================================== */

    const totalRecords =
      await InventoryAdjustment.countDocuments(
        filter
      );

    /* ======================================================
       Fetch Data
    ====================================================== */

    const adjustments =
      await InventoryAdjustment.find(filter)
        .populate(
          "restaurant",
          "restaurantName restaurantCode"
        )
        .populate(
          "store",
          "storeName storeCode"
        )
        .populate(
          "warehouse",
          "warehouseName warehouseCode"
        )
        .populate(
          "kitchen",
          "kitchenName kitchenCode"
        )
        .populate(
          "shift",
          "shiftName"
        )
        .populate(
          "adjustedBy",
          "name employeeCode"
        )
        .populate(
          "approvedBy",
          "name employeeCode"
        )
        .populate(
          "createdBy",
          "name"
        )
        .populate(
          "updatedBy",
          "name"
        )
        .populate({
          path: "adjustmentItems.ingredient",
          select:
            "ingredientCode ingredientName currentStock averageCost",
        })
        .populate({
          path: "adjustmentItems.menuItem",
          select:
            "itemCode itemName currentStock",
        })
        .populate({
          path: "adjustmentItems.category",
          select: "categoryName",
        })
        .populate({
          path: "adjustmentItems.unit",
          select:
            "unitName shortName",
        })
        .sort({
          approvedAt: -1,
          adjustmentDate: -1,
        })
        .skip(skip)
        .limit(limit);

    /* ======================================================
       Response
    ====================================================== */

    return res.status(200).json({
      success: true,
      message:
        "Approved Inventory Adjustments fetched successfully.",
      totalRecords,
      currentPage: page,
      totalPages: Math.ceil(
        totalRecords / limit
      ),
      count: adjustments.length,
      data: adjustments,
    });

  } catch (error) {

    console.error(
      "Get Approved Inventory Adjustments Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Internal Server Error.",
    });

  }
};
/* ==========================================================
   Get Today's Inventory Adjustments
========================================================== */

exports.getTodayAdjustments = async (req, res) => {
  try {
    /* ======================================================
       Restaurant Validation
    ====================================================== */

    const restaurantId =
      req.user?.restaurant ||
      req.user?.restaurantId ||
      req.query.restaurant;

    if (!restaurantId) {
      return res.status(400).json({
        success: false,
        message: "Restaurant is required.",
      });
    }

    /* ======================================================
       Today's Date Range
    ====================================================== */

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    /* ======================================================
       Pagination
    ====================================================== */

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    /* ======================================================
       Filters
    ====================================================== */

    const filter = {
      restaurant: restaurantId,
      adjustmentDate: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
      isDeleted: false,
    };

    if (req.query.store) {
      filter.store = req.query.store;
    }

    if (req.query.warehouse) {
      filter.warehouse = req.query.warehouse;
    }

    if (req.query.kitchen) {
      filter.kitchen = req.query.kitchen;
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.approvalStatus) {
      filter.approvalStatus =
        req.query.approvalStatus;
    }

    /* ======================================================
       Total Records
    ====================================================== */

    const totalRecords =
      await InventoryAdjustment.countDocuments(
        filter
      );

    /* ======================================================
       Fetch Today's Adjustments
    ====================================================== */

    const adjustments =
      await InventoryAdjustment.find(filter)
        .populate(
          "restaurant",
          "restaurantName restaurantCode"
        )
        .populate(
          "store",
          "storeName storeCode"
        )
        .populate(
          "warehouse",
          "warehouseName warehouseCode"
        )
        .populate(
          "kitchen",
          "kitchenName kitchenCode"
        )
        .populate(
          "shift",
          "shiftName"
        )
        .populate(
          "adjustedBy",
          "name employeeCode"
        )
        .populate(
          "approvedBy",
          "name employeeCode"
        )
        .populate(
          "createdBy",
          "name"
        )
        .populate(
          "updatedBy",
          "name"
        )
        .populate({
          path: "adjustmentItems.ingredient",
          select:
            "ingredientCode ingredientName currentStock averageCost",
        })
        .populate({
          path: "adjustmentItems.menuItem",
          select:
            "itemCode itemName currentStock",
        })
        .populate({
          path: "adjustmentItems.category",
          select: "categoryName",
        })
        .populate({
          path: "adjustmentItems.unit",
          select:
            "unitName shortName",
        })
        .sort({
          adjustmentDate: -1,
          createdAt: -1,
        })
        .skip(skip)
        .limit(limit);

    /* ======================================================
       Today's Summary
    ====================================================== */

    const todaySummary =
      await InventoryAdjustment.aggregate([
        {
          $match: filter,
        },
        {
          $group: {
            _id: null,
            totalAdjustments: {
              $sum: 1,
            },
            totalStockBefore: {
              $sum: "$totalStockBefore",
            },
            totalStockAfter: {
              $sum: "$totalStockAfter",
            },
            totalIncreaseQuantity: {
              $sum: "$totalIncreaseQuantity",
            },
            totalDecreaseQuantity: {
              $sum: "$totalDecreaseQuantity",
            },
            totalAdjustmentCost: {
              $sum: "$totalAdjustmentCost",
            },
          },
        },
      ]);

    /* ======================================================
       Response
    ====================================================== */

    return res.status(200).json({
      success: true,
      message:
        "Today's Inventory Adjustments fetched successfully.",
      totalRecords,
      currentPage: page,
      totalPages: Math.ceil(
        totalRecords / limit
      ),
      count: adjustments.length,
      summary:
        todaySummary.length > 0
          ? todaySummary[0]
          : {
              totalAdjustments: 0,
              totalStockBefore: 0,
              totalStockAfter: 0,
              totalIncreaseQuantity: 0,
              totalDecreaseQuantity: 0,
              totalAdjustmentCost: 0,
            },
      data: adjustments,
    });

  } catch (error) {

    console.error(
      "Get Today's Inventory Adjustments Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Internal Server Error.",
    });

  }
};
// =============================================
// Get Inventory Adjustment Summary
// =============================================

exports.getAdjustmentSummary = async (req, res) => {
  try {

    const companyId = req.user.companyId;


    const summary = await InventoryAdjustment.aggregate([
      {
        $match: {
          companyId: new mongoose.Types.ObjectId(companyId),
        },
      },

      {
        $group: {

          _id: null,


          // Total Adjustments
          totalAdjustments: {
            $sum: 1,
          },


          // Pending Count
          pendingAdjustments: {
            $sum: {
              $cond: [
                {
                  $eq: ["$status", "pending"],
                },
                1,
                0,
              ],
            },
          },


          // Approved Count
          approvedAdjustments: {
            $sum: {
              $cond: [
                {
                  $eq: ["$status", "approved"],
                },
                1,
                0,
              ],
            },
          },


          // Rejected Count
          rejectedAdjustments: {
            $sum: {
              $cond: [
                {
                  $eq: ["$status", "rejected"],
                },
                1,
                0,
              ],
            },
          },


          // Cancelled Count
          cancelledAdjustments: {
            $sum: {
              $cond: [
                {
                  $eq: ["$status", "cancelled"],
                },
                1,
                0,
              ],
            },
          },


          // Total Adjust Quantity
          totalQuantityAdjusted: {
            $sum: "$quantity",
          },


          // Total Value Difference
          totalValueDifference: {
            $sum: "$totalValue",
          },

        },
      },

      {
        $project: {

          _id: 0,

          totalAdjustments: 1,

          pendingAdjustments: 1,

          approvedAdjustments: 1,

          rejectedAdjustments: 1,

          cancelledAdjustments: 1,

          totalQuantityAdjusted: 1,

          totalValueDifference: 1,

        },
      },

    ]);



    // Default response if no data

    const result = summary[0] || {

      totalAdjustments: 0,

      pendingAdjustments: 0,

      approvedAdjustments: 0,

      rejectedAdjustments: 0,

      cancelledAdjustments: 0,

      totalQuantityAdjusted: 0,

      totalValueDifference: 0,

    };



    return res.status(200).json({

      success: true,

      message: "Inventory adjustment summary fetched successfully",

      data: result,

    });



  } catch (error) {

    console.error(
      "Get Adjustment Summary Error:",
      error
    );


    return res.status(500).json({

      success: false,

      message: "Failed to fetch adjustment summary",

      error: error.message,

    });

  }
};
// =============================================
// Get Reason Wise Inventory Adjustments
// =============================================

exports.getReasonWiseAdjustments = async (req, res) => {
  try {

    const companyId = req.user.companyId;


    const reasonWiseAdjustments = await InventoryAdjustment.aggregate([

      {
        $match: {
          companyId: new mongoose.Types.ObjectId(companyId),
        },
      },


      {
        $group: {

          _id: "$reason",


          // Total Adjustment Count
          totalAdjustments: {
            $sum: 1,
          },


          // Total Quantity
          totalQuantityAdjusted: {
            $sum: "$quantity",
          },


          // Total Stock Value
          totalValueDifference: {
            $sum: "$totalValue",
          },


          // Approved Count
          approvedCount: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$status",
                    "approved"
                  ]
                },
                1,
                0,
              ],
            },
          },


          // Pending Count
          pendingCount: {
            $sum: {
              $cond: [
                {
                  $eq: [
                    "$status",
                    "pending"
                  ]
                },
                1,
                0,
              ],
            },
          },


        },
      },


      {
        $project: {

          _id: 0,

          reason: "$_id",

          totalAdjustments: 1,

          totalQuantityAdjusted: 1,

          totalValueDifference: 1,

          approvedCount: 1,

          pendingCount: 1,

        },
      },


      {
        $sort: {
          totalAdjustments: -1,
        },
      },


    ]);



    return res.status(200).json({

      success: true,

      message:
        "Reason wise inventory adjustments fetched successfully",

      data: reasonWiseAdjustments,

    });



  } catch (error) {

    console.error(
      "Get Reason Wise Adjustments Error:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        "Failed to fetch reason wise adjustments",

      error: error.message,

    });

  }
};
// =============================================
// Get Store Wise Inventory Adjustments
// =============================================

exports.getStoreAdjustments = async (req, res) => {
  try {

    const companyId = req.user.companyId;


    const storeAdjustments = await InventoryAdjustment.aggregate([

      {
        $match: {
          companyId: new mongoose.Types.ObjectId(companyId),
        },
      },


      // Populate Store Details
      {
        $lookup: {

          from: "stores",

          localField: "store",

          foreignField: "_id",

          as: "storeDetails",

        },
      },


      {
        $unwind: {
          path: "$storeDetails",
          preserveNullAndEmptyArrays: true,
        },
      },


      {
        $group: {

          _id: "$store",


          storeName: {
            $first: "$storeDetails.storeName",
          },


          totalAdjustments: {
            $sum: 1,
          },


          totalQuantityAdjusted: {
            $sum: "$quantity",
          },


          totalValueDifference: {
            $sum: "$totalValue",
          },


          approvedCount: {

            $sum: {

              $cond: [

                {
                  $eq: [
                    "$status",
                    "approved"
                  ]
                },

                1,

                0,

              ],

            },

          },


          pendingCount: {

            $sum: {

              $cond: [

                {
                  $eq: [
                    "$status",
                    "pending"
                  ]
                },

                1,

                0,

              ],

            },

          },


          rejectedCount: {

            $sum: {

              $cond: [

                {
                  $eq: [
                    "$status",
                    "rejected"
                  ]
                },

                1,

                0,

              ],

            },

          },


        },

      },


      {
        $project: {

          _id: 0,

          storeId: "$_id",

          storeName: 1,

          totalAdjustments: 1,

          totalQuantityAdjusted: 1,

          totalValueDifference: 1,

          approvedCount: 1,

          pendingCount: 1,

          rejectedCount: 1,

        },
      },


      {
        $sort: {

          totalAdjustments: -1,

        },
      },


    ]);



    return res.status(200).json({

      success: true,

      message:
        "Store wise inventory adjustments fetched successfully",

      data: storeAdjustments,

    });



  } catch (error) {

    console.error(
      "Get Store Adjustments Error:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        "Failed to fetch store adjustments",

      error: error.message,

    });

  }
};
// =============================================
// Search Inventory Adjustments
// =============================================

exports.searchInventoryAdjustments = async (req, res) => {
  try {

    const companyId = req.user.companyId;


    const {
      search,
      status,
      reason,
      store,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = req.query;



    let filter = {

      companyId: new mongoose.Types.ObjectId(companyId),

    };



    // ===============================
    // Status Filter
    // ===============================

    if (status) {

      filter.status = status;

    }



    // ===============================
    // Reason Filter
    // ===============================

    if (reason) {

      filter.reason = reason;

    }



    // ===============================
    // Store Filter
    // ===============================

    if (store) {

      filter.store = new mongoose.Types.ObjectId(store);

    }



    // ===============================
    // Date Range Filter
    // ===============================

    if (startDate && endDate) {

      filter.createdAt = {

        $gte: new Date(startDate),

        $lte: new Date(endDate),

      };

    }



    // ===============================
    // Search Filter
    // ===============================

    if (search) {


      filter.$or = [

        {
          adjustmentNo: {
            $regex: search,
            $options: "i",
          },
        },


        {
          reason: {
            $regex: search,
            $options: "i",
          },
        },


      ];

    }



    const skip = 
      (Number(page) - 1) * Number(limit);



    const adjustments =
      await InventoryAdjustment.find(filter)

      .populate(
        "store",
        "storeName"
      )

      .populate(
        "product",
        "productName sku barcode"
      )

      .populate(
        "createdBy",
        "name email"
      )

      .sort({
        createdAt: -1,
      })

      .skip(skip)

      .limit(Number(limit));



    const total =
      await InventoryAdjustment.countDocuments(filter);



    return res.status(200).json({

      success: true,


      message:
        "Inventory adjustments fetched successfully",


      pagination: {

        totalRecords: total,

        currentPage: Number(page),

        totalPages:
          Math.ceil(total / limit),

        pageSize: Number(limit),

      },


      data: adjustments,


    });



  } catch (error) {


    console.error(
      "Search Inventory Adjustments Error:",
      error
    );



    return res.status(500).json({

      success: false,

      message:
        "Failed to search inventory adjustments",

      error: error.message,

    });


  }
};