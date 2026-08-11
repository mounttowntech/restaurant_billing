const mongoose = require("mongoose");
const crypto = require("crypto");
const axios = require("axios");

const Payment = require("../models/Payment");

/* ==========================================================
   Cashfree Configuration
========================================================== */

const CASHFREE_API_VERSION =
  process.env.CASHFREE_API_VERSION ||
  "2025-01-01";

const CASHFREE_ENV =
  process.env.CASHFREE_ENV ||
  "https://sandbox.cashfree.com";

/* ==========================================================
   Helpers
========================================================== */

const getCashfreeHeaders = () => {
  if (
    !process.env.CASHFREE_APP_ID ||
    !process.env.CASHFREE_SECRET_KEY
  ) {
    throw new Error(
      "Cashfree credentials are not configured"
    );
  }

  return {
    "x-client-id":
      process.env.CASHFREE_APP_ID,

    "x-client-secret":
      process.env.CASHFREE_SECRET_KEY,

    "x-api-version":
      CASHFREE_API_VERSION,

    "Content-Type":
      "application/json",

    Accept:
      "application/json",
  };
};

/* ----------------------------------------------------------
   Mongo ObjectId Validation
---------------------------------------------------------- */

const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(
    id
  );
};

/* ----------------------------------------------------------
   Error Response
---------------------------------------------------------- */

const sendError = (
  res,
  error,
  defaultMessage = "Something went wrong"
) => {
  console.error(
    defaultMessage,
    error.response?.data ||
      error.message ||
      error
  );

  return res.status(
    error.response?.status || 500
  ).json({
    success: false,

    message:
      error.response?.data?.message ||
      defaultMessage,

    error:
      error.response?.data ||
      error.message,
  });
};

/* ==========================================================
   CREATE PAYMENT
========================================================== */

exports.createPayment = async (
  req,
  res
) => {
  try {
    const body = {
      ...req.body,
      createdBy: req.user?.id,
    };

    if (
      body.paymentMethod ===
        "Cashfree" &&
      body.paymentGateway !==
        "Cashfree"
    ) {
      body.paymentGateway =
        "Cashfree";
    }

    const payment =
      await Payment.create(body);

    return res.status(201).json({
      success: true,

      message:
        "Payment created successfully",

      data: payment,
    });
  } catch (error) {
    return sendError(
      res,
      error,
      "Unable to create payment"
    );
  }
};

/* ==========================================================
   GET ALL PAYMENTS
========================================================== */

// ==========================================================
// Get All Payments
// ==========================================================

