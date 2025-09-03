const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authenticateToken');
const NotificationController = require('../controllers/NotificationController');

// Get all notifications for a user
router.get('/user/notifications', 
  authenticateToken, 
  NotificationController.getUserNotifications
);

// Mark notification as read
router.put('/user/notifications/:id/read', 
  authenticateToken, 
  NotificationController.markAsRead
);

// Mark all notifications as read
router.put('/user/notifications/mark-all-read', 
  authenticateToken, 
  NotificationController.markAllAsRead
);

// Delete notification
router.delete('/user/notifications/:id', 
  authenticateToken, 
  NotificationController.deleteNotification
);

module.exports = router;
