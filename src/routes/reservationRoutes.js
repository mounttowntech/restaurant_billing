
const express = require("express");

const router = express.Router();

const {
  createReservation,
  getReservations,
  getReservationById,
  updateReservation,
  confirmReservation,
  seatReservation,
  completeReservation,
  cancelReservation,
  getTodayReservations,
  deleteReservation,
} = require("../controllers/reservationController");

// If you have authentication middleware:
// const { verifyToken } = require("../middleware/auth");

// Create Reservation
router.post(
  "/create",
  // verifyToken,
  createReservation
);

// Get All Reservations
router.get(
  "/all",
  // verifyToken,
  getReservations
);

// Get Today's Reservations
router.get(
  "/today",
  // verifyToken,
  getTodayReservations
);

// Get Reservation By ID
router.get(
  "/:id",
  // verifyToken,
  getReservationById
);

// Update Reservation
router.put(
  "/update/:id",
  // verifyToken,
  updateReservation
);

// Confirm Reservation
router.patch(
  "/confirm/:id",
  // verifyToken,
  confirmReservation
);

// Seat Customer
router.patch(
  "/seat/:id",
  // verifyToken,
  seatReservation
);

// Complete Reservation
router.patch(
  "/complete/:id",
  // verifyToken,
  completeReservation
);

// Cancel Reservation
router.patch(
  "/cancel/:id",
  // verifyToken,
  cancelReservation
);

// Delete Reservation
router.delete(
  "/delete/:id",
  // verifyToken,
  deleteReservation
);

module.exports = router;

