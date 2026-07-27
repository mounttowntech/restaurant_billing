const RestaurantSetting = require("../models/restaurantSettingModel");
const Restaurant = require("../models/Restaurant");

/* ==========================================================
   Create Restaurant Setting
========================================================== */

exports.createRestaurantSetting = async (req, res) => {
  try {
    const {
      restaurant,
      store,
      restaurantName,
      ownerName,
      email,
      phone,
      address,
      gstNumber,
      fssaiNumber,
      currency,
      currencySymbol,
      timezone,
      language,
      invoicePrefix,
      invoiceStartNumber,
      enableGST,
      gstPercentage,
      serviceCharge,
      autoPrintInvoice,
      autoPrintKOT,
      allowNegativeStock,
      dineInEnabled,
      takeawayEnabled,
      deliveryEnabled,
      reservationEnabled,
      acceptedPaymentModes,
      receiptPrinterName,
      kitchenPrinterName,
      logo,
      favicon,
      receiptFooter,
    } = req.body;

    // Check Restaurant
    const restaurantExists = await Restaurant.findById(restaurant);

    if (!restaurantExists) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    // Prevent Duplicate Settings
    const exists = await RestaurantSetting.findOne({
      restaurant,
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Restaurant settings already exist.",
      });
    }

    const setting = await RestaurantSetting.create({
      restaurant,
      store,
      restaurantName,
      ownerName,
      email,
      phone,
      address,
      gstNumber,
      fssaiNumber,

      currency,
      currencySymbol,
      timezone,
      language,

      invoicePrefix,
      invoiceStartNumber,
      enableGST,
      gstPercentage,
      serviceCharge,

      autoPrintInvoice,
      autoPrintKOT,
      allowNegativeStock,

      dineInEnabled,
      takeawayEnabled,
      deliveryEnabled,
      reservationEnabled,

      acceptedPaymentModes,

      receiptPrinterName,
      kitchenPrinterName,

      logo,
      favicon,
      receiptFooter,
    });

    res.status(201).json({
      success: true,
      message: "Restaurant setting created successfully.",
      data: setting,
    });
  } catch (error) {
    console.error("createRestaurantSetting:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
   Get All Restaurant Settings
========================================================== */

exports.getRestaurantSettings = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const settings = await RestaurantSetting.find()
      .populate("restaurant", "restaurantName restaurantCode")
      .populate("store", "storeName")
      .sort({
        createdAt: -1,
      })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await RestaurantSetting.countDocuments({
      isDeleted: false,
    });

    res.status(200).json({
      success: true,
      total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit),
      data: settings,
    });
  } catch (error) {
    console.error("getRestaurantSettings:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
   Get Restaurant Setting By ID
========================================================== */

exports.getRestaurantSettingById = async (req, res) => {
  try {
    const setting = await RestaurantSetting.findById(req.params.id)
      .populate("restaurant")
      .populate("store");

    if (!setting) {
      return res.status(404).json({
        success: false,
        message: "Restaurant setting not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: setting,
    });
  } catch (error) {
    console.error("getRestaurantSettingById:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
   Get Restaurant Setting By Restaurant
========================================================== */

exports.getRestaurantSettingByRestaurant = async (req, res) => {
  try {
    const setting = await RestaurantSetting.findOne({
      restaurant: req.params.restaurantId,
    })
      .populate("restaurant")
      .populate("store");

    if (!setting) {
      return res.status(404).json({
        success: false,
        message: "Restaurant setting not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: setting,
    });
  } catch (error) {
    console.error("getRestaurantSettingByRestaurant:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// =============================================
// Update Restaurant Setting
// =============================================



exports.updateRestaurantSetting = async (req, res) => {
  try {
    const { id } = req.params;

    const setting = await RestaurantSetting.findById(id);

    if (!setting) {
      return res.status(404).json({
        success: false,
        message: "Restaurant setting not found.",
      });
    }

    // Prevent duplicate restaurant mapping
    if (
      req.body.restaurant &&
      req.body.restaurant.toString() !== setting.restaurant.toString()
    ) {
      const exists = await RestaurantSetting.findOne({
        restaurant: req.body.restaurant,
        _id: { $ne: id },
      });

      if (exists) {
        return res.status(400).json({
          success: false,
          message: "Settings already exist for this restaurant.",
        });
      }

      const restaurantExists = await Restaurant.findById(req.body.restaurant);

      if (!restaurantExists) {
        return res.status(404).json({
          success: false,
          message: "Restaurant not found.",
        });
      }
    }

    // ==========================================
    // Basic Information
    // ==========================================

    if (req.body.restaurant) setting.restaurant = req.body.restaurant;

    if (req.body.store !== undefined) setting.store = req.body.store;

    if (req.body.restaurantName !== undefined)
      setting.restaurantName = req.body.restaurantName;

    if (req.body.ownerName !== undefined)
      setting.ownerName = req.body.ownerName;

    if (req.body.email !== undefined) setting.email = req.body.email;

    if (req.body.phone !== undefined) setting.phone = req.body.phone;

    if (req.body.address !== undefined) setting.address = req.body.address;

    if (req.body.gstNumber !== undefined)
      setting.gstNumber = req.body.gstNumber;

    if (req.body.fssaiNumber !== undefined)
      setting.fssaiNumber = req.body.fssaiNumber;

    // ==========================================
    // Localization
    // ==========================================

    if (req.body.currency !== undefined) setting.currency = req.body.currency;

    if (req.body.currencySymbol !== undefined)
      setting.currencySymbol = req.body.currencySymbol;

    if (req.body.timezone !== undefined) setting.timezone = req.body.timezone;

    if (req.body.language !== undefined) setting.language = req.body.language;

    // ==========================================
    // Billing
    // ==========================================

    if (req.body.invoicePrefix !== undefined)
      setting.invoicePrefix = req.body.invoicePrefix;

    if (req.body.invoiceStartNumber !== undefined)
      setting.invoiceStartNumber = req.body.invoiceStartNumber;

    if (req.body.enableGST !== undefined)
      setting.enableGST = req.body.enableGST;

    if (req.body.gstPercentage !== undefined)
      setting.gstPercentage = req.body.gstPercentage;

    if (req.body.serviceCharge !== undefined)
      setting.serviceCharge = req.body.serviceCharge;

    // ==========================================
    // POS
    // ==========================================

    if (req.body.autoPrintInvoice !== undefined)
      setting.autoPrintInvoice = req.body.autoPrintInvoice;

    if (req.body.autoPrintKOT !== undefined)
      setting.autoPrintKOT = req.body.autoPrintKOT;

    if (req.body.allowNegativeStock !== undefined)
      setting.allowNegativeStock = req.body.allowNegativeStock;

    // ==========================================
    // Order
    // ==========================================

    if (req.body.dineInEnabled !== undefined)
      setting.dineInEnabled = req.body.dineInEnabled;

    if (req.body.takeawayEnabled !== undefined)
      setting.takeawayEnabled = req.body.takeawayEnabled;

    if (req.body.deliveryEnabled !== undefined)
      setting.deliveryEnabled = req.body.deliveryEnabled;

    if (req.body.reservationEnabled !== undefined)
      setting.reservationEnabled = req.body.reservationEnabled;

    // ==========================================
    // Payment
    // ==========================================

    if (req.body.acceptedPaymentModes !== undefined)
      setting.acceptedPaymentModes = req.body.acceptedPaymentModes;

    // ==========================================
    // Printer
    // ==========================================

    if (req.body.receiptPrinterName !== undefined)
      setting.receiptPrinterName = req.body.receiptPrinterName;

    if (req.body.kitchenPrinterName !== undefined)
      setting.kitchenPrinterName = req.body.kitchenPrinterName;

    // ==========================================
    // Branding
    // ==========================================

    if (req.body.logo !== undefined) setting.logo = req.body.logo;

    if (req.body.favicon !== undefined) setting.favicon = req.body.favicon;

    if (req.body.receiptFooter !== undefined)
      setting.receiptFooter = req.body.receiptFooter;

    // ==========================================
    // Status
    // ==========================================

    if (req.body.isActive !== undefined) setting.isActive = req.body.isActive;

    if (req.user?.userId) {
      setting.updatedBy = req.user.userId;
    }

    await setting.save();

    const updatedSetting = await RestaurantSetting.findById(setting._id)
      .populate("restaurant", "restaurantName restaurantCode")
      .populate("store", "storeName");

    return res.status(200).json({
      success: true,
      message: "Restaurant setting updated successfully.",
      data: updatedSetting,
    });
  } catch (error) {
    console.error("Update Restaurant Setting Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update restaurant setting.",
      error: error.message,
    });
  }
};
// ==============================================
// Update Billing Settings
// ==============================================

exports.updateBillingSettings = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      invoicePrefix,
      invoiceStartNumber,
      enableGST,
      gstPercentage,
      serviceCharge,
    } = req.body;

    // ==========================================
    // Find Restaurant Setting
    // ==========================================

    const setting = await RestaurantSetting.findById(id);

    if (!setting) {
      return res.status(404).json({
        success: false,
        message: "Restaurant setting not found.",
      });
    }

    // ==========================================
    // Validation
    // ==========================================

    if (invoiceStartNumber !== undefined && Number(invoiceStartNumber) < 1) {
      return res.status(400).json({
        success: false,
        message: "Invoice start number must be greater than 0.",
      });
    }

    if (
      gstPercentage !== undefined &&
      (Number(gstPercentage) < 0 || Number(gstPercentage) > 100)
    ) {
      return res.status(400).json({
        success: false,
        message: "GST percentage must be between 0 and 100.",
      });
    }

    if (serviceCharge !== undefined && Number(serviceCharge) < 0) {
      return res.status(400).json({
        success: false,
        message: "Service charge cannot be negative.",
      });
    }

    // ==========================================
    // Update Billing Fields
    // ==========================================

    if (invoicePrefix !== undefined) {
      setting.invoicePrefix = invoicePrefix.trim().toUpperCase();
    }

    if (invoiceStartNumber !== undefined) {
      setting.invoiceStartNumber = Number(invoiceStartNumber);
    }

    if (enableGST !== undefined) {
      setting.enableGST = enableGST;
    }

    if (gstPercentage !== undefined) {
      setting.gstPercentage = Number(gstPercentage);
    }

    if (serviceCharge !== undefined) {
      setting.serviceCharge = Number(serviceCharge);
    }

    // ==========================================
    // Updated By
    // ==========================================

    if (req.user?.userId) {
      setting.updatedBy = req.user.userId;
    }

    await setting.save();

    // ==========================================
    // Response
    // ==========================================

    return res.status(200).json({
      success: true,
      message: "Billing settings updated successfully.",
      data: {
        _id: setting._id,
        invoicePrefix: setting.invoicePrefix,
        invoiceStartNumber: setting.invoiceStartNumber,
        enableGST: setting.enableGST,
        gstPercentage: setting.gstPercentage,
        serviceCharge: setting.serviceCharge,
        updatedAt: setting.updatedAt,
      },
    });
  } catch (error) {
    console.error("Update Billing Settings Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update billing settings.",
      error: error.message,
    });
  }
};
// ======================================================
// Update POS Settings
// ======================================================



exports.updatePOSSettings = async (req, res) => {
  try {
    const { id } = req.params;

    const { autoPrintInvoice, autoPrintKOT, allowNegativeStock } = req.body;

    // =============================================
    // Find Restaurant Setting
    // =============================================

    const setting = await RestaurantSetting.findById(id);

    if (!setting) {
      return res.status(404).json({
        success: false,
        message: "Restaurant setting not found.",
      });
    }

    // =============================================
    // Update POS Settings
    // =============================================

    if (autoPrintInvoice !== undefined) {
      setting.autoPrintInvoice = Boolean(autoPrintInvoice);
    }

    if (autoPrintKOT !== undefined) {
      setting.autoPrintKOT = Boolean(autoPrintKOT);
    }

    if (allowNegativeStock !== undefined) {
      setting.allowNegativeStock = Boolean(allowNegativeStock);
    }

    // =============================================
    // Updated By
    // =============================================

    if (req.user?.userId) {
      setting.updatedBy = req.user.userId;
    }

    await setting.save();

    // =============================================
    // Response
    // =============================================

    return res.status(200).json({
      success: true,
      message: "POS settings updated successfully.",
      data: {
        _id: setting._id,
        autoPrintInvoice: setting.autoPrintInvoice,
        autoPrintKOT: setting.autoPrintKOT,
        allowNegativeStock: setting.allowNegativeStock,
        updatedAt: setting.updatedAt,
      },
    });
  } catch (error) {
    console.error("Update POS Settings Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update POS settings.",
      error: error.message,
    });
  }
};
// ======================================================
// Update Order Settings
// ======================================================


exports.updateOrderSettings = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      dineInEnabled,
      takeawayEnabled,
      deliveryEnabled,
      reservationEnabled,
    } = req.body;

    // =============================================
    // Find Restaurant Setting
    // =============================================

    const setting = await RestaurantSetting.findById(id);

    if (!setting) {
      return res.status(404).json({
        success: false,
        message: "Restaurant setting not found.",
      });
    }

    // =============================================
    // Update Order Settings
    // =============================================

    if (dineInEnabled !== undefined) {
      setting.dineInEnabled = Boolean(dineInEnabled);
    }

    if (takeawayEnabled !== undefined) {
      setting.takeawayEnabled = Boolean(takeawayEnabled);
    }

    if (deliveryEnabled !== undefined) {
      setting.deliveryEnabled = Boolean(deliveryEnabled);
    }

    if (reservationEnabled !== undefined) {
      setting.reservationEnabled = Boolean(reservationEnabled);
    }

    // =============================================
    // Updated By
    // =============================================

    if (req.user?.userId) {
      setting.updatedBy = req.user.userId;
    }

    await setting.save();

    // =============================================
    // Response
    // =============================================

    return res.status(200).json({
      success: true,
      message: "Order settings updated successfully.",
      data: {
        _id: setting._id,
        dineInEnabled: setting.dineInEnabled,
        takeawayEnabled: setting.takeawayEnabled,
        deliveryEnabled: setting.deliveryEnabled,
        reservationEnabled: setting.reservationEnabled,
        updatedAt: setting.updatedAt,
      },
    });
  } catch (error) {
    console.error("Update Order Settings Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update order settings.",
      error: error.message,
    });
  }
};
// ======================================================
// Update Payment Settings
// ======================================================



