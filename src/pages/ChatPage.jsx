import React, { useState, useEffect } from 'react'
import Sidebar from '../components/Sidebar';
import ChatInterface from '../components/ChatInterface';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export default function ChatPage() {
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const res = await api.get('/conversations');
      setConversations(res.data);
    } catch (error) {
      console.error('Failed to fetch conversations', error);
    }
  };

  const handleNewChat = () => {
    setCurrentConversation(null);
  };

  const handleSelectConversation = (conv) => {
    setCurrentConversation(conv);
  };

  const handleConversationUpdate = (updated) => {
    setConversations(prev => prev.map(c => c._id === updated._id ? updated : c));
    setCurrentConversation(updated);
  };

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900">
      <Sidebar
        conversations={conversations}
        onSelect={handleSelectConversation}
        onNewChat={handleNewChat}
        currentId={currentConversation?._id}
      />
      <ChatInterface
        conversation={currentConversation}
        onConversationUpdate={handleConversationUpdate}
      />
    </div>
  );
}