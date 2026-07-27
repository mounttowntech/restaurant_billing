const express = require("express");
const router = express.Router();

const reservationController = require("../controllers/reservationController");

// ======================================================
// CRUD
// ======================================================

// Create Reservation
router.post(
  "/create",
  reservationController.createReservation
);

// Get All Reservations
router.get(
  "/all",
  reservationController.getReservations
);

// Search Reservations
router.get(
  "/search",
  reservationController.searchReservations
);

// Reservation Summary
router.get(
  "/summary",
  reservationController.getReservationSummary
);

// Reservation Report
router.get(
  "/report",
  reservationController.getReservationReport
);

// Reservation Calendar
router.get(
  "/calendar",
  reservationController.getReservationCalendar
);

// Reservation Analytics
router.get(
  "/analytics",
  reservationController.getReservationAnalytics
);

// Today's Reservations
router.get(
  "/today",
  reservationController.getTodayReservations
);

// Upcoming Reservations
router.get(
  "/upcoming",
  reservationController.getUpcomingReservations
);

// Pending Reservations
router.get(
  "/pending",
  reservationController.getPendingReservations
);

// Completed Reservations
router.get(
  "/completed",
  reservationController.getCompletedReservations
);

// Cancelled Reservations
router.get(
  "/cancelled",
  reservationController.getCancelledReservations
);

// No Show Reservations
router.get(
  "/no-show",
  reservationController.getNoShowReservations
);

// Customer Reservations
router.get(
  "/customer/:customerId",
  reservationController.getCustomerReservations
);

// Table Reservations
router.get(
  "/table/:tableId",
  reservationController.getTableReservations
);

// Waiter Reservations
router.get(
  "/waiter/:waiterId",
  reservationController.getWaiterReservations
);

// Date Wise Reservations
router.get(
  "/date-wise",
  reservationController.getDateWiseReservations
);

// Reservation By Id
router.get(
  "/:id",
  reservationController.getReservationById
);

// ======================================================
// UPDATE
// ======================================================

// Update Reservation
router.put(
  "/:id",
  reservationController.updateReservation
);

// Restore Reservation
router.put(
  "/:id/restore",
  reservationController.restoreReservation
);

// Update Reservation Status
router.put(
  "/:id/status",
  reservationController.updateReservationStatus
);

// Assign Waiter
router.put(
  "/:id/assign-waiter",
  reservationController.assignWaiter
);

// Mark Arrival
router.put(
  "/:id/arrival",
  reservationController.markArrival
);

// Complete Reservation
router.put(
  "/:id/complete",
  reservationController.completeReservation
);

// Cancel Reservation
router.put(
  "/:id/cancel",
  reservationController.cancelReservation
);

// ======================================================
// DELETE
// ======================================================

// Soft Delete
router.delete(
  "/:id",
  reservationController.deleteReservation
);

module.exports = router;