const Store = require("../models/storeModel");
const Restaurant = require("../models/Restaurant");

/* ==========================================================
   Create Store
========================================================== */

exports.createStore = async (req, res) => {
  try {
    const {
      restaurant,
      storeCode,
      storeName,
      branchName,
      managerName,
      email,
      phone,
      alternatePhone,
      gstNumber,
      fssaiNumber,
      address,
      area,
      city,
      state,
      country,
      pincode,
      latitude,
      longitude,
      openingTime,
      closingTime,
      totalTables,
      totalSeats,
      serviceChargePercentage,
      gstEnabled,
      serviceChargeEnabled,
      dineInEnabled,
      takeawayEnabled,
      deliveryEnabled,
      onlineOrderEnabled,
      printerName,
      kitchenPrinter,
      billingPrinter,
      logo,
    } = req.body;

    // Validate Restaurant
    const restaurantExists = await Restaurant.findById(restaurant);

    if (!restaurantExists) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found.",
      });
    }

    // Duplicate Store Code
    const existingCode = await Store.findOne({
      storeCode: storeCode.toUpperCase(),
    });

    if (existingCode) {
      return res.status(400).json({
        success: false,
        message: "Store code already exists.",
      });
    }

    const store = await Store.create({
      restaurant,
      storeCode: storeCode.toUpperCase(),
      storeName,
      branchName,
      managerName,
      email,
      phone,
      alternatePhone,
      gstNumber,
      fssaiNumber,
      address,
      area,
      city,
      state,
      country,
      pincode,
      latitude,
      longitude,
      openingTime,
      closingTime,
      totalTables,
      totalSeats,
      serviceChargePercentage,
      gstEnabled,
      serviceChargeEnabled,
      dineInEnabled,
      takeawayEnabled,
      deliveryEnabled,
      onlineOrderEnabled,
      printerName,
      kitchenPrinter,
      billingPrinter,
      logo,
      createdBy: req.user?.id,
    });

    const populatedStore = await Store.findById(store._id)
      .populate("restaurant", "restaurantName restaurantCode");

    return res.status(201).json({
      success: true,
      message: "Store created successfully.",
      data: populatedStore,
    });
  } catch (error) {
    console.error("createStore:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create store.",
      error: error.message,
    });
  }
};

/* ==========================================================
   Get All Stores
========================================================== */

exports.getStores = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      restaurant,
      status,
      city,
    } = req.query;

    const filter = {
      isDeleted: false,
    };

    if (restaurant) {
      filter.restaurant = restaurant;
    }

    if (status) {
      filter.status = status;
    }

    if (city) {
      filter.city = city;
    }

    const totalRecords = await Store.countDocuments(filter);

    const stores = await Store.find(filter)
      .populate(
        "restaurant",
        "restaurantName restaurantCode"
      )
      .sort({
        createdAt: -1,
      })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      totalRecords,
      currentPage: Number(page),
      totalPages: Math.ceil(
        totalRecords / Number(limit)
      ),
      count: stores.length,
      data: stores,
    });
  } catch (error) {
    console.error("getStores:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch stores.",
      error: error.message,
    });
  }
};

/* ==========================================================
   Get Store By ID
========================================================== */

exports.getStoreById = async (req, res) => {
  try {
    const store = await Store.findOne({
      _id: req.params.id,
      isDeleted: false,
    }).populate(
      "restaurant",
      "restaurantName restaurantCode ownerName phone"
    );

    if (!store) {
      return res.status(404).json({
        success: false,
        message: "Store not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: store,
    });
  } catch (error) {
    console.error("getStoreById:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch store.",
      error: error.message,
    });
  }
};




