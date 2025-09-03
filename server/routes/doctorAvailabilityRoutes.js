const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authenticateToken');
const DoctorAvailabilityController = require('../controllers/DoctorAvailabilityController');

// Get all doctor availabilities
router.get('/doctor-availability', 
  authenticateToken, 
  DoctorAvailabilityController.getAllDoctorAvailabilities
);

// Get availabilities for a specific doctor
router.get('/doctor-availability/doctor/:doctorId', 
  authenticateToken, 
  DoctorAvailabilityController.getDoctorAvailabilities
);

// Get available time slots for a specific date and doctor
router.get('/doctor-availability/slots/:doctorId/:date', 
  authenticateToken, 
  DoctorAvailabilityController.getAvailableTimeSlots
);

// Create doctor availability
router.post('/doctor-availability', 
  authenticateToken, 
  DoctorAvailabilityController.createDoctorAvailability
);

// Update doctor availability
router.put('/doctor-availability/:id', 
  authenticateToken, 
  DoctorAvailabilityController.updateDoctorAvailability
);

// Delete doctor availability
router.delete('/doctor-availability/:id', 
  authenticateToken, 
  DoctorAvailabilityController.deleteDoctorAvailability
);

module.exports = router;