exports.getPayments = async (req, res) => {
  try {
    const page = Math.max(
      Number(req.query.page) || 1,
      1
    );

    const limit = Math.min(
      Math.max(
        Number(req.query.limit) || 20,
        1
      ),
      100
    );

    const skip = (page - 1) * limit;

    const search = String(
      req.query.search || ""
    ).trim();

    const filter = {
      isDeleted: false,
    };

    // ======================================================
    // Store Filter
    // ======================================================

    if (
      req.query.store &&
      mongoose.Types.ObjectId.isValid(req.query.store)
    ) {
      filter.store = req.query.store;
    }

    // ======================================================
    // Customer Filter
    // ======================================================

    if (
      req.query.customer &&
      mongoose.Types.ObjectId.isValid(req.query.customer)
    ) {
      filter.customer = req.query.customer;
    }

    // ======================================================
    // Payment Status
    // ======================================================

    if (req.query.paymentStatus) {
      filter.paymentStatus =
        req.query.paymentStatus;
    }

    // ======================================================
    // Payment Method
    // ======================================================

    if (req.query.paymentMethod) {
      filter.paymentMethod =
        req.query.paymentMethod;
    }

    // ======================================================
    // Payment Gateway
    // ======================================================

    if (req.query.paymentGateway) {
      filter.paymentGateway =
        req.query.paymentGateway;
    }

    // ======================================================
    // Search
    // ======================================================

    if (search) {
      filter.$or = [
        {
          paymentNo: {
            $regex: search,
            $options: "i",
          },
        },
        {
          referenceNo: {
            $regex: search,
            $options: "i",
          },
        },
        {
          transactionId: {
            $regex: search,
            $options: "i",
          },
        },
        {
          cashfreeOrderId: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    // ======================================================
    // Query Payments + Count
    // ======================================================

    const [payments, total] =
      await Promise.all([
        Payment.find(filter)
          .populate(
            "customer",
            "name phone"
          )
          .populate(
            "invoice",
            "invoiceNo"
          )
          .populate(
            "order",
            "orderNo"
          )
          .populate(
            "store",
            "storeName storeCode"
          )
          .populate(
            "restaurant",
            "restaurantName restaurantCode"
          )
          .sort({
            paymentDate: -1,
            createdAt: -1,
          })
          .skip(skip)
          .limit(limit)
          .lean(),

        Payment.countDocuments(filter),
      ]);

    // ======================================================
    // Response
    // ======================================================

    return res.status(200).json({
      success: true,
      message: "Payments fetched successfully",
      count: payments.length,
      total,
      page,
      limit,
      totalPages: Math.ceil(
        total / limit
      ),
      data: payments,
    });

  } catch (error) {
    console.error(
      "getPayments Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to fetch payments",
      error: error.message,
    });
  }
};
/* ==========================================================
   GET PAYMENT BY ID
========================================================== */

exports.getPaymentById = async (
  req,
  res
) => {
  try {
    if (
      !isValidObjectId(
        req.params.id
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid payment ID",
      });
    }

    const payment =
      await Payment.findOne({
        _id: req.params.id,
        isDeleted: false,
      })
        .populate("customer")
        .populate("invoice")
        .populate("order")
        .populate("restaurant")
        .populate("store")
        .populate("supplier");

    if (!payment) {
      return res.status(404).json({
        success: false,
        message:
          "Payment not found",
      });
    }

    return res.json({
      success: true,
      data: payment,
    });
  } catch (error) {
    return sendError(
      res,
      error,
      "Unable to fetch payment"
    );
  }
};

/* ==========================================================
   UPDATE PAYMENT
========================================================== */

exports.updatePayment = async (
  req,
  res
) => {
  try {
    if (
      !isValidObjectId(
        req.params.id
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid payment ID",
      });
    }

    const existing =
      await Payment.findOne({
        _id: req.params.id,
        isDeleted: false,
      });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message:
          "Payment not found",
      });
    }

    if (
      existing.paymentGateway ===
        "Cashfree" &&
      existing.paymentStatus ===
        "Paid"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Paid Cashfree payment cannot be directly modified",
      });
    }

    const allowedFields = [
      "paymentDate",
      "paymentType",
      "paymentMethod",
      "paymentGateway",
      "amount",
      "referenceNo",
      "transactionId",
      "bankName",
      "cardLast4",
      "approvalCode",
      "splitPayments",
      "remarks",
      "customer",
      "invoice",
      "order",
      "supplier",
    ];

    const update = {};

    allowedFields.forEach(
      (field) => {
        if (
          req.body[field] !==
          undefined
        ) {
          update[field] =
            req.body[field];
        }
      }
    );

    update.updatedBy =
      req.user?.id;

    const payment =
      await Payment.findOneAndUpdate(
        {
          _id: req.params.id,
          isDeleted: false,
        },
        update,
        {
          new: true,
          runValidators: true,
        }
      );

    return res.json({
      success: true,

      message:
        "Payment updated successfully",

      data: payment,
    });
  } catch (error) {
    return sendError(
      res,
      error,
      "Unable to update payment"
    );
  }
};

/* ==========================================================
   SOFT DELETE
========================================================== */

exports.deletePayment = async (
  req,
  res
) => {
  try {
    if (
      !isValidObjectId(
        req.params.id
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid payment ID",
      });
    }

    const payment =
      await Payment.findOne({
        _id: req.params.id,
        isDeleted: false,
      });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message:
          "Payment not found",
      });
    }

    if (
      payment.paymentStatus ===
        "Paid"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Paid payment cannot be deleted",
      });
    }

    await payment.softDelete(
      req.user?.id
    );

    return res.json({
      success: true,

      message:
        "Payment deleted successfully",
    });
  } catch (error) {
    return sendError(
      res,
      error,
      "Unable to delete payment"
    );
  }
};

/* ==========================================================
   RESTORE
========================================================== */

