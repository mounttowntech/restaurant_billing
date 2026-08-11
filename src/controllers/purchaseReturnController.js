const mongoose = require("mongoose");

const Purchase = require("../models/Purchase");
const PurchaseReturn = require("../models/purchaseReturnModel");
const Ingredient = require("../models/Ingredient");


// ==========================================================
// HELPER: Generate Purchase Return Number
// ==========================================================

const generateReturnNo = async () => {
  const lastReturn = await PurchaseReturn.findOne({})
    .sort({ createdAt: -1 })
    .select("returnNo")
    .lean();

  let nextNumber = 1;

  if (lastReturn && lastReturn.returnNo) {
    const match =
      String(lastReturn.returnNo).match(
        /(\d+)$/
      );

    if (match) {
      nextNumber =
        Number(match[1]) + 1;
    }
  }

  return `PR-${String(nextNumber).padStart(
    6,
    "0"
  )}`;
};

// ==========================================================
// HELPER: Round
// ==========================================================

const round = (value) => {
  return Number(
    (Number(value) || 0).toFixed(2)
  );
};

// ==========================================================
// CREATE PURCHASE RETURN
// ==========================================================

exports.createPurchaseReturn = async (
  req,
  res
) => {
  const session =
    await mongoose.startSession();

  try {
    const {
      company,
      restaurant,
      store,
      warehouse,
      supplier,
      purchase,
      items,
      returnDate,
      otherCharges,
      paymentStatus,
      returnReason,
      remarks,
    } = req.body;

    // ======================================================
    // BASIC VALIDATION
    // ======================================================

    if (!company) {
      return res.status(400).json({
        success: false,
        message: "Company is required.",
      });
    }

    if (!restaurant) {
      return res.status(400).json({
        success: false,
        message:
          "Restaurant is required.",
      });
    }

    if (!store) {
      return res.status(400).json({
        success: false,
        message: "Store is required.",
      });
    }

    if (!supplier) {
      return res.status(400).json({
        success: false,
        message:
          "Supplier is required.",
      });
    }

    if (!purchase) {
      return res.status(400).json({
        success: false,
        message:
          "Purchase is required.",
      });
    }

    if (!Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message:
          "Items must be an array.",
      });
    }

    if (items.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "At least one return item is required.",
      });
    }

    // ======================================================
    // VALIDATE IDS
    // ======================================================

    const idsToValidate = [
      {
        name: "company",
        value: company,
      },
      {
        name: "restaurant",
        value: restaurant,
      },
      {
        name: "store",
        value: store,
      },
      {
        name: "supplier",
        value: supplier,
      },
      {
        name: "purchase",
        value: purchase,
      },
    ];

    if (warehouse) {
      idsToValidate.push({
        name: "warehouse",
        value: warehouse,
      });
    }

    for (
      let i = 0;
      i < idsToValidate.length;
      i++
    ) {
      const item =
        idsToValidate[i];

      if (
        !mongoose.Types.ObjectId.isValid(
          item.value
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            `${item.name} contains an invalid ID.`,
        });
      }
    }

    // ======================================================
    // FIND ORIGINAL PURCHASE
    // ======================================================

    const originalPurchase =
      await Purchase.findOne({
        _id: purchase,
        supplier: supplier,
        restaurant: restaurant,
        store: store,
        isDeleted: false,
      }).lean();

    if (!originalPurchase) {
      return res.status(404).json({
        success: false,
        message:
          "Original purchase not found.",
      });
    }

    // ======================================================
    // CHECK PURCHASE ITEMS
    // ======================================================

    const purchaseItems =
      Array.isArray(
        originalPurchase.items
      )
        ? originalPurchase.items
        : [];

    if (purchaseItems.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "Original purchase has no items.",
      });
    }

    // ======================================================
    // CREATE MAP OF PURCHASED INGREDIENTS
    // ======================================================

    const purchasedMap = new Map();

    for (
      let i = 0;
      i < purchaseItems.length;
      i++
    ) {
      const purchaseItem =
        purchaseItems[i];

      if (
        !purchaseItem ||
        !purchaseItem.ingredient
      ) {
        continue;
      }

      const ingredientId =
        String(
          purchaseItem.ingredient
        );

      const existing =
        purchasedMap.get(
          ingredientId
        );

      const quantity =
        Number(
          purchaseItem.quantity
        ) || 0;

      if (existing) {
        existing.quantity +=
          quantity;
      } else {
        purchasedMap.set(
          ingredientId,
          {
            quantity,
            ingredient:
              purchaseItem.ingredient,
            ingredientCode:
              purchaseItem.ingredientCode ||
              "",
            ingredientName:
              purchaseItem.ingredientName ||
              "",
            barcode:
              purchaseItem.barcode ||
              "",
            unit:
              purchaseItem.unit ||
              null,
            purchaseUnit:
              purchaseItem.purchaseUnit ||
              null,
            purchasePrice:
              Number(
                purchaseItem.purchasePrice
              ) || 0,
            gstPercentage:
              Number(
                purchaseItem.gstPercentage
              ) || 0,
          }
        );
      }
    }

    // ======================================================
    // CHECK PREVIOUS RETURNS
    // ======================================================

    const previousReturns =
      await PurchaseReturn.find({
        purchase: purchase,
        status: {
          $ne: "cancelled",
        },
        isDeleted: false,
      }).lean();

    const alreadyReturnedMap =
      new Map();

    for (
      let i = 0;
      i < previousReturns.length;
      i++
    ) {
      const previousReturn =
        previousReturns[i];

      const previousItems =
        Array.isArray(
          previousReturn.items
        )
          ? previousReturn.items
          : [];

      for (
        let j = 0;
        j < previousItems.length;
        j++
      ) {
        const returnItem =
          previousItems[j];

        if (
          !returnItem ||
          !returnItem.ingredient
        ) {
          continue;
        }

        const ingredientId =
          String(
            returnItem.ingredient
          );

        const quantity =
          Number(
            returnItem.quantity
          ) || 0;

        const oldQuantity =
          alreadyReturnedMap.get(
            ingredientId
          ) || 0;

        alreadyReturnedMap.set(
          ingredientId,
          oldQuantity +
            quantity
        );
      }
    }

    // ======================================================
    // START SESSION
    // ======================================================

    session.startTransaction();

    // ======================================================
    // PREPARE RETURN ITEMS
    // ======================================================

    const preparedItems = [];

    let totalItems = 0;
    let totalQuantity = 0;
    let subtotal = 0;
    let totalDiscount = 0;
    let totalTaxable = 0;
    let totalCGST = 0;
    let totalSGST = 0;
    let totalIGST = 0;
    let totalGST = 0;

    for (
      let i = 0;
      i < items.length;
      i++
    ) {
      const inputItem =
        items[i];

      // ----------------------------------------------------
      // INGREDIENT
      // ----------------------------------------------------

      const ingredientId =
        inputItem &&
        inputItem.ingredient;

      if (!ingredientId) {
        await session.abortTransaction();

        return res.status(400).json({
          success: false,
          message:
            `Ingredient is required for item ${i + 1}.`,
        });
      }

      if (
        !mongoose.Types.ObjectId.isValid(
          ingredientId
        )
      ) {
        await session.abortTransaction();

        return res.status(400).json({
          success: false,
          message:
            `Invalid ingredient ID for item ${i + 1}.`,
        });
      }

      const ingredientKey =
        String(ingredientId);

      // ----------------------------------------------------
      // CHECK ORIGINAL PURCHASE
      // ----------------------------------------------------

      const purchased =
        purchasedMap.get(
          ingredientKey
        );

      if (!purchased) {
        await session.abortTransaction();

        return res.status(400).json({
          success: false,
          message:
            `Ingredient was not part of the original purchase.`,
        });
      }

      // ----------------------------------------------------
      // QUANTITY
      // ----------------------------------------------------

      const quantity =
        Number(
          inputItem.quantity
        );

      if (
        !Number.isFinite(
          quantity
        ) ||
        quantity <= 0
      ) {
        await session.abortTransaction();

        return res.status(400).json({
          success: false,
          message:
            `Invalid return quantity for ${purchased.ingredientName || "ingredient"}.`,
        });
      }

      // ----------------------------------------------------
      // PREVIOUSLY RETURNED
      // ----------------------------------------------------

      const previouslyReturned =
        alreadyReturnedMap.get(
          ingredientKey
        ) || 0;

      const remainingReturnable =
        purchased.quantity -
        previouslyReturned;

      if (
        quantity >
        remainingReturnable
      ) {
        await session.abortTransaction();

        return res.status(400).json({
          success: false,
          message:
            `Cannot return ${quantity} of ${
              purchased.ingredientName ||
              "ingredient"
            }. Purchased: ${
              purchased.quantity
            }, Already returned: ${
              previouslyReturned
            }, Remaining returnable: ${
              remainingReturnable
            }.`,
        });
      }

      // ----------------------------------------------------
      // FIND INGREDIENT
      // ----------------------------------------------------

      const ingredient =
        await Ingredient.findOne({
          _id: ingredientId,
          restaurant: restaurant,
          store: store,
          isDeleted: false,
        }).session(session);

      if (!ingredient) {
        await session.abortTransaction();

        return res.status(404).json({
          success: false,
          message:
            `Ingredient not found: ${
              purchased.ingredientName ||
              ingredientId
            }.`,
        });
      }

      // ----------------------------------------------------
      // STOCK CHECK
      // ----------------------------------------------------

      const currentStock =
        Number(
          ingredient.currentStock
        ) || 0;

      if (
        quantity >
        currentStock
      ) {
        await session.abortTransaction();

        return res.status(400).json({
          success: false,
          message:
            `Insufficient stock for ${
              ingredient.ingredientName
            }. Available: ${
              currentStock
            }, Return quantity: ${
              quantity
            }.`,
        });
      }

      // ----------------------------------------------------
      // PRICE
      // ----------------------------------------------------

      const purchasePrice =
        Number(
          inputItem.purchasePrice
        );

      const finalPurchasePrice =
        Number.isFinite(
          purchasePrice
        )
          ? purchasePrice
          : Number(
              purchased.purchasePrice
            ) || 0;

      // ----------------------------------------------------
      // DISCOUNT
      // ----------------------------------------------------

      const discountPercentage =
        Number(
          inputItem.discountPercentage
        ) || 0;

      const grossAmount =
        quantity *
        finalPurchasePrice;

      const discountAmount =
        round(
          grossAmount *
            discountPercentage /
            100
        );

      const taxableAmount =
        round(
          grossAmount -
            discountAmount
        );

      // ----------------------------------------------------
      // GST
      // ----------------------------------------------------

      const gstPercentage =
        Number(
          inputItem.gstPercentage
        );

      const finalGSTPercentage =
        Number.isFinite(
          gstPercentage
        )
          ? gstPercentage
          : Number(
              purchased.gstPercentage
            ) ||
            Number(
              ingredient.gstPercentage
            ) ||
            0;

      const gstAmount =
        round(
          taxableAmount *
            finalGSTPercentage /
            100
        );

      const cgstAmount =
        round(
          gstAmount / 2
        );

      const sgstAmount =
        round(
          gstAmount / 2
        );

      const igstAmount = 0;

      const totalAmount =
        round(
          taxableAmount +
            gstAmount
        );

      // ----------------------------------------------------
      // PREPARE ITEM
      // ----------------------------------------------------

      const preparedItem = {
        ingredient:
          ingredient._id,

        ingredientCode:
          ingredient.ingredientCode ||
          purchased.ingredientCode ||
          "",

        ingredientName:
          ingredient.ingredientName ||
          purchased.ingredientName ||
          "",

        barcode:
          ingredient.barcode ||
          purchased.barcode ||
          "",

        unit:
          inputItem.unit ||
          purchased.unit ||
          ingredient.unit ||
          null,

        purchaseUnit:
          inputItem.purchaseUnit ||
          purchased.purchaseUnit ||
          ingredient.purchaseUnit ||
          null,

        quantity,

        purchasePrice:
          finalPurchasePrice,

        discountPercentage,

        discountAmount,

        gstPercentage:
          finalGSTPercentage,

        cgstAmount,

        sgstAmount,

        igstAmount,

        taxAmount:
          gstAmount,

        taxableAmount,

        totalAmount,

        reason:
          inputItem.reason ||
          "",
      };

      preparedItems.push(
        preparedItem
      );

      totalItems++;

      totalQuantity +=
        quantity;

      subtotal +=
        grossAmount;

      totalDiscount +=
        discountAmount;

      totalTaxable +=
        taxableAmount;

      totalCGST +=
        cgstAmount;

      totalSGST +=
        sgstAmount;

      totalIGST +=
        igstAmount;

      totalGST +=
        gstAmount;
    }

    // ======================================================
    // ROUND TOTALS
    // ======================================================

    subtotal =
      round(subtotal);

    totalDiscount =
      round(totalDiscount);

    totalTaxable =
      round(totalTaxable);

    totalCGST =
      round(totalCGST);

    totalSGST =
      round(totalSGST);

    totalIGST =
      round(totalIGST);

    totalGST =
      round(totalGST);

    const charges =
      Number(otherCharges) || 0;

    const grandTotal =
      round(
        totalTaxable +
          totalGST +
          charges
      );

    // ======================================================
    // GENERATE RETURN NUMBER
    // ======================================================

    const returnNo =
      await generateReturnNo();

    // ======================================================
    // CREATE PURCHASE RETURN
    // ======================================================

    const purchaseReturn =
      new PurchaseReturn({
        company,

        restaurant,

        store,

        warehouse:
          warehouse || null,

        supplier,

        purchase,

        purchaseInvoiceNo:
          originalPurchase.invoiceNumber ||
          "",

        returnNo,

        returnDate:
          returnDate
            ? new Date(returnDate)
            : new Date(),

        items:
          preparedItems,

        totalItems,

        totalQuantity:

          round(totalQuantity),

        subtotal,

        discountAmount:
          totalDiscount,

        taxableAmount:
          totalTaxable,

        cgstAmount:
          totalCGST,

        sgstAmount:
          totalSGST,

        igstAmount:
          totalIGST,

        totalTax:
          totalGST,

        otherCharges:
          charges,

        grandTotal,

        paymentStatus:
          paymentStatus ||
          "pending",

        status:
          "completed",

        returnReason:
          returnReason || "",

        remarks:
          remarks || "",

        createdBy:
          req.user?._id ||
          req.user?.id ||
          null,

        updatedBy:
          req.user?._id ||
          req.user?.id ||
          null,
      });

    await purchaseReturn.save({
      session,
    });

    // ======================================================
    // UPDATE INGREDIENT STOCK
    // ======================================================

    for (
      let i = 0;
      i < preparedItems.length;
      i++
    ) {
      const returnItem =
        preparedItems[i];

      const quantity =
        Number(
          returnItem.quantity
        ) || 0;

      const ingredient =
        await Ingredient.findOne({
          _id:
            returnItem.ingredient,
          restaurant:
            restaurant,
          store:
            store,
          isDeleted:
            false,
        }).session(session);

      if (!ingredient) {
        throw new Error(
          `Ingredient not found while updating stock: ${returnItem.ingredient}`
        );
      }

      const currentStock =
        Number(
          ingredient.currentStock
        ) || 0;

      if (
        quantity >
        currentStock
      ) {
        throw new Error(
          `Insufficient stock for ${ingredient.ingredientName}. Available: ${currentStock}, Return quantity: ${quantity}.`
        );
      }

      ingredient.currentStock =
        round(
          currentStock -
            quantity
        );

      ingredient.stockValue =
        round(
          ingredient.currentStock *
            (
              Number(
                ingredient.averageCost
              ) ||
              Number(
                ingredient.purchasePrice
              ) ||
              Number(
                returnItem.purchasePrice
              ) ||
              0
            )
        );

      ingredient.updatedBy =
        req.user?._id ||
        req.user?.id ||
        null;

      await ingredient.save({
        session,
      });
    }

    // ======================================================
    // COMMIT
    // ======================================================

    await session.commitTransaction();

    // ======================================================
    // POPULATE RESULT
    // ======================================================

    const result =
      await PurchaseReturn.findById(
        purchaseReturn._id
      )
        .populate(
          "supplier",
          "supplierName supplierCode phone email"
        )
        .populate(
          "restaurant",
          "restaurantName restaurantCode"
        )
        .populate(
          "store",
          "storeName storeCode"
        )
        .populate(
          "purchase",
          "purchaseNo invoiceNumber purchaseDate"
        )
        .populate(
          "items.ingredient",
          "ingredientCode ingredientName currentStock"
        )
        .lean();

    return res.status(201).json({
      success: true,
      message:
        "Purchase return created successfully.",
      data: result,
    });
  } catch (error) {
    // ======================================================
    // ROLLBACK
    // ======================================================

    try {
      if (
        session.inTransaction()
      ) {
        await session.abortTransaction();
      }
    } catch (rollbackError) {
      console.error(
        "Rollback error:",
        rollbackError
      );
    }

    console.error(
      "CREATE PURCHASE RETURN ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to create purchase return.",
      error:
        error.message,
    });
  } finally {
    await session.endSession();
  }
};

