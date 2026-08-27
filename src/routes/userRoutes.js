const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");

// Optional Authentication Middleware
const { verifyToken } = require("../middleware/auth");

// Optional Upload Middleware
const upload = require("../middleware/upload");

/* ==========================================================
   CRUD
========================================================== */

// Create User
router.post("/create", verifyToken, userController.createUser);

// Get All Users
router.get("/all", verifyToken, userController.getUsers);

// Get User By ID
router.get("/:id", verifyToken, userController.getUserById);

// Update User
router.put("/:id", verifyToken, userController.updateUser);

// Soft Delete User
router.delete("/:id", verifyToken, userController.deleteUser);

// Restore User
router.put("/restore/:id", verifyToken, userController.restoreUser);

/* ==========================================================
   Status
========================================================== */

// Update Status
router.put("/status/:id", verifyToken, userController.updateUserStatus);

// Activate User
router.put("/activate/:id", verifyToken, userController.activateUser);

// Deactivate User
router.put("/deactivate/:id", verifyToken, userController.deactivateUser);

// Block User
router.put("/block/:id", verifyToken, userController.blockUser);

// Unblock User
router.put("/unblock/:id", verifyToken, userController.unblockUser);

/* ==========================================================
   Authentication
========================================================== */

// Login
router.post("/login", userController.loginUser);

// Logout
router.post("/logout", verifyToken, userController.logoutUser);

// Change Password
router.put("/change-password", verifyToken, userController.changePassword);

// Forgot Password
router.post("/forgot-password", userController.forgotPassword);

// Reset Password
router.post("/reset-password", userController.resetPassword);

/* ==========================================================
   Profile
========================================================== */

// Current User Profile
router.get("/profile/me", verifyToken, userController.getCurrentUserProfile);

// Update Profile
router.put("/profile/update", verifyToken, userController.updateProfile);

// Upload Profile Image
router.put(
  "/profile/upload-image",
  verifyToken,
  upload.single("profileImage"),
  userController.uploadProfileImage,
);

// Remove Profile Image
router.delete(
  "/profile/remove-image",
  verifyToken,
  userController.removeProfileImage,
);

/* ==========================================================
   Reports
========================================================== */

// Search Users
router.get("/reports/search", verifyToken, userController.searchUsers);

// Active Users
router.get("/reports/active", verifyToken, userController.getActiveUsers);

// Inactive Users
router.get("/reports/inactive", verifyToken, userController.getInactiveUsers);

// Blocked Users
router.get("/reports/blocked", verifyToken, userController.getBlockedUsers);

// Deleted Users
router.get("/reports/deleted", verifyToken, userController.getDeletedUsers);

// Online Users
router.get("/reports/online", verifyToken, userController.getOnlineUsers);

// Offline Users
router.get("/reports/offline", verifyToken, userController.getOfflineUsers);

// Restaurant Users
router.get(
  "/reports/restaurant/:restaurantId",
  verifyToken,
  userController.getRestaurantUsers,
);

// Store Users
router.get(
  "/reports/store/:storeId",
  verifyToken,
  userController.getStoreUsers,
);

// Role Users
router.get("/reports/role/:roleId", verifyToken, userController.getRoleUsers);

// Shift Users
router.get(
  "/reports/shift/:shiftId",
  verifyToken,
  userController.getShiftUsers,
);

// Summary
router.get("/reports/summary", verifyToken, userController.getUserSummary);

// Analytics
router.get("/reports/analytics", verifyToken, userController.getUserAnalytics);

module.exports = router;