exports.restorePayment = async (
  req,
  res
) => {
  try {
    if (
      !isValidObjectId(
        req.params.id
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid payment ID",
      });
    }

    const payment =
      await Payment.findOne({
        _id: req.params.id,
        isDeleted: true,
      }).setOptions({
        includeDeleted: true,
      });

    /*
      Because the schema has find middleware,
      use findOne without relying on middleware
      by querying through findById and checking.
    */

    const paymentById =
      await Payment.findById(
        req.params.id
      );

    if (!paymentById) {
      return res.status(404).json({
        success: false,
        message:
          "Payment not found",
      });
    }

    await paymentById.restore();

    return res.json({
      success: true,

      message:
        "Payment restored successfully",

      data: paymentById,
    });
  } catch (error) {
    return sendError(
      res,
      error,
      "Unable to restore payment"
    );
  }
};

/* ==========================================================
   MARK PAID
========================================================== */

exports.markPaymentPaid = async (
  req,
  res
) => {
  try {
    const payment =
      await Payment.findOne({
        _id: req.params.id,
        isDeleted: false,
      });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message:
          "Payment not found",
      });
    }

    if (
      payment.paymentStatus ===
        "Cancelled"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Cancelled payment cannot be marked as paid",
      });
    }

    if (
      payment.paymentGateway ===
        "Cashfree"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Cashfree payments must be verified through Cashfree",
      });
    }

    await payment.markPaid(
      req.body.paymentMethod ||
        "Cash",

      req.body.transactionId ||
        ""
    );

    payment.updatedBy =
      req.user?.id;

    await payment.save();

    return res.json({
      success: true,

      message:
        "Payment marked as paid",

      data: payment,
    });
  } catch (error) {
    return sendError(
      res,
      error,
      "Unable to mark payment as paid"
    );
  }
};

/* ==========================================================
   REFUND
========================================================== */

exports.refundPayment = async (
  req,
  res
) => {
  try {
    const payment =
      await Payment.findOne({
        _id: req.params.id,
        isDeleted: false,
      });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message:
          "Payment not found",
      });
    }

    if (
      payment.paymentStatus !==
      "Paid"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Only paid payments can be refunded",
      });
    }

    const refundAmount =
      Number(
        req.body.refundAmount
      );

    await payment.refundPayment(
      refundAmount,
      req.body.refundReason ||
        ""
    );

    payment.updatedBy =
      req.user?.id;

    await payment.save();

    return res.json({
      success: true,

      message:
        "Payment refunded successfully",

      data: payment,
    });
  } catch (error) {
    return sendError(
      res,
      error,
      "Unable to refund payment"
    );
  }
};

/* ==========================================================
   CANCEL
========================================================== */

exports.cancelPayment = async (
  req,
  res
) => {
  try {
    const payment =
      await Payment.findOne({
        _id: req.params.id,
        isDeleted: false,
      });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message:
          "Payment not found",
      });
    }

    await payment.cancelPayment(
      req.body.remarks || ""
    );

    payment.updatedBy =
      req.user?.id;

    await payment.save();

    return res.json({
      success: true,

      message:
        "Payment cancelled successfully",

      data: payment,
    });
  } catch (error) {
    return sendError(
      res,
      error,
      "Unable to cancel payment"
    );
  }
};

/* ==========================================================
   TODAY COLLECTION
========================================================== */

exports.todayCollection = async (
  req,
  res
) => {
  try {
    const result =
      await Payment.getTodayCollection(
        req.query.storeId ||
          null
      );

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    return sendError(
      res,
      error,
      "Unable to get today's collection"
    );
  }
};

/* ==========================================================
   PENDING PAYMENTS
========================================================== */

exports.pendingPayments = async (
  req,
  res
) => {
  try {
    const payments =
      await Payment.getPendingPayments(
        req.query.storeId ||
          null
      );

    return res.json({
      success: true,

      count:
        payments.length,

      data: payments,
    });
  } catch (error) {
    return sendError(
      res,
      error,
      "Unable to get pending payments"
    );
  }
};

/* ==========================================================
   PAYMENT SUMMARY
========================================================== */

exports.paymentSummary = async (
  req,
  res
) => {
  try {
    const summary =
      await Payment.getPaymentSummary(
        req.query.storeId ||
          null
      );

    return res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    return sendError(
      res,
      error,
      "Unable to get payment summary"
    );
  }
};

