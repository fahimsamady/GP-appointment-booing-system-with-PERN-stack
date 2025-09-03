import React, { useState, useEffect } from 'react';
import { Table, Button, Card, Select, Alert } from 'flowbite-react';
import { Calendar, Clock, User } from 'lucide-react';
import axiosWithAuth from '../middelware/axiosWithAuth';

function AvailableAppointments() {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const response = await axiosWithAuth().get('/api/doctor/doctors');
      setDoctors(response.data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setError('Failed to load doctors');
    }
  };

  const fetchAvailableSlots = async () => {
    if (!selectedDoctor || !selectedDate) {
      setError('Please select both doctor and date');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await axiosWithAuth().get(
        `/api/doctor-availability/slots/${selectedDoctor}/${selectedDate}`
      );
      setAvailableSlots(response.data.available ? response.data.timeSlots : []);
      if (!response.data.available) {
        setError('No available slots for the selected date');
      }
    } catch (error) {
      console.error('Error fetching available slots:', error);
      setError('Failed to load available slots');
    } finally {
      setLoading(false);
    }
  };

  const bookAppointment = async (timeSlot) => {
    try {
      const appointmentData = {
        doctor_id: selectedDoctor,
        appointment_datetime: `${selectedDate}T${timeSlot}:00`,
        status_id: 1 // Assuming 1 is "Scheduled" status
      };

      await axiosWithAuth().post('/api/appointment/appointments', appointmentData);
      setSuccess('Appointment booked successfully!');
      fetchAvailableSlots(); // Refresh slots
    } catch (error) {
      console.error('Error booking appointment:', error);
      setError('Failed to book appointment');
    }
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3); // 3 months ahead
    return maxDate.toISOString().split('T')[0];
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Available Appointments</h1>
        <p className="text-gray-600">Book an appointment with your preferred doctor</p>
      </div>

      {error && (
        <Alert color="failure" className="mb-4">
          {error}
        </Alert>
      )}

      {success && (
        <Alert color="success" className="mb-4">
          {success}
        </Alert>
      )}

      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <User className="inline w-4 h-4 mr-1" />
              Select Doctor
            </label>
            <Select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
            >
              <option value="">Choose a doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  Dr. {doctor.User?.Profile?.first_name} {doctor.User?.Profile?.last_name} - {doctor.specialization}
                </option>
              ))}
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline w-4 h-4 mr-1" />
              Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={getMinDate()}
              max={getMaxDate()}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-end">
            <Button
              onClick={fetchAvailableSlots}
              disabled={!selectedDoctor || !selectedDate || loading}
              className="w-full"
            >
              {loading ? 'Loading...' : 'Check Availability'}
            </Button>
          </div>
        </div>
      </Card>

      {availableSlots.length > 0 && (
        <Card>
          <h2 className="text-xl font-semibold mb-4">Available Time Slots</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {availableSlots.map((slot, index) => (
              <Button
                key={index}
                color="light"
                onClick={() => bookAppointment(slot)}
                className="flex items-center justify-center p-3 border border-gray-300 hover:bg-blue-50 hover:border-blue-300"
              >
                <Clock className="w-4 h-4 mr-1" />
                {slot}
              </Button>
            ))}
          </div>
        </Card>
      )}

      {availableSlots.length === 0 && selectedDoctor && selectedDate && !loading && (
        <Card>
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No available slots for the selected date</p>
            <p className="text-sm text-gray-500 mt-2">Please try a different date or doctor</p>
          </div>
        </Card>
      )}
    </div>
  );
}

export default AvailableAppointments;
