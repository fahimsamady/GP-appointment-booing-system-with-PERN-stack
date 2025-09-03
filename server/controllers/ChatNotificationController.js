const { Notification, Message, Conversation, ConversationParticipant } = require('../models');
const { Op } = require('sequelize');

// Create notification for new message
exports.createMessageNotification = async (messageId) => {
  try {
    const message = await Message.findByPk(messageId, {
      include: [
        {
          model: Conversation,
          include: [
            {
              model: ConversationParticipant,
              where: {
                user_id: { [Op.ne]: message.sender_id }
              }
            }
          ]
        }
      ]
    });

    if (!message) {
      throw new Error('Message not found');
    }

    // Create notifications for all other participants
    const notifications = await Promise.all(
      message.Conversation.ConversationParticipants.map(async (participant) => {
        return await Notification.create({
          user_id: participant.user_id,
          title: 'New Message',
          message: `You have a new message from ${message.User?.Profile?.first_name || 'Someone'}`,
          type: 'appointment' // Using appointment type for chat messages
        });
      })
    );

    return notifications;
  } catch (error) {
    console.error('Error creating message notification:', error);
    throw error;
  }
};

// Mark chat notifications as read when user opens conversation
exports.markChatNotificationsAsRead = async (userId, conversationId) => {
  try {
    await Notification.update(
      { is_read: true },
      {
        where: {
          user_id: userId,
          type: 'appointment', // Chat messages use appointment type
          message: {
            [Op.like]: '%new message%'
          }
        }
      }
    );

    return { success: true };
  } catch (error) {
    console.error('Error marking chat notifications as read:', error);
    throw error;
  }
};