/* ==========================================================
   STORE COLLECTION
========================================================== */

exports.storeCollection = async (
  req,
  res
) => {
  try {
    if (
      !isValidObjectId(
        req.params.storeId
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid store ID",
      });
    }

    const payments =
      await Payment.getStoreCollection(
        req.params.storeId
      );

    return res.json({
      success: true,

      count:
        payments.length,

      data: payments,
    });
  } catch (error) {
    return sendError(
      res,
      error,
      "Unable to get store collection"
    );
  }
};

/* ==========================================================
   CASHFREE - CREATE ORDER
========================================================== */

exports.createCashfreeOrder =
  async (req, res) => {
    try {
      const {
        paymentNo,
        amount,
        customerId,
        phone,
        name,
        email,
        restaurant,
        store,
        invoice,
        order,
        paymentType = "Invoice",
        remarks,
      } = req.body;

      /* -----------------------------------------------------
         Validation
      ----------------------------------------------------- */

      const numericAmount =
        Number(amount);

      if (
        !Number.isFinite(
          numericAmount
        ) ||
        numericAmount <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Valid payment amount is required",
        });
      }

      if (!phone) {
        return res.status(400).json({
          success: false,
          message:
            "Customer phone is required",
        });
      }

      if (
        !restaurant ||
        !isValidObjectId(
          restaurant
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Valid restaurant ID is required",
        });
      }

      if (
        !store ||
        !isValidObjectId(store)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Valid store ID is required",
        });
      }

      /* -----------------------------------------------------
         Generate unique Cashfree Order ID
      ----------------------------------------------------- */

      const cashfreeOrderId =
        `ORDER_${Date.now()}_${crypto
          .randomBytes(4)
          .toString("hex")}`;

      /* -----------------------------------------------------
         Return URL
      ----------------------------------------------------- */

      const returnUrl =
        process.env.CASHFREE_RETURN_URL ||
        `${process.env.FRONTEND_URL}/payment/success?order_id={order_id}`;

      /* -----------------------------------------------------
         Webhook URL
      ----------------------------------------------------- */

      const notifyUrl =
        process.env.CASHFREE_WEBHOOK_URL ||
        `${process.env.BACKEND_URL}/api/payment/cashfree/webhook`;

      /* -----------------------------------------------------
         Cashfree Create Order
      ----------------------------------------------------- */

      const cashfreeResponse =
        await axios.post(
          `${CASHFREE_ENV}/pg/orders`,

          {
            order_id:
              cashfreeOrderId,

            order_amount:
              Number(
                numericAmount.toFixed(2)
              ),

            order_currency: "INR",

            customer_details: {
              customer_id:
                customerId ||
                `CUSTOMER_${Date.now()}`,

              customer_phone:
                String(phone),

              customer_name:
                name ||
                "Customer",

              customer_email:
                email ||
                "customer@example.com",
            },

            order_meta: {
              return_url:
                returnUrl,

              notify_url:
                notifyUrl,
            },

            order_note:
              remarks ||
              "Restaurant payment",
          },

          {
            headers:
              getCashfreeHeaders(),

            timeout: 15000,
          }
        );

      const cashfreeData =
        cashfreeResponse.data;

      /* -----------------------------------------------------
         Create Local Payment
      ----------------------------------------------------- */

      const payment =
        await Payment.create({
          paymentNo:
            paymentNo ||
            `PAY-CF-${Date.now()}`,

          paymentDate:
            new Date(),

          restaurant,

          store,

          invoice,

          order,

          customer:
            customerId,

          paymentType,

          paymentGateway:
            "Cashfree",

          paymentMethod:
            "Cashfree",

          amount:
            numericAmount,

          receivedAmount: 0,

          balanceAmount:
            numericAmount,

          changeAmount: 0,

          paymentStatus:
            "Pending",

          cashfreeOrderId:
            cashfreeData.order_id,

          cashfreePaymentSessionId:
            cashfreeData.payment_session_id,

          cashfreeOrderStatus:
            cashfreeData.order_status,

          remarks,

          createdBy:
            req.user?.id,
        });

      return res.status(201).json({
        success: true,

        message:
          "Cashfree order created successfully",

        data: {
          paymentId:
            payment._id,

          paymentNo:
            payment.paymentNo,

          orderId:
            cashfreeData.order_id,

          paymentSessionId:
            cashfreeData.payment_session_id,

          orderStatus:
            cashfreeData.order_status,

          amount:
            numericAmount,

          paymentGateway:
            "Cashfree",
        },
      });
    } catch (error) {
      return sendError(
        res,
        error,
        "Unable to create Cashfree order"
      );
    }
  };

