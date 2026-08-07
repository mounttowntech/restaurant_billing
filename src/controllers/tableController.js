const Table = require("../models/Table");
const Restaurant = require("../models/Restaurant");
const Store = require("../models/storeModel");

/* ==========================================================
   Create Table
========================================================== */

exports.createTable = async (req, res) => {
  try {
    const {
      restaurant,
      store,
      tableCode,
      tableName,
      tableNumber,
      floor,
      section,
      capacity,
      shape,
      qrCode,
      notes,
      statusColor,
    } = req.body;

    // Restaurant Validation
    const restaurantExists = await Restaurant.findById(restaurant);

    if (!restaurantExists) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found.",
      });
    }

    // Store Validation
    const storeExists = await Store.findById(store);

    if (!storeExists) {
      return res.status(404).json({
        success: false,
        message: "Store not found.",
      });
    }

    // Duplicate Table Code
    const codeExists = await Table.findOne({
      tableCode: tableCode.toUpperCase(),
    });

    if (codeExists) {
      return res.status(400).json({
        success: false,
        message: "Table code already exists.",
      });
    }

    // Duplicate Table Number in Store
    const tableNumberExists = await Table.findOne({
      store,
      tableNumber,
      isDeleted: false,
    });

    if (tableNumberExists) {
      return res.status(400).json({
        success: false,
        message: "Table number already exists in this store.",
      });
    }

    const table = await Table.create({
      restaurant,
      store,
      tableCode: tableCode.toUpperCase(),
      tableName,
      tableNumber,
      floor,
      section,
      capacity,
      shape,
      qrCode,
      notes,
      statusColor,
      createdBy: req.user?.id,
    });

    const populatedTable = await Table.findById(table._id)
      .populate("restaurant", "restaurantName restaurantCode")
      .populate("store", "storeName storeCode");

    return res.status(201).json({
      success: true,
      message: "Table created successfully.",
      data: populatedTable,
    });
  } catch (error) {
    console.error("createTable:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create table.",
      error: error.message,
    });
  }
};

/* ==========================================================
   Get All Tables
========================================================== */

exports.getTables = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      restaurant,
      store,
      floor,
      section,
      status,
      isActive,
    } = req.query;

    const pageNumber = Number(page);
    const limitNumber = Number(limit);

    const filter = {
      isDeleted: false,
    };

    if (restaurant) filter.restaurant = restaurant;
    if (store) filter.store = store;
    if (floor) filter.floor = floor;
    if (section) filter.section = section;
    if (status) filter.status = status;

    if (isActive !== undefined) {
      filter.isActive = isActive === "true";
    }

    const totalRecords =
      await Table.countDocuments(filter);

    const tables = await Table.find(filter)
      .populate(
        "restaurant",
        "restaurantName restaurantCode"
      )
      .populate(
        "store",
        "storeName storeCode"
      )
      .sort({
        tableNumber: 1,
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
      count: tables.length,
      data: tables,
    });
  } catch (error) {
    console.error(
      "GET TABLES ERROR:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch tables.",
      error: error.message,
    });
  }
};

/* ==========================================================
   Get Table By ID
========================================================== */

exports.getTableById = async (req, res) => {
  try {
    const table = await Table.findOne({
      _id: req.params.id,
      isDeleted: false,
    })
      .populate("restaurant", "restaurantName restaurantCode ownerName phone")
      .populate("store", "storeName storeCode managerName phone")
      .populate("currentWaiter", "name employeeId email phone")
      .populate("currentOrder", "orderNo orderStatus grandTotal")
      .populate(
        "reservation",
        "reservationNo customerName reservationDate reservationTime",
      )
      .populate("mergedTables", "tableName tableNumber capacity status")
      .populate("createdBy", "name email")
      .populate("updatedBy", "name email");

    if (!table) {
      return res.status(404).json({
        success: false,
        message: "Table not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: table,
    });
  } catch (error) {
    console.error("getTableById:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch table.",
      error: error.message,
    });
  }
};

