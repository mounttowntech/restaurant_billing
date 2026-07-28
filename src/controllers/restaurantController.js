const Restaurant = require("../models/Restaurant");


// ===============================
// Create Restaurant
// ===============================
exports.createRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.create({
      ...req.body,
      createdBy: req.user?.id,
    });

    return res.status(201).json({
      success: true,
      message: "Restaurant created successfully",
      data: restaurant,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ===============================
// Get All Restaurants
// ===============================
exports.getRestaurants = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      status,
      city,
    } = req.query;

    const query = {
      isDeleted: false,
    };

    if (search) {
      query.$or = [
        { restaurantName: { $regex: search, $options: "i" } },
        { restaurantCode: { $regex: search, $options: "i" } },
        { ownerName: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    if (status) query.status = status;

    if (city) query.city = city;

    const restaurants = await Restaurant.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Restaurant.countDocuments(query);

    return res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: restaurants,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ===============================
// Get Restaurant By ID
// ===============================
exports.getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: restaurant,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ===============================
// Update Restaurant
// ===============================
exports.updateRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOneAndUpdate(
      {
        _id: req.params.id,
        isDeleted: false,
      },
      {
        ...req.body,
        updatedBy: req.user?.id,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Restaurant updated successfully",
      data: restaurant,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ===============================
// Delete Restaurant (Soft Delete)
// ===============================
exports.deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      {
        isDeleted: true,
        updatedBy: req.user?.id,
      },
      {
        new: true,
      }
    );

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Restaurant deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// ===============================
// Change Restaurant Status
// ===============================
exports.changeRestaurantStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const restaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      {
        status,
        updatedBy: req.user?.id,
      },
      {
        new: true,
      }
    );

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Restaurant status updated",
      data: restaurant,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};