// ==========================================================
// GET ALL PURCHASE RETURNS
// ==========================================================

exports.getPurchaseReturns =
  async (req, res) => {
    try {
      const {
        company,
        restaurant,
        store,
        supplier,
        purchase,
        status,
        paymentStatus,
        fromDate,
        toDate,
        page = 1,
        limit = 20,
        search,
      } = req.query;

      const filter = {
        isDeleted: false,
      };

      if (company) {
        filter.company =
          company;
      }

      if (restaurant) {
        filter.restaurant =
          restaurant;
      }

      if (store) {
        filter.store =
          store;
      }

      if (supplier) {
        filter.supplier =
          supplier;
      }

      if (purchase) {
        filter.purchase =
          purchase;
      }

      if (status) {
        filter.status =
          status;
      }

      if (paymentStatus) {
        filter.paymentStatus =
          paymentStatus;
      }

      // ====================================================
      // DATE FILTER
      // ====================================================

      if (
        fromDate ||
        toDate
      ) {
        filter.returnDate = {};

        if (fromDate) {
          const from =
            new Date(fromDate);

          from.setHours(
            0,
            0,
            0,
            0
          );

          filter.returnDate.$gte =
            from;
        }

        if (toDate) {
          const to =
            new Date(toDate);

          to.setHours(
            23,
            59,
            59,
            999
          );

          filter.returnDate.$lte =
            to;
        }
      }

      // ====================================================
      // SEARCH
      // ====================================================

      if (search) {
        filter.$or = [
          {
            returnNo: {
              $regex: search,
              $options: "i",
            },
          },
          {
            purchaseInvoiceNo: {
              $regex: search,
              $options: "i",
            },
          },
        ];
      }

      const pageNumber =
        Math.max(
          Number(page) || 1,
          1
        );

      const limitNumber =
        Math.min(
          Math.max(
            Number(limit) || 20,
            1
          ),
          100
        );

      const skip =
        (pageNumber - 1) *
        limitNumber;

      const [
        returns,
        total,
      ] = await Promise.all([
        PurchaseReturn.find(filter)
          .populate(
            "supplier",
            "supplierName supplierCode phone"
          )
          .populate(
            "restaurant",
            "restaurantName restaurantCode"
          )
          .populate(
            "store",
            "storeName storeCode"
          )
          .populate(
            "purchase",
            "purchaseNo invoiceNumber purchaseDate"
          )
          .populate(
            "items.ingredient",
            "ingredientCode ingredientName currentStock"
          )
          .sort({
            returnDate: -1,
            createdAt: -1,
          })
          .skip(skip)
          .limit(limitNumber)
          .lean(),

        PurchaseReturn.countDocuments(
          filter
        ),
      ]);

      return res.status(200).json({
        success: true,
        data: returns,
        pagination: {
          page:
            pageNumber,
          limit:
            limitNumber,
          total,
          totalPages:
            Math.ceil(
              total /
                limitNumber
            ),
        },
      });
    } catch (error) {
      console.error(
        "GET PURCHASE RETURNS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch purchase returns.",
        error:
          error.message,
      });
    }
  };

