
const Reservation = require("../models/reservationModel");
const Table = require("../models/Table");
const Restaurant = require("../models/Restaurant");
const Store = require("../models/storeModel");

/* ==========================================================
   Generate Reservation Number
========================================================== */

const generateReservationNo = async () => {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  const prefix = `RES-${year}${month}${day}`;

  const lastReservation = await Reservation.findOne({
    reservationNo: {
      $regex: `^${prefix}`,
    },
  })
    .sort({ createdAt: -1 })
    .select("reservationNo");

  let sequence = 1;

  if (lastReservation) {
    const lastNumber = Number(
      lastReservation.reservationNo.split("-").pop()
    );

    if (!isNaN(lastNumber)) {
      sequence = lastNumber + 1;
    }
  }

  return `${prefix}-${String(sequence).padStart(4, "0")}`;
};

/* ==========================================================
   Create Reservation
========================================================== */

exports.createReservation = async (req, res) => {
  try {
    const {
      restaurant,
      store,
      table,
      customerName,
      customerPhone,
      customerEmail,
      reservationDate,
      reservationTime,
      numberOfGuests,
      durationMinutes,
      notes,
    } = req.body;

    /* -----------------------------------------
       Required Fields
    ----------------------------------------- */

    if (
      !restaurant ||
      !store ||
      !table ||
      !customerName ||
      !reservationDate ||
      !reservationTime ||
      !numberOfGuests
    ) {
      return res.status(400).json({
        success: false,
        message:
          "restaurant, store, table, customerName, reservationDate, reservationTime and numberOfGuests are required.",
      });
    }

    /* -----------------------------------------
       Restaurant Validation
    ----------------------------------------- */

    const restaurantExists =
      await Restaurant.findById(restaurant);

    if (!restaurantExists) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found.",
      });
    }

    /* -----------------------------------------
       Store Validation
    ----------------------------------------- */

    const storeExists = await Store.findById(store);

    if (!storeExists) {
      return res.status(404).json({
        success: false,
        message: "Store not found.",
      });
    }

    /* -----------------------------------------
       Table Validation
    ----------------------------------------- */

    const tableExists = await Table.findOne({
      _id: table,
      restaurant,
      store,
      isDeleted: false,
      isActive: true,
    });

    if (!tableExists) {
      return res.status(404).json({
        success: false,
        message: "Table not found or inactive.",
      });
    }

    /* -----------------------------------------
       Table Status Validation
    ----------------------------------------- */

    if (
      tableExists.status === "Occupied" ||
      tableExists.status === "Out Of Service" ||
      tableExists.status === "Cleaning"
    ) {
      return res.status(400).json({
        success: false,
        message: `Table is currently ${tableExists.status}.`,
      });
    }

    /* -----------------------------------------
       Check Existing Reservation
    ----------------------------------------- */

    const existingReservation =
      await Reservation.findOne({
        table,
        reservationDate: new Date(reservationDate),
        status: {
          $in: ["Pending", "Confirmed", "Seated"],
        },
      });

    if (existingReservation) {
      return res.status(400).json({
        success: false,
        message:
          "This table already has an active reservation for this date.",
        data: {
          reservationNo:
            existingReservation.reservationNo,
          reservationTime:
            existingReservation.reservationTime,
        },
      });
    }

    /* -----------------------------------------
       Generate Reservation Number
    ----------------------------------------- */

    const reservationNo =
      await generateReservationNo();

    /* -----------------------------------------
       Create Reservation
    ----------------------------------------- */

    const reservation =
      await Reservation.create({
        reservationNo,
        restaurant,
        store,
        table,
        customerName,
        customerPhone,
        customerEmail,
        reservationDate,
        reservationTime,
        numberOfGuests,
        durationMinutes,
        notes,
        status: "Confirmed",
        createdBy: req.user?.id,
      });

    /* -----------------------------------------
       Update Table
    ----------------------------------------- */

    tableExists.status = "Reserved";
    tableExists.statusColor = "#FF9800";
    tableExists.reservation = reservation._id;
    tableExists.updatedBy = req.user?.id;

    await tableExists.save();

    /* -----------------------------------------
       Populate Result
    ----------------------------------------- */

    const populatedReservation =
      await Reservation.findById(reservation._id)
        .populate(
          "restaurant",
          "restaurantName restaurantCode"
        )
        .populate(
          "store",
          "storeName storeCode"
        )
        .populate(
          "table",
          "tableName tableNumber tableCode capacity"
        );

    return res.status(201).json({
      success: true,
      message: "Reservation created successfully.",
      data: populatedReservation,
    });
  } catch (error) {
    console.error(
      "createReservation:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to create reservation.",
      error: error.message,
    });
  }
};

