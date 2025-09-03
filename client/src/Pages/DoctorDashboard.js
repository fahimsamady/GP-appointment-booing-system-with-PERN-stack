import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Badge, Modal, Alert } from 'flowbite-react';
import { Calendar, Clock, Users, FileText, Plus, Edit } from 'lucide-react';
import axiosWithAuth from '../middelware/axiosWithAuth';

function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [newAvailability, setNewAvailability] = useState({
    available_date: '',
    available_start_time: '',
    available_end_time: ''
  });
  const [prescription, setPrescription] = useState({
    medication_name: '',
    dosage: '',
    frequency: '',
    duration: '',
    notes: ''
  });

  useEffect(() => {
    fetchDoctorAppointments();
    fetchDoctorAvailability();
  }, []);

  const fetchDoctorAppointments = async () => {
    try {
      const response = await axiosWithAuth().get('/api/user/appointments');
      setAppointments(response.data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setMessage({ type: 'error', text: 'Failed to load appointments' });
    }
  };

  const fetchDoctorAvailability = async () => {
    try {
      const response = await axiosWithAuth().get('/api/user/doctor-availability');
      setAvailability(response.data);
    } catch (error) {
      console.error('Error fetching availability:', error);
    }
  };

  const addAvailability = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axiosWithAuth().post('/api/doctor-availability', newAvailability);
      setMessage({ type: 'success', text: 'Availability added successfully' });
      setNewAvailability({ available_date: '', available_start_time: '', available_end_time: '' });
      setShowAvailabilityModal(false);
      fetchDoctorAvailability();
    } catch (error) {
      console.error('Error adding availability:', error);
      setMessage({ type: 'error', text: 'Failed to add availability' });
    } finally {
      setLoading(false);
    }
  };

  const createPrescription = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const prescriptionData = {
        ...prescription,
        patient_id: selectedAppointment.Patient.id,
        appointment_id: selectedAppointment.id
      };
      await axiosWithAuth().post('/api/prescription/prescriptions', prescriptionData);
      setMessage({ type: 'success', text: 'Prescription created successfully' });
      setPrescription({ medication_name: '', dosage: '', frequency: '', duration: '', notes: '' });
      setShowPrescriptionModal(false);
      setSelectedAppointment(null);
    } catch (error) {
      console.error('Error creating prescription:', error);
      setMessage({ type: 'error', text: 'Failed to create prescription' });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Scheduled': { color: 'blue', icon: Clock },
      'Completed': { color: 'green', icon: Calendar },
      'Cancelled': { color: 'red', icon: Calendar }
    };
    
    const config = statusConfig[status] || statusConfig['Scheduled'];
    const Icon = config.icon;
    
    return (
      <Badge color={config.color} icon={Icon}>
        {status}
      </Badge>
    );
  };

  const todayAppointments = appointments.filter(apt => {
    const appointmentDate = new Date(apt.appointment_datetime).toDateString();
    const today = new Date().toDateString();
    return appointmentDate === today;
  });

  const upcomingAppointments = appointments.filter(apt => {
    const appointmentDate = new Date(apt.appointment_datetime);
    const now = new Date();
    return appointmentDate > now && apt.AppointmentStatus.status === 'Scheduled';
  });

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Doctor Dashboard</h1>
        <p className="text-gray-600">Manage your appointments and availability</p>
      </div>

      {message.text && (
        <Alert color={message.type === 'success' ? 'success' : 'failure'} className="mb-4">
          {message.text}
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Today's Appointments</p>
              <p className="text-2xl font-bold text-gray-900">{todayAppointments.length}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Upcoming</p>
              <p className="text-2xl font-bold text-gray-900">{upcomingAppointments.length}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Patients</p>
              <p className="text-2xl font-bold text-gray-900">
                {new Set(appointments.map(apt => apt.Patient.id)).size}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <FileText className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Availability Slots</p>
              <p className="text-2xl font-bold text-gray-900">{availability.length}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Appointments */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Today's Appointments</h2>
            <Badge color="blue">{todayAppointments.length}</Badge>
          </div>
          
          <div className="space-y-3">
            {todayAppointments.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No appointments today</p>
            ) : (
              todayAppointments.map((appointment) => (
                <div key={appointment.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">
                        {appointment.Patient.User.Profile.first_name} {appointment.Patient.User.Profile.last_name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {new Date(appointment.appointment_datetime).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      {getStatusBadge(appointment.AppointmentStatus.status)}
                      <Button
                        size="sm"
                        color="light"
                        onClick={() => {
                          setSelectedAppointment(appointment);
                          setShowPrescriptionModal(true);
                        }}
                      >
                        <FileText className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Availability Management */}
        <Card>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Availability</h2>
            <Button
              size="sm"
              onClick={() => setShowAvailabilityModal(true)}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
          
          <div className="space-y-3">
            {availability.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No availability set</p>
            ) : (
              availability.map((slot) => (
                <div key={slot.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold">
                        {new Date(slot.available_date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-600">
                        {slot.available_start_time} - {slot.available_end_time}
                      </p>
                    </div>
                    <Button size="sm" color="light">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* All Appointments Table */}
      <Card className="mt-6">
        <h2 className="text-xl font-semibold mb-4">All Appointments</h2>
        <div className="overflow-x-auto">
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell>Patient</Table.HeadCell>
              <Table.HeadCell>Date & Time</Table.HeadCell>
              <Table.HeadCell>Status</Table.HeadCell>
              <Table.HeadCell>Actions</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {appointments.map((appointment) => (
                <Table.Row key={appointment.id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                  <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                    {appointment.Patient.User.Profile.first_name} {appointment.Patient.User.Profile.last_name}
                  </Table.Cell>
                  <Table.Cell>
                    {new Date(appointment.appointment_datetime).toLocaleString()}
                  </Table.Cell>
                  <Table.Cell>{getStatusBadge(appointment.AppointmentStatus.status)}</Table.Cell>
                  <Table.Cell>
                    <Button
                      size="sm"
                      color="light"
                      onClick={() => {
                        setSelectedAppointment(appointment);
                        setShowPrescriptionModal(true);
                      }}
                    >
                      <FileText className="w-4 h-4 mr-1" />
                      Prescription
                    </Button>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      </Card>

      {/* Add Availability Modal */}
      <Modal show={showAvailabilityModal} onClose={() => setShowAvailabilityModal(false)}>
        <Modal.Header>Add Availability</Modal.Header>
        <Modal.Body>
          <form onSubmit={addAvailability} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                value={newAvailability.available_date}
                onChange={(e) => setNewAvailability(prev => ({ ...prev, available_date: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
              <input
                type="time"
                value={newAvailability.available_start_time}
                onChange={(e) => setNewAvailability(prev => ({ ...prev, available_start_time: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
              <input
                type="time"
                value={newAvailability.available_end_time}
                onChange={(e) => setNewAvailability(prev => ({ ...prev, available_end_time: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex space-x-2">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Adding...' : 'Add Availability'}
              </Button>
              <Button color="gray" onClick={() => setShowAvailabilityModal(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      {/* Create Prescription Modal */}
      <Modal show={showPrescriptionModal} onClose={() => setShowPrescriptionModal(false)} size="4xl">
        <Modal.Header>Create Prescription</Modal.Header>
        <Modal.Body>
          {selectedAppointment && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold">Patient: {selectedAppointment.Patient.User.Profile.first_name} {selectedAppointment.Patient.User.Profile.last_name}</h3>
              <p className="text-sm text-gray-600">Appointment: {new Date(selectedAppointment.appointment_datetime).toLocaleString()}</p>
            </div>
          )}
          
          <form onSubmit={createPrescription} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Medication Name</label>
                <input
                  type="text"
                  value={prescription.medication_name}
                  onChange={(e) => setPrescription(prev => ({ ...prev, medication_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dosage</label>
                <input
                  type="text"
                  value={prescription.dosage}
                  onChange={(e) => setPrescription(prev => ({ ...prev, dosage: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                <input
                  type="text"
                  value={prescription.frequency}
                  onChange={(e) => setPrescription(prev => ({ ...prev, frequency: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                <input
                  type="text"
                  value={prescription.duration}
                  onChange={(e) => setPrescription(prev => ({ ...prev, duration: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                value={prescription.notes}
                onChange={(e) => setPrescription(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex space-x-2">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? 'Creating...' : 'Create Prescription'}
              </Button>
              <Button color="gray" onClick={() => setShowPrescriptionModal(false)} className="flex-1">
                Cancel
              </Button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default DoctorDashboard;