exports.updateTable = async (req, res) => {
  try {
    const table = await Table.findOne({
      _id: req.params.id,

      isDeleted: false,
    });

    if (!table) {
      return res.status(404).json({
        success: false,

        message: "Table not found.",
      });
    }

    const fields = [
      "restaurant",

      "store",

      "tableCode",

      "tableName",

      "tableNumber",

      "floor",

      "section",

      "capacity",

      "shape",

      "qrCode",

      "notes",

      "statusColor",
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        table[field] =
          field === "tableCode"
            ? req.body[field].toUpperCase()
            : req.body[field];
      }
    });

    table.updatedBy = req.user?.id;

    await table.save();

    const updatedTable = await Table.findById(table._id)

      .populate("restaurant", "restaurantName restaurantCode")

      .populate("store", "storeName storeCode");

    res.status(200).json({
      success: true,

      message: "Table updated successfully.",

      data: updatedTable,
    });
  } catch (error) {
    console.error("updateTable:", error);

    res.status(500).json({
      success: false,

      message: "Failed to update table.",

      error: error.message,
    });
  }
};

/* ==========================================================

   Delete Table (Soft Delete)

========================================================== */

exports.deleteTable = async (req, res) => {
  try {
    const table = await Table.findOne({
      _id: req.params.id,

      isDeleted: false,
    });

    if (!table) {
      return res.status(404).json({
        success: false,

        message: "Table not found.",
      });
    }

    table.isDeleted = true;

    table.updatedBy = req.user?.id;

    await table.save();

    res.status(200).json({
      success: true,

      message: "Table deleted successfully.",
    });
  } catch (error) {
    console.error("deleteTable:", error);

    res.status(500).json({
      success: false,

      message: "Failed to delete table.",

      error: error.message,
    });
  }
};

/* ==========================================================

   Restore Table

========================================================== */

exports.restoreTable = async (req, res) => {
  try {
    const table = await Table.findOne({
      _id: req.params.id,

      isDeleted: true,
    });

    if (!table) {
      return res.status(404).json({
        success: false,

        message: "Deleted table not found.",
      });
    }

    table.isDeleted = false;

    table.updatedBy = req.user?.id;

    await table.save();

    res.status(200).json({
      success: true,

      message: "Table restored successfully.",

      data: table,
    });
  } catch (error) {
    console.error("restoreTable:", error);

    res.status(500).json({
      success: false,

      message: "Failed to restore table.",

      error: error.message,
    });
  }
};

/* ==========================================================

   Activate Table

========================================================== */

exports.activateTable = async (req, res) => {
  try {
    const table = await Table.findOneAndUpdate(
      {
        _id: req.params.id,

        isDeleted: false,
      },

      {
        isActive: true,

        updatedBy: req.user?.id,
      },

      {
        new: true,
      },
    );

    if (!table) {
      return res.status(404).json({
        success: false,

        message: "Table not found.",
      });
    }

    res.status(200).json({
      success: true,

      message: "Table activated successfully.",

      data: table,
    });
  } catch (error) {
    console.error("activateTable:", error);

    res.status(500).json({
      success: false,

      message: "Failed to activate table.",

      error: error.message,
    });
  }
};

/* ==========================================================

   Deactivate Table

========================================================== */

exports.deactivateTable = async (req, res) => {
  try {
    const table = await Table.findOneAndUpdate(
      {
        _id: req.params.id,

        isDeleted: false,
      },

      {
        isActive: false,

        updatedBy: req.user?.id,
      },

      {
        new: true,
      },
    );

    if (!table) {
      return res.status(404).json({
        success: false,

        message: "Table not found.",
      });
    }

    res.status(200).json({
      success: true,

      message: "Table deactivated successfully.",

      data: table,
    });
  } catch (error) {
    console.error("deactivateTable:", error);

    res.status(500).json({
      success: false,

      message: "Failed to deactivate table.",

      error: error.message,
    });
  }
};

/* ==========================================================

   Update Table Status

========================================================== */