/* ==========================================================
   Get All Reservations
========================================================== */

exports.getReservations = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      restaurant,
      store,
      table,
      status,
      reservationDate,
      keyword,
    } = req.query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    const filter = {};

    if (restaurant) {
      filter.restaurant = restaurant;
    }

    if (store) {
      filter.store = store;
    }

    if (table) {
      filter.table = table;
    }

    if (status) {
      filter.status = status;
    }

    if (reservationDate) {
      filter.reservationDate =
        new Date(reservationDate);
    }

    if (keyword) {
      filter.$or = [
        {
          reservationNo: {
            $regex: keyword,
            $options: "i",
          },
        },
        {
          customerName: {
            $regex: keyword,
            $options: "i",
          },
        },
        {
          customerPhone: {
            $regex: keyword,
            $options: "i",
          },
        },
      ];
    }

    const totalRecords =
      await Reservation.countDocuments(filter);

    const reservations =
      await Reservation.find(filter)
        .populate(
          "restaurant",
          "restaurantName restaurantCode"
        )
        .populate(
          "store",
          "storeName storeCode"
        )
        .populate(
          "table",
          "tableName tableNumber tableCode capacity status"
        )
        .sort({
          reservationDate: 1,
          reservationTime: 1,
        })
        .skip(
          (pageNumber - 1) * limitNumber
        )
        .limit(limitNumber);

    return res.status(200).json({
      success: true,
      totalRecords,
      currentPage: pageNumber,
      totalPages: Math.ceil(
        totalRecords / limitNumber
      ),
      count: reservations.length,
      data: reservations,
    });
  } catch (error) {
    console.error(
      "getReservations:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch reservations.",
      error: error.message,
    });
  }
};

/* ==========================================================
   Get Reservation By ID
========================================================== */

exports.getReservationById = async (req, res) => {
  try {
    const reservation =
      await Reservation.findById(
        req.params.id
      )
        .populate(
          "restaurant",
          "restaurantName restaurantCode ownerName phone"
        )
        .populate(
          "store",
          "storeName storeCode managerName phone"
        )
        .populate(
          "table",
          "tableName tableNumber tableCode capacity status"
        )
        .populate(
          "createdBy",
          "name email"
        )
        .populate(
          "updatedBy",
          "name email"
        );

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: reservation,
    });
  } catch (error) {
    console.error(
      "getReservationById:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch reservation.",
      error: error.message,
    });
  }
};

/* ==========================================================
   Update Reservation
========================================================== */

exports.updateReservation = async (req, res) => {
  try {
    const reservation =
      await Reservation.findById(
        req.params.id
      );

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found.",
      });
    }

    if (
      ["Completed", "Cancelled"].includes(
        reservation.status
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Completed or cancelled reservation cannot be updated.",
      });
    }

    const allowedFields = [
      "customerName",
      "customerPhone",
      "customerEmail",
      "reservationDate",
      "reservationTime",
      "numberOfGuests",
      "durationMinutes",
      "notes",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        reservation[field] =
          req.body[field];
      }
    });

    reservation.updatedBy =
      req.user?.id;

    await reservation.save();

    const updatedReservation =
      await Reservation.findById(
        reservation._id
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
          "table",
          "tableName tableNumber tableCode capacity status"
        );

    return res.status(200).json({
      success: true,
      message:
        "Reservation updated successfully.",
      data: updatedReservation,
    });
  } catch (error) {
    console.error(
      "updateReservation:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to update reservation.",
      error: error.message,
    });
  }
};

/* ==========================================================
   Confirm Reservation
========================================================== */

exports.confirmReservation = async (
  req,
  res
) => {
  try {
    const reservation =
      await Reservation.findById(
        req.params.id
      );

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found.",
      });
    }

    reservation.status = "Confirmed";
    reservation.updatedBy =
      req.user?.id;

    await reservation.save();

    await Table.findByIdAndUpdate(
      reservation.table,
      {
        status: "Reserved",
        statusColor: "#FF9800",
        reservation: reservation._id,
        updatedBy: req.user?.id,
      }
    );

    return res.status(200).json({
      success: true,
      message:
        "Reservation confirmed successfully.",
      data: reservation,
    });
  } catch (error) {
    console.error(
      "confirmReservation:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to confirm reservation.",
      error: error.message,
    });
  }
};

/* ==========================================================
   Seat Customer
========================================================== */

