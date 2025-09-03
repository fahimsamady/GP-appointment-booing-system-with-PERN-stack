const { AppointmentRequest, Appointment, Patient, Doctor, AppointmentStatus, User, Profile } = require('../models');
const { Op } = require('sequelize');

// Get all appointment requests for admin
exports.getAllAppointmentRequests = async (req, res) => {
  try {
    const appointmentRequests = await AppointmentRequest.findAll({
      include: [
        {
          model: Patient,
          include: [
            {
              model: User,
              include: [Profile]
            }
          ]
        },
        {
          model: AppointmentStatus
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    const formattedRequests = appointmentRequests.map(request => ({
      id: request.id,
      name: request.name,
      last_name: request.last_name,
      date_of_birth: request.date_of_birth,
      email: request.email,
      phone_number: request.phone_number,
      prefer_date: request.prefer_date,
      prefer_time: request.prefer_time,
      description: request.description,
      severity: request.severity,
      status: request.AppointmentStatus.status,
      createdAt: request.createdAt,
      patient: request.Patient
    }));

    res.json(formattedRequests);
  } catch (error) {
    console.error('Error fetching appointment requests:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update appointment request status (approve/reject)
exports.updateAppointmentRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, doctor_id, appointment_datetime } = req.body;

    const appointmentRequest = await AppointmentRequest.findByPk(id, {
      include: [AppointmentStatus]
    });

    if (!appointmentRequest) {
      return res.status(404).json({ error: 'Appointment request not found' });
    }

    if (action === 'approve') {
      if (!doctor_id || !appointment_datetime) {
        return res.status(400).json({ error: 'Doctor ID and appointment datetime are required for approval' });
      }

      // Check if doctor exists
      const doctor = await Doctor.findByPk(doctor_id);
      if (!doctor) {
        return res.status(404).json({ error: 'Doctor not found' });
      }

      // Get approved status
      const approvedStatus = await AppointmentStatus.findOne({
        where: { status: 'Approved' }
      });

      if (!approvedStatus) {
        return res.status(500).json({ error: 'Approved status not found' });
      }

      // Update appointment request status
      await appointmentRequest.update({ status_id: approvedStatus.id });

      // Create actual appointment
      const scheduledStatus = await AppointmentStatus.findOne({
        where: { status: 'Scheduled' }
      });

      if (!scheduledStatus) {
        return res.status(500).json({ error: 'Scheduled status not found' });
      }

      const appointment = await Appointment.create({
        patient_id: appointmentRequest.patient_id,
        doctor_id: doctor_id,
        appointment_datetime: appointment_datetime,
        status_id: scheduledStatus.id
      });

      res.json({ 
        message: 'Appointment request approved and appointment created',
        appointment: appointment
      });

    } else if (action === 'reject') {
      // Get rejected status
      const rejectedStatus = await AppointmentStatus.findOne({
        where: { status: 'Rejected' }
      });

      if (!rejectedStatus) {
        return res.status(500).json({ error: 'Rejected status not found' });
      }

      // Update appointment request status
      await appointmentRequest.update({ status_id: rejectedStatus.id });

      res.json({ message: 'Appointment request rejected' });
    } else {
      return res.status(400).json({ error: 'Invalid action. Use "approve" or "reject"' });
    }

  } catch (error) {
    console.error('Error updating appointment request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const totalRequests = await AppointmentRequest.count();
    const pendingRequests = await AppointmentRequest.count({
      include: [{
        model: AppointmentStatus,
        where: { status: 'Received' }
      }]
    });
    const approvedRequests = await AppointmentRequest.count({
      include: [{
        model: AppointmentStatus,
        where: { status: 'Approved' }
      }]
    });
    const rejectedRequests = await AppointmentRequest.count({
      include: [{
        model: AppointmentStatus,
        where: { status: 'Rejected' }
      }]
    });

    const totalAppointments = await Appointment.count();
    const totalPatients = await Patient.count();
    const totalDoctors = await Doctor.count();

    res.json({
      appointmentRequests: {
        total: totalRequests,
        pending: pendingRequests,
        approved: approvedRequests,
        rejected: rejectedRequests
      },
      appointments: {
        total: totalAppointments
      },
      users: {
        patients: totalPatients,
        doctors: totalDoctors
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all users (patients and doctors)
exports.getAllUsers = async (req, res) => {
  try {
    const patients = await Patient.findAll({
      include: [
        {
          model: User,
          include: [Profile]
        }
      ]
    });

    const doctors = await Doctor.findAll({
      include: [
        {
          model: User,
          include: [Profile]
        }
      ]
    });

    res.json({
      patients: patients.map(patient => ({
        id: patient.id,
        user_id: patient.user_id,
        name: `${patient.User.Profile.first_name} ${patient.User.Profile.last_name}`,
        email: patient.User.email,
        type: 'patient',
        createdAt: patient.createdAt
      })),
      doctors: doctors.map(doctor => ({
        id: doctor.id,
        user_id: doctor.user_id,
        name: `Dr. ${doctor.User.Profile.first_name} ${doctor.User.Profile.last_name}`,
        email: doctor.User.email,
        specialization: doctor.specialization,
        type: 'doctor',
        createdAt: doctor.createdAt
      }))
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