exports.updatePaymentSettings = async (req, res) => {
  try {
    const { id } = req.params;

    const { acceptedPaymentModes } = req.body;

    // ==================================================
    // Find Restaurant Setting
    // ==================================================

    const setting = await RestaurantSetting.findById(id);

    if (!setting) {
      return res.status(404).json({
        success: false,
        message: "Restaurant setting not found.",
      });
    }

    // ==================================================
    // Validation
    // ==================================================

    if (acceptedPaymentModes !== undefined) {
      if (!Array.isArray(acceptedPaymentModes)) {
        return res.status(400).json({
          success: false,
          message: "acceptedPaymentModes must be an array.",
        });
      }

      const validPaymentModes = [
        "Cash",
        "Card",
        "UPI",
        "Wallet",
        "Net Banking",
      ];

      const invalidModes = acceptedPaymentModes.filter(
        (mode) => !validPaymentModes.includes(mode),
      );

      if (invalidModes.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid payment mode(s).",
          invalidModes,
          allowedModes: validPaymentModes,
        });
      }

      // Remove duplicate payment modes
      setting.acceptedPaymentModes = [...new Set(acceptedPaymentModes)];
    }

    // ==================================================
    // Updated By
    // ==================================================

    if (req.user?.userId) {
      setting.updatedBy = req.user.userId;
    }

    await setting.save();

    // ==================================================
    // Response
    // ==================================================

    return res.status(200).json({
      success: true,
      message: "Payment settings updated successfully.",
      data: {
        _id: setting._id,
        acceptedPaymentModes: setting.acceptedPaymentModes,
        updatedAt: setting.updatedAt,
      },
    });
  } catch (error) {
    console.error("Update Payment Settings Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update payment settings.",
      error: error.message,
    });
  }
};