// ==========================================================
// GET PURCHASE RETURN BY ID
// ==========================================================

exports.getPurchaseReturnById =
  async (req, res) => {
    try {
      const { id } =
        req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid purchase return ID.",
        });
      }

      const purchaseReturn =
        await PurchaseReturn.findOne({
          _id: id,
          isDeleted: false,
        })
          .populate(
            "supplier",
            "supplierName supplierCode phone email address"
          )
          .populate(
            "restaurant",
            "restaurantName restaurantCode"
          )
          .populate(
            "store",
            "storeName storeCode branchName"
          )
          .populate(
            "purchase",
            "purchaseNo invoiceNumber invoiceDate purchaseDate grandTotal"
          )
          .populate(
            "items.ingredient",
            "ingredientCode ingredientName barcode currentStock purchasePrice gstPercentage"
          )
          .lean();

      if (!purchaseReturn) {
        return res.status(404).json({
          success: false,
          message:
            "Purchase return not found.",
        });
      }

      return res.status(200).json({
        success: true,
        data:
          purchaseReturn,
      });
    } catch (error) {
      console.error(
        "GET PURCHASE RETURN ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to fetch purchase return.",
        error:
          error.message,
      });
    }
  };

// ==========================================================
// CANCEL PURCHASE RETURN
// ==========================================================

