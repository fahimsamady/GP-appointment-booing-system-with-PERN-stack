const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/authenticateToken");
const AppointmentRequestController = require("../controllers/AppointmentRequestController");
const appointmentsController = require("../controllers/AppointmentController");

router.post(
  "/appointment/appointmentRequestForm",
  authenticateToken,
  AppointmentRequestController.createAppointmentRequest
);
router.get(
  "/appointment/appointmentRequests",
  authenticateToken,
  AppointmentRequestController.getAllAppointmentRequests
);

router.put(
  "/appointment/appointments/:id",
  authenticateToken,
  appointmentsController.cancelAppointment
);

router.put(
  "/appointment/appointments/:id/reschedule",
  authenticateToken,
  appointmentsController.rescheduleAppointment
);

module.exports = router;