exports.updatePrinterSettings = async (req, res) => {
  try {
    const { id } = req.params;
    const { receiptPrinterName, kitchenPrinterName } = req.body;
    const setting = await RestaurantSetting.findById(id);
    if (!setting) {
      return res.status(404).json({
        success: false,
        message: "Restaurant setting not found.",
      });
    }
    if (
      receiptPrinterName !== undefined &&
      typeof receiptPrinterName !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Receipt printer name must be a string.",
      });
    }
    if (
      kitchenPrinterName !== undefined &&
      typeof kitchenPrinterName !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message: "Kitchen printer name must be a string.",
      });
    }
    if (receiptPrinterName !== undefined) {
      setting.receiptPrinterName = receiptPrinterName.trim();
    }
    if (kitchenPrinterName !== undefined) {
      setting.kitchenPrinterName = kitchenPrinterName.trim();
    }
    if (req.user?.userId) {
      setting.updatedBy = req.user.userId;
    }
    await setting.save();
    return res.status(200).json({
      success: true,
      message: "Printer settings updated successfully.",
      data: {
        _id: setting._id,
        receiptPrinterName: setting.receiptPrinterName,
        kitchenPrinterName: setting.kitchenPrinterName,
        updatedAt: setting.updatedAt,
      },
    });
  } catch (error) {
    console.error("Update Printer Settings Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update printer settings.",
      error: error.message,
    });
  }
};
// ======================================================
// Update Branding Settings
// ======================================================



