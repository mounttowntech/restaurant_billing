const express = require("express");

const router = express.Router();

const {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  toggleProductAvailability,
} = require("../controllers/productController");

const {
  verifyToken,
} = require("../middleware/auth");

// =====================================================
// CREATE PRODUCT
// POST /api/products/create
// =====================================================

router.post(
  "/create",
  verifyToken,
  createProduct
);

// =====================================================
// GET ALL PRODUCTS
// GET /api/products
// =====================================================

router.get(
  "/all",
  verifyToken,
  getAllProducts
);

// =====================================================
// GET PRODUCT BY ID
// GET /api/products/:id
// =====================================================

router.get(
  "/:id",
  verifyToken,
  getProductById
);

// =====================================================
// UPDATE PRODUCT
// PUT /api/products/:id
// =====================================================

router.put(
  "/update/:id",
  verifyToken,
  updateProduct
);

// =====================================================
// DELETE PRODUCT
// DELETE /api/products/:id
// =====================================================

router.delete(
  "/delete/:id",
  verifyToken,
  deleteProduct
);

// =====================================================
// TOGGLE AVAILABILITY
// PATCH /api/products/:id/toggle-availability
// =====================================================

router.patch(
  "/toggle-availability/:id",
  verifyToken,
  toggleProductAvailability
);

module.exports = router;