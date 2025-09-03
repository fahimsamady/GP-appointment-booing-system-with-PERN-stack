const { Conversation, Message, ConversationParticipant, User, Profile, Patient, Doctor } = require('../models');
const { Op } = require('sequelize');
const ChatNotificationController = require('./ChatNotificationController');

// Get all conversations for a user
exports.getUserConversations = async (req, res) => {
  try {
    const { userId } = req.user;
    
    const conversations = await Conversation.findAll({
      include: [
        {
          model: ConversationParticipant,
          where: { user_id: userId },
          include: [
            {
              model: User,
              include: [Profile]
            }
          ]
        },
        {
          model: Message,
          order: [['createdAt', 'DESC']],
          limit: 1,
          include: [
            {
              model: User,
              include: [Profile]
            }
          ]
        }
      ],
      order: [['updatedAt', 'DESC']]
    });

    // Format conversations to include other participants
    const formattedConversations = conversations.map(conversation => {
      const otherParticipants = conversation.ConversationParticipants.filter(
        participant => participant.user_id !== userId
      );
      
      return {
        id: conversation.id,
        title: conversation.title,
        lastMessage: conversation.Messages[0] || null,
        otherParticipants: otherParticipants.map(participant => ({
          id: participant.User.id,
          name: `${participant.User.Profile.first_name} ${participant.User.Profile.last_name}`,
          email: participant.User.email,
          userType: participant.User.user_type_id
        })),
        updatedAt: conversation.updatedAt,
        unreadCount: 0 // Will be calculated separately
      };
    });

    res.json(formattedConversations);
  } catch (error) {
    console.error('Error fetching user conversations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get messages for a specific conversation
exports.getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.user;
    const { page = 1, limit = 50 } = req.query;

    // Check if user is participant in this conversation
    const participant = await ConversationParticipant.findOne({
      where: { 
        conversation_id: conversationId,
        user_id: userId 
      }
    });

    if (!participant) {
      return res.status(403).json({ error: 'Access denied to this conversation' });
    }

    const offset = (page - 1) * limit;

    const messages = await Message.findAll({
      where: { conversation_id: conversationId },
      include: [
        {
          model: User,
          include: [Profile]
        }
      ],
      order: [['createdAt', 'ASC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Mark messages as read for the current user
    await Message.update(
      { is_read: true },
      { 
        where: { 
          conversation_id: conversationId,
          sender_id: { [Op.ne]: userId },
          is_read: false
        }
      }
    );

    res.json(messages);
  } catch (error) {
    console.error('Error fetching conversation messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.user;
    const { content, messageType = 'text' } = req.body;

    // Check if user is participant in this conversation
    const participant = await ConversationParticipant.findOne({
      where: { 
        conversation_id: conversationId,
        user_id: userId 
      }
    });

    if (!participant) {
      return res.status(403).json({ error: 'Access denied to this conversation' });
    }

    const message = await Message.create({
      conversation_id: conversationId,
      sender_id: userId,
      content,
      message_type: messageType
    });

    // Update conversation's updatedAt timestamp
    await Conversation.update(
      { updatedAt: new Date() },
      { where: { id: conversationId } }
    );

    // Fetch the created message with user details
    const messageWithUser = await Message.findByPk(message.id, {
      include: [
        {
          model: User,
          include: [Profile]
        }
      ]
    });

    // Create notifications for other participants
    try {
      await ChatNotificationController.createMessageNotification(message.id);
    } catch (notificationError) {
      console.error('Error creating message notification:', notificationError);
      // Don't fail the message send if notification fails
    }

    res.status(201).json(messageWithUser);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create a new conversation
exports.createConversation = async (req, res) => {
  try {
    const { userId } = req.user;
    const { participantId, title, initialMessage } = req.body;

    // Check if conversation already exists between these users
    const existingConversation = await Conversation.findOne({
      include: [
        {
          model: ConversationParticipant,
          where: {
            user_id: { [Op.in]: [userId, participantId] }
          }
        }
      ]
    });

    if (existingConversation) {
      return res.status(400).json({ 
        error: 'Conversation already exists',
        conversationId: existingConversation.id
      });
    }

    // Create conversation
    const conversation = await Conversation.create({
      title: title || 'New Conversation'
    });

    // Add participants
    await ConversationParticipant.bulkCreate([
      { conversation_id: conversation.id, user_id: userId },
      { conversation_id: conversation.id, user_id: participantId }
    ]);

    // Send initial message if provided
    if (initialMessage) {
      await Message.create({
        conversation_id: conversation.id,
        sender_id: userId,
        content: initialMessage,
        message_type: 'text'
      });
    }

    res.status(201).json({ 
      message: 'Conversation created successfully',
      conversationId: conversation.id
    });
  } catch (error) {
    console.error('Error creating conversation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get available doctors for chat (for patients)
exports.getAvailableDoctors = async (req, res) => {
  try {
    const { userId } = req.user;

    // Get all doctors
    const doctors = await Doctor.findAll({
      include: [
        {
          model: User,
          include: [Profile]
        }
      ]
    });

    // Get existing conversations with doctors
    const existingConversations = await Conversation.findAll({
      include: [
        {
          model: ConversationParticipant,
          where: { user_id: userId }
        },
        {
          model: ConversationParticipant,
          include: [
            {
              model: User,
              where: { user_type_id: 3 } // Doctor type
            }
          ]
        }
      ]
    });

    const doctorIdsWithConversations = existingConversations.map(conv => 
      conv.ConversationParticipants
        .filter(p => p.User.user_type_id === 3)
        .map(p => p.user_id)
    ).flat();

    const availableDoctors = doctors
      .filter(doctor => !doctorIdsWithConversations.includes(doctor.user_id))
      .map(doctor => ({
        id: doctor.user_id,
        name: `Dr. ${doctor.User.Profile.first_name} ${doctor.User.Profile.last_name}`,
        specialization: doctor.specialization,
        email: doctor.User.email
      }));

    res.json(availableDoctors);
  } catch (error) {
    console.error('Error fetching available doctors:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get available patients for chat (for doctors)
exports.getAvailablePatients = async (req, res) => {
  try {
    const { userId } = req.user;

    // Get all patients
    const patients = await Patient.findAll({
      include: [
        {
          model: User,
          include: [Profile]
        }
      ]
    });

    // Get existing conversations with patients
    const existingConversations = await Conversation.findAll({
      include: [
        {
          model: ConversationParticipant,
          where: { user_id: userId }
        },
        {
          model: ConversationParticipant,
          include: [
            {
              model: User,
              where: { user_type_id: 2 } // Patient type
            }
          ]
        }
      ]
    });

    const patientIdsWithConversations = existingConversations.map(conv => 
      conv.ConversationParticipants
        .filter(p => p.User.user_type_id === 2)
        .map(p => p.user_id)
    ).flat();

    const availablePatients = patients
      .filter(patient => !patientIdsWithConversations.includes(patient.user_id))
      .map(patient => ({
        id: patient.user_id,
        name: `${patient.User.Profile.first_name} ${patient.User.Profile.last_name}`,
        email: patient.User.email
      }));

    res.json(availablePatients);
  } catch (error) {
    console.error('Error fetching available patients:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get unread message count for a user
exports.getUnreadCount = async (req, res) => {
  try {
    const { userId } = req.user;

    const unreadCount = await Message.count({
      include: [
        {
          model: ConversationParticipant,
          where: { user_id: userId }
        }
      ],
      where: {
        sender_id: { [Op.ne]: userId },
        is_read: false
      }
    });

    res.json({ unreadCount });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a conversation
exports.deleteConversation = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { userId } = req.user;

    // Check if user is participant
    const participant = await ConversationParticipant.findOne({
      where: { 
        conversation_id: conversationId,
        user_id: userId 
      }
    });

    if (!participant) {
      return res.status(403).json({ error: 'Access denied to this conversation' });
    }

    // Delete conversation (cascade will handle messages and participants)
    await Conversation.destroy({
      where: { id: conversationId }
    });

    res.json({ message: 'Conversation deleted successfully' });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