exports.updateStore = async (req, res) => {

  try {

    const store = await Store.findOne({

      _id: req.params.id,

      isDeleted: false,

    });



    if (!store) {

      return res.status(404).json({

        success: false,

        message: "Store not found.",

      });

    }



    // Validate Restaurant

    if (req.body.restaurant) {

      const restaurant = await Restaurant.findById(

        req.body.restaurant

      );



      if (!restaurant) {

        return res.status(404).json({

          success: false,

          message: "Restaurant not found.",

        });

      }



      store.restaurant = req.body.restaurant;

    }



    // Check duplicate store code

    if (

      req.body.storeCode &&

      req.body.storeCode.toUpperCase() !==

        store.storeCode

    ) {

      const existing = await Store.findOne({

        storeCode: req.body.storeCode.toUpperCase(),

        _id: { $ne: store._id },

      });



      if (existing) {

        return res.status(400).json({

          success: false,

          message: "Store code already exists.",

        });

      }



      store.storeCode =

        req.body.storeCode.toUpperCase();

    }



    if (req.body.storeName !== undefined)

      store.storeName = req.body.storeName;



    if (req.body.branchName !== undefined)

      store.branchName = req.body.branchName;



    if (req.body.managerName !== undefined)

      store.managerName = req.body.managerName;



    if (req.body.email !== undefined)

      store.email = req.body.email;



    if (req.body.phone !== undefined)

      store.phone = req.body.phone;



    if (req.body.alternatePhone !== undefined)

      store.alternatePhone =

        req.body.alternatePhone;



    if (req.body.gstNumber !== undefined)

      store.gstNumber = req.body.gstNumber;



    if (req.body.fssaiNumber !== undefined)

      store.fssaiNumber = req.body.fssaiNumber;



    if (req.body.address !== undefined)

      store.address = req.body.address;



    if (req.body.area !== undefined)

      store.area = req.body.area;



    if (req.body.city !== undefined)

      store.city = req.body.city;



    if (req.body.state !== undefined)

      store.state = req.body.state;



    if (req.body.country !== undefined)

      store.country = req.body.country;



    if (req.body.pincode !== undefined)

      store.pincode = req.body.pincode;



    if (req.body.latitude !== undefined)

      store.latitude = req.body.latitude;



    if (req.body.longitude !== undefined)

      store.longitude = req.body.longitude;



    if (req.body.openingTime !== undefined)

      store.openingTime = req.body.openingTime;



    if (req.body.closingTime !== undefined)

      store.closingTime = req.body.closingTime;



    if (req.body.totalTables !== undefined)

      store.totalTables = req.body.totalTables;



    if (req.body.totalSeats !== undefined)

      store.totalSeats = req.body.totalSeats;



    if (

      req.body.serviceChargePercentage !==

      undefined

    )

      store.serviceChargePercentage =

        req.body.serviceChargePercentage;



    if (req.body.gstEnabled !== undefined)

      store.gstEnabled = req.body.gstEnabled;



    if (

      req.body.serviceChargeEnabled !==

      undefined

    )

      store.serviceChargeEnabled =

        req.body.serviceChargeEnabled;



    if (req.body.dineInEnabled !== undefined)

      store.dineInEnabled =

        req.body.dineInEnabled;



    if (

      req.body.takeawayEnabled !== undefined

    )

      store.takeawayEnabled =

        req.body.takeawayEnabled;



    if (

      req.body.deliveryEnabled !== undefined

    )

      store.deliveryEnabled =

        req.body.deliveryEnabled;



    if (

      req.body.onlineOrderEnabled !==

      undefined

    )

      store.onlineOrderEnabled =

        req.body.onlineOrderEnabled;



    if (req.body.printerName !== undefined)

      store.printerName =

        req.body.printerName;



    if (

      req.body.kitchenPrinter !== undefined

    )

      store.kitchenPrinter =

        req.body.kitchenPrinter;



    if (

      req.body.billingPrinter !== undefined

    )

      store.billingPrinter =

        req.body.billingPrinter;



    if (req.body.logo !== undefined)

      store.logo = req.body.logo;



    store.updatedBy = req.user?.id;



    await store.save();



    const updatedStore = await Store.findById(

      store._id

    ).populate(

      "restaurant",

      "restaurantName restaurantCode"

    );



    return res.status(200).json({

      success: true,

      message: "Store updated successfully.",

      data: updatedStore,

    });

  } catch (error) {

    console.error(error);



    return res.status(500).json({

      success: false,

      message: error.message,

    });

  }

};



/* ==========================================================

   Delete Store (Soft Delete)

========================================================== */



exports.deleteStore = async (req, res) => {

  try {

    const store = await Store.findOne({

      _id: req.params.id,

      isDeleted: false,

    });



    if (!store) {

      return res.status(404).json({

        success: false,

        message: "Store not found.",

      });

    }



    store.isDeleted = true;

    store.updatedBy = req.user?.id;



    await store.save();



    return res.status(200).json({

      success: true,

      message: "Store deleted successfully.",

    });

  } catch (error) {

    console.error(error);



    return res.status(500).json({

      success: false,

      message: error.message,

    });

  }

};