exports.cancelPurchaseReturn =
  async (req, res) => {
    const session =
      await mongoose.startSession();

    try {
      const { id } =
        req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid purchase return ID.",
        });
      }

      session.startTransaction();

      const purchaseReturn =
        await PurchaseReturn.findOne({
          _id: id,
          isDeleted: false,
        }).session(session);

      if (!purchaseReturn) {
        await session.abortTransaction();

        return res.status(404).json({
          success: false,
          message:
            "Purchase return not found.",
        });
      }

      if (
        purchaseReturn.status ===
        "cancelled"
      ) {
        await session.abortTransaction();

        return res.status(400).json({
          success: false,
          message:
            "Purchase return is already cancelled.",
        });
      }

      const items =
        Array.isArray(
          purchaseReturn.items
        )
          ? purchaseReturn.items
          : [];

      // ====================================================
      // RESTORE STOCK
      // ====================================================

      for (
        let i = 0;
        i < items.length;
        i++
      ) {
        const item =
          items[i];

        if (
          !item ||
          !item.ingredient
        ) {
          continue;
        }

        const ingredient =
          await Ingredient.findOne({
            _id:
              item.ingredient,
            restaurant:
              purchaseReturn.restaurant,
            store:
              purchaseReturn.store,
            isDeleted:
              false,
          }).session(session);

        if (!ingredient) {
          throw new Error(
            `Ingredient not found while cancelling return: ${item.ingredient}`
          );
        }

        const currentStock =
          Number(
            ingredient.currentStock
          ) || 0;

        const returnQuantity =
          Number(
            item.quantity
          ) || 0;

        ingredient.currentStock =
          round(
            currentStock +
              returnQuantity
          );

        ingredient.stockValue =
          round(
            ingredient.currentStock *
              (
                Number(
                  ingredient.averageCost
                ) ||
                Number(
                  ingredient.purchasePrice
                ) ||
                0
              )
          );

        ingredient.updatedBy =
          req.user?._id ||
          req.user?.id ||
          null;

        await ingredient.save({
          session,
        });
      }

      purchaseReturn.status =
        "cancelled";

      purchaseReturn.updatedBy =
        req.user?._id ||
        req.user?.id ||
        null;

      await purchaseReturn.save({
        session,
      });

      await session.commitTransaction();

      return res.status(200).json({
        success: true,
        message:
          "Purchase return cancelled and stock restored successfully.",
        data:
          purchaseReturn,
      });
    } catch (error) {
      try {
        if (
          session.inTransaction()
        ) {
          await session.abortTransaction();
        }
      } catch (rollbackError) {
        console.error(
          "Rollback error:",
          rollbackError
        );
      }

      console.error(
        "CANCEL PURCHASE RETURN ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to cancel purchase return.",
        error:
          error.message,
      });
    } finally {
      await session.endSession();
    }
  };

