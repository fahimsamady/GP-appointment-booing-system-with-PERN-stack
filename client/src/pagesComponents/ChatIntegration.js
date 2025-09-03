import React, { useState, useEffect } from 'react';
import { Button, Badge, Card } from 'flowbite-react';
import { MessageCircle, Users, Clock } from 'lucide-react';
import axiosWithAuth from '../middelware/axiosWithAuth';

function ChatIntegration({ appointmentId, doctorId, patientId, userType }) {
  const [conversation, setConversation] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (appointmentId) {
      checkExistingConversation();
    }
  }, [appointmentId]);

  const checkExistingConversation = async () => {
    try {
      const response = await axiosWithAuth().get('/api/chat/conversations');
      const existingConversation = response.data.find(conv => 
        conv.otherParticipants.some(participant => 
          participant.id === (userType === 2 ? doctorId : patientId)
        )
      );
      
      if (existingConversation) {
        setConversation(existingConversation);
        setUnreadCount(existingConversation.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error checking existing conversation:', error);
    }
  };

  const startConversation = async () => {
    setLoading(true);
    try {
      const participantId = userType === 2 ? doctorId : patientId;
      const initialMessage = `Hello! I'd like to discuss my appointment.`;
      
      const response = await axiosWithAuth().post('/api/chat/conversations', {
        participantId,
        initialMessage
      });

      if (response.data.conversationId) {
        setConversation({ id: response.data.conversationId });
        setMessage({ type: 'success', text: 'Conversation started successfully!' });
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
      if (error.response?.data?.conversationId) {
        setConversation({ id: error.response.data.conversationId });
        setMessage({ type: 'info', text: 'Conversation already exists' });
      } else {
        setMessage({ type: 'error', text: 'Failed to start conversation' });
      }
    } finally {
      setLoading(false);
    }
  };

  const openChat = () => {
    // This would typically open the chat modal or navigate to chat page
    // For now, we'll just show an alert
    alert('Opening chat...');
  };

  return (
    <Card className="mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <MessageCircle className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Chat with {userType === 2 ? 'Doctor' : 'Patient'}</h3>
            <p className="text-sm text-gray-600">
              {conversation ? 'Continue your conversation' : 'Start a conversation about your appointment'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <Badge color="red" size="sm">
              {unreadCount}
            </Badge>
          )}
          
          {conversation ? (
            <Button
              onClick={openChat}
              size="sm"
              className="flex items-center"
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              Open Chat
            </Button>
          ) : (
            <Button
              onClick={startConversation}
              disabled={loading}
              size="sm"
              className="flex items-center"
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              {loading ? 'Starting...' : 'Start Chat'}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

export default ChatIntegration;
