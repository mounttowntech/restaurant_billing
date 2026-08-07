const express = require("express");

const router = express.Router();

const companyController =
  require("../controllers/companyController");

const {
  verifyToken,
} = require("../middleware/auth");

// =====================================================
// Create Company
// =====================================================

router.post(
  "/create",
  verifyToken,
  companyController.createCompany
);

// =====================================================
// Get All Companies
// =====================================================

router.get(
  "/all",
  verifyToken,
  companyController.getAllCompanies
);

// =====================================================
// Get Company By ID
// =====================================================

router.get(
  "/:id",
  verifyToken,
  companyController.getCompanyById
);

// =====================================================
// Update Company
// =====================================================

router.put(
  "/update/:id",
  verifyToken,
  companyController.updateCompany
);

// =====================================================
// Delete Company
// =====================================================

router.delete(
  "/delete/:id",
  verifyToken,
  companyController.deleteCompany
);

// =====================================================
// Restore Company
// =====================================================

router.patch(
  "/restore/:id",
  verifyToken,
  companyController.restoreCompany
);

// =====================================================
// Toggle Status
// =====================================================

router.patch(
  "/toggle-status/:id",
  verifyToken,
  companyController.toggleCompanyStatus
);

module.exports = router;