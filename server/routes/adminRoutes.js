const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authenticateToken');
const AdminController = require('../controllers/AdminController');

// Get all appointment requests for admin
router.get('/admin/appointment-requests', 
  authenticateToken, 
  AdminController.getAllAppointmentRequests
);

// Update appointment request status (approve/reject)
router.put('/admin/appointment-requests/:id', 
  authenticateToken, 
  AdminController.updateAppointmentRequest
);

// Get dashboard statistics
router.get('/admin/dashboard-stats', 
  authenticateToken, 
  AdminController.getDashboardStats
);

// Get all users
router.get('/admin/users', 
  authenticateToken, 
  AdminController.getAllUsers
);

module.exports = router;