/* ==========================================================

   Restore Store

========================================================== */



exports.restoreStore = async (req, res) => {

  try {

    const store = await Store.findOne({

      _id: req.params.id,

      isDeleted: true,

    });



    if (!store) {

      return res.status(404).json({

        success: false,

        message: "Deleted store not found.",

      });

    }



    store.isDeleted = false;

    store.updatedBy = req.user?.id;



    await store.save();



    return res.status(200).json({

      success: true,

      message: "Store restored successfully.",

      data: store,

    });

  } catch (error) {

    console.error(error);



    return res.status(500).json({

      success: false,

      message: error.message,

    });

  }

};



/* ==========================================================

   Update Store Status

========================================================== */



exports.updateStoreStatus = async (

  req,

  res

) => {

  try {

    const { status } = req.body;



    if (

      !["Active", "Inactive"].includes(status)

    ) {

      return res.status(400).json({

        success: false,

        message: "Invalid status.",

      });

    }



    const store = await Store.findOneAndUpdate(

      {

        _id: req.params.id,

        isDeleted: false,

      },

      {

        status,

        updatedBy: req.user?.id,

      },

      {

        new: true,

      }

    ).populate(

      "restaurant",

      "restaurantName restaurantCode"

    );



    if (!store) {

      return res.status(404).json({

        success: false,

        message: "Store not found.",

      });

    }



    return res.status(200).json({

      success: true,

      message:

        "Store status updated successfully.",

      data: store,

    });

  } catch (error) {

    console.error(error);



    return res.status(500).json({

      success: false,

      message: error.message,

    });

  }

};



/* ==========================================================

   Activate Store

========================================================== */



exports.activateStore = async (req, res) => {

  try {

    const store = await Store.findOneAndUpdate(

      {

        _id: req.params.id,

        isDeleted: false,

      },

      {

        status: "Active",

        updatedBy: req.user?.id,

      },

      {

        new: true,

      }

    );



    if (!store) {

      return res.status(404).json({

        success: false,

        message: "Store not found.",

      });

    }



    return res.status(200).json({

      success: true,

      message: "Store activated successfully.",

      data: store,

    });

  } catch (error) {

    return res.status(500).json({

      success: false,

      message: error.message,

    });

  }

};



/* ==========================================================

   Deactivate Store

========================================================== */



exports.deactivateStore = async (

  req,

  res

) => {

  try {

    const store = await Store.findOneAndUpdate(

      {

        _id: req.params.id,

        isDeleted: false,

      },

      {

        status: "Inactive",

        updatedBy: req.user?.id,

      },

      {

        new: true,

      }

    );



    if (!store) {

      return res.status(404).json({

        success: false,

        message: "Store not found.",

      });

    }



    return res.status(200).json({

      success: true,

      message:

        "Store deactivated successfully.",

      data: store,

    });

  } catch (error) {

    return res.status(500).json({

      success: false,

      message: error.message,

    });

  }

};

