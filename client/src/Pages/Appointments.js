import React, { useState, useEffect } from "react";
import { Table, Button, Modal, Select, Alert } from "flowbite-react";
import { Calendar, Clock, Edit } from "lucide-react";
import axiosWithAuth from "../middelware/axiosWithAuth";
import ConfirmModal from "../pagesComponents/ConfirmModal";

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [rescheduleData, setRescheduleData] = useState({
    new_date: '',
    new_time: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const axiosInstance = axiosWithAuth();
        const response = await axiosInstance.get("/api/user/appointments");
        setAppointments(response.data);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    };

    fetchAppointments();
  }, []);

  const handleCancelAppointment = async () => {
    try {
      const axiosInstance = axiosWithAuth();
      await axiosInstance.put(
        `/api/appointment/appointments/${selectedAppointment.id}`,
        {
          status: "Cancel",
        }
      );
      const updatedAppointments = appointments.map((appointment) => {
        if (appointment.id === selectedAppointment.id) {
          return { ...appointment, AppointmentStatus: { status: "Cancel" } };
        }
        return appointment;
      });
      setAppointments(updatedAppointments);
    } catch (error) {
      console.error("Error canceling appointment:", error);
    }
    setShowConfirmModal(false);
  };

  const handleShowConfirmModal = (appointment) => {
    setSelectedAppointment(appointment);
    setShowConfirmModal(true);
  };

  const handleCloseConfirmModal = () => {
    setShowConfirmModal(false);
  };

  const handleRescheduleAppointment = async () => {
    if (!rescheduleData.new_date || !rescheduleData.new_time) {
      setMessage({ type: 'error', text: 'Please select both date and time' });
      return;
    }

    setLoading(true);
    try {
      const newDateTime = `${rescheduleData.new_date}T${rescheduleData.new_time}:00`;
      await axiosWithAuth().put(`/api/appointment/appointments/${selectedAppointment.id}/reschedule`, {
        appointment_datetime: newDateTime
      });
      
      setMessage({ type: 'success', text: 'Appointment rescheduled successfully' });
      fetchAppointments();
      setShowRescheduleModal(false);
      setRescheduleData({ new_date: '', new_time: '' });
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      setMessage({ type: 'error', text: 'Failed to reschedule appointment' });
    } finally {
      setLoading(false);
    }
  };

  const openRescheduleModal = (appointment) => {
    setSelectedAppointment(appointment);
    setShowRescheduleModal(true);
  };

  return (
    <div className="overflow-x-auto">
      <h1 className="text-center text-4xl font-bold">All Appointments </h1>
      
      {message.text && (
        <Alert color={message.type === 'success' ? 'success' : 'failure'} className="mb-4">
          {message.text}
        </Alert>
      )}
      <Table hoverable={true}>
        <Table.Head>
          <Table.HeadCell>Appointment ID</Table.HeadCell>
          <Table.HeadCell>Patient Name</Table.HeadCell>
          <Table.HeadCell>Doctor's Name</Table.HeadCell>
          <Table.HeadCell>Appointment Date</Table.HeadCell>
          <Table.HeadCell>Appointment Status</Table.HeadCell>
          <Table.HeadCell>Action</Table.HeadCell> {/* Add Action column */}
        </Table.Head>
        <Table.Body className="divide-y">
          {appointments.map((appointment) => (
            <Table.Row
              key={appointment.id}
              className="bg-white dark:border-gray-700 dark:bg-gray-800"
            >
              <Table.Cell>{appointment.id}</Table.Cell>
              <Table.Cell>{`${appointment.Patient.User.Profile.first_name} ${appointment.Patient.User.Profile.last_name}`}</Table.Cell>
              <Table.Cell>{`${appointment.Doctor.User.Profile.first_name} ${appointment.Doctor.User.Profile.last_name}`}</Table.Cell>
              <Table.Cell>
                {new Date(appointment.appointment_datetime).toLocaleString()}
              </Table.Cell>
              <Table.Cell>{appointment.AppointmentStatus.status}</Table.Cell>
              <Table.Cell>
                <div className="flex space-x-2">
                  {appointment.AppointmentStatus.status === "Scheduled" && (
                    <Button
                      size="sm"
                      color="light"
                      onClick={() => openRescheduleModal(appointment)}
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Reschedule
                    </Button>
                  )}
                  {appointment.AppointmentStatus.status !== "cancel" && (
                    <Button
                      color={"gray"}
                      onClick={() => handleShowConfirmModal(appointment)}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={handleCloseConfirmModal}
        onConfirm={handleCancelAppointment}
        message="Are you sure you want to cancel this appointment?"
      />

      {/* Reschedule Modal */}
      <Modal show={showRescheduleModal} onClose={() => setShowRescheduleModal(false)}>
        <Modal.Header>Reschedule Appointment</Modal.Header>
        <Modal.Body>
          {selectedAppointment && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold">Current Appointment</h3>
                <p className="text-sm text-gray-600">
                  {new Date(selectedAppointment.appointment_datetime).toLocaleString()}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  New Date
                </label>
                <input
                  type="date"
                  value={rescheduleData.new_date}
                  onChange={(e) => setRescheduleData(prev => ({ ...prev, new_date: e.target.value }))}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Clock className="inline w-4 h-4 mr-1" />
                  New Time
                </label>
                <input
                  type="time"
                  value={rescheduleData.new_time}
                  onChange={(e) => setRescheduleData(prev => ({ ...prev, new_time: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <div className="flex space-x-2">
            <Button
              onClick={handleRescheduleAppointment}
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Rescheduling...' : 'Reschedule'}
            </Button>
            <Button
              color="gray"
              onClick={() => setShowRescheduleModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Appointments;
