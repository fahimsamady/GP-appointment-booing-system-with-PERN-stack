import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Badge, Modal, Select, Alert } from 'flowbite-react';
import { Users, Calendar, FileText, CheckCircle, XCircle, Clock } from 'lucide-react';
import axiosWithAuth from '../middelware/axiosWithAuth';

function AdminDashboard() {
  const [appointmentRequests, setAppointmentRequests] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    rejectedRequests: 0
  });

  useEffect(() => {
    fetchAppointmentRequests();
    fetchDoctors();
  }, []);

  const fetchAppointmentRequests = async () => {
    try {
      const response = await axiosWithAuth().get('/api/admin/appointment-requests');
      setAppointmentRequests(response.data);
      
      // Calculate stats
      const total = response.data.length;
      const pending = response.data.filter(req => req.status === 'Received').length;
      const approved = response.data.filter(req => req.status === 'Approved').length;
      const rejected = response.data.filter(req => req.status === 'Rejected').length;
      
      setStats({ totalRequests: total, pendingRequests: pending, approvedRequests: approved, rejectedRequests: rejected });
    } catch (error) {
      console.error('Error fetching appointment requests:', error);
      setMessage({ type: 'error', text: 'Failed to load appointment requests' });
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await axiosWithAuth().get('/api/doctor/doctors');
      setDoctors(response.data);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const handleRequestAction = async (requestId, action, doctorId = null, appointmentDateTime = null) => {
    setLoading(true);
    try {
      const data = { action };
      if (action === 'approve' && doctorId && appointmentDateTime) {
        data.doctor_id = doctorId;
        data.appointment_datetime = appointmentDateTime;
      }

      await axiosWithAuth().put(`/api/admin/appointment-requests/${requestId}`, data);
      setMessage({ type: 'success', text: `Request ${action}d successfully` });
      fetchAppointmentRequests();
      setShowModal(false);
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
      setMessage({ type: 'error', text: `Failed to ${action} request` });
    } finally {
      setLoading(false);
    }
  };

  const openModal = (request) => {
    setSelectedRequest(request);
    setShowModal(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Received': { color: 'yellow', icon: Clock },
      'Approved': { color: 'green', icon: CheckCircle },
      'Rejected': { color: 'red', icon: XCircle }
    };
    
    const config = statusConfig[status] || statusConfig['Received'];
    const Icon = config.icon;
    
    return (
      <Badge color={config.color} icon={Icon}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">Manage appointment requests and system overview</p>
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
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalRequests}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingRequests}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-900">{stats.approvedRequests}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-900">{stats.rejectedRequests}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Appointment Requests Table */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Appointment Requests</h2>
        </div>
        
        <div className="overflow-x-auto">
          <Table hoverable>
            <Table.Head>
              <Table.HeadCell>ID</Table.HeadCell>
              <Table.HeadCell>Patient Name</Table.HeadCell>
              <Table.HeadCell>Email</Table.HeadCell>
              <Table.HeadCell>Phone</Table.HeadCell>
              <Table.HeadCell>Preferred Date</Table.HeadCell>
              <Table.HeadCell>Preferred Time</Table.HeadCell>
              <Table.HeadCell>Severity</Table.HeadCell>
              <Table.HeadCell>Status</Table.HeadCell>
              <Table.HeadCell>Actions</Table.HeadCell>
            </Table.Head>
            <Table.Body className="divide-y">
              {appointmentRequests.map((request) => (
                <Table.Row key={request.id} className="bg-white dark:border-gray-700 dark:bg-gray-800">
                  <Table.Cell className="whitespace-nowrap font-medium text-gray-900 dark:text-white">
                    {request.id}
                  </Table.Cell>
                  <Table.Cell>{`${request.name} ${request.last_name}`}</Table.Cell>
                  <Table.Cell>{request.email}</Table.Cell>
                  <Table.Cell>{request.phone_number}</Table.Cell>
                  <Table.Cell>
                    {request.prefer_date ? new Date(request.prefer_date).toLocaleDateString() : 'N/A'}
                  </Table.Cell>
                  <Table.Cell>{request.prefer_time}</Table.Cell>
                  <Table.Cell>
                    <Badge color={request.severity === 'high' ? 'red' : request.severity === 'medium' ? 'yellow' : 'green'}>
                      {request.severity}
                    </Badge>
                  </Table.Cell>
                  <Table.Cell>{getStatusBadge(request.status)}</Table.Cell>
                  <Table.Cell>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        color="light"
                        onClick={() => openModal(request)}
                      >
                        View Details
                      </Button>
                      {request.status === 'Received' && (
                        <>
                          <Button
                            size="sm"
                            color="success"
                            onClick={() => openModal(request)}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            color="failure"
                            onClick={() => handleRequestAction(request.id, 'reject')}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </div>
      </Card>

      {/* Modal for Request Details and Approval */}
      {selectedRequest && (
        <Modal show={showModal} onClose={() => setShowModal(false)} size="4xl">
          <Modal.Header>Appointment Request Details</Modal.Header>
          <Modal.Body>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Patient Name</label>
                  <p className="text-gray-900">{`${selectedRequest.name} ${selectedRequest.last_name}`}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                  <p className="text-gray-900">
                    {selectedRequest.date_of_birth ? new Date(selectedRequest.date_of_birth).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="text-gray-900">{selectedRequest.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <p className="text-gray-900">{selectedRequest.phone_number}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Preferred Date</label>
                  <p className="text-gray-900">
                    {selectedRequest.prefer_date ? new Date(selectedRequest.prefer_date).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Preferred Time</label>
                  <p className="text-gray-900">{selectedRequest.prefer_time}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Severity</label>
                  <Badge color={selectedRequest.severity === 'high' ? 'red' : selectedRequest.severity === 'medium' ? 'yellow' : 'green'}>
                    {selectedRequest.severity}
                  </Badge>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  {getStatusBadge(selectedRequest.status)}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-md">{selectedRequest.description}</p>
              </div>

              {selectedRequest.status === 'Received' && (
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-4">Approve Appointment</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Select Doctor</label>
                      <Select id="doctor-select">
                        <option value="">Choose a doctor</option>
                        {doctors.map((doctor) => (
                          <option key={doctor.id} value={doctor.id}>
                            Dr. {doctor.User?.Profile?.first_name} {doctor.User?.Profile?.last_name} - {doctor.specialization}
                          </option>
                        ))}
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Appointment Date & Time</label>
                      <input
                        type="datetime-local"
                        id="appointment-datetime"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Modal.Body>
          <Modal.Footer>
            <div className="flex space-x-2">
              {selectedRequest.status === 'Received' && (
                <Button
                  color="success"
                  onClick={() => {
                    const doctorId = document.getElementById('doctor-select').value;
                    const appointmentDateTime = document.getElementById('appointment-datetime').value;
                    if (doctorId && appointmentDateTime) {
                      handleRequestAction(selectedRequest.id, 'approve', doctorId, appointmentDateTime);
                    } else {
                      setMessage({ type: 'error', text: 'Please select doctor and appointment time' });
                    }
                  }}
                  disabled={loading}
                >
                  {loading ? 'Approving...' : 'Approve & Schedule'}
                </Button>
              )}
              <Button color="gray" onClick={() => setShowModal(false)}>
                Close
              </Button>
            </div>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
}

export default AdminDashboard;