exports.searchStores = async (req, res) => {
  try {
    const { keyword = "" } = req.query;

    const stores = await Store.find({
      isDeleted: false,
      $or: [
        {
          storeCode: {
            $regex: keyword,
            $options: "i",
          },
        },
        {
          storeName: {
            $regex: keyword,
            $options: "i",
          },
        },
        {
          branchName: {
            $regex: keyword,
            $options: "i",
          },
        },
        {
          city: {
            $regex: keyword,
            $options: "i",
          },
        },
        {
          managerName: {
            $regex: keyword,
            $options: "i",
          },
        },
      ],
    }).populate(
      "restaurant",
      "restaurantName restaurantCode"
    );

    res.status(200).json({
      success: true,
      count: stores.length,
      data: stores,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
   Active Stores
========================================================== */

exports.getActiveStores = async (req, res) => {
  try {
    const stores = await Store.find({
      status: "Active",
      isDeleted: false,
    }).populate(
      "restaurant",
      "restaurantName restaurantCode"
    );

    res.status(200).json({
      success: true,
      count: stores.length,
      data: stores,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
   Inactive Stores
========================================================== */

exports.getInactiveStores = async (req, res) => {
  try {
    const stores = await Store.find({
      status: "Inactive",
      isDeleted: false,
    }).populate(
      "restaurant",
      "restaurantName restaurantCode"
    );

    res.status(200).json({
      success: true,
      count: stores.length,
      data: stores,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
   Deleted Stores
========================================================== */

exports.getDeletedStores = async (req, res) => {
  try {
    const stores = await Store.find({
      isDeleted: true,
    }).populate(
      "restaurant",
      "restaurantName restaurantCode"
    );

    res.status(200).json({
      success: true,
      count: stores.length,
      data: stores,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
   Restaurant Stores
========================================================== */

exports.getRestaurantStores = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const stores = await Store.find({
      restaurant: restaurantId,
      isDeleted: false,
    }).populate(
      "restaurant",
      "restaurantName restaurantCode"
    );

    res.status(200).json({
      success: true,
      count: stores.length,
      data: stores,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
   City Wise Stores
========================================================== */

exports.getCityWiseStores = async (req, res) => {
  try {
    const result = await Store.aggregate([
      {
        $match: {
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: "$city",
          totalStores: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          totalStores: -1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
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
   State Wise Stores
========================================================== */

exports.getStateWiseStores = async (req, res) => {
  try {
    const result = await Store.aggregate([
      {
        $match: {
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: "$state",
          totalStores: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          totalStores: -1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
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
   Online Order Stores
========================================================== */

exports.getOnlineOrderStores = async (req, res) => {
  try {
    const stores = await Store.find({
      onlineOrderEnabled: true,
      isDeleted: false,
    }).populate(
      "restaurant",
      "restaurantName restaurantCode"
    );

    res.status(200).json({
      success: true,
      count: stores.length,
      data: stores,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
   Dine In Stores
========================================================== */

exports.getDineInStores = async (req, res) => {
  try {
    const stores = await Store.find({
      dineInEnabled: true,
      isDeleted: false,
    }).populate(
      "restaurant",
      "restaurantName restaurantCode"
    );

    res.status(200).json({
      success: true,
      count: stores.length,
      data: stores,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
   Delivery Stores
========================================================== */

exports.getDeliveryStores = async (req, res) => {
  try {
    const stores = await Store.find({
      deliveryEnabled: true,
      isDeleted: false,
    }).populate(
      "restaurant",
      "restaurantName restaurantCode"
    );

    res.status(200).json({
      success: true,
      count: stores.length,
      data: stores,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
   Takeaway Stores
========================================================== */

exports.getTakeawayStores = async (req, res) => {
  try {
    const stores = await Store.find({
      takeawayEnabled: true,
      isDeleted: false,
    }).populate(
      "restaurant",
      "restaurantName restaurantCode"
    );

    res.status(200).json({
      success: true,
      count: stores.length,
      data: stores,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
   Store Summary
========================================================== */

exports.getStoreSummary = async (req, res) => {
  try {
    const [
      totalStores,
      activeStores,
      inactiveStores,
      deletedStores,
      onlineStores,
      dineInStores,
      deliveryStores,
      takeawayStores,
    ] = await Promise.all([
      Store.countDocuments({
        isDeleted: false,
      }),
      Store.countDocuments({
        status: "Active",
        isDeleted: false,
      }),
      Store.countDocuments({
        status: "Inactive",
        isDeleted: false,
      }),
      Store.countDocuments({
        isDeleted: true,
      }),
      Store.countDocuments({
        onlineOrderEnabled: true,
        isDeleted: false,
      }),
      Store.countDocuments({
        dineInEnabled: true,
        isDeleted: false,
      }),
      Store.countDocuments({
        deliveryEnabled: true,
        isDeleted: false,
      }),
      Store.countDocuments({
        takeawayEnabled: true,
        isDeleted: false,
      }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalStores,
        activeStores,
        inactiveStores,
        deletedStores,
        onlineStores,
        dineInStores,
        deliveryStores,
        takeawayStores,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

/* ==========================================================
   Store Analytics
========================================================== */

exports.getStoreAnalytics = async (req, res) => {
  try {
    const analytics = await Store.aggregate([
      {
        $facet: {
          statusWise: [
            {
              $group: {
                _id: "$status",
                total: {
                  $sum: 1,
                },
              },
            },
          ],

          cityWise: [
            {
              $group: {
                _id: "$city",
                total: {
                  $sum: 1,
                },
              },
            },
            {
              $sort: {
                total: -1,
              },
            },
          ],

          stateWise: [
            {
              $group: {
                _id: "$state",
                total: {
                  $sum: 1,
                },
              },
            },
            {
              $sort: {
                total: -1,
              },
            },
          ],

          monthlyCreated: [
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
                totalStores: {
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
          ],
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: analytics[0],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};