const mongoose = require("mongoose");

const Order = require("../models/Order");
const MenuItem = require("../models/MenuItem");
const Restaurant = require("../models/Restaurant");
const Store = require("../models/storeModel");
const Table = require("../models/Table");
const KOT = require("../models/KOT");

/* ==========================================================
   GENERATE ORDER NUMBER
========================================================== */

const generateOrderNo = async (restaurantId) => {
  const restaurant = await Restaurant.findById(restaurantId).select(
    "orderPrefix"
  );

  const prefix = restaurant?.orderPrefix || "ORD";

  const count = await Order.countDocuments({
    restaurant: restaurantId,
  });

  return `${prefix}-${String(count + 1).padStart(6, "0")}`;
};

/* ==========================================================
   GENERATE KOT NUMBER
========================================================== */

const generateKOTNo = async (restaurantId) => {
  const restaurant = await Restaurant.findById(restaurantId).select(
    "kotPrefix"
  );

  const prefix = restaurant?.kotPrefix || "KOT";

  const count = await KOT.countDocuments({
    restaurant: restaurantId,
  });

  return `${prefix}-${String(count + 1).padStart(6, "0")}`;
};

/* ==========================================================
   PRICE BASED ON ORDER TYPE
========================================================== */

const getMenuPrice = (menuItem, orderType) => {
  switch (orderType) {
    case "Takeaway":
      return Number(menuItem.takeawayPrice || menuItem.dineInPrice || 0);

    case "Delivery":
      return Number(menuItem.deliveryPrice || menuItem.dineInPrice || 0);

    case "Online":
      return Number(menuItem.deliveryPrice || menuItem.dineInPrice || 0);

    case "QR Order":
      return Number(menuItem.dineInPrice || 0);

    case "Dine In":
    default:
      return Number(menuItem.dineInPrice || 0);
  }
};

/* ==========================================================
   CREATE POS ORDER
========================================================== */