exports.updateTableStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const validStatus = [
      "Available",

      "Occupied",

      "Reserved",

      "Cleaning",

      "Out Of Service",
    ];

    if (!validStatus.includes(status)) {
      return res.status(400).json({
        success: false,

        message: "Invalid table status.",
      });
    }

    const colorMap = {
      Available: "#4CAF50",

      Occupied: "#F44336",

      Reserved: "#FF9800",

      Cleaning: "#2196F3",

      "Out Of Service": "#9E9E9E",
    };

    const table = await Table.findOneAndUpdate(
      {
        _id: req.params.id,

        isDeleted: false,
      },

      {
        status,

        statusColor: colorMap[status],

        updatedBy: req.user?.id,
      },

      {
        new: true,
      },
    );

    if (!table) {
      return res.status(404).json({
        success: false,

        message: "Table not found.",
      });
    }

    res.status(200).json({
      success: true,

      message: "Table status updated successfully.",

      data: table,
    });
  } catch (error) {
    console.error("updateTableStatus:", error);

    res.status(500).json({
      success: false,

      message: "Failed to update table status.",

      error: error.message,
    });
  }
};

/* ==========================================================

   Assign Waiter

========================================================== */

exports.assignWaiter = async (req, res) => {
  try {
    const { waiterId } = req.body;

    const table = await Table.findOneAndUpdate(
      {
        _id: req.params.id,

        isDeleted: false,
      },

      {
        currentWaiter: waiterId,

        updatedBy: req.user?.id,
      },

      {
        new: true,
      },
    ).populate("currentWaiter", "name employeeId email");

    if (!table) {
      return res.status(404).json({
        success: false,

        message: "Table not found.",
      });
    }

    res.status(200).json({
      success: true,

      message: "Waiter assigned successfully.",

      data: table,
    });
  } catch (error) {
    console.error("assignWaiter:", error);

    res.status(500).json({
      success: false,

      message: "Failed to assign waiter.",

      error: error.message,
    });
  }
};

/* ==========================================================

   Remove Waiter

========================================================== */

exports.removeWaiter = async (req, res) => {
  try {
    const table = await Table.findOneAndUpdate(
      {
        _id: req.params.id,

        isDeleted: false,
      },

      {
        currentWaiter: null,

        updatedBy: req.user?.id,
      },

      {
        new: true,
      },
    );

    if (!table) {
      return res.status(404).json({
        success: false,

        message: "Table not found.",
      });
    }

    res.status(200).json({
      success: true,

      message: "Waiter removed successfully.",

      data: table,
    });
  } catch (error) {
    console.error("removeWaiter:", error);

    res.status(500).json({
      success: false,

      message: "Failed to remove waiter.",

      error: error.message,
    });
  }
};

