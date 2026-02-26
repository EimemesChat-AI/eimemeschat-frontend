import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useEffect, useState } from 'react';
import api from '../../services/api';

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { currentUser } = useAuth();
  const [isAdmin, setIsAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (requireAdmin && currentUser) {
      api.get('/auth/me')
        .then(res => {
          setIsAdmin(res.data.user.role === 'admin');
        })
        .catch(() => setIsAdmin(false))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [currentUser, requireAdmin]);

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (requireAdmin) {
    if (loading) return <div>Loading...</div>;
    if (!isAdmin) return <Navigate to="/" />;
  }

  return children;
}
