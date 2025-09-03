import React, { useState, useEffect } from 'react';
import { Button, Badge, Modal } from 'flowbite-react';
import { MessageCircle, X, Send } from 'lucide-react';
import axiosWithAuth from '../middelware/axiosWithAuth';

function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    fetchUnreadCount();
    fetchConversations();
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await axiosWithAuth().get('/api/chat/unread-count');
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const fetchConversations = async () => {
    try {
      const response = await axiosWithAuth().get('/api/chat/conversations');
      setConversations(response.data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await axiosWithAuth().get(`/api/chat/conversations/${conversationId}/messages`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
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
      fetchConversations();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const openConversation = (conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation.id);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 shadow-lg"
          color="blue"
        >
          <MessageCircle className="w-6 h-6" />
          {unreadCount > 0 && (
            <Badge
              color="red"
              size="sm"
              className="absolute -top-2 -right-2 min-w-[20px] h-5 flex items-center justify-center"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Chat Modal */}
      <Modal show={isOpen} onClose={() => setIsOpen(false)} size="4xl">
        <Modal.Header>
          <div className="flex items-center justify-between w-full">
            <span>Messages</span>
            <Button
              color="gray"
              size="sm"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </Modal.Header>
        <Modal.Body>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-96">
            {/* Conversations List */}
            <div className="lg:col-span-1 border-r pr-4">
              <h3 className="font-semibold mb-3">Conversations</h3>
              <div className="space-y-2 overflow-y-auto max-h-80">
                {conversations.length === 0 ? (
                  <p className="text-gray-500 text-sm">No conversations yet</p>
                ) : (
                  conversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      onClick={() => openConversation(conversation)}
                      className={`p-2 rounded cursor-pointer transition-colors ${
                        selectedConversation?.id === conversation.id
                          ? 'bg-blue-50 border border-blue-200'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm truncate">
                            {conversation.otherParticipants[0]?.name || 'Unknown'}
                          </h4>
                          <p className="text-xs text-gray-600 truncate">
                            {conversation.lastMessage?.content || 'No messages'}
                          </p>
                        </div>
                        {conversation.lastMessage && (
                          <span className="text-xs text-gray-500 ml-2">
                            {formatTime(conversation.lastMessage.created_at)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Chat Area */}
            <div className="lg:col-span-2 flex flex-col">
              {selectedConversation ? (
                <>
                  {/* Chat Header */}
                  <div className="flex items-center space-x-3 pb-3 border-b mb-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <MessageCircle className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">
                        {selectedConversation.otherParticipants[0]?.name || 'Unknown User'}
                      </h4>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto space-y-2 mb-3 max-h-60">
                    {messages.length === 0 ? (
                      <p className="text-gray-500 text-sm text-center py-4">No messages yet</p>
                    ) : (
                      messages.map((msg) => {
                        const isOwnMessage = msg.sender_id === parseInt(localStorage.getItem('userId'));
                        return (
                          <div key={msg.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                            <div
                              className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                                isOwnMessage
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-100 text-gray-900'
                              }`}
                            >
                              <p>{msg.content}</p>
                              <p className={`text-xs mt-1 ${
                                isOwnMessage ? 'text-blue-100' : 'text-gray-500'
                              }`}>
                                {formatTime(msg.created_at)}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder="Type a message..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <Button onClick={sendMessage} disabled={!newMessage.trim()} size="sm">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 text-sm">Select a conversation to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default ChatWidget;