exports.reserveTable = async (req, res) => {
  try {
    const { reservationId } = req.body;

    const table = await Table.findOne({
      _id: req.params.id,

      isDeleted: false,
    });

    if (!table) {
      return res.status(404).json({
        success: false,

        message: "Table not found.",
      });
    }

    if (table.status === "Occupied") {
      return res.status(400).json({
        success: false,

        message: "Occupied table cannot be reserved.",
      });
    }

    table.status = "Reserved";

    table.statusColor = "#FF9800";

    table.reservation = reservationId;

    table.updatedBy = req.user?.id;

    await table.save();

    const updated = await Table.findById(table._id)

      .populate("reservation")

      .populate("currentWaiter", "name");

    res.status(200).json({
      success: true,

      message: "Table reserved successfully.",

      data: updated,
    });
  } catch (error) {
    console.error("reserveTable:", error);

    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

/* ==========================================================

   Release Table

========================================================== */

exports.releaseTable = async (req, res) => {
  try {
    const table = await Table.findOne({
      _id: req.params.id,

      isDeleted: false,
    });

    if (!table) {
      return res.status(404).json({
        success: false,

        message: "Table not found.",
      });
    }

    table.status = "Available";

    table.statusColor = "#4CAF50";

    table.currentOrder = null;

    table.currentWaiter = null;

    table.reservation = null;

    table.updatedBy = req.user?.id;

    await table.save();

    res.status(200).json({
      success: true,

      message: "Table released successfully.",

      data: table,
    });
  } catch (error) {
    console.error("releaseTable:", error);

    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

/* ==========================================================

   Occupy Table

========================================================== */

exports.occupyTable = async (req, res) => {
  try {
    const { orderId, waiterId } = req.body;

    const table = await Table.findOne({
      _id: req.params.id,

      isDeleted: false,
    });

    if (!table) {
      return res.status(404).json({
        success: false,

        message: "Table not found.",
      });
    }

    if (table.status === "Occupied") {
      return res.status(400).json({
        success: false,

        message: "Table is already occupied.",
      });
    }

    table.status = "Occupied";

    table.statusColor = "#F44336";

    table.currentOrder = orderId || null;

    table.currentWaiter = waiterId || null;

    table.updatedBy = req.user?.id;

    await table.save();

    const updated = await Table.findById(table._id)

      .populate("currentOrder")

      .populate("currentWaiter", "name employeeId");

    res.status(200).json({
      success: true,

      message: "Table occupied successfully.",

      data: updated,
    });
  } catch (error) {
    console.error("occupyTable:", error);

    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

/* ==========================================================

   Clean Table

========================================================== */

exports.cleanTable = async (req, res) => {
  try {
    const table = await Table.findOne({
      _id: req.params.id,

      isDeleted: false,
    });

    if (!table) {
      return res.status(404).json({
        success: false,

        message: "Table not found.",
      });
    }

    table.status = "Cleaning";

    table.statusColor = "#2196F3";

    table.currentOrder = null;

    table.currentWaiter = null;

    table.reservation = null;

    table.updatedBy = req.user?.id;

    await table.save();

    res.status(200).json({
      success: true,

      message: "Table moved to cleaning.",

      data: table,
    });
  } catch (error) {
    console.error("cleanTable:", error);

    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

/* ==========================================================

   Mark Out Of Service

========================================================== */

exports.markOutOfService = async (req, res) => {
  try {
    const { notes } = req.body;

    const table = await Table.findOne({
      _id: req.params.id,

      isDeleted: false,
    });

    if (!table) {
      return res.status(404).json({
        success: false,

        message: "Table not found.",
      });
    }

    table.status = "Out Of Service";

    table.statusColor = "#9E9E9E";

    table.notes = notes || table.notes;

    table.currentOrder = null;

    table.currentWaiter = null;

    table.reservation = null;

    table.updatedBy = req.user?.id;

    await table.save();

    res.status(200).json({
      success: true,

      message: "Table marked as out of service.",

      data: table,
    });
  } catch (error) {
    console.error("markOutOfService:", error);

    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

/* ==========================================================

   Merge Tables

========================================================== */

exports.mergeTables = async (req, res) => {
  try {
    const { mergedTables } = req.body;

    if (!mergedTables || !mergedTables.length) {
      return res.status(400).json({
        success: false,

        message: "Merged tables are required.",
      });
    }

    const masterTable = await Table.findOne({
      _id: req.params.id,

      isDeleted: false,
    });

    if (!masterTable) {
      return res.status(404).json({
        success: false,

        message: "Master table not found.",
      });
    }

    const tables = await Table.find({
      _id: { $in: mergedTables },

      isDeleted: false,
    });

    const totalCapacity =
      masterTable.capacity + tables.reduce((sum, t) => sum + t.capacity, 0);

    masterTable.isMergeTable = true;

    masterTable.mergedTables = mergedTables;

    masterTable.capacity = totalCapacity;

    masterTable.updatedBy = req.user?.id;

    await masterTable.save();

    res.status(200).json({
      success: true,

      message: "Tables merged successfully.",

      data: masterTable,
    });
  } catch (error) {
    console.error("mergeTables:", error);

    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

/* ==========================================================

   Unmerge Tables

========================================================== */

exports.unmergeTables = async (req, res) => {
  try {
    const table = await Table.findOne({
      _id: req.params.id,

      isDeleted: false,
    });

    if (!table) {
      return res.status(404).json({
        success: false,

        message: "Table not found.",
      });
    }

    if (!table.isMergeTable) {
      return res.status(400).json({
        success: false,

        message: "Table is not a merged table.",
      });
    }

    const originalCapacity = await Table.findById(table._id).select("capacity");

    table.isMergeTable = false;

    table.mergedTables = [];

    table.capacity = originalCapacity.capacity;

    table.updatedBy = req.user?.id;

    await table.save();

    res.status(200).json({
      success: true,

      message: "Tables unmerged successfully.",

      data: table,
    });
  } catch (error) {
    console.error("unmergeTables:", error);

    res.status(500).json({
      success: false,

      message: error.message,
    });
  }
};

exports.searchTables = async (req, res) => {
  try {
    const {
      keyword,

      restaurant,

      store,

      floor,

      section,

      status,

      page = 1,

      limit = 10,
    } = req.query;

    const filter = {
      isDeleted: false,
    };

    if (restaurant) filter.restaurant = restaurant;

    if (store) filter.store = store;

    if (floor) filter.floor = floor;

    if (section) filter.section = section;

    if (status) filter.status = status;

    if (keyword) {
      filter.$or = [
        { tableName: { $regex: keyword, $options: "i" } },

        { tableCode: { $regex: keyword, $options: "i" } },

        { floor: { $regex: keyword, $options: "i" } },

        { section: { $regex: keyword, $options: "i" } },
      ];
    }

    const totalRecords = await Table.countDocuments(filter);

    const tables = await Table.find(filter)

      .populate("restaurant", "restaurantName")

      .populate("store", "storeName")

      .populate("currentWaiter", "name employeeId")

      .sort({ tableNumber: 1 })

      .skip((page - 1) * limit)

      .limit(Number(limit));

    res.status(200).json({
      success: true,

      totalRecords,

      currentPage: Number(page),

      totalPages: Math.ceil(totalRecords / limit),

      count: tables.length,

      data: tables,
    });
  } catch (error) {
    console.error("searchTables:", error);

    res.status(500).json({
      success: false,

      message: "Failed to search tables.",

      error: error.message,
    });
  }
};

/* ==========================================================

   Get Available Tables

========================================================== */

exports.getAvailableTables = async (req, res) => {
  try {
    const { restaurant, store } = req.query;

    const filter = {
      status: "Available",

      isDeleted: false,

      isActive: true,
    };

    if (restaurant) filter.restaurant = restaurant;

    if (store) filter.store = store;

    const tables = await Table.find(filter)

      .populate("restaurant", "restaurantName")

      .populate("store", "storeName")

      .sort({ tableNumber: 1 });

    res.status(200).json({
      success: true,

      count: tables.length,

      data: tables,
    });
  } catch (error) {
    console.error("getAvailableTables:", error);

    res.status(500).json({
      success: false,

      message: "Failed to fetch available tables.",

      error: error.message,
    });
  }
};

/* ==========================================================

   Get Occupied Tables

========================================================== */

exports.getOccupiedTables = async (req, res) => {
  try {
    const { restaurant, store } = req.query;

    const filter = {
      status: "Occupied",

      isDeleted: false,
    };

    if (restaurant) filter.restaurant = restaurant;

    if (store) filter.store = store;

    const tables = await Table.find(filter)

      .populate("restaurant", "restaurantName")

      .populate("store", "storeName")

      .populate("currentOrder", "orderNo")

      .populate("currentWaiter", "name")

      .sort({ tableNumber: 1 });

    res.status(200).json({
      success: true,

      count: tables.length,

      data: tables,
    });
  } catch (error) {
    console.error("getOccupiedTables:", error);

    res.status(500).json({
      success: false,

      message: "Failed to fetch occupied tables.",

      error: error.message,
    });
  }
};

/* ==========================================================

   Get Reserved Tables

========================================================== */

exports.getReservedTables = async (req, res) => {
  try {
    const { restaurant, store } = req.query;

    const filter = {
      status: "Reserved",

      isDeleted: false,
    };

    if (restaurant) filter.restaurant = restaurant;

    if (store) filter.store = store;

    const tables = await Table.find(filter)

      .populate("restaurant", "restaurantName")

      .populate("store", "storeName")

      .populate(
        "reservation",

        "reservationNo customerName reservationDate reservationTime",
      )

      .sort({ tableNumber: 1 });

    res.status(200).json({
      success: true,

      count: tables.length,

      data: tables,
    });
  } catch (error) {
    console.error("getReservedTables:", error);

    res.status(500).json({
      success: false,

      message: "Failed to fetch reserved tables.",

      error: error.message,
    });
  }
};

/* ==========================================================

   Get Cleaning Tables

========================================================== */

exports.getCleaningTables = async (req, res) => {
  try {
    const { restaurant, store } = req.query;

    const filter = {
      status: "Cleaning",

      isDeleted: false,
    };

    if (restaurant) filter.restaurant = restaurant;

    if (store) filter.store = store;

    const tables = await Table.find(filter)

      .populate("restaurant", "restaurantName")

      .populate("store", "storeName")

      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,

      count: tables.length,

      data: tables,
    });
  } catch (error) {
    console.error("getCleaningTables:", error);

    res.status(500).json({
      success: false,

      message: "Failed to fetch cleaning tables.",

      error: error.message,
    });
  }
};
/* ==========================================================
   Get Out Of Service Tables
========================================================== */

exports.getOutOfServiceTables = async (req, res) => {
  try {
    const { restaurant, store } = req.query;

    const filter = {
      status: "Out Of Service",
      isDeleted: false,
    };

    if (restaurant) filter.restaurant = restaurant;
    if (store) filter.store = store;

    const tables = await Table.find(filter)
      .populate("restaurant", "restaurantName restaurantCode")
      .populate("store", "storeName storeCode")
      .sort({ tableNumber: 1 });

    res.status(200).json({
      success: true,
      count: tables.length,
      data: tables,
    });
  } catch (error) {
    console.error("getOutOfServiceTables:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch out of service tables.",
      error: error.message,
    });
  }
};

/* ==========================================================
   Get Active Tables
========================================================== */

exports.getActiveTables = async (req, res) => {
  try {
    const { restaurant, store } = req.query;

    const filter = {
      isActive: true,
      isDeleted: false,
    };

    if (restaurant) filter.restaurant = restaurant;
    if (store) filter.store = store;

    const tables = await Table.find(filter)
      .populate("restaurant", "restaurantName restaurantCode")
      .populate("store", "storeName storeCode")
      .sort({ tableNumber: 1 });

    res.status(200).json({
      success: true,
      count: tables.length,
      data: tables,
    });
  } catch (error) {
    console.error("getActiveTables:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch active tables.",
      error: error.message,
    });
  }
};

/* ==========================================================
   Get Inactive Tables
========================================================== */

exports.getInactiveTables = async (req, res) => {
  try {
    const { restaurant, store } = req.query;

    const filter = {
      isActive: false,
      isDeleted: false,
    };

    if (restaurant) filter.restaurant = restaurant;
    if (store) filter.store = store;

    const tables = await Table.find(filter)
      .populate("restaurant", "restaurantName restaurantCode")
      .populate("store", "storeName storeCode")
      .sort({ tableNumber: 1 });

    res.status(200).json({
      success: true,
      count: tables.length,
      data: tables,
    });
  } catch (error) {
    console.error("getInactiveTables:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch inactive tables.",
      error: error.message,
    });
  }
};

/* ==========================================================
   Get Deleted Tables
========================================================== */

exports.getDeletedTables = async (req, res) => {
  try {
    const { restaurant, store } = req.query;

    const filter = {
      isDeleted: true,
    };

    if (restaurant) filter.restaurant = restaurant;
    if (store) filter.store = store;

    const tables = await Table.find(filter)
      .populate("restaurant", "restaurantName restaurantCode")
      .populate("store", "storeName storeCode")
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: tables.length,
      data: tables,
    });
  } catch (error) {
    console.error("getDeletedTables:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch deleted tables.",
      error: error.message,
    });
  }
};

/* ==========================================================
   Get Restaurant Tables
========================================================== */

exports.getRestaurantTables = async (req, res) => {
  try {
    const { restaurant } = req.params;

    const tables = await Table.find({
      restaurant,
      isDeleted: false,
    })
      .populate("restaurant", "restaurantName restaurantCode")
      .populate("store", "storeName storeCode")
      .populate("currentWaiter", "name employeeId")
      .populate("reservation", "reservationNo customerName")
      .populate("currentOrder", "orderNo")
      .sort({
        store: 1,
        tableNumber: 1,
      });

    res.status(200).json({
      success: true,
      count: tables.length,
      data: tables,
    });
  } catch (error) {
    console.error("getRestaurantTables:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch restaurant tables.",
      error: error.message,
    });
  }
};

exports.getStoreTables = async (req, res) => {
  try {
    const { store } = req.params;

    const tables = await Table.find({
      store,

      isDeleted: false,
    })

      .populate("restaurant", "restaurantName restaurantCode")

      .populate("store", "storeName storeCode")

      .populate("currentWaiter", "name employeeId")

      .populate("reservation", "reservationNo customerName")

      .sort({ tableNumber: 1 });

    return res.status(200).json({
      success: true,

      count: tables.length,

      data: tables,
    });
  } catch (error) {
    console.error("getStoreTables:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to fetch store tables.",

      error: error.message,
    });
  }
};

/* ==========================================================

   Get Floor Tables

========================================================== */

exports.getFloorTables = async (req, res) => {
  try {
    const { floor } = req.params;

    const { restaurant, store } = req.query;

    const filter = {
      floor,

      isDeleted: false,
    };

    if (restaurant) filter.restaurant = restaurant;

    if (store) filter.store = store;

    const tables = await Table.find(filter)

      .populate("restaurant", "restaurantName")

      .populate("store", "storeName")

      .sort({ tableNumber: 1 });

    return res.status(200).json({
      success: true,

      floor,

      count: tables.length,

      data: tables,
    });
  } catch (error) {
    console.error("getFloorTables:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to fetch floor tables.",

      error: error.message,
    });
  }
};

/* ==========================================================

   Get Section Tables

========================================================== */

exports.getSectionTables = async (req, res) => {
  try {
    const { section } = req.params;

    const { restaurant, store } = req.query;

    const filter = {
      section,

      isDeleted: false,
    };

    if (restaurant) filter.restaurant = restaurant;

    if (store) filter.store = store;

    const tables = await Table.find(filter)

      .populate("restaurant", "restaurantName")

      .populate("store", "storeName")

      .sort({ tableNumber: 1 });

    return res.status(200).json({
      success: true,

      section,

      count: tables.length,

      data: tables,
    });
  } catch (error) {
    console.error("getSectionTables:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to fetch section tables.",

      error: error.message,
    });
  }
};