exports.seatReservation = async (
  req,
  res
) => {
  try {
    const reservation =
      await Reservation.findById(
        req.params.id
      );

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found.",
      });
    }

    if (
      ["Cancelled", "Completed"].includes(
        reservation.status
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Reservation cannot be seated.",
      });
    }

    reservation.status = "Seated";
    reservation.updatedBy =
      req.user?.id;

    await reservation.save();

    await Table.findByIdAndUpdate(
      reservation.table,
      {
        status: "Occupied",
        statusColor: "#F44336",
        reservation: reservation._id,
        updatedBy: req.user?.id,
      }
    );

    return res.status(200).json({
      success: true,
      message:
        "Customer seated successfully.",
      data: reservation,
    });
  } catch (error) {
    console.error(
      "seatReservation:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to seat customer.",
      error: error.message,
    });
  }
};

/* ==========================================================
   Complete Reservation
========================================================== */

exports.completeReservation = async (
  req,
  res
) => {
  try {
    const reservation =
      await Reservation.findById(
        req.params.id
      );

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found.",
      });
    }

    reservation.status = "Completed";
    reservation.updatedBy =
      req.user?.id;

    await reservation.save();

    await Table.findOneAndUpdate(
      {
        _id: reservation.table,
        reservation: reservation._id,
      },
      {
        status: "Cleaning",
        statusColor: "#2196F3",
        reservation: null,
        currentOrder: null,
        currentWaiter: null,
        updatedBy: req.user?.id,
      }
    );

    return res.status(200).json({
      success: true,
      message:
        "Reservation completed successfully.",
      data: reservation,
    });
  } catch (error) {
    console.error(
      "completeReservation:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to complete reservation.",
      error: error.message,
    });
  }
};

/* ==========================================================
   Cancel Reservation
========================================================== */

exports.cancelReservation = async (
  req,
  res
) => {
  try {
    const { reason } = req.body;

    const reservation =
      await Reservation.findById(
        req.params.id
      );

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found.",
      });
    }

    if (
      ["Completed", "Cancelled"].includes(
        reservation.status
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Reservation is already completed or cancelled.",
      });
    }

    reservation.status = "Cancelled";
    reservation.cancelledReason =
      reason || "";
    reservation.updatedBy =
      req.user?.id;

    await reservation.save();

    /* -----------------------------------------
       Release Table
    ----------------------------------------- */

    await Table.findOneAndUpdate(
      {
        _id: reservation.table,
        reservation: reservation._id,
      },
      {
        status: "Available",
        statusColor: "#4CAF50",
        reservation: null,
        currentOrder: null,
        currentWaiter: null,
        updatedBy: req.user?.id,
      }
    );

    return res.status(200).json({
      success: true,
      message:
        "Reservation cancelled successfully.",
      data: reservation,
    });
  } catch (error) {
    console.error(
      "cancelReservation:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to cancel reservation.",
      error: error.message,
    });
  }
};

/* ==========================================================
   Get Today's Reservations
========================================================== */

exports.getTodayReservations = async (
  req,
  res
) => {
  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const filter = {
      reservationDate: {
        $gte: start,
        $lte: end,
      },
    };

    if (req.query.restaurant) {
      filter.restaurant =
        req.query.restaurant;
    }

    if (req.query.store) {
      filter.store =
        req.query.store;
    }

    const reservations =
      await Reservation.find(filter)
        .populate(
          "restaurant",
          "restaurantName"
        )
        .populate(
          "store",
          "storeName"
        )
        .populate(
          "table",
          "tableName tableNumber tableCode capacity status"
        )
        .sort({
          reservationTime: 1,
        });

    return res.status(200).json({
      success: true,
      count: reservations.length,
      data: reservations,
    });
  } catch (error) {
    console.error(
      "getTodayReservations:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to fetch today's reservations.",
      error: error.message,
    });
  }
};

/* ==========================================================
   Delete Reservation
========================================================== */

exports.deleteReservation = async (
  req,
  res
) => {
  try {
    const reservation =
      await Reservation.findById(
        req.params.id
      );

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found.",
      });
    }

    if (
      ["Seated", "Completed"].includes(
        reservation.status
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Seated or completed reservation cannot be deleted.",
      });
    }

    await Table.findOneAndUpdate(
      {
        _id: reservation.table,
        reservation: reservation._id,
      },
      {
        status: "Available",
        statusColor: "#4CAF50",
        reservation: null,
        updatedBy: req.user?.id,
      }
    );

    await Reservation.findByIdAndDelete(
      reservation._id
    );

    return res.status(200).json({
      success: true,
      message:
        "Reservation deleted successfully.",
    });
  } catch (error) {
    console.error(
      "deleteReservation:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Failed to delete reservation.",
      error: error.message,
    });
  }
};

