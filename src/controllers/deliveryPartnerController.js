const DeliveryPartner = require("../models/DeliveryPartner");
const mongoose = require("mongoose");
exports.createDeliveryPartner = async (req, res) => {
  try {
    const deliveryPartner = await DeliveryPartner.create(req.body);

    res.status(201).json({
      success: true,
      message: "Delivery Partner created successfully.",
      data: deliveryPartner,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
exports.getDeliveryPartners = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      restaurant,
      store,
      status,
      verificationStatus,
      isOnline,
      vehicleType,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    const query = {};

    if (restaurant && mongoose.Types.ObjectId.isValid(restaurant)) {
      query.restaurant = restaurant;
    }

    if (store && mongoose.Types.ObjectId.isValid(store)) {
      query.store = store;
    }

    if (status) {
      query.status = status;
    }

    if (verificationStatus) {
      query.verificationStatus = verificationStatus;
    }

    if (vehicleType) {
      query["vehicleDetails.vehicleType"] = vehicleType;
    }

    if (isOnline !== undefined) {
      query["availability.isOnline"] = isOnline === "true";
    }

    if (search) {
      query.$or = [
        {
          "personalDetails.firstName": {
            $regex: search,
            $options: "i",
          },
        },
        {
          "personalDetails.lastName": {
            $regex: search,
            $options: "i",
          },
        },
        {
          "personalDetails.phone": {
            $regex: search,
            $options: "i",
          },
        },
        {
          "personalDetails.email": {
            $regex: search,
            $options: "i",
          },
        },
        {
          "vehicleDetails.vehicleNumber": {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const partners = await DeliveryPartner.find(query)
      .populate("restaurant", "restaurantName")
      .populate("store", "storeName")
      .populate("createdBy", "name")
      .populate("updatedBy", "name")
      .sort({
        [sortBy]: sortOrder === "asc" ? 1 : -1,
      })
      .skip(skip)
      .limit(Number(limit));

    const totalRecords = await DeliveryPartner.countDocuments(query);

    res.status(200).json({
      success: true,
      currentPage: Number(page),
      totalPages: Math.ceil(totalRecords / limit),
      totalRecords,
      recordsPerPage: Number(limit),
      data: partners,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
exports.getDeliveryPartnerById = async (req, res) => {
  try {
    const partner = await DeliveryPartner.findById(req.params.id)
      .populate("restaurant")
      .populate("store")
      .populate("createdBy", "name")
      .populate("updatedBy", "name");

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Delivery Partner not found.",
      });
    }

    res.status(200).json({
      success: true,
      data: partner,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
exports.updateDeliveryPartner = async (req, res) => {
  try {
    const partner = await DeliveryPartner.findById(req.params.id);

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Delivery Partner not found.",
      });
    }

    Object.assign(partner, req.body);

    await partner.save();

    res.status(200).json({
      success: true,
      message: "Delivery Partner updated successfully.",
      data: partner,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
exports.deleteDeliveryPartner = async (req, res) => {
  try {
    const partner = await DeliveryPartner.findById(req.params.id);

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Delivery Partner not found.",
      });
    }

    await partner.softDelete();

    res.status(200).json({
      success: true,
      message: "Delivery Partner deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
exports.searchDeliveryPartners = async (req, res) => {
  try {
    const { keyword } = req.query;

    if (!keyword) {
      return res.status(400).json({
        success: false,
        message: "Keyword is required.",
      });
    }

    const partners = await DeliveryPartner.find({
      $or: [
        {
          "personalDetails.firstName": {
            $regex: keyword,
            $options: "i",
          },
        },
        {
          "personalDetails.lastName": {
            $regex: keyword,
            $options: "i",
          },
        },
        {
          "personalDetails.phone": {
            $regex: keyword,
            $options: "i",
          },
        },
        {
          "personalDetails.email": {
            $regex: keyword,
            $options: "i",
          },
        },
        {
          "vehicleDetails.vehicleNumber": {
            $regex: keyword,
            $options: "i",
          },
        },
      ],
    })
      .populate("restaurant", "restaurantName")
      .populate("store", "storeName");

    res.status(200).json({
      success: true,
      total: partners.length,
      data: partners,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
exports.goOnline = async (req, res) => {
  try {
    const partner = await DeliveryPartner.findById(req.params.id);

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Delivery Partner not found.",
      });
    }

    await partner.goOnline();

    res.status(200).json({
      success: true,
      message: "Delivery Partner is now Online.",
      data: partner,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
exports.goOffline = async (req, res) => {
  try {
    const partner = await DeliveryPartner.findById(req.params.id);

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Delivery Partner not found.",
      });
    }

    await partner.goOffline();

    res.status(200).json({
      success: true,
      message: "Delivery Partner is now Offline.",
      data: partner,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
exports.markBusy = async (req, res) => {
  try {
    const partner = await DeliveryPartner.findById(req.params.id);

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Delivery Partner not found.",
      });
    }

    await partner.markBusy();

    res.status(200).json({
      success: true,
      message: "Delivery Partner marked as Busy.",
      data: partner,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
exports.markAvailable = async (req, res) => {
  try {
    const partner = await DeliveryPartner.findById(req.params.id);

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Delivery Partner not found.",
      });
    }

    await partner.markAvailable();

    res.status(200).json({
      success: true,
      message: "Delivery Partner is now Available.",
      data: partner,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
exports.completeDelivery = async (req, res) => {
  try {
    const { deliveryMinutes = 0 } = req.body;

    const partner = await DeliveryPartner.findById(req.params.id);

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Delivery Partner not found.",
      });
    }

    await partner.completeDelivery(deliveryMinutes);

    res.status(200).json({
      success: true,
      message: "Delivery completed successfully.",
      data: partner,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
exports.cancelDelivery = async (req, res) => {
  try {
    const partner = await DeliveryPartner.findById(req.params.id);

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: "Delivery Partner not found.",
      });
    }

    await partner.cancelDelivery();

    res.status(200).json({
      success: true,
      message: "Delivery cancelled successfully.",
      data: partner,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getAvailablePartners = async (req, res) => {

  try {

    const { restaurantId } = req.params;



    const partners = await DeliveryPartner.getAvailablePartners(restaurantId);



    res.status(200).json({

      success: true,

      total: partners.length,

      data: partners,

    });

  } catch (error) {

    res.status(500).json({

      success: false,

      message: error.message,

    });

  }

};

exports.getOnlinePartners = async (req, res) => {

  try {

    const { restaurantId } = req.params;



    const partners = await DeliveryPartner.getOnlinePartners(restaurantId);



    res.status(200).json({

      success: true,

      total: partners.length,

      data: partners,

    });

  } catch (error) {

    res.status(500).json({

      success: false,

      message: error.message,

    });

  }

};

exports.getTopRatedPartners = async (req, res) => {

  try {

    const { restaurantId } = req.params;



    const limit = Number(req.query.limit) || 10;



    const partners = await DeliveryPartner.getTopRatedPartners(

      restaurantId,

      limit

    );



    res.status(200).json({

      success: true,

      total: partners.length,

      data: partners,

    });

  } catch (error) {

    res.status(500).json({

      success: false,

      message: error.message,

    });

  }

};

exports.getStorePartners = async (req, res) => {

  try {

    const { storeId } = req.params;



    const partners = await DeliveryPartner.getStorePartners(storeId);



    res.status(200).json({

      success: true,

      total: partners.length,

      data: partners,

    });

  } catch (error) {

    res.status(500).json({

      success: false,

      message: error.message,

    });

  }

};

exports.getDeliverySummary = async (req, res) => {

  try {

    const { restaurantId } = req.params;



    const summary = await DeliveryPartner.getDeliverySummary(restaurantId);



    res.status(200).json({

      success: true,

      data: summary,

    });

  } catch (error) {

    res.status(500).json({

      success: false,

      message: error.message,

    });

  }

};

exports.getDashboardStatistics = async (req, res) => {

  try {

    const { restaurantId } = req.params;



    const [

      totalPartners,

      activePartners,

      onlinePartners,

      availablePartners,

      busyPartners,

      blockedPartners,

      pendingPartners,

      summary,

    ] = await Promise.all([

      DeliveryPartner.countDocuments({

        restaurant: restaurantId,

        isDeleted: false,

      }),



      DeliveryPartner.countDocuments({

        restaurant: restaurantId,

        status: "active",

      }),



      DeliveryPartner.countDocuments({

        restaurant: restaurantId,

        "availability.isOnline": true,

      }),



      DeliveryPartner.countDocuments({

        restaurant: restaurantId,

        "availability.currentStatus": "available",

      }),



      DeliveryPartner.countDocuments({

        restaurant: restaurantId,

        "availability.currentStatus": "busy",

      }),



      DeliveryPartner.countDocuments({

        restaurant: restaurantId,

        status: "blocked",

      }),



      DeliveryPartner.countDocuments({

        restaurant: restaurantId,

        status: "pending",

      }),



      DeliveryPartner.getDeliverySummary(restaurantId),

    ]);



    res.status(200).json({

      success: true,

      data: {

        totalPartners,

        activePartners,

        onlinePartners,

        availablePartners,

        busyPartners,

        blockedPartners,

        pendingPartners,

        summary,

      },

    });

  } catch (error) {

    res.status(500).json({

      success: false,

      message: error.message,

    });

  }

};


exports.getPerformanceReport = async (req, res) => {

  try {

    const { restaurantId } = req.params;



    const partners = await DeliveryPartner.find({

      restaurant: restaurantId,

      status: "active",

    })

      .select(

        "personalDetails performance availability vehicleDetails status"

      )

      .sort({

        "performance.customerRating": -1,

      });



    res.status(200).json({

      success: true,

      total: partners.length,

      data: partners,

    });

  } catch (error) {

    res.status(500).json({

      success: false,

      message: error.message,

    });

  }

};