/* ==========================================================

   Get Capacity Tables

========================================================== */

exports.getCapacityTables = async (req, res) => {
  try {
    const { capacity } = req.params;

    const { restaurant, store } = req.query;

    const filter = {
      capacity: { $gte: Number(capacity) },

      isDeleted: false,

      isActive: true,
    };

    if (restaurant) filter.restaurant = restaurant;

    if (store) filter.store = store;

    const tables = await Table.find(filter)

      .populate("restaurant", "restaurantName")

      .populate("store", "storeName")

      .sort({ capacity: 1, tableNumber: 1 });

    return res.status(200).json({
      success: true,

      minimumCapacity: Number(capacity),

      count: tables.length,

      data: tables,
    });
  } catch (error) {
    console.error("getCapacityTables:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to fetch capacity tables.",

      error: error.message,
    });
  }
};

/* ==========================================================

   Get Waiter Tables

========================================================== */

exports.getWaiterTables = async (req, res) => {
  try {
    const { waiterId } = req.params;

    const tables = await Table.find({
      currentWaiter: waiterId,

      isDeleted: false,
    })

      .populate("restaurant", "restaurantName")

      .populate("store", "storeName")

      .populate("currentWaiter", "name employeeId email")

      .populate("currentOrder", "orderNo orderStatus")

      .sort({ tableNumber: 1 });

    return res.status(200).json({
      success: true,

      count: tables.length,

      data: tables,
    });
  } catch (error) {
    console.error("getWaiterTables:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to fetch waiter tables.",

      error: error.message,
    });
  }
};