exports.updateBrandingSettings = async (req, res) => {
  try {
    const { id } = req.params;

    const { logo, favicon, receiptFooter } = req.body;

    // =============================================
    // Find Restaurant Setting
    // =============================================

    const setting = await RestaurantSetting.findById(id);

    if (!setting) {
      return res.status(404).json({
        success: false,
        message: "Restaurant setting not found.",
      });
    }

    // =============================================
    // Validation
    // =============================================

    if (logo !== undefined && typeof logo !== "string") {
      return res.status(400).json({
        success: false,
        message: "Logo must be a valid string.",
      });
    }

    if (favicon !== undefined && typeof favicon !== "string") {
      return res.status(400).json({
        success: false,
        message: "Favicon must be a valid string.",
      });
    }

    if (receiptFooter !== undefined && typeof receiptFooter !== "string") {
      return res.status(400).json({
        success: false,
        message: "Receipt footer must be a valid string.",
      });
    }

    // =============================================
    // Update Branding Settings
    // =============================================

    if (logo !== undefined) {
      setting.logo = logo.trim();
    }

    if (favicon !== undefined) {
      setting.favicon = favicon.trim();
    }

    if (receiptFooter !== undefined) {
      setting.receiptFooter = receiptFooter.trim();
    }

    // =============================================
    // Updated By
    // =============================================

    if (req.user?.userId) {
      setting.updatedBy = req.user.userId;
    }

    await setting.save();

    // =============================================
    // Response
    // =============================================

    return res.status(200).json({
      success: true,
      message: "Branding settings updated successfully.",
      data: {
        _id: setting._id,
        logo: setting.logo,
        favicon: setting.favicon,
        receiptFooter: setting.receiptFooter,
        updatedAt: setting.updatedAt,
      },
    });
  } catch (error) {
    console.error("Update Branding Settings Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update branding settings.",
      error: error.message,
    });
  }
};
// ======================================================
// Update Localization Settings
// ======================================================


