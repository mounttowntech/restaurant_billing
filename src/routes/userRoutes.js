const express = require("express");
const router = express.Router();

const { createUser, getUsers, getUserById, updateUser, deleteUser, restoreUser, updateUserStatus, activateUser, deactivateUser, blockUser, unblockUser, getCurrentUserProfile, updateProfile, uploadProfileImage, removeProfileImage, searchUsers, getActiveUsers, getInactiveUsers, getBlockedUsers, getDeletedUsers, getOnlineUsers, getOfflineUsers, getRestaurantUsers, getStoreUsers, getRoleUsers, getShiftUsers, getUserSummary, getUserAnalytics } = require("../controllers/userController");

// Optional Authentication Middleware
const { verifyToken } = require("../middleware/auth");

// Optional Upload Middleware
const upload = require("../middleware/upload");

/* ==========================================================
   CRUD
========================================================== */

// Create User
router.post(
  "/create",
  // verifyToken,
  createUser
);

// Get All Users
router.get(
  "/all",
  // verifyToken,
  getUsers
);

// Get User By ID
router.get(
  "/:id",
  // verifyToken,
  getUserById
);

// Update User
router.put(
  "/:id",
  // verifyToken,
  updateUser
);

// Soft Delete User
router.delete(
  "/:id",
  // verifyToken,
  deleteUser
);

// Restore User
router.put(
  "/restore/:id",
  // verifyToken,
  restoreUser
);

/* ==========================================================
   Status
========================================================== */

// Update Status
router.put(
  "/status/:id",
  // verifyToken,
  updateUserStatus
);

// Activate User
router.put(
  "/activate/:id",
  // verifyToken,
  activateUser
);

// Deactivate User
router.put(
  "/deactivate/:id",
  // verifyToken,
  deactivateUser
);

// Block User
router.put(
  "/block/:id",
  // verifyToken,
  blockUser
);

// Unblock User
router.put(
  "/unblock/:id",
  // verifyToken,
  unblockUser
);

/* ==========================================================
   Authentication
========================================================== */

// Login
// router.post(
//   "/login",
//   userController.loginUser
// );

// Logout
// router.post(
//   "/logout",
//   // verifyToken,
//   userController.logoutUser
// );

// Change Password
// router.put(
//   "/change-password",
//   // verifyToken,
//   userController.changePassword
// );

// Forgot Password
// router.post(
//   "/forgot-password",
//   userController.forgotPassword
// );

// Reset Password
// router.post(
//   "/reset-password",
//   userController.resetPassword
// );

/* ==========================================================
   Profile
========================================================== */

// Current User Profile
router.get(
  "/profile/me",
  // verifyToken,
  getCurrentUserProfile
);

// Update Profile
router.put(  "/profile/update",
  // verifyToken,
  updateProfile
);

// Upload Profile Image
router.put(
  "/profile/upload-image",
  // verifyToken,
  // upload.single("profileImage"),
  uploadProfileImage
);

// Remove Profile Image
router.delete(
  "/profile/remove-image",
  // verifyToken,
  removeProfileImage
);

/* ==========================================================
   Reports
========================================================== */

// Search Users
router.get(
  "/reports/search",
  // verifyToken,
  searchUsers
);

// Active Users
router.get(
  "/reports/active",
  // verifyToken,
  getActiveUsers
);

// Inactive Users
router.get(
  "/reports/inactive",
  // verifyToken,
  getInactiveUsers
);

// Blocked Users
router.get(
  "/reports/blocked",
  // verifyToken,
  getBlockedUsers
);

// Deleted Users
router.get(
  "/reports/deleted",
  // verifyToken,
  getDeletedUsers
);

// Online Users
router.get(
  "/reports/online",
  // verifyToken,
  getOnlineUsers
);

// Offline Users
router.get(
  "/reports/offline",
  // verifyToken,
  getOfflineUsers
);

// Restaurant Users
router.get(
  "/reports/restaurant/:restaurantId",
  // verifyToken,
  getRestaurantUsers
);

// Store Users
router.get(
  "/reports/store/:storeId",
  // verifyToken,
  getStoreUsers
);

// Role Users
router.get(
  "/reports/role/:roleId",
  // verifyToken,
  getRoleUsers
);

// Shift Users
router.get(
  "/reports/shift/:shiftId",
  // verifyToken,
  getShiftUsers
);

// Summary
router.get(
  "/reports/summary",
  // verifyToken,
  getUserSummary
);

// Analytics
router.get(
  "/reports/analytics",
  // verifyToken,
  getUserAnalytics
);

module.exports = router;
