const { DoctorAvailability, Doctor, User, Profile } = require('../models');
const { Op } = require('sequelize');

// Get all doctor availabilities
exports.getAllDoctorAvailabilities = async (req, res) => {
  try {
    const availabilities = await DoctorAvailability.findAll({
      include: [
        {
          model: Doctor,
          include: [
            {
              model: User,
              include: [Profile]
            }
          ]
        }
      ]
    });
    res.json(availabilities);
  } catch (error) {
    console.error('Error fetching doctor availabilities:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get availabilities for a specific doctor
exports.getDoctorAvailabilities = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const availabilities = await DoctorAvailability.findAll({
      where: { doctor_id: doctorId },
      include: [
        {
          model: Doctor,
          include: [
            {
              model: User,
              include: [Profile]
            }
          ]
        }
      ]
    });
    res.json(availabilities);
  } catch (error) {
    console.error('Error fetching doctor availabilities:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Create doctor availability
exports.createDoctorAvailability = async (req, res) => {
  try {
    const { doctor_id, available_date, available_start_time, available_end_time } = req.body;
    
    // Check for conflicts
    const conflict = await DoctorAvailability.findOne({
      where: {
        doctor_id,
        available_date,
        [Op.or]: [
          {
            available_start_time: {
              [Op.between]: [available_start_time, available_end_time]
            }
          },
          {
            available_end_time: {
              [Op.between]: [available_start_time, available_end_time]
            }
          }
        ]
      }
    });

    if (conflict) {
      return res.status(400).json({ message: 'Time slot conflicts with existing availability' });
    }

    const availability = await DoctorAvailability.create({
      doctor_id,
      available_date,
      available_start_time,
      available_end_time
    });

    res.status(201).json(availability);
  } catch (error) {
    console.error('Error creating doctor availability:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Update doctor availability
exports.updateDoctorAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { available_date, available_start_time, available_end_time } = req.body;

    const availability = await DoctorAvailability.findByPk(id);
    if (!availability) {
      return res.status(404).json({ message: 'Availability not found' });
    }

    // Check for conflicts (excluding current record)
    const conflict = await DoctorAvailability.findOne({
      where: {
        doctor_id: availability.doctor_id,
        available_date,
        id: { [Op.ne]: id },
        [Op.or]: [
          {
            available_start_time: {
              [Op.between]: [available_start_time, available_end_time]
            }
          },
          {
            available_end_time: {
              [Op.between]: [available_start_time, available_end_time]
            }
          }
        ]
      }
    });

    if (conflict) {
      return res.status(400).json({ message: 'Time slot conflicts with existing availability' });
    }

    await availability.update({
      available_date,
      available_start_time,
      available_end_time
    });

    res.json(availability);
  } catch (error) {
    console.error('Error updating doctor availability:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Delete doctor availability
exports.deleteDoctorAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const availability = await DoctorAvailability.findByPk(id);
    
    if (!availability) {
      return res.status(404).json({ message: 'Availability not found' });
    }

    await availability.destroy();
    res.json({ message: 'Availability deleted successfully' });
  } catch (error) {
    console.error('Error deleting doctor availability:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Get available time slots for a specific date and doctor
exports.getAvailableTimeSlots = async (req, res) => {
  try {
    const { doctorId, date } = req.params;
    
    const availability = await DoctorAvailability.findOne({
      where: {
        doctor_id: doctorId,
        available_date: date
      }
    });

    if (!availability) {
      return res.json({ available: false, message: 'No availability for this date' });
    }

    // Generate 30-minute time slots
    const timeSlots = [];
    const startTime = new Date(`2000-01-01T${availability.available_start_time}`);
    const endTime = new Date(`2000-01-01T${availability.available_end_time}`);
    
    let currentTime = new Date(startTime);
    while (currentTime < endTime) {
      const timeString = currentTime.toTimeString().slice(0, 5);
      timeSlots.push(timeString);
      currentTime.setMinutes(currentTime.getMinutes() + 30);
    }

    res.json({
      available: true,
      timeSlots,
      doctorId,
      date
    });
  } catch (error) {
    console.error('Error fetching available time slots:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