/* ==========================================================
   CASHFREE - VERIFY PAYMENT
========================================================== */

exports.verifyCashfreePayment =
  async (req, res) => {
    try {
      const {
        orderId,
      } = req.params;

      if (!orderId) {
        return res.status(400).json({
          success: false,
          message:
            "Cashfree order ID is required",
        });
      }

      const payment =
        await Payment.findOne({
          cashfreeOrderId:
            orderId,

          isDeleted: false,
        });

      if (!payment) {
        return res.status(404).json({
          success: false,
          message:
            "Local payment not found",
        });
      }

      /* -----------------------------------------------------
         Get Cashfree Transactions
      ----------------------------------------------------- */

      const response =
        await axios.get(
          `${CASHFREE_ENV}/pg/orders/${encodeURIComponent(
            orderId
          )}/payments`,
          {
            headers:
              getCashfreeHeaders(),

            timeout: 15000,
          }
        );

      const transactions =
        Array.isArray(
          response.data
        )
          ? response.data
          : [];

      /* -----------------------------------------------------
         Determine Status
      ----------------------------------------------------- */

      const successfulPayment =
        transactions.find(
          (item) =>
            item.payment_status ===
            "SUCCESS"
        );

      const pendingPayment =
        transactions.find(
          (item) =>
            item.payment_status ===
            "PENDING"
        );

      const failedPayment =
        transactions.find(
          (item) =>
            item.payment_status ===
            "FAILED"
        );

      /* -----------------------------------------------------
         SUCCESS
      ----------------------------------------------------- */

      if (successfulPayment) {
        const cashfreeAmount =
          Number(
            successfulPayment.payment_amount
          );

        /*
          Never mark paid unless the Cashfree
          transaction amount matches your local
          payment amount.
        */

        if (
          Number.isFinite(
            cashfreeAmount
          ) &&
          cashfreeAmount !==
            Number(payment.amount)
        ) {
          return res.status(400).json({
            success: false,

            message:
              "Cashfree payment amount does not match local payment amount",

            expected:
              payment.amount,

            received:
              cashfreeAmount,
          });
        }

        payment.paymentStatus =
          "Paid";

        payment.paymentGateway =
          "Cashfree";

        payment.paymentMethod =
          "Cashfree";

        payment.receivedAmount =
          Number(payment.amount);

        payment.balanceAmount = 0;

        payment.changeAmount = 0;

        payment.cashfreePaymentId =
          String(
            successfulPayment.cf_payment_id ||
              ""
          );

        payment.cashfreePaymentStatus =
          successfulPayment.payment_status;

        payment.cashfreePaymentMethod =
          successfulPayment.payment_group ||
          successfulPayment.payment_method ||
          "";

        payment.cashfreeBankReference =
          successfulPayment.bank_reference ||
          "";

        payment.cashfreePaymentMessage =
          successfulPayment.payment_message ||
          "";

        payment.cashfreeOrderStatus =
          "PAID";

        payment.updatedBy =
          req.user?.id;

        await payment.save();
      }

      /* -----------------------------------------------------
         PENDING
      ----------------------------------------------------- */

      else if (pendingPayment) {
        payment.paymentStatus =
          "Pending";

        payment.cashfreePaymentStatus =
          pendingPayment.payment_status;

        payment.cashfreePaymentMethod =
          pendingPayment.payment_group ||
          "";

        payment.cashfreeOrderStatus =
          "PENDING";

        payment.updatedBy =
          req.user?.id;

        await payment.save();
      }

      /* -----------------------------------------------------
         FAILED
      ----------------------------------------------------- */

      else if (failedPayment) {
        payment.paymentStatus =
          "Failed";

        payment.cashfreePaymentStatus =
          failedPayment.payment_status;

        payment.cashfreePaymentMessage =
          failedPayment.payment_message ||
          "";

        payment.cashfreeOrderStatus =
          "FAILED";

        payment.updatedBy =
          req.user?.id;

        await payment.save();
      }

      return res.json({
        success: true,

        data: {
          paymentId:
            payment._id,

          orderId,

          localPaymentStatus:
            payment.paymentStatus,

          cashfreeOrderStatus:
            payment.cashfreeOrderStatus,

          cashfreePaymentStatus:
            payment.cashfreePaymentStatus,

          transactions,
        },
      });
    } catch (error) {
      return sendError(
        res,
        error,
        "Unable to verify Cashfree payment"
      );
    }
  };