exports.updateLocalizationSettings = async (req, res) => {
  try {
    const { id } = req.params;

    const { currency, currencySymbol, timezone, language } = req.body;

    // =============================================
    // Find Restaurant Setting
    // =============================================

    const setting = await RestaurantSetting.findById(id);

    if (!setting) {
      return res.status(404).json({
        success: false,
        message: "Restaurant setting not found.",
      });
    }

    // =============================================
    // Validation
    // =============================================

    if (currency !== undefined && typeof currency !== "string") {
      return res.status(400).json({
        success: false,
        message: "Currency must be a string.",
      });
    }

    if (currencySymbol !== undefined && typeof currencySymbol !== "string") {
      return res.status(400).json({
        success: false,
        message: "Currency symbol must be a string.",
      });
    }

    if (timezone !== undefined && typeof timezone !== "string") {
      return res.status(400).json({
        success: false,
        message: "Timezone must be a string.",
      });
    }

    if (language !== undefined && typeof language !== "string") {
      return res.status(400).json({
        success: false,
        message: "Language must be a string.",
      });
    }

    // =============================================
    // Update Localization Settings
    // =============================================

    if (currency !== undefined) {
      setting.currency = currency.trim().toUpperCase();
    }

    if (currencySymbol !== undefined) {
      setting.currencySymbol = currencySymbol.trim();
    }

    if (timezone !== undefined) {
      setting.timezone = timezone.trim();
    }

    if (language !== undefined) {
      setting.language = language.trim();
    }

    // =============================================
    // Updated By
    // =============================================

    if (req.user?.userId) {
      setting.updatedBy = req.user.userId;
    }

    await setting.save();

    // =============================================
    // Response
    // =============================================

    return res.status(200).json({
      success: true,
      message: "Localization settings updated successfully.",
      data: {
        _id: setting._id,
        currency: setting.currency,
        currencySymbol: setting.currencySymbol,
        timezone: setting.timezone,
        language: setting.language,
        updatedAt: setting.updatedAt,
      },
    });
  } catch (error) {
    console.error("Update Localization Settings Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update localization settings.",
      error: error.message,
    });
  }
};

