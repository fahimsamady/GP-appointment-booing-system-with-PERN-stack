const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authenticateToken');
const UserProfileController = require('../controllers/UserProfileController');

// Get user profile
router.get('/user/profile', 
  authenticateToken, 
  UserProfileController.getUserProfile
);

// Update user profile
router.put('/user/profile', 
  authenticateToken, 
  UserProfileController.updateUserProfile
);

// Change password
router.put('/user/password', 
  authenticateToken, 
  UserProfileController.changePassword
);

// Update notification preferences
router.put('/user/notifications', 
  authenticateToken, 
  UserProfileController.updateNotificationPreferences
);

// Get user type specific data
router.get('/user/type-data', 
  authenticateToken, 
  UserProfileController.getUserTypeData
);

module.exports = router;