/* ==========================================================
   CASHFREE WEBHOOK
========================================================== */

/*
  IMPORTANT:

  This function expects req.body to contain the RAW
  request body as a Buffer.

  The route/server must use express.raw() for this
  endpoint before express.json() processes the request.
*/

exports.cashfreeWebhook =
  async (req, res) => {
    try {
      const signature =
        req.headers[
          "x-webhook-signature"
        ];

      const timestamp =
        req.headers[
          "x-webhook-timestamp"
        ];

      if (
        !signature ||
        !timestamp
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Missing Cashfree webhook signature",
        });
      }

      if (
        !process.env
          .CASHFREE_WEBHOOK_SECRET
      ) {
        console.error(
          "CASHFREE_WEBHOOK_SECRET is not configured"
        );

        return res.status(500).json({
          success: false,
          message:
            "Webhook secret is not configured",
        });
      }

      /* -----------------------------------------------------
         Raw Body
      ----------------------------------------------------- */

      const rawBody =
        Buffer.isBuffer(
          req.body
        )
          ? req.body.toString(
              "utf8"
            )
          : typeof req.body ===
            "string"
          ? req.body
          : JSON.stringify(
              req.body
            );

      /* -----------------------------------------------------
         Signature

         Cashfree signs:
         timestamp + rawBody
      ----------------------------------------------------- */

      const signedPayload =
        String(timestamp) +
        rawBody;

      const expectedSignature =
        crypto
          .createHmac(
            "sha256",
            process.env
              .CASHFREE_WEBHOOK_SECRET
          )
          .update(
            signedPayload
          )
          .digest("base64");

      /* -----------------------------------------------------
         Timing Safe Comparison
      ----------------------------------------------------- */

      const receivedBuffer =
        Buffer.from(
          signature
        );

      const expectedBuffer =
        Buffer.from(
          expectedSignature
        );

      if (
        receivedBuffer.length !==
        expectedBuffer.length
      ) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid webhook signature",
        });
      }

      const valid =
        crypto.timingSafeEqual(
          receivedBuffer,
          expectedBuffer
        );

      if (!valid) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid webhook signature",
        });
      }

      /* -----------------------------------------------------
         Parse Payload
      ----------------------------------------------------- */

      let payload;

      try {
        payload =
          JSON.parse(rawBody);
      } catch (parseError) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid webhook JSON",
        });
      }

      console.log(
        "Cashfree webhook received:",
        JSON.stringify(
          payload,
          null,
          2
        )
      );

      /* -----------------------------------------------------
         Cashfree Payload

         Common structure:

         data.order.order_id
         data.payment.cf_payment_id
         data.payment.payment_status
      ----------------------------------------------------- */

      const orderData =
        payload?.data?.order ||
        {};

      const paymentData =
        payload?.data?.payment ||
        {};

      const orderId =
        orderData.order_id;

      const cashfreePaymentId =
        paymentData.cf_payment_id;

      const cashfreeStatus =
        paymentData.payment_status;

      if (!orderId) {
        /*
          Return 200 after valid signature so Cashfree
          does not repeatedly retry an unusable event.
        */

        return res.status(200).json({
          success: true,
          message:
            "Webhook received without order ID",
        });
      }

      /* -----------------------------------------------------
         Find Local Payment
      ----------------------------------------------------- */

      const payment =
        await Payment.findOne({
          cashfreeOrderId:
            orderId,
        });

      if (!payment) {
        console.warn(
          `Payment not found for Cashfree order: ${orderId}`
        );

        return res.status(200).json({
          success: true,
          message:
            "Webhook received but payment not found",
        });
      }

      /* -----------------------------------------------------
         Idempotency

         If already paid, don't process it again.
      ----------------------------------------------------- */

      if (
        payment.paymentStatus ===
          "Paid" &&
        payment.cashfreePaymentId &&
        cashfreePaymentId &&
        String(
          payment.cashfreePaymentId
        ) ===
          String(
            cashfreePaymentId
          )
      ) {
        return res.status(200).json({
          success: true,
          message:
            "Webhook already processed",
        });
      }

      /* -----------------------------------------------------
         Store Common Cashfree Data
      ----------------------------------------------------- */

      payment.paymentGateway =
        "Cashfree";

      payment.paymentMethod =
        "Cashfree";

      if (cashfreePaymentId) {
        payment.cashfreePaymentId =
          String(
            cashfreePaymentId
          );
      }

      payment.cashfreePaymentStatus =
        cashfreeStatus || "";

      payment.cashfreePaymentMethod =
        paymentData.payment_group ||
        paymentData.payment_method ||
        "";

      payment.cashfreeBankReference =
        paymentData.bank_reference ||
        "";

      payment.cashfreePaymentMessage =
        paymentData.payment_message ||
        "";

      payment.cashfreeWebhookReceivedAt =
        new Date();

      /* -----------------------------------------------------
         SUCCESS
      ----------------------------------------------------- */

      if (
        cashfreeStatus ===
        "SUCCESS"
      ) {
        const gatewayAmount =
          Number(
            paymentData.payment_amount
          );

        if (
          Number.isFinite(
            gatewayAmount
          ) &&
          gatewayAmount !==
            Number(payment.amount)
        ) {
          console.error(
            `Amount mismatch for ${orderId}: expected ${payment.amount}, received ${gatewayAmount}`
          );

          return res.status(400).json({
            success: false,

            message:
              "Payment amount mismatch",
          });
        }

        payment.paymentStatus =
          "Paid";

        payment.receivedAmount =
          Number(payment.amount);

        payment.balanceAmount = 0;

        payment.changeAmount = 0;

        payment.cashfreeOrderStatus =
          "PAID";
      }

      /* -----------------------------------------------------
         FAILED
      ----------------------------------------------------- */

      else if (
        cashfreeStatus ===
          "FAILED" ||
        cashfreeStatus ===
          "USER_DROPPED"
      ) {
        payment.paymentStatus =
          "Failed";

        payment.cashfreeOrderStatus =
          "FAILED";
      }

      /* -----------------------------------------------------
         PENDING
      ----------------------------------------------------- */

      else if (
        cashfreeStatus ===
        "PENDING"
      ) {
        payment.paymentStatus =
          "Pending";

        payment.cashfreeOrderStatus =
          "PENDING";
      }

      payment.updatedBy =
        undefined;

      await payment.save();

      return res.status(200).json({
        success: true,

        message:
          "Webhook processed successfully",
      });
    } catch (error) {
      console.error(
        "Cashfree Webhook Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Webhook processing failed",
      });
    }
  };

/* ==========================================================
   CASHFREE ORDER DETAILS
========================================================== */

exports.getCashfreeOrder =
  async (req, res) => {
    try {
      const { orderId } =
        req.params;

      const response =
        await axios.get(
          `${CASHFREE_ENV}/pg/orders/${encodeURIComponent(
            orderId
          )}`,
          {
            headers:
              getCashfreeHeaders(),

            timeout: 15000,
          }
        );

      return res.json({
        success: true,
        data: response.data,
      });
    } catch (error) {
      return sendError(
        res,
        error,
        "Unable to get Cashfree order"
      );
    }
  };

/* ==========================================================
   CASHFREE TRANSACTIONS
========================================================== */

exports.getCashfreePayments =
  async (req, res) => {
    try {
      const { orderId } =
        req.params;

      const response =
        await axios.get(
          `${CASHFREE_ENV}/pg/orders/${encodeURIComponent(
            orderId
          )}/payments`,
          {
            headers:
              getCashfreeHeaders(),

            timeout: 15000,
          }
        );

      return res.json({
        success: true,
        data: response.data,
      });
    } catch (error) {
      return sendError(
        res,
        error,
        "Unable to get Cashfree transactions"
      );
    }
  };