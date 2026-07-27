const Reservation = require("../models/reservationModel");

/* ==========================================================
   Create Reservation
========================================================== */

exports.createReservation = async (req, res) => {
  try {
    const reservation = await Reservation.create({
      ...req.body,
      createdBy: req.user?.id || req.body.createdBy,
    });

    const result = await Reservation.findById(reservation._id)
      .populate("restaurant", "restaurantName")
      .populate("store", "storeName")
      .populate("customer", "customerName mobile phone")
      .populate("table", "tableName tableNo")
      .populate("waiter", "waiterName");

    res.status(201).json({
      success: true,
      message: "Reservation created successfully.",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
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
      status,
      restaurant,
      store,
      customer,
      table,
      waiter,
      reservationType,
      reservationDate,
    } = req.query;

    const filter = {};

    if (status) filter.reservationStatus = status;
    if (restaurant) filter.restaurant = restaurant;
    if (store) filter.store = store;
    if (customer) filter.customer = customer;
    if (table) filter.table = table;
    if (waiter) filter.waiter = waiter;
    if (reservationType) filter.reservationType = reservationType;

    if (reservationDate) {
      const start = new Date(reservationDate);
      start.setHours(0, 0, 0, 0);

      const end = new Date(reservationDate);
      end.setHours(23, 59, 59, 999);

      filter.reservationDate = {
        $gte: start,
        $lte: end,
      };
    }

    const reservations = await Reservation.find(filter)
      .populate("restaurant", "restaurantName")
      .populate("store", "storeName")
      .populate("customer", "customerName mobile phone")
      .populate("table", "tableName tableNo")
      .populate("waiter", "waiterName")
      .sort({
        reservationDate: -1,
        reservationTime: 1,
      })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Reservation.countDocuments(filter);

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      count: reservations.length,
      data: reservations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
   Get Reservation By ID
========================================================== */

exports.getReservationById = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate("restaurant", "restaurantName")
      .populate("store", "storeName")
      .populate("customer", "customerName mobile phone email")
      .populate("table", "tableName tableNo capacity")
      .populate("waiter", "waiterName mobile");

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: reservation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.updateReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        success: false,

        message: "Reservation not found",
      });
    }

    Object.assign(reservation, req.body);

    reservation.updatedBy = req.user?.userId || req.user?.id;

    await reservation.save();

    const updatedReservation = await Reservation.findById(reservation._id)

      .populate("restaurant")

      .populate("store")

      .populate("customer")

      .populate("table")

      .populate("waiter");

    res.status(200).json({
      success: true,

      message: "Reservation updated successfully",

      data: updatedReservation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

/* ==========================================================

   Soft Delete Reservation

========================================================== */

exports.deleteReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        success: false,

        message: "Reservation not found",
      });
    }

    await reservation.softDelete(req.user?.userId || req.user?.id);

    res.status(200).json({
      success: true,

      message: "Reservation deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

/* ==========================================================

   Restore Reservation

========================================================== */

exports.restoreReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findOne({
      _id: req.params.id,

      isDeleted: true,
    });

    if (!reservation) {
      return res.status(404).json({
        success: false,

        message: "Deleted reservation not found",
      });
    }

    await reservation.restore();

    res.status(200).json({
      success: true,

      message: "Reservation restored successfully",

      data: reservation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

/* ==========================================================

   Update Reservation Status

========================================================== */

exports.updateReservationStatus = async (req, res) => {
  try {
    const { reservationStatus } = req.body;

    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        success: false,

        message: "Reservation not found",
      });
    }

    reservation.reservationStatus = reservationStatus;

    reservation.updatedBy = req.user?.userId || req.user?.id;

    await reservation.save();

    res.status(200).json({
      success: true,

      message: "Reservation status updated successfully",

      data: reservation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

/* ==========================================================

   Assign Waiter

========================================================== */

exports.assignWaiter = async (req, res) => {
  try {
    const { waiter } = req.body;

    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        success: false,

        message: "Reservation not found",
      });
    }

    reservation.waiter = waiter;

    reservation.updatedBy = req.user?.userId || req.user?.id;

    await reservation.save();

    const updatedReservation = await Reservation.findById(reservation._id)

      .populate("waiter");

    res.status(200).json({
      success: true,

      message: "Waiter assigned successfully",

      data: updatedReservation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

/* ==========================================================

   Mark Customer Arrival

========================================================== */

exports.markArrival = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        success: false,

        message: "Reservation not found",
      });
    }

    reservation.arrivalTime = new Date();

    reservation.reservationStatus = "Seated";

    reservation.updatedBy = req.user?.userId || req.user?.id;

    await reservation.save();

    res.status(200).json({
      success: true,

      message: "Customer marked as arrived",

      data: reservation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

/* ==========================================================

   Complete Reservation

========================================================== */

exports.completeReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        success: false,

        message: "Reservation not found",
      });
    }

    reservation.completedTime = new Date();

    reservation.reservationStatus = "Completed";

    reservation.updatedBy = req.user?.userId || req.user?.id;

    await reservation.save();

    res.status(200).json({
      success: true,

      message: "Reservation completed successfully",

      data: reservation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

/* ==========================================================

   Cancel Reservation

========================================================== */

exports.cancelReservation = async (req, res) => {
  try {
    const { remarks } = req.body;

    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        success: false,

        message: "Reservation not found",
      });
    }

    reservation.reservationStatus = "Cancelled";

    if (remarks) {
      reservation.remarks = remarks;
    }

    reservation.updatedBy = req.user?.userId || req.user?.id;

    await reservation.save();

    res.status(200).json({
      success: true,

      message: "Reservation cancelled successfully",

      data: reservation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

exports.searchReservations = async (req, res) => {
  try {
    const {
      keyword,

      reservationStatus,

      reservationType,

      restaurant,

      store,

      customer,

      table,

      waiter,

      fromDate,

      toDate,

      page = 1,

      limit = 10,
    } = req.query;

    const query = {
      isDeleted: false,
    };

    if (reservationStatus) query.reservationStatus = reservationStatus;

    if (reservationType) query.reservationType = reservationType;

    if (restaurant) query.restaurant = restaurant;

    if (store) query.store = store;

    if (customer) query.customer = customer;

    if (table) query.table = table;

    if (waiter) query.waiter = waiter;

    if (fromDate || toDate) {
      query.reservationDate = {};

      if (fromDate) query.reservationDate.$gte = new Date(fromDate);

      if (toDate) {
        const endDate = new Date(toDate);

        endDate.setHours(23, 59, 59, 999);

        query.reservationDate.$lte = endDate;
      }
    }

    if (keyword) {
      query.$or = [
        {
          reservationNo: {
            $regex: keyword,

            $options: "i",
          },
        },

        {
          specialRequest: {
            $regex: keyword,

            $options: "i",
          },
        },

        {
          remarks: {
            $regex: keyword,

            $options: "i",
          },
        },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const reservations = await Reservation.find(query)

      .populate("restaurant", "restaurantName")

      .populate("store", "storeName")

      .populate("customer", "customerName mobile")

      .populate("table", "tableName tableNo")

      .populate("waiter", "name")

      .sort({
        reservationDate: -1,

        reservationTime: -1,
      })

      .skip(skip)

      .limit(Number(limit));

    const total = await Reservation.countDocuments(query);

    res.status(200).json({
      success: true,

      totalRecords: total,

      currentPage: Number(page),

      totalPages: Math.ceil(total / limit),

      count: reservations.length,

      data: reservations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

/* ==========================================================

   Today's Reservations

========================================================== */

exports.getTodayReservations = async (req, res) => {
  try {
    const start = new Date();

    start.setHours(0, 0, 0, 0);

    const end = new Date();

    end.setHours(23, 59, 59, 999);

    const reservations = await Reservation.find({
      reservationDate: {
        $gte: start,

        $lte: end,
      },

      isDeleted: false,
    })

      .populate("restaurant", "restaurantName")

      .populate("store", "storeName")

      .populate("customer", "customerName mobile")

      .populate("table", "tableName tableNo")

      .populate("waiter", "name")

      .sort({
        reservationTime: 1,
      });

    const summary = {
      totalReservations: reservations.length,

      pending: reservations.filter((r) => r.reservationStatus === "Pending")
        .length,

      confirmed: reservations.filter((r) => r.reservationStatus === "Confirmed")
        .length,

      seated: reservations.filter((r) => r.reservationStatus === "Seated")
        .length,

      completed: reservations.filter((r) => r.reservationStatus === "Completed")
        .length,

      cancelled: reservations.filter((r) => r.reservationStatus === "Cancelled")
        .length,

      noShow: reservations.filter((r) => r.reservationStatus === "No Show")
        .length,

      totalGuests: reservations.reduce(
        (sum, item) => sum + Number(item.guests || 0),

        0,
      ),

      advanceCollected: reservations.reduce(
        (sum, item) => sum + Number(item.advanceAmount || 0),

        0,
      ),
    };

    res.status(200).json({
      success: true,

      summary,

      count: reservations.length,

      data: reservations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

exports.getUpcomingReservations = async (req, res) => {
  try {
    const {
      restaurant,

      store,

      page = 1,

      limit = 10,
    } = req.query;

    const now = new Date();

    const query = {
      reservationDate: {
        $gte: now,
      },

      reservationStatus: {
        $in: ["Pending", "Confirmed"],
      },

      isDeleted: false,
    };

    if (restaurant) query.restaurant = restaurant;

    if (store) query.store = store;

    const skip = (Number(page) - 1) * Number(limit);

    const reservations = await Reservation.find(query)

      .populate("restaurant", "restaurantName")

      .populate("store", "storeName")

      .populate("customer", "customerName mobile")

      .populate("table", "tableName tableNo")

      .populate("waiter", "name")

      .sort({
        reservationDate: 1,

        reservationTime: 1,
      })

      .skip(skip)

      .limit(Number(limit));

    const total = await Reservation.countDocuments(query);

    res.status(200).json({
      success: true,

      totalRecords: total,

      currentPage: Number(page),

      totalPages: Math.ceil(total / Number(limit)),

      count: reservations.length,

      data: reservations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

/* ==========================================================

   Get Pending Reservations

========================================================== */

exports.getPendingReservations = async (req, res) => {
  try {
    const { restaurant, store, page = 1, limit = 10 } = req.query;
    const query = {
      reservationStatus: "Pending",
      isDeleted: false,
    };
    if (restaurant) query.restaurant = restaurant;
    if (store) query.store = store;
    const skip = (Number(page) - 1) * Number(limit);
    const reservations = await Reservation.find(query)
      .populate("restaurant", "restaurantName")
      .populate("store", "storeName")
      .populate("customer", "customerName mobile")
      .populate("table", "tableName tableNo")
      .populate("waiter", "name")
      .sort({
        reservationDate: 1,
        reservationTime: 1,
      })
      .skip(skip)
      .limit(Number(limit));
    const total = await Reservation.countDocuments(query);
    const totalGuests = reservations.reduce(
      (sum, item) => sum + Number(item.guests || 0),
      0,
    );
    const advanceCollected = reservations.reduce(
      (sum, item) => sum + Number(item.advanceAmount || 0),

      0,
    );
    res.status(200).json({
      success: true,
      totalRecords: total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      summary: {
        pendingReservations: total,
        totalGuests,
        advanceCollected,
      },
      count: reservations.length,
      data: reservations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getCompletedReservations = async (req, res) => {
  try {
    const {
      restaurant,

      store,

      fromDate,

      toDate,

      page = 1,

      limit = 10,
    } = req.query;

    const query = {
      reservationStatus: "Completed",

      isDeleted: false,
    };

    if (restaurant) query.restaurant = restaurant;

    if (store) query.store = store;

    if (fromDate || toDate) {
      query.reservationDate = {};

      if (fromDate) {
        query.reservationDate.$gte = new Date(fromDate);
      }

      if (toDate) {
        const endDate = new Date(toDate);

        endDate.setHours(23, 59, 59, 999);

        query.reservationDate.$lte = endDate;
      }
    }

    const skip = (Number(page) - 1) * Number(limit);

    const reservations = await Reservation.find(query)

      .populate("restaurant", "restaurantName")

      .populate("store", "storeName")

      .populate("customer", "customerName mobile")

      .populate("table", "tableName tableNo")

      .populate("waiter", "name")

      .sort({
        completedTime: -1,

        reservationDate: -1,
      })

      .skip(skip)

      .limit(Number(limit));

    const total = await Reservation.countDocuments(query);

    const summary = {
      totalReservations: total,

      totalGuests: reservations.reduce(
        (sum, item) => sum + Number(item.guests || 0),

        0,
      ),

      advanceCollected: reservations.reduce(
        (sum, item) => sum + Number(item.advanceAmount || 0),

        0,
      ),
    };

    res.status(200).json({
      success: true,

      summary,

      totalRecords: total,

      currentPage: Number(page),

      totalPages: Math.ceil(total / Number(limit)),

      count: reservations.length,

      data: reservations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

/* ==========================================================

   Get Cancelled Reservations

========================================================== */

exports.getCancelledReservations = async (req, res) => {
  try {
    const {
      restaurant,
      store,
      fromDate,
      toDate,
      page = 1,
      limit = 10,
    } = req.query;
    const query = {
      reservationStatus: "Cancelled",
      isDeleted: false,
    };
    if (restaurant) query.restaurant = restaurant;
    if (store) query.store = store;
    if (fromDate || toDate) {
      query.reservationDate = {};
      if (fromDate) {
        query.reservationDate.$gte = new Date(fromDate);
      }
      if (toDate) {
        const endDate = new Date(toDate);
        endDate.setHours(23, 59, 59, 999);
        query.reservationDate.$lte = endDate;
      }
    }
    const skip = (Number(page) - 1) * Number(limit);
    const reservations = await Reservation.find(query)
      .populate("restaurant", "restaurantName")
      .populate("store", "storeName")
      .populate("customer", "customerName mobile")
      .populate("table", "tableName tableNo")
      .populate("waiter", "name")
      .sort({
        updatedAt: -1,
      })
      .skip(skip)
      .limit(Number(limit));
    const total = await Reservation.countDocuments(query);
    const summary = {
      totalCancelled: total,
      cancelledGuests: reservations.reduce(
        (sum, item) => sum + Number(item.guests || 0),
        0,
      ),
      advanceAmount: reservations.reduce(
        (sum, item) => sum + Number(item.advanceAmount || 0),
        0,
      ),
    };
    res.status(200).json({
      success: true,
      summary,
      totalRecords: total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      count: reservations.length,
      data: reservations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getNoShowReservations = async (req, res) => {
  try {
    const {
      restaurant,

      store,

      fromDate,

      toDate,

      page = 1,

      limit = 10,
    } = req.query;

    const query = {
      reservationStatus: "No Show",

      isDeleted: false,
    };

    if (restaurant) query.restaurant = restaurant;

    if (store) query.store = store;

    if (fromDate || toDate) {
      query.reservationDate = {};

      if (fromDate) {
        query.reservationDate.$gte = new Date(fromDate);
      }

      if (toDate) {
        const endDate = new Date(toDate);

        endDate.setHours(23, 59, 59, 999);

        query.reservationDate.$lte = endDate;
      }
    }

    const skip = (Number(page) - 1) * Number(limit);

    const reservations = await Reservation.find(query)

      .populate("restaurant", "restaurantName")

      .populate("store", "storeName")

      .populate("customer", "customerName mobile email")

      .populate("table", "tableName tableNo")

      .populate("waiter", "name")

      .sort({
        reservationDate: -1,

        reservationTime: -1,
      })

      .skip(skip)

      .limit(Number(limit));

    const total = await Reservation.countDocuments(query);

    const summary = {
      totalNoShows: total,

      totalGuests: reservations.reduce(
        (sum, item) => sum + Number(item.guests || 0),

        0,
      ),

      advanceCollected: reservations.reduce(
        (sum, item) => sum + Number(item.advanceAmount || 0),

        0,
      ),
    };

    res.status(200).json({
      success: true,

      summary,

      totalRecords: total,

      currentPage: Number(page),

      totalPages: Math.ceil(total / Number(limit)),

      count: reservations.length,

      data: reservations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

/* ==========================================================

   Get Customer Reservation History

========================================================== */

exports.getCustomerReservations = async (req, res) => {
  try {
    const { customerId } = req.params;

    const {
      reservationStatus,

      page = 1,

      limit = 10,
    } = req.query;

    const query = {
      customer: customerId,

      isDeleted: false,
    };

    if (reservationStatus) {
      query.reservationStatus = reservationStatus;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const reservations = await Reservation.find(query)

      .populate("restaurant", "restaurantName")

      .populate("store", "storeName")

      .populate("customer", "customerName mobile email")

      .populate("table", "tableName tableNo")

      .populate("waiter", "name")

      .sort({
        reservationDate: -1,

        reservationTime: -1,
      })

      .skip(skip)

      .limit(Number(limit));

    const total = await Reservation.countDocuments(query);

    const summary = {
      totalReservations: total,

      completedReservations: await Reservation.countDocuments({
        customer: customerId,

        reservationStatus: "Completed",

        isDeleted: false,
      }),

      cancelledReservations: await Reservation.countDocuments({
        customer: customerId,

        reservationStatus: "Cancelled",

        isDeleted: false,
      }),

      noShowReservations: await Reservation.countDocuments({
        customer: customerId,

        reservationStatus: "No Show",

        isDeleted: false,
      }),

      totalGuests: reservations.reduce(
        (sum, item) => sum + Number(item.guests || 0),

        0,
      ),

      totalAdvancePaid: reservations.reduce(
        (sum, item) => sum + Number(item.advanceAmount || 0),

        0,
      ),
    };

    res.status(200).json({
      success: true,

      summary,

      totalRecords: total,

      currentPage: Number(page),

      totalPages: Math.ceil(total / Number(limit)),

      count: reservations.length,

      data: reservations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

//Get Table Reservations

exports.getTableReservations = async (req, res) => {
  try {
    const { tableId } = req.params;

    const {
      reservationStatus,

      fromDate,

      toDate,

      page = 1,

      limit = 10,
    } = req.query;

    const query = {
      table: tableId,

      isDeleted: false,
    };

    if (reservationStatus) {
      query.reservationStatus = reservationStatus;
    }

    if (fromDate || toDate) {
      query.reservationDate = {};

      if (fromDate) {
        query.reservationDate.$gte = new Date(fromDate);
      }

      if (toDate) {
        const end = new Date(toDate);

        end.setHours(23, 59, 59, 999);

        query.reservationDate.$lte = end;
      }
    }

    const skip = (Number(page) - 1) * Number(limit);

    const reservations = await Reservation.find(query)

      .populate("restaurant", "restaurantName")

      .populate("store", "storeName")

      .populate("customer", "customerName mobile email")

      .populate("table", "tableName tableNo capacity")

      .populate("waiter", "name")

      .sort({
        reservationDate: -1,

        reservationTime: -1,
      })

      .skip(skip)

      .limit(Number(limit));

    const total = await Reservation.countDocuments(query);

    const summary = {
      totalReservations: total,

      pending: reservations.filter((r) => r.reservationStatus === "Pending")
        .length,

      confirmed: reservations.filter((r) => r.reservationStatus === "Confirmed")
        .length,

      seated: reservations.filter((r) => r.reservationStatus === "Seated")
        .length,

      completed: reservations.filter((r) => r.reservationStatus === "Completed")
        .length,

      cancelled: reservations.filter((r) => r.reservationStatus === "Cancelled")
        .length,

      noShow: reservations.filter((r) => r.reservationStatus === "No Show")
        .length,

      totalGuests: reservations.reduce(
        (sum, item) => sum + Number(item.guests || 0),

        0,
      ),

      advanceCollected: reservations.reduce(
        (sum, item) => sum + Number(item.advanceAmount || 0),

        0,
      ),
    };

    res.status(200).json({
      success: true,

      summary,

      totalRecords: total,

      currentPage: Number(page),

      totalPages: Math.ceil(total / Number(limit)),

      count: reservations.length,

      data: reservations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

/* ==========================================================

   Get Waiter Reservations

========================================================== */

exports.getWaiterReservations = async (req, res) => {
  try {
    const { waiterId } = req.params;
    const {
      reservationStatus,
      fromDate,
      toDate,
      page = 1,
      limit = 10,
    } = req.query;
    const query = {
      waiter: waiterId,
      isDeleted: false,
    };
    if (reservationStatus) {
      query.reservationStatus = reservationStatus;
    }
    if (fromDate || toDate) {
      query.reservationDate = {};
      if (fromDate) {
        query.reservationDate.$gte = new Date(fromDate);
      }
      if (toDate) {
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);
        query.reservationDate.$lte = end;
      }
    }
    const skip = (Number(page) - 1) * Number(limit);
    const reservations = await Reservation.find(query)
      .populate("restaurant", "restaurantName")
      .populate("store", "storeName")
      .populate("customer", "customerName mobile email")
      .populate("table", "tableName tableNo")
      .populate("waiter", "name")
      .sort({
        reservationDate: -1,
        reservationTime: -1,
      })
      .skip(skip)
      .limit(Number(limit));
    const total = await Reservation.countDocuments(query);
    const summary = {
      totalReservations: total,
      pending: reservations.filter((r) => r.reservationStatus === "Pending")
        .length,
      confirmed: reservations.filter((r) => r.reservationStatus === "Confirmed")
        .length,
      seated: reservations.filter((r) => r.reservationStatus === "Seated")
        .length,
      completed: reservations.filter((r) => r.reservationStatus === "Completed")
        .length,
      cancelled: reservations.filter((r) => r.reservationStatus === "Cancelled")
        .length,
      noShow: reservations.filter((r) => r.reservationStatus === "No Show")
        .length,
      totalGuests: reservations.reduce(
        (sum, item) => sum + Number(item.guests || 0),
        0,
      ),
      advanceCollected: reservations.reduce(
        (sum, item) => sum + Number(item.advanceAmount || 0),
        0,
      ),
    };
    res.status(200).json({
      success: true,
      summary,
      totalRecords: total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      count: reservations.length,
      data: reservations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getDateWiseReservations = async (req, res) => {
  try {
    const { startDate, endDate, restaurant, store, reservationStatus } =
      req.query;
    const filter = {
      isDeleted: false,
    };

    // Date Filter
    if (startDate || endDate) {
      filter.reservationDate = {};
      if (startDate) {
        filter.reservationDate.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.reservationDate.$lte = end;
      }
    }
    if (restaurant) {
      filter.restaurant = restaurant;
    }
    if (store) {
      filter.store = store;
    }
    if (reservationStatus) {
      filter.reservationStatus = reservationStatus;
    }
    const reservations = await Reservation.find(filter)
      .populate("customer", "customerName phone")
      .populate("table", "tableName tableNumber")
      .populate("waiter", "name")
      .populate("restaurant", "restaurantName")
      .populate("store", "storeName")
      .sort({
        reservationDate: 1,
        reservationTime: 1,
      });
    return res.status(200).json({
      success: true,
      count: reservations.length,
      data: reservations,
    });
  } catch (error) {
    console.error("Get Date Wise Reservations Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch date wise reservations.",
      error: error.message,
    });
  }
};

exports.getReservationSummary = async (req, res) => {
  try {
    const { restaurant, store, startDate, endDate } = req.query;

    const filter = {
      isDeleted: false,
    };

    if (restaurant) filter.restaurant = restaurant;
    if (store) filter.store = store;

    if (startDate || endDate) {
      filter.reservationDate = {};

      if (startDate) {
        filter.reservationDate.$gte = new Date(startDate);
      }

      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.reservationDate.$lte = end;
      }
    }

    const summary = await Reservation.aggregate([
      {
        $match: filter,
      },
      {
        $group: {
          _id: "$reservationStatus",

          totalReservations: {
            $sum: 1,
          },

          totalGuests: {
            $sum: "$guests",
          },

          totalAdvanceAmount: {
            $sum: "$advanceAmount",
          },
        },
      },
      {
        $sort: {
          _id: 1,
        },
      },
    ]);

    const overall = await Reservation.aggregate([
      {
        $match: filter,
      },
      {
        $group: {
          _id: null,

          totalReservations: {
            $sum: 1,
          },

          totalGuests: {
            $sum: "$guests",
          },

          totalAdvanceAmount: {
            $sum: "$advanceAmount",
          },

          averageGuests: {
            $avg: "$guests",
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      overall: overall[0] || {
        totalReservations: 0,
        totalGuests: 0,
        totalAdvanceAmount: 0,
        averageGuests: 0,
      },
      summary,
    });
  } catch (error) {
    console.error("Reservation Summary Error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to fetch reservation summary.",
      error: error.message,
    });
  }
};
exports.getReservationReport = async (req, res) => {
  try {
    const {
      restaurant,
      store,
      waiter,
      table,
      customer,
      reservationStatus,
      reservationType,
      occasion,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = req.query;
    const filter = {
      isDeleted: false,
    };
    if (restaurant) filter.restaurant = restaurant;
    if (store) filter.store = store;
    if (waiter) filter.waiter = waiter;
    if (table) filter.table = table;
    if (customer) filter.customer = customer;
    if (reservationStatus) filter.reservationStatus = reservationStatus;
    if (reservationType) filter.reservationType = reservationType;
    if (occasion) filter.occasion = occasion;
    if (startDate || endDate) {
      filter.reservationDate = {};
      if (startDate) filter.reservationDate.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.reservationDate.$lte = end;
      }
    }
    const totalRecords = await Reservation.countDocuments(filter);
    const reservations = await Reservation.find(filter)
      .populate("customer", "customerName mobile")
      .populate("table", "tableName tableNumber")
      .populate("waiter", "name")
      .populate("restaurant", "restaurantName")

      .populate("store", "storeName")
      .sort({
        reservationDate: -1,
        reservationTime: -1,
      })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const totals = await Reservation.aggregate([
      {
        $match: filter,
      },
      {
        $group: {
          _id: null,
          totalReservations: {
            $sum: 1,
          },
          totalGuests: {
            $sum: "$guests",
          },
          totalAdvance: {
            $sum: "$advanceAmount",
          },
          averageGuests: {
            $avg: "$guests",
          },
        },
      },
    ]);
    res.status(200).json({
      success: true,
      totalRecords,
      currentPage: Number(page),
      totalPages: Math.ceil(totalRecords / Number(limit)),
      totals: totals[0] || {},
      data: reservations,
    });
  } catch (error) {
    console.error("Reservation Report Error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to generate reservation report.",
      error: error.message,
    });
  }
};
/* ==========================================================
   Get Reservation Calendar
========================================================== */

exports.getReservationCalendar = async (req, res) => {
  try {
    const { restaurant, store, startDate, endDate } = req.query;
    const filter = {
      isDeleted: false,
    };
    if (restaurant) filter.restaurant = restaurant;
    if (store) filter.store = store;
    if (startDate || endDate) {
      filter.reservationDate = {};
      if (startDate) filter.reservationDate.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.reservationDate.$lte = end;
      }
    }
    const reservations = await Reservation.find(filter)
      .populate("customer", "customerName")
      .populate("table", "tableName tableNumber")
      .populate("waiter", "name")
      .sort({
        reservationDate: 1,
        reservationTime: 1,
      });
    const events = reservations.map((item) => ({
      id: item._id,
      title: `${item.customer?.customerName || "Customer"} (${item.guests})`,
      start: `${
        item.reservationDate.toISOString().split("T")[0]
      }T${item.reservationTime}`,
      reservationNo: item.reservationNo,
      guests: item.guests,
      status: item.reservationStatus,
      table: item.table?.tableName,
      waiter: item.waiter?.name,
      advanceAmount: item.advanceAmount,
      occasion: item.occasion,
    }));
    return res.status(200).json({
      success: true,
      count: events.length,
      data: events,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Unable to load reservation calendar.",
      error: error.message,
    });
  }
};
/* ==========================================================
   Reservation Analytics Dashboard
========================================================== */

exports.getReservationAnalytics = async (req, res) => {
  try {
    const { restaurant, store, startDate, endDate } = req.query;
    const filter = {
      isDeleted: false,
    };
    if (restaurant) filter.restaurant = mongoose.Types.ObjectId(restaurant);
    if (store) filter.store = mongoose.Types.ObjectId(store);
    if (startDate || endDate) {
      filter.reservationDate = {};
      if (startDate) filter.reservationDate.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.reservationDate.$lte = end;
      }
    }
    const [
      statusSummary,
      reservationTypes,
      occasions,
      monthlyReservations,
      topCustomers,
      waiterSummary,
      guestSummary,
    ] = await Promise.all([
      Reservation.aggregate([
        { $match: filter },
        {
          $group: {
            _id: "$reservationStatus",
            total: { $sum: 1 },
          },
        },
      ]),

      Reservation.aggregate([
        { $match: filter },
        {
          $group: {
            _id: "$reservationType",
            total: { $sum: 1 },
          },
        },
      ]),

      Reservation.aggregate([
        { $match: filter },
        {
          $group: {
            _id: "$occasion",
            total: { $sum: 1 },
          },
        },
      ]),

      Reservation.aggregate([
        { $match: filter },
        {
          $group: {
            _id: {
              month: {
                $month: "$reservationDate",
              },
              year: {
                $year: "$reservationDate",
              },
            },
            totalReservations: {
              $sum: 1,
            },
            guests: {
              $sum: "$guests",
            },
          },
        },
        {
          $sort: {
            "_id.year": 1,
            "_id.month": 1,
          },
        },
      ]),
      Reservation.aggregate([
        { $match: filter },
        {
          $group: {
            _id: "$customer",
            totalReservations: {
              $sum: 1,
            },
            totalGuests: {
              $sum: "$guests",
            },
          },
        },
        {
          $sort: {
            totalReservations: -1,
          },
        },
        {
          $limit: 10,
        },
        {
          $lookup: {
            from: "customers",
            localField: "_id",
            foreignField: "_id",
            as: "customer",
          },
        },
        {
          $unwind: {
            path: "$customer",
            preserveNullAndEmptyArrays: true,
          },
        },
      ]),
      Reservation.aggregate([
        { $match: filter },
        {
          $group: {
            _id: "$waiter",
            reservations: {
              $sum: 1,
            },
          },
        },
        {
          $lookup: {
            from: "waiters",
            localField: "_id",
            foreignField: "_id",
            as: "waiter",
          },
        },
        {
          $unwind: {
            path: "$waiter",
            preserveNullAndEmptyArrays: true,
          },
        },
      ]),
      Reservation.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            totalGuests: {
              $sum: "$guests",
            },
            averageGuests: {
              $avg: "$guests",
            },
            maxGuests: {
              $max: "$guests",
            },
            minGuests: {
              $min: "$guests",
            },
            totalAdvance: {
              $sum: "$advanceAmount",
            },
          },
        },
      ]),
    ]);
    return res.status(200).json({
      success: true,
      analytics: {
        reservationStatus: statusSummary,
        reservationTypes,
        occasions,
        monthlyReservations,
        topCustomers,
        waiterSummary,
        guestSummary: guestSummary[0] || {},
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Unable to fetch reservation analytics.",
      error: error.message,
    });
  }
};
