const Restaurant = require("../models/Restaurant");
const mongoose = require("mongoose");
const axios=require("axios");
/* ==========================================================
   Create Restaurant
========================================================== */

exports.createRestaurant = async (req, res) => {
  try {
    const { restaurantCode, restaurantName, phone, email } = req.body;

    // Required Validation
    if (!restaurantCode || !restaurantName || !phone) {
      return res.status(400).json({
        success: false,
        message: "Restaurant Code, Restaurant Name and Phone are required.",
      });
    }

    // Duplicate Restaurant Code
    const codeExists = await Restaurant.findOne({
      restaurantCode: restaurantCode.toUpperCase(),
    });

    if (codeExists) {
      return res.status(409).json({
        success: false,
        message: "Restaurant code already exists.",
      });
    }

    // Duplicate Phone
    const phoneExists = await Restaurant.findOne({
      phone,
    });

    if (phoneExists) {
      return res.status(409).json({
        success: false,
        message: "Phone number already exists.",
      });
    }

    // Duplicate Email
    if (email) {
      const emailExists = await Restaurant.findOne({
        email: email.toLowerCase(),
      });

      if (emailExists) {
        return res.status(409).json({
          success: false,
          message: "Email already exists.",
        });
      }
    }

    const restaurant = await Restaurant.create({
      ...req.body,
      restaurantCode: restaurantCode.toUpperCase(),
      email: email ? email.toLowerCase() : "",
      createdBy: req.user?.userId,
    });

    return res.status(201).json({
      success: true,
      message: "Restaurant created successfully.",
      data: restaurant,
    });
  } catch (error) {
    console.error("Create Restaurant Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create restaurant.",
      error: error.message,
    });
  }
};

/* ==========================================================
   Get Restaurants
========================================================== */

exports.getRestaurants = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, city, state, search } = req.query;

    const filter = {
      isDeleted: false,
    };

    if (status) {
      filter.status = status;
    }

    if (city) {
      filter.city = new RegExp(city, "i");
    }

    if (state) {
      filter.state = new RegExp(state, "i");
    }

    if (search) {
      filter.$or = [
        {
          restaurantName: {
            $regex: search,
            $options: "i",
          },
        },
        {
          restaurantCode: {
            $regex: search,
            $options: "i",
          },
        },
        {
          ownerName: {
            $regex: search,
            $options: "i",
          },
        },
        {
          phone: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const totalRecords = await Restaurant.countDocuments(filter);

    const restaurants = await Restaurant.find(filter)
      .sort({
        createdAt: -1,
      })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      totalRecords,
      currentPage: Number(page),
      totalPages: Math.ceil(totalRecords / Number(limit)),
      data: restaurants,
    });
  } catch (error) {
    console.error("Get Restaurants Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch restaurants.",
      error: error.message,
    });
  }
};

/* ==========================================================
   Get Restaurant By Id
========================================================== */

exports.getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: restaurant,
    });
  } catch (error) {
    console.error("Get Restaurant By Id Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch restaurant.",
      error: error.message,
    });
  }
};

exports.updateRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant || restaurant.isDeleted) {
      return res.status(404).json({
        success: false,

        message: "Restaurant not found",
      });
    }

    Object.assign(restaurant, req.body);

    restaurant.updatedBy = req.user?.userId || req.user?.id;

    await restaurant.save();

    res.status(200).json({
      success: true,

      message: "Restaurant updated successfully",

      data: restaurant,
    });
  } catch (error) {
    console.error("updateRestaurant Error:", error);

    res.status(500).json({
      success: false,

      message: "Failed to update restaurant",

      error: error.message,
    });
  }
};

/* ==========================================================

   Soft Delete Restaurant

========================================================== */

exports.deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    restaurant.isDeleted = true;

    restaurant.updatedBy = req.user?.userId || req.user?.id;

    await restaurant.save();

    res.status(200).json({
      success: true,

      message: "Restaurant deleted successfully",
    });
  } catch (error) {
    console.error("deleteRestaurant Error:", error);

    res.status(500).json({
      success: false,

      message: "Failed to delete restaurant",

      error: error.message,
    });
  }
};

/* ==========================================================

   Restore Restaurant

========================================================== */

// exports.restoreRestaurant = async (req, res) => {
//   try {
//     const restaurant = await Restaurant.findOne({
//       _id: req.params.id,

//       isDeleted: true,
//     });

//     if (!restaurant) {
//       return res.status(404).json({
//         success: false,

//         message: "Deleted restaurant not found",
//       });
//     }

//     restaurant.isDeleted = false;

//     restaurant.updatedBy = req.user?.userId || req.user?.id;

//     await restaurant.save();

//     res.status(200).json({
//       success: true,

//       message: "Restaurant restored successfully",

