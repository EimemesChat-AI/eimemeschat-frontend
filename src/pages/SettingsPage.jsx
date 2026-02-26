import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { FaSun, FaMoon } from 'react-icons/fa';

export default function SettingsPage() {
  const { currentUser, logout } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      api.get('/users/profile').then(res => {
        setUsername(res.data.user.username);
      });
    }
  }, [currentUser]);

  const handleUpdateUsername = async () => {
    try {
      await api.put('/users/profile', { username });
      toast.success('Username updated');
    } catch {
      toast.error('Update failed');
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure? This action cannot be undone.')) return;
    try {
      await api.delete('/users/account');
      await logout();
      navigate('/login');
    } catch {
      toast.error('Delete failed');
    }
  };

  const handleClearHistory = async () => {
    if (!confirm('Delete all conversations?')) return;
    try {
      // Assuming an endpoint to delete all user conversations
      await api.delete('/conversations'); // need to implement bulk delete
      toast.success('History cleared');
    } catch {
      toast.error('Failed');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="mt-1 p-2 border rounded w-full dark:bg-gray-800"
          />
          <button onClick={handleUpdateUsername} className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded">
            Update
          </button>
        </div>
        <div>
          <label className="block text-sm font-medium">Theme</label>
          <button onClick={toggleDarkMode} className="mt-1 px-4 py-2 border rounded flex items-center gap-2">
            {darkMode ? <FaSun /> : <FaMoon />}
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
        </div>
        <div>
          <button onClick={handleClearHistory} className="px-4 py-2 bg-yellow-600 text-white rounded">
            Clear Chat History
          </button>
        </div>
        <div>
          <button onClick={handleDeleteAccount} className="px-4 py-2 bg-red-600 text-white rounded">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}
