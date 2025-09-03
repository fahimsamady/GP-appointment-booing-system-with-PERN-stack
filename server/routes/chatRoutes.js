const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authenticateToken');
const ChatController = require('../controllers/ChatController');

// Get all conversations for a user
router.get('/chat/conversations', 
  authenticateToken, 
  ChatController.getUserConversations
);

// Get messages for a specific conversation
router.get('/chat/conversations/:conversationId/messages', 
  authenticateToken, 
  ChatController.getConversationMessages
);

// Send a message
router.post('/chat/conversations/:conversationId/messages', 
  authenticateToken, 
  ChatController.sendMessage
);

// Create a new conversation
router.post('/chat/conversations', 
  authenticateToken, 
  ChatController.createConversation
);

// Get available doctors for chat (for patients)
router.get('/chat/available-doctors', 
  authenticateToken, 
  ChatController.getAvailableDoctors
);

// Get available patients for chat (for doctors)
router.get('/chat/available-patients', 
  authenticateToken, 
  ChatController.getAvailablePatients
);

// Get unread message count
router.get('/chat/unread-count', 
  authenticateToken, 
  ChatController.getUnreadCount
);

// Delete a conversation
router.delete('/chat/conversations/:conversationId', 
  authenticateToken, 
  ChatController.deleteConversation
);

module.exports = router;
