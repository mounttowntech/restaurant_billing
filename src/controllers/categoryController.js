const Category = require("../models/Category");

// ==============================================
// Create Category
// ==============================================
exports.createCategory = async (req, res) => {
  try {
    const {
      restaurant,
      store,
      categoryCode,
      categoryName,
      parentCategory,
      description,
      image,
      icon,
      kitchenCategory,
      displayOrder,
      gstPercentage,
      colorCode,
      isVegCategory,
    } = req.body;

    const exists = await Category.findOne({
      categoryCode: categoryCode.toUpperCase(),
      isDeleted: false,
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: "Category Code already exists",
      });
    }

    const category = await Category.create({
      restaurant,
      store,
      categoryCode: categoryCode.toUpperCase(),
      categoryName,
      parentCategory,
      description,
      image,
      icon,
      kitchenCategory,
      displayOrder,
      gstPercentage,
      colorCode,
      isVegCategory,
      createdBy: req.user?._id,
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================================
// Get All Categories
// ==============================================
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({
      isDeleted: false,
    })
      .populate("parentCategory", "categoryName")
      .populate("restaurant", "restaurantName")
      .populate("store", "storeName")
      .sort({ displayOrder: 1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: categories.length,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================================
// Get Category By ID
// ==============================================
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      isDeleted: false,
    })
      .populate("parentCategory", "categoryName")
      .populate("restaurant", "restaurantName")
      .populate("store", "storeName");

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================================
// Update Category
// ==============================================
exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category || category.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    if (
      req.body.categoryCode &&
      req.body.categoryCode !== category.categoryCode
    ) {
      const exists = await Category.findOne({
        categoryCode: req.body.categoryCode.toUpperCase(),
        _id: { $ne: req.params.id },
        isDeleted: false,
      });

      if (exists) {
        return res.status(400).json({
          success: false,
          message: "Category Code already exists",
        });
      }

      req.body.categoryCode = req.body.categoryCode.toUpperCase();
    }

    req.body.updatedBy = req.user?._id;

    const updated = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================================
// Delete Category (Soft Delete)
// ==============================================
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category || category.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    category.isDeleted = true;
    category.updatedBy = req.user?._id;

    await category.save();

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================================
// Change Category Status
// ==============================================
exports.changeCategoryStatus = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category || category.isDeleted) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    category.isActive = !category.isActive;
    category.updatedBy = req.user?._id;

    await category.save();

    res.status(200).json({
      success: true,
      message: "Category status updated",
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================================
// Parent Categories
// ==============================================
exports.getParentCategories = async (req, res) => {
  try {
    const categories = await Category.find({
      parentCategory: null,
      isDeleted: false,
      isActive: true,
    }).sort({ categoryName: 1 });

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================================
// Dropdown
// ==============================================
exports.getCategoryDropdown = async (req, res) => {
  try {
    const categories = await Category.find({
      isDeleted: false,
      isActive: true,
    })
      .select("_id categoryName")
      .sort({ categoryName: 1 });

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};