// ==========================================================
// SOFT DELETE PURCHASE RETURN
// ==========================================================

exports.deletePurchaseReturn =
  async (req, res) => {
    try {
      const { id } =
        req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          id
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid purchase return ID.",
        });
      }

      const purchaseReturn =
        await PurchaseReturn.findOne({
          _id: id,
          isDeleted: false,
        });

      if (!purchaseReturn) {
        return res.status(404).json({
          success: false,
          message:
            "Purchase return not found.",
        });
      }

      if (
        purchaseReturn.status !==
        "cancelled"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Cancel the purchase return before deleting it.",
        });
      }

      purchaseReturn.isDeleted =
        true;

      purchaseReturn.deletedAt =
        new Date();

      purchaseReturn.deletedBy =
        req.user?._id ||
        req.user?.id ||
        null;

      await purchaseReturn.save();

      return res.status(200).json({
        success: true,
        message:
          "Purchase return deleted successfully.",
      });
    } catch (error) {
      console.error(
        "DELETE PURCHASE RETURN ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to delete purchase return.",
        error:
          error.message,
      });
    }
  };

// ==========================================================
// UPDATE PAYMENT STATUS
// ==========================================================

exports.updatePaymentStatus =
  async (req, res) => {
    try {
      const { id } =
        req.params;

      const {
        paymentStatus,
      } = req.body;

      const allowedStatuses = [
        "pending",
        "refunded",
        "adjusted",
        "cancelled",
      ];

      if (
        !allowedStatuses.includes(
          paymentStatus
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid payment status.",
        });
      }

      const purchaseReturn =
        await PurchaseReturn.findOne({
          _id: id,
          isDeleted: false,
        });

      if (!purchaseReturn) {
        return res.status(404).json({
          success: false,
          message:
            "Purchase return not found.",
        });
      }

      purchaseReturn.paymentStatus =
        paymentStatus;

      purchaseReturn.updatedBy =
        req.user?._id ||
        req.user?.id ||
        null;

      await purchaseReturn.save();

      return res.status(200).json({
        success: true,
        message:
          "Payment status updated successfully.",
        data:
          purchaseReturn,
      });
    } catch (error) {
      console.error(
        "UPDATE PAYMENT STATUS ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Failed to update payment status.",
        error:
          error.message,
      });
    }
  };