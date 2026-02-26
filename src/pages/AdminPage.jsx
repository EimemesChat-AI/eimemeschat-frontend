
import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [limits, setLimits] = useState({ chatgpt: 50, llama: 40, gemini: 60 });

  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchSystemPrompt();
    fetchLimits();
  }, []);

  const fetchStats = async () => {
    const res = await api.get('/admin/stats');
    setStats(res.data);
  };

  const fetchUsers = async () => {
    const res = await api.get('/admin/users');
    setUsers(res.data);
  };

  const fetchSystemPrompt = async () => {
    const res = await api.get('/admin/system-prompt');
    setSystemPrompt(res.data.prompt);
  };

  const fetchLimits = async () => {
    try {
      const res = await api.get('/admin/limits'); // need to implement this route
      setLimits(res.data);
    } catch {
      // use defaults
    }
  };

  const handleUpdatePrompt = async () => {
    try {
      await api.put('/admin/system-prompt', { prompt: systemPrompt });
      toast.success('System prompt updated');
    } catch {
      toast.error('Update failed');
    }
  };

  const handleUpdateLimits = async () => {
    try {
      await api.put('/admin/limits', limits);
      toast.success('Limits updated');
    } catch {
      toast.error('Update failed');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Delete this user?')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      fetchUsers();
      toast.success('User deleted');
    } catch {
      toast.error('Delete failed');
    }
  };

  if (!stats) return <div>Loading...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">
          <h3 className="text-lg font-semibold">Total Users</h3>
          <p className="text-3xl">{stats.totalUsers}</p>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">
          <h3 className="text-lg font-semibold">Total Messages</h3>
          <p className="text-3xl">{stats.totalMessages}</p>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 rounded shadow">
          <h3 className="text-lg font-semibold">Model Usage</h3>
          {stats.usageByModel.map(u => (
            <div key={u._id}>{u._id}: {u.count}</div>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">System Prompt</h2>
        <textarea
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          rows="6"
          className="w-full p-2 border rounded dark:bg-gray-800"
        />
        <button onClick={handleUpdatePrompt} className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded">
          Update Prompt
        </button>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Daily Message Limits</h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label>ChatGPT</label>
            <input
              type="number"
              value={limits.chatgpt}
              onChange={(e) => setLimits({ ...limits, chatgpt: +e.target.value })}
              className="w-full p-2 border rounded dark:bg-gray-800"
            />
          </div>
          <div>
            <label>Llama</label>
            <input
              type="number"
              value={limits.llama}
              onChange={(e) => setLimits({ ...limits, llama: +e.target.value })}
              className="w-full p-2 border rounded dark:bg-gray-800"
            />
          </div>
          <div>
            <label>Gemini</label>
            <input
              type="number"
              value={limits.gemini}
              onChange={(e) => setLimits({ ...limits, gemini: +e.target.value })}
              className="w-full p-2 border rounded dark:bg-gray-800"
            />
          </div>
        </div>
        <button onClick={handleUpdateLimits} className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded">
          Update Limits
        </button>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Users</h2>
        <table className="min-w-full bg-white dark:bg-gray-800">
          <thead>
            <tr>
              <th className="py-2">Email</th>
              <th>Username</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id} className="border-t">
                <td className="py-2">{user.email}</td>
                <td>{user.username}</td>
                <td>{user.role}</td>
                <td>
                  <button onClick={() => handleDeleteUser(user._id)} className="text-red-600">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}