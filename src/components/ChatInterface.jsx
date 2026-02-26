import { useState, useEffect, useRef } from 'react';
import Message from './Message';
import ModelSelector from './ModelSelector';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function ChatInterface({ conversation, onConversationUpdate }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState('chatgpt');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (conversation) {
      setMessages(conversation.messages || []);
      setModel(conversation.modelUsed || 'chatgpt');
    } else {
      setMessages([]);
      setModel('chatgpt');
    }
  }, [conversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const res = await api.post('/messages', {
        message: userMessage,
        conversationId: conversation?._id,
        model,
      });

      const assistantMessage = res.data.message;
      setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);

      if (!conversation) {
        const convRes = await api.get(`/conversations/${res.data.conversationId}`);
        onConversationUpdate(convRes.data);
      } else {
        const convRes = await api.get(`/conversations/${conversation._id}`);
        onConversationUpdate(convRes.data);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Failed to send message';
      toast.error(errorMsg);
      setMessages(prev => prev.slice(0, -1)); // remove optimistic user message
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    if (messages.length === 0 || messages[messages.length-1].role !== 'assistant') return;
    const lastUserMessage = [...messages].reverse().find(m => m.role === 'user');
    if (!lastUserMessage) return;

    setMessages(prev => prev.slice(0, -1)); // remove assistant
    setLoading(true);
    try {
      const res = await api.post('/messages', {
        message: lastUserMessage.content,
        conversationId: conversation._id,
        model,
      });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.message }]);
    } catch (error) {
      toast.error('Regeneration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="border-b border-gray-200 dark:border-gray-700 p-4 flex justify-between items-center">
        <h2 className="text-lg font-semibold">{conversation?.title || 'New Chat'}</h2>
        <ModelSelector selected={model} onChange={setModel} />
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <Message key={idx} role={msg.role} content={msg.content} />
        ))}
        {loading && <div className="text-gray-500">AI is thinking...</div>}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex space-x-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
            placeholder="Type your message..."
            className="flex-1 p-2 border rounded-lg resize-none dark:bg-gray-800 dark:text-white"
            rows="2"
          />
          <button
            onClick={handleSend}
            disabled={loading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            Send
          </button>
        </div>
        {messages.length > 0 && messages[messages.length-1]?.role === 'assistant' && (
          <button onClick={handleRegenerate} className="mt-2 text-sm text-indigo-600 hover:underline">
            Regenerate response
          </button>
        )}
      </div>
    </div>
  );
}
