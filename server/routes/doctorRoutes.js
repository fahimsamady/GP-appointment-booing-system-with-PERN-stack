const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authenticateToken');
const doctorController = require('../controllers/DoctorController');
const { Doctor, User, Profile } = require('../models');

// Get all doctors
router.get('/doctor/doctors', async (req, res) => {
  try {
    const doctors = await Doctor.findAll({
      include: [
        {
          model: User,
          include: [Profile]
        }
      ]
    });
    res.json(doctors);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get doctor availability for current user
router.get('/user/doctor-availability', 
  authenticateToken, 
  async (req, res) => {
    try {
      const { userId } = req.user;
      
      // Find doctor record for current user
      const doctor = await Doctor.findOne({
        where: { user_id: userId }
      });

      if (!doctor) {
        return res.status(404).json({ error: 'Doctor not found' });
      }

      // Get doctor's availability
      const DoctorAvailability = require('../models/doctoravailability');
      const availability = await DoctorAvailability.findAll({
        where: { doctor_id: doctor.id }
      });

      res.json(availability);
    } catch (error) {
      console.error('Error fetching doctor availability:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

router.get('/doctor/doctors/:doctorId', doctorController.getAppointmentsForDoctorWithStatus);

module.exports = router;