/* ==========================================================

   Get Merged Tables

========================================================== */

exports.getMergedTables = async (req, res) => {
  try {
    const { restaurant, store } = req.query;

    const filter = {
      isMergeTable: true,

      isDeleted: false,
    };

    if (restaurant) filter.restaurant = restaurant;

    if (store) filter.store = store;

    const tables = await Table.find(filter)

      .populate("restaurant", "restaurantName restaurantCode")

      .populate("store", "storeName storeCode")

      .populate(
        "mergedTables",

        "tableName tableNumber capacity status",
      )

      .sort({ tableNumber: 1 });

    return res.status(200).json({
      success: true,

      count: tables.length,

      data: tables,
    });
  } catch (error) {
    console.error("getMergedTables:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to fetch merged tables.",

      error: error.message,
    });
  }
};

exports.getTableSummary = async (req, res) => {
  try {
    const { restaurant, store } = req.query;

    const filter = {
      isDeleted: false,
    };

    if (restaurant) filter.restaurant = restaurant;

    if (store) filter.store = store;

    const [
      totalTables,

      availableTables,

      occupiedTables,

      reservedTables,

      cleaningTables,

      outOfServiceTables,

      activeTables,

      inactiveTables,

      mergedTables,
    ] = await Promise.all([
      Table.countDocuments(filter),

      Table.countDocuments({
        ...filter,

        status: "Available",
      }),

      Table.countDocuments({
        ...filter,

        status: "Occupied",
      }),

      Table.countDocuments({
        ...filter,

        status: "Reserved",
      }),

      Table.countDocuments({
        ...filter,

        status: "Cleaning",
      }),

      Table.countDocuments({
        ...filter,

        status: "Out Of Service",
      }),

      Table.countDocuments({
        ...filter,

        isActive: true,
      }),

      Table.countDocuments({
        ...filter,

        isActive: false,
      }),

      Table.countDocuments({
        ...filter,

        isMergeTable: true,
      }),
    ]);

    const totalSeats = await Table.aggregate([
      {
        $match: filter,
      },

      {
        $group: {
          _id: null,

          totalSeats: {
            $sum: "$capacity",
          },

          averageCapacity: {
            $avg: "$capacity",
          },
        },
      },
    ]);

    return res.status(200).json({
      success: true,

      data: {
        totalTables,

        availableTables,

        occupiedTables,

        reservedTables,

        cleaningTables,

        outOfServiceTables,

        activeTables,

        inactiveTables,

        mergedTables,

        totalSeats: totalSeats.length > 0 ? totalSeats[0].totalSeats : 0,

        averageCapacity:
          totalSeats.length > 0
            ? Number(totalSeats[0].averageCapacity.toFixed(2))
            : 0,
      },
    });
  } catch (error) {
    console.error("getTableSummary:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to fetch table summary.",

      error: error.message,
    });
  }
};