//       data: restaurant,
//     });
//   } catch (error) {
//     console.error("restoreRestaurant Error:", error);

//     res.status(500).json({
//       success: false,

//       message: "Failed to restore restaurant",

//       error: error.message,
//     });
//   }
// };

/* ==========================================================

   Update Restaurant Status

========================================================== */

exports.updateRestaurantStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["Active", "Inactive"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant || restaurant.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }
    restaurant.status = status;
    restaurant.updatedBy = req.user?.userId || req.user?.id;
    await restaurant.save();
    res.status(200).json({
      success: true,
      message: "Restaurant status updated successfully",
      data: restaurant,
    });
  } catch (error) {
    console.error("updateRestaurantStatus Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update restaurant status",
      error: error.message,
    });
  }
};

exports.getActiveRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({
      status: "Active",
      isDeleted: false,
    }).sort({
      restaurantName: 1,
    });

//     res.json({
//       success: true,
//       count: restaurants.length,
//       data: restaurants,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };
// exports.getInactiveRestaurants = async (req, res) => {
//   try {
//     const restaurants = await Restaurant.find({
//       status: "Inactive",
//       isDeleted: false,
//     }).sort({
//       restaurantName: 1,
//     });

//     res.json({
//       success: true,
//       count: restaurants.length,
//       data: restaurants,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };
// exports.getDeletedRestaurants = async (req, res) => {
//   try {
//     const restaurants = await Restaurant.find({
//       isDeleted: true,
//     });

//     res.json({
//       success: true,
//       count: restaurants.length,
//       data: restaurants,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };
// exports.getRestaurantSummary = async (req, res) => {
//   try {
//     const totalRestaurants = await Restaurant.countDocuments({
//       isDeleted: false,
//     });

//     const activeRestaurants = await Restaurant.countDocuments({
//       status: "Active",
//       isDeleted: false,
//     });

//     const inactiveRestaurants = await Restaurant.countDocuments({
//       status: "Inactive",
//       isDeleted: false,
//     });

//     const deletedRestaurants = await Restaurant.countDocuments({
//       isDeleted: true,
//     });

//     res.json({
//       success: true,
//       data: {
//         totalRestaurants,
//         activeRestaurants,
//         inactiveRestaurants,
//         deletedRestaurants,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };
// exports.getRestaurantAnalytics = async (req, res) => {
//   try {
//     const cityWise = await Restaurant.aggregate([
//       {
//         $match: {
//           isDeleted: false,
//         },
//       },
//       {
//         $group: {
//           _id: "$city",
//           restaurants: {
//             $sum: 1,
//           },
//         },
//       },
//       {
//         $sort: {
//           restaurants: -1,
//         },
//       },
//     ]);

//     const stateWise = await Restaurant.aggregate([
//       {
//         $match: {
//           isDeleted: false,
//         },
//       },
//       {
//         $group: {
//           _id: "$state",
//           restaurants: {
//             $sum: 1,
//           },
//         },
//       },
//       {
//         $sort: {
//           restaurants: -1,
//         },
//       },
//     ]);

//     const statusWise = await Restaurant.aggregate([
//       {
//         $match: {
//           isDeleted: false,
//         },
//       },
//       {
//         $group: {
//           _id: "$status",
//           total: {
//             $sum: 1,
//           },
//         },
//       },
//     ]);

//     res.json({
//       success: true,
//       data: {
//         cityWise,
//         stateWise,
//         statusWise,
//       },
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };
// exports.getCityWiseRestaurants = async (req, res) => {
//   try {
//     const result = await Restaurant.aggregate([
//       {
//         $match: {
//           isDeleted: false,
//         },
//       },
//       {
//         $group: {
//           _id: "$city",
//           totalRestaurants: {
//             $sum: 1,
//           },
//           restaurants: {
//             $push: {
//               _id: "$_id",
//               restaurantName: "$restaurantName",
//               phone: "$phone",
//               status: "$status",
//             },
//           },
//         },
//       },
//       {
//         $sort: {
//           _id: 1,
//         },
//       },
//     ]);

//     res.json({
//       success: true,
//       data: result,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };
// exports.getStateWiseRestaurants = async (req, res) => {
//   try {
//     const result = await Restaurant.aggregate([
//       {
//         $match: {
//           isDeleted: false,
//         },
//       },
//       {
//         $group: {
//           _id: "$state",
//           totalRestaurants: {
//             $sum: 1,
//           },
//           restaurants: {
//             $push: {
//               _id: "$_id",
//               restaurantName: "$restaurantName",
//               city: "$city",
//               phone: "$phone",
//               status: "$status",
//             },
//           },
//         },
//       },
//       {
//         $sort: {
//           _id: 1,
//         },
//       },
//     ]);

    res.json({
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
