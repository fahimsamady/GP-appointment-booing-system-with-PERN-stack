const appointmentService = require("../services/appointmentService");
const ReminderService = require("../services/appointmentService");

const {
  Appointment,
  Patient,
  Doctor,
  AppointmentStatus,
  User,
  Profile,
  ContactInformation,
} = require("../models");

// Get all appointments
exports.getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.findAll();
    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Create a new appointment
exports.createAppointment = async (req, res) => {
  const { patient_id, doctor_id, appointment_datetime, status_id } = req.body;
  try {
    const appointment = await Appointment.create({
      patient_id,
      doctor_id,
      appointment_datetime,
      status_id,
    });
    res.status(201).json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Get appointments for a specific user
exports.getUserAppointments = async (req, res) => {
  const { userId } = req.user;
  try {
    const appointments = await Appointment.findAll({
      where: { userId },
    });
    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// Function to send appointment reminders to patients
exports.sendAppointmentReminders = async () => {
  try {
    const upcomingAppointments = await Appointments.findAll({
      where: {
        appointment_datetime: {
          [Sequelize.Op.gte]: new Date(),
        },
      },
      include: [
        {
          model: Patient,
          include: [
            {
              model: User,
              include: ContactInformation,
            },
          ],
        },
      ],
    });
    upcomingAppointments.forEach((appointment) => {
      const { patient } = appointment;
      const { email, phone } = patient.user.contactInformation;
      const appointmentDateTime = new Date(appointment.appointment_datetime);
      const oneDayBefore = new Date(appointmentDateTime);
      oneDayBefore.setDate(oneDayBefore.getDate() - 1);
      scheduleReminder(oneDayBefore, () => {
        ReminderService.sendSMSReminder(phone, formatSMSReminder(appointment));
        ReminderService.sendEmailReminder(
          email,
          "Appointment Reminder",
          formatEmailReminder(appointment)
        );
      });

      const oneHourBefore = new Date(appointmentDateTime);
      oneHourBefore.setHours(oneHourBefore.getHours() - 1);
      scheduleReminder(oneHourBefore, () => {
        ReminderService.sendSMSReminder(
          phone,
          "Your appointment is scheduled in one hour."
        );
        ReminderService.sendEmailReminder(
          email,
          "Appointment Reminder",
          "Dear patient, Your appointment is scheduled in one hour."
        );
      });
    });
  } catch (error) {
    console.error("Error sending appointment reminders:", error);
  }
};

exports.getAppointmentsWithDetails = async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      include: [
        {
          model: Patient,
          include: [
            {
              model: User,
              include: [Profile],
            },
          ],
        },
        {
          model: Doctor,
          include: [
            {
              model: User,
              include: [Profile],
            },
          ],
        },
        {
          model: AppointmentStatus,
        },
      ],
    });

    return res.json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return res.status(500).send(error.message);
  }
};

exports.getAppointmentsWithDetailsByUserId = async (req, res) => {
  try {
    const { userId } = req.user;

    const patient = await Patient.findOne({
      where: { user_id: userId },
      raw: true,
    });
    const doctor = await Doctor.findOne({
      where: { user_id: userId },
      raw: true,
    });

    if (!patient && !doctor) {
      return res.status(404).send("User does not have appointments.");
    }
    let condition = {};
    if (patient && doctor) {
      condition = {
        [sequelize.Op.or]: [
          { patient_id: patient.id },
          { doctor_id: doctor.id },
        ],
      };
    } else if (patient) {
      condition = { patient_id: patient.id };
    } else if (doctor) {
      condition = { doctor_id: doctor.id };
    }
    const appointments = await Appointment.findAll({
      where: condition,
      include: [
        {
          model: Patient,
          include: [{ model: User, include: [Profile] }],
        },
        {
          model: Doctor,
          include: [{ model: User, include: [Profile] }],
        },
        { model: AppointmentStatus },
      ],
    });
    return res.json(appointments);
  } catch (error) {
    console.error("Error fetching appointments for user:", error);
    return res.status(500).send(error.message);
  }
};

// Cancel an appointment by Id
exports.cancelAppointment = async (req, res) => {
  const { id } = req.params;
  console.log(id);
  try {
    const appointment = await Appointment.findByPk(id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    const cancelStatus = await AppointmentStatus.findOne({
      where: { status: "Cancelled" },
    });
    if (!cancelStatus) {
      return res.status(500).json({ message: "Cancel status not found" });
    }

    // Update appointment status to "cancel"
    appointment.status_id = cancelStatus.id;
    await appointment.save();
    return res.json(appointment);
  } catch (error) {
    console.error("Error canceling appointment:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

// Reschedule an appointment
exports.rescheduleAppointment = async (req, res) => {
  const { id } = req.params;
  const { appointment_datetime } = req.body;
  
  try {
    const appointment = await Appointment.findByPk(id);
    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Check if the new time conflicts with existing appointments for the same doctor
    const conflict = await Appointment.findOne({
      where: {
        doctor_id: appointment.doctor_id,
        appointment_datetime: appointment_datetime,
        id: { [Op.ne]: id },
        status_id: {
          [Op.notIn]: [
            // Get cancelled status ID
            (await AppointmentStatus.findOne({ where: { status: "Cancelled" } }))?.id
          ].filter(Boolean)
        }
      }
    });

    if (conflict) {
      return res.status(400).json({ message: "Time slot is already booked" });
    }

    // Update appointment datetime
    appointment.appointment_datetime = appointment_datetime;
    await appointment.save();
    
    return res.json({ 
      message: "Appointment rescheduled successfully", 
      appointment: appointment 
    });
  } catch (error) {
    console.error("Error rescheduling appointment:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};