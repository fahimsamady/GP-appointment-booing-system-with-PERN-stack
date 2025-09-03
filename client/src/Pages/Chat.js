import React, { useState, useEffect, useRef } from 'react';
import { Card, Button, Modal, Select, Alert, Badge } from 'flowbite-react';
import { MessageCircle, Send, Plus, Users, Phone, Video } from 'lucide-react';
import axiosWithAuth from '../middelware/axiosWithAuth';

function Chat() {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [availablePatients, setAvailablePatients] = useState([]);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [initialMessage, setInitialMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef(null);
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    fetchUserType();
    fetchConversations();
    fetchUnreadCount();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchUserType = async () => {
    try {
      const response = await axiosWithAuth().get('/api/user/type-data');
      setUserType(response.data.user_type_id);
    } catch (error) {
      console.error('Error fetching user type:', error);
    }
  };

  const fetchConversations = async () => {
    try {
      const response = await axiosWithAuth().get('/api/chat/conversations');
      setConversations(response.data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setMessage({ type: 'error', text: 'Failed to load conversations' });
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await axiosWithAuth().get(`/api/chat/conversations/${conversationId}/messages`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessage({ type: 'error', text: 'Failed to load messages' });
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await axiosWithAuth().get('/api/chat/unread-count');
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      if (userType === 2) { // Patient
        const response = await axiosWithAuth().get('/api/chat/available-doctors');
        setAvailableDoctors(response.data);
      } else if (userType === 3) { // Doctor
        const response = await axiosWithAuth().get('/api/chat/available-patients');
        setAvailablePatients(response.data);
      }
    } catch (error) {
      console.error('Error fetching available users:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const response = await axiosWithAuth().post(
        `/api/chat/conversations/${selectedConversation.id}/messages`,
        { content: newMessage }
      );
      
      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
      fetchConversations(); // Refresh conversations to update last message
    } catch (error) {
      console.error('Error sending message:', error);
      setMessage({ type: 'error', text: 'Failed to send message' });
    }
  };

  const createConversation = async () => {
    if (!selectedUser || !initialMessage.trim()) {
      setMessage({ type: 'error', text: 'Please select a user and enter a message' });
      return;
    }

    setLoading(true);
    try {
      const response = await axiosWithAuth().post('/api/chat/conversations', {
        participantId: selectedUser,
        initialMessage: initialMessage
      });

      setMessage({ type: 'success', text: 'Conversation started successfully' });
      setShowNewChatModal(false);
      setSelectedUser('');
      setInitialMessage('');
      fetchConversations();
    } catch (error) {
      console.error('Error creating conversation:', error);
      if (error.response?.data?.conversationId) {
        setMessage({ type: 'info', text: 'Conversation already exists' });
        setSelectedConversation({ id: error.response.data.conversationId });
      } else {
        setMessage({ type: 'error', text: 'Failed to start conversation' });
      }
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const openNewChatModal = () => {
    fetchAvailableUsers();
    setShowNewChatModal(true);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Messages</h1>
            <p className="text-gray-600">Communicate with your {userType === 2 ? 'doctors' : 'patients'}</p>
          </div>
          <div className="flex items-center space-x-4">
            {unreadCount > 0 && (
              <Badge color="red" size="lg">
                {unreadCount} unread
              </Badge>
            )}
            <Button onClick={openNewChatModal} className="flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              New Chat
            </Button>
          </div>
        </div>
      </div>

      {message.text && (
        <Alert color={message.type === 'success' ? 'success' : message.type === 'error' ? 'failure' : 'info'} className="mb-4">
          {message.text}
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Conversations List */}
        <div className="lg:col-span-1">
          <Card className="h-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Conversations</h2>
              <MessageCircle className="w-5 h-5 text-gray-500" />
            </div>
            
            <div className="space-y-2 overflow-y-auto flex-1">
              {conversations.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No conversations yet</p>
                  <p className="text-sm text-gray-500 mt-2">Start a new chat to begin</p>
                </div>
              ) : (
                conversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    onClick={() => setSelectedConversation(conversation)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedConversation?.id === conversation.id
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 truncate">
                          {conversation.otherParticipants[0]?.name || 'Unknown User'}
                        </h3>
                        <p className="text-sm text-gray-600 truncate">
                          {conversation.lastMessage?.content || 'No messages yet'}
                        </p>
                      </div>
                      <div className="text-xs text-gray-500 ml-2">
                        {conversation.lastMessage && formatTime(conversation.lastMessage.created_at)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Chat Area */}
        <div className="lg:col-span-2">
          <Card className="h-full flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="flex items-center justify-between p-4 border-b">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {selectedConversation.otherParticipants[0]?.name || 'Unknown User'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {userType === 2 ? 'Doctor' : 'Patient'}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" color="light">
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button size="sm" color="light">
                      <Video className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No messages yet</p>
                      <p className="text-sm text-gray-500 mt-2">Start the conversation!</p>
                    </div>
                  ) : (
                    messages.map((msg, index) => {
                      const isOwnMessage = msg.sender_id === parseInt(localStorage.getItem('userId'));
                      const showDate = index === 0 || 
                        formatDate(msg.created_at) !== formatDate(messages[index - 1].created_at);

                      return (
                        <div key={msg.id}>
                          {showDate && (
                            <div className="text-center text-sm text-gray-500 my-4">
                              {formatDate(msg.created_at)}
                            </div>
                          )}
                          <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                isOwnMessage
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 text-gray-900'
                              }`}
                            >
                              <p className="text-sm">{msg.content}</p>
                              <p className={`text-xs mt-1 ${
                                isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                              }`}>
                                {formatTime(msg.created_at)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type your message..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a conversation</h3>
                  <p className="text-gray-600">Choose a conversation from the list to start messaging</p>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>

      {/* New Chat Modal */}
      <Modal show={showNewChatModal} onClose={() => setShowNewChatModal(false)}>
        <Modal.Header>Start New Conversation</Modal.Header>
        <Modal.Body>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select {userType === 2 ? 'Doctor' : 'Patient'}
              </label>
              <Select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
              >
                <option value="">Choose a {userType === 2 ? 'doctor' : 'patient'}</option>
                {(userType === 2 ? availableDoctors : availablePatients).map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name} {user.specialization && `- ${user.specialization}`}
                  </option>
                ))}
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Initial Message
              </label>
              <textarea
                value={initialMessage}
                onChange={(e) => setInitialMessage(e.target.value)}
                rows={3}
                placeholder="Type your initial message..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <div className="flex space-x-2">
            <Button
              onClick={createConversation}
              disabled={loading || !selectedUser || !initialMessage.trim()}
              className="flex-1"
            >
              {loading ? 'Starting...' : 'Start Conversation'}
            </Button>
            <Button
              color="gray"
              onClick={() => setShowNewChatModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Chat;