exports.createPOSOrder = async (req, res) => {
  try {
    const {
      restaurant,
      store,
      customer = null,
      table = null,
      waiter = null,
      reservation = null,
      orderType = "Dine In",
      items,
      remarks = "",
    } = req.body;

    /* ------------------------------------------------------
       BASIC VALIDATION
    ------------------------------------------------------ */

    if (!restaurant || !store) {
      return res.status(400).json({
        success: false,
        message: "Restaurant and store are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(restaurant)) {
      return res.status(400).json({
        success: false,
        message: "Invalid restaurant ID",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(store)) {
      return res.status(400).json({
        success: false,
        message: "Invalid store ID",
      });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one item is required",
      });
    }

    /* ------------------------------------------------------
       RESTAURANT
    ------------------------------------------------------ */

    const restaurantDoc = await Restaurant.findOne({
      _id: restaurant,
      isDeleted: false,
      status: "Active",
    });

    if (!restaurantDoc) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    /* ------------------------------------------------------
       STORE
    ------------------------------------------------------ */

    const storeDoc = await Store.findById(store);

    if (!storeDoc) {
      return res.status(404).json({
        success: false,
        message: "Store not found",
      });
    }

    /* ------------------------------------------------------
       DINE IN TABLE VALIDATION
    ------------------------------------------------------ */

    let tableDoc = null;

    if (orderType === "Dine In") {
      if (!table) {
        return res.status(400).json({
          success: false,
          message: "Table is required for Dine In order",
        });
      }

      tableDoc = await Table.findOne({
        _id: table,
        restaurant,
        store,
        isDeleted: false,
        isActive: true,
      });

      if (!tableDoc) {
        return res.status(404).json({
          success: false,
          message: "Table not found",
        });
      }

      if (
        tableDoc.status === "Occupied" &&
        tableDoc.currentOrder
      ) {
        return res.status(400).json({
          success: false,
          message: "Table is already occupied",
        });
      }
    }

    /* ------------------------------------------------------
       LOAD MENU ITEMS
    ------------------------------------------------------ */

    const menuItemIds = items.map((item) => item.menuItem);

    const menuItems = await MenuItem.find({
      _id: {
        $in: menuItemIds,
      },
      restaurant,
      store,
      isDeleted: false,
      isAvailable: true,
      status: "Active",
    });

    if (menuItems.length !== menuItemIds.length) {
      return res.status(400).json({
        success: false,
        message: "One or more menu items are unavailable",
      });
    }

    /* ------------------------------------------------------
       CREATE ORDER ITEMS
    ------------------------------------------------------ */

    const orderItems = [];

    let subTotal = 0;
    let totalDiscount = 0;
    let totalTaxable = 0;
    let totalGST = 0;
    let totalCGST = 0;
    let totalSGST = 0;
    let totalIGST = 0;
    let totalQuantity = 0;

    for (const requestedItem of items) {
      const menuItem = menuItems.find(
        (item) =>
          item._id.toString() ===
          requestedItem.menuItem.toString()
      );

      if (!menuItem) {
        continue;
      }

      const quantity = Math.max(
        1,
        Number(requestedItem.quantity || 1)
      );

      let unitPrice = getMenuPrice(
        menuItem,
        orderType
      );

      /* ----------------------------------------------------
         VARIANT
      ---------------------------------------------------- */

      let selectedVariant = null;

      if (requestedItem.variant?.name) {
        const variant = menuItem.variants?.find(
          (v) =>
            v.name === requestedItem.variant.name
        );

        if (!variant) {
          return res.status(400).json({
            success: false,
            message: `Variant "${requestedItem.variant.name}" not found for ${menuItem.menuName}`,
          });
        }

        selectedVariant = {
          name: variant.name,
          price: Number(variant.price || 0),
        };

        unitPrice = Number(variant.price || unitPrice);
      }

      /* ----------------------------------------------------
         ADDONS
      ---------------------------------------------------- */

      const selectedAddons = [];

      if (
        Array.isArray(requestedItem.addons) &&
        requestedItem.addons.length > 0
      ) {
        for (const requestedAddon of requestedItem.addons) {
          const addonId =
            requestedAddon.addon || requestedAddon;

          const addon = await mongoose
            .model("Addon")
            .findById(addonId);

          if (!addon) {
            return res.status(400).json({
              success: false,
              message: "Invalid addon selected",
            });
          }

          selectedAddons.push({
            addon: addon._id,
            addonName:
              addon.addonName ||
              addon.name ||
              "Addon",
            price: Number(
              addon.price ||
                addon.sellingPrice ||
                0
            ),
          });

          unitPrice += Number(
            addon.price ||
              addon.sellingPrice ||
              0
          );
        }
      }

      /* ----------------------------------------------------
         DISCOUNT
      ---------------------------------------------------- */

      const discountPercentage = Number(
        menuItem.discountPercentage || 0
      );

      const grossAmount =
        unitPrice * quantity;

      const discountAmount =
        (grossAmount * discountPercentage) / 100;

      const taxableAmount =
        grossAmount - discountAmount;

      /* ----------------------------------------------------
         GST
      ---------------------------------------------------- */

      const gstPercentage = Number(
        menuItem.gstPercentage || 0
      );

      const gstAmount =
        (taxableAmount * gstPercentage) / 100;

      const cgstAmount =
        gstAmount / 2;

      const sgstAmount =
        gstAmount / 2;

      const igstAmount = 0;

      const totalAmount =
        taxableAmount + gstAmount;

      /* ----------------------------------------------------
         TOTALS
      ---------------------------------------------------- */

      subTotal += grossAmount;
      totalDiscount += discountAmount;
      totalTaxable += taxableAmount;
      totalGST += gstAmount;
      totalCGST += cgstAmount;
      totalSGST += sgstAmount;
      totalIGST += igstAmount;
      totalQuantity += quantity;

      orderItems.push({
        menuItem: menuItem._id,
        recipe: menuItem.recipe || null,

        variant: selectedVariant,

        addons: selectedAddons,

        menuCode: menuItem.menuCode,
        menuName: menuItem.menuName,

        quantity,

        unitPrice,

        discountPercentage,

        discountAmount,

        taxableAmount,

        gstPercentage,

        cgstAmount,
        sgstAmount,
        igstAmount,
        gstAmount,

        totalAmount,

        kitchenStatus: "Pending",

        remarks:
          requestedItem.remarks || "",
      });
    }

    /* ------------------------------------------------------
       SERVICE / CHARGES
    ------------------------------------------------------ */

    let serviceCharge = 0;
    let packingCharge = 0;
    let deliveryCharge = 0;

    if (
      restaurantDoc.serviceChargeEnabled &&
      orderType === "Dine In"
    ) {
      serviceCharge =
        (totalTaxable *
          Number(
            restaurantDoc.serviceChargePercentage || 0
          )) /
        100;
    }

    if (orderType === "Takeaway") {
      packingCharge = 0;
    }

    if (orderType === "Delivery") {
      deliveryCharge = 0;
    }

    /* ------------------------------------------------------
       GRAND TOTAL
    ------------------------------------------------------ */

    const beforeRound =
      totalTaxable +
      totalGST +
      serviceCharge +
      packingCharge +
      deliveryCharge;

    const grandTotal =
      Math.round(beforeRound);

    const roundOffAmount =
      Number(
        (grandTotal - beforeRound).toFixed(2)
      );

    /* ------------------------------------------------------
       ORDER NUMBER
    ------------------------------------------------------ */

    const orderNo =
      await generateOrderNo(restaurant);

    /* ------------------------------------------------------
       CREATE ORDER
    ------------------------------------------------------ */

    const order = await Order.create({
      orderNo,

      restaurant,
      store,

      customer,
      table,
      waiter,
      reservation,

      orderType,

      items: orderItems,

      totalItems: orderItems.length,
      totalQuantity,

      subTotal,

      discountPercentage: 0,
      discountAmount: totalDiscount,

      taxableAmount: totalTaxable,

      cgstAmount: totalCGST,
      sgstAmount: totalSGST,
      igstAmount: totalIGST,

      gstAmount: totalGST,

      serviceCharge,
      packingCharge,
      deliveryCharge,

      tipAmount: 0,

      roundOffAmount,

      grandTotal,

      paymentMethod: "Cash",
      paymentStatus: "Pending",

      paidAmount: 0,
      dueAmount: grandTotal,

      orderStatus: "Pending",
      kitchenStatus: "Pending",

      remarks,

      createdBy: req.user?.id,
    });

    /* ------------------------------------------------------
       UPDATE TABLE
    ------------------------------------------------------ */

    if (tableDoc) {
      tableDoc.status = "Occupied";
      tableDoc.currentOrder = order._id;

      await tableDoc.save();
    }

    /* ------------------------------------------------------
       CREATE KOT
    ------------------------------------------------------ */

    const kotNo =
      await generateKOTNo(restaurant);

    const kotItems = order.items.map(
      (item) => ({
        orderItem: item.menuItem,

        menuItem: item.menuItem,

        recipe: item.recipe,

        menuCode: item.menuCode,

        menuName: item.menuName,

        quantity: item.quantity,

        estimatedPreparationTime: 15,

        kitchenStatus: "Pending",

        remarks: item.remarks || "",
      })
    );

    const kot = await KOT.create({
      kotNo,

      restaurant,
      store,

      order: order._id,

      customer,
      reservation,
      table,
      waiter,

      kotType: orderType,

      priority: "Normal",

      items: kotItems,

      totalItems: kotItems.length,

      totalQuantity,

      kitchenStatus: "Pending",

      printed: false,

      createdBy: req.user?.id,
    });

    /* ------------------------------------------------------
       POPULATE
    ------------------------------------------------------ */

    const populatedOrder =
      await Order.findById(order._id)
        .populate("restaurant")
        .populate("store")
        .populate("customer")
        .populate("table")
        .populate("waiter")
        .populate("items.menuItem");

    res.status(201).json({
      success: true,
      message: "POS order created successfully",
      data: {
        order: populatedOrder,
        kot,
      },
    });
  } catch (error) {
    console.error("createPOSOrder:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