/* ==========================================================

   Get Table Analytics

========================================================== */

exports.getTableAnalytics = async (req, res) => {
  try {
    const { restaurant, store } = req.query;

    const match = {
      isDeleted: false,
    };

    if (restaurant) match.restaurant = Table.base.Types.ObjectId(restaurant);

    if (store) match.store = Table.base.Types.ObjectId(store);

    const [
      statusWise,

      floorWise,

      sectionWise,

      capacityWise,

      shapeWise,

      monthlyCreated,
    ] = await Promise.all([
      Table.aggregate([
        { $match: match },

        {
          $group: {
            _id: "$status",

            count: { $sum: 1 },
          },
        },

        {
          $sort: {
            count: -1,
          },
        },
      ]),

      Table.aggregate([
        { $match: match },

        {
          $group: {
            _id: "$floor",

            count: { $sum: 1 },
          },
        },

        {
          $sort: {
            _id: 1,
          },
        },
      ]),

      Table.aggregate([
        { $match: match },

        {
          $group: {
            _id: "$section",

            count: { $sum: 1 },
          },
        },

        {
          $sort: {
            count: -1,
          },
        },
      ]),

      Table.aggregate([
        { $match: match },

        {
          $bucket: {
            groupBy: "$capacity",

            boundaries: [1, 3, 5, 7, 9, 100],

            default: "Others",

            output: {
              count: {
                $sum: 1,
              },
            },
          },
        },
      ]),

      Table.aggregate([
        { $match: match },

        {
          $group: {
            _id: "$shape",

            count: {
              $sum: 1,
            },
          },
        },
      ]),

      Table.aggregate([
        { $match: match },

        {
          $group: {
            _id: {
              year: {
                $year: "$createdAt",
              },

              month: {
                $month: "$createdAt",
              },
            },

            count: {
              $sum: 1,
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
    ]);

    return res.status(200).json({
      success: true,

      data: {
        statusWise,

        floorWise,

        sectionWise,

        capacityWise,

        shapeWise,

        monthlyCreated,
      },
    });
  } catch (error) {
    console.error("getTableAnalytics:", error);

    return res.status(500).json({
      success: false,

      message: "Failed to fetch table analytics.",

      error: error.message,
    });
  }
};