exports.activateRestaurantSetting = async (req, res) => {
  try {
    const setting = await RestaurantSetting.findById(req.params.id);

    if (!setting) {
      return res.status(404).json({
        success: false,

        message: "Restaurant setting not found",
      });
    }

    setting.isActive = true;

    await setting.save();

    res.status(200).json({
      success: true,

      message: "Restaurant setting activated successfully",

      data: setting,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

/* ==========================================================

   deactivateRestaurantSetting()

========================================================== */

exports.deactivateRestaurantSetting = async (req, res) => {
  try {
    const setting = await RestaurantSetting.findById(req.params.id);

    if (!setting) {
      return res.status(404).json({
        success: false,

        message: "Restaurant setting not found",
      });
    }

    setting.isActive = false;

    await setting.save();

    res.status(200).json({
      success: true,

      message: "Restaurant setting deactivated successfully",

      data: setting,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

/* ==========================================================

   deleteRestaurantSetting()  (Soft Delete)

========================================================== */

exports.deleteRestaurantSetting = async (req, res) => {
  try {
    const setting = await RestaurantSetting.findById(req.params.id);

    if (!setting) {
      return res.status(404).json({
        success: false,

        message: "Restaurant setting not found",
      });
    }

    setting.isDeleted = true;

    setting.deletedAt = new Date();

    await setting.save();

    res.status(200).json({
      success: true,

      message: "Restaurant setting deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

exports.restoreRestaurantSetting = async (req, res) => {
  try {
    const setting = await RestaurantSetting.findOne({
      _id: req.params.id,
    }).setOptions({
      bypassDeleted: true,
    });
    if (!setting) {
      return res.status(404).json({
        success: false,
        message: "Restaurant setting not found",
      });
    }
    setting.isDeleted = false;
    setting.deletedAt = null;
    await setting.save();
    res.status(200).json({
      success: true,
      message: "Restaurant setting restored successfully",
      data: setting,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.searchRestaurantSettings = async (req, res) => {
  try {
    const {
      keyword = "",

      restaurant,

      store,

      isActive,

      page = 1,

      limit = 10,
    } = req.query;

    const filter = {};

    if (restaurant) filter.restaurant = restaurant;

    if (store) filter.store = store;

    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    if (keyword) {
      filter.$or = [
        {
          restaurantName: {
            $regex: keyword,

            $options: "i",
          },
        },

        {
          ownerName: {
            $regex: keyword,

            $options: "i",
          },
        },

        {
          phone: {
            $regex: keyword,

            $options: "i",
          },
        },

        {
          email: {
            $regex: keyword,

            $options: "i",
          },
        },

        {
          gstNumber: {
            $regex: keyword,

            $options: "i",
          },
        },

        {
          fssaiNumber: {
            $regex: keyword,

            $options: "i",
          },
        },
      ];
    }

    const total = await RestaurantSetting.countDocuments(filter);

    const settings = await RestaurantSetting.find(filter)

      .populate("restaurant", "restaurantName restaurantCode")

      .populate("store", "storeName")

      .sort({
        createdAt: -1,
      })

      .skip((page - 1) * limit)

      .limit(Number(limit));

    res.status(200).json({
      success: true,

      total,

      currentPage: Number(page),

      totalPages: Math.ceil(total / limit),

      count: settings.length,

      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

/* ==========================================================

   getActiveRestaurantSettings()

========================================================== */

exports.getActiveRestaurantSettings = async (req, res) => {
  try {
    const settings = await RestaurantSetting.find({
      isActive: true,
    })

      .populate("restaurant", "restaurantName restaurantCode")

      .populate("store", "storeName")

      .sort({
        restaurantName: 1,
      });

    res.status(200).json({
      success: true,

      count: settings.length,

      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

/* ==========================================================

   getInactiveRestaurantSettings()

========================================================== */

exports.getInactiveRestaurantSettings = async (req, res) => {
  try {
    const settings = await RestaurantSetting.find({
      isActive: false,
    })

      .populate("restaurant", "restaurantName restaurantCode")

      .populate("store", "storeName")

      .sort({
        restaurantName: 1,
      });

    res.status(200).json({
      success: true,

      count: settings.length,

      data: settings,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

/* ==========================================================

   getRestaurantSettingSummary()

========================================================== */

exports.getRestaurantSettingSummary = async (req, res) => {
  try {
    const [
      totalSettings,
      activeSettings,
      inactiveSettings,
      gstEnabled,
      reservationEnabled,
      deliveryEnabled,
      dineInEnabled,
      takeawayEnabled,
    ] = await Promise.all([
      RestaurantSetting.countDocuments({}),
      RestaurantSetting.countDocuments({
        isActive: true,
      }),
      RestaurantSetting.countDocuments({
        isActive: false,
      }),
      RestaurantSetting.countDocuments({
        enableGST: true,
      }),
      RestaurantSetting.countDocuments({
        reservationEnabled: true,
      }),
      RestaurantSetting.countDocuments({
        deliveryEnabled: true,
      }),
      RestaurantSetting.countDocuments({
        dineInEnabled: true,
      }),
      RestaurantSetting.countDocuments({
        takeawayEnabled: true,
      }),
    ]);
    res.status(200).json({
      success: true,
      data: {
        totalSettings,
        activeSettings,
        inactiveSettings,
        gstEnabled,
        reservationEnabled,
        deliveryEnabled,
        dineInEnabled,
        takeawayEnabled,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
