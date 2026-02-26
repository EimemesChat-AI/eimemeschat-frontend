import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Link, useNavigate } from 'react-router-dom';
import { FaSun, FaMoon, FaEdit, FaTrash } from 'react-icons/fa';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function Sidebar({ conversations, onSelect, onNewChat, currentId }) {
  const { logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const [editingId, setEditingId] = useState(null);
  const [newTitle, setNewTitle] = useState('');

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch {
      toast.error('Logout failed');
    }
  };

  const handleRename = async (id) => {
    if (!newTitle.trim()) return;
    try {
      const res = await api.put(`/conversations/${id}`, { title: newTitle });
      onSelect(res.data);
      setEditingId(null);
    } catch {
      toast.error('Rename failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this conversation?')) return;
    try {
      await api.delete(`/conversations/${id}`);
      if (currentId === id) onNewChat();
      const res = await api.get('/conversations');
      // Refresh list - we can update parent state by refetching or passing a callback
      window.location.reload(); // quick fix
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="w-64 bg-gray-100 dark:bg-gray-800 flex flex-col h-full">
      <button
        onClick={onNewChat}
        className="m-2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
      >
        + New Chat
      </button>
      <div className="flex-1 overflow-y-auto">
        {conversations.map(conv => (
          <div
            key={conv._id}
            className={`p-2 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 flex justify-between items-center ${currentId === conv._id ? 'bg-gray-300 dark:bg-gray-600' : ''}`}
            onClick={() => onSelect(conv)}
          >
            {editingId === conv._id ? (
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onBlur={() => handleRename(conv._id)}
                onKeyDown={(e) => e.key === 'Enter' && handleRename(conv._id)}
                autoFocus
                className="flex-1 p-1 text-black"
              />
            ) : (
              <>
                <span className="truncate">{conv.title}</span>
                <div className="flex space-x-1">
                  <button onClick={(e) => { e.stopPropagation(); setEditingId(conv._id); setNewTitle(conv.title); }} className="text-xs text-blue-500">
                    <FaEdit size={14} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(conv._id); }} className="text-xs text-red-500">
                    <FaTrash size={14} />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
      <div className="p-2 border-t border-gray-300 dark:border-gray-700">
        <button onClick={toggleDarkMode} className="w-full p-2 text-left flex items-center gap-2">
          {darkMode ? <FaSun /> : <FaMoon />}
          {darkMode ? 'Light' : 'Dark'}
        </button>
        <Link to="/settings" className="block p-2 hover:bg-gray-200 dark:hover:bg-gray-700">Settings</Link>
        <button onClick={handleLogout} className="w-full p-2 text-left text-red-500">Logout</button>
      </div>
    </div>
  );
}
