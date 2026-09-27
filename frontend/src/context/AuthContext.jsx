import { createContext, useContext, useEffect, useState } from 'react';
import { authAPI } from '../lib/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('borrowbox_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('borrowbox_token');
      if (token) {
        try {
          const res = await authAPI.me();
          setUser(res.data.data);
          localStorage.setItem('borrowbox_user', JSON.stringify(res.data.data));
        } catch {
          localStorage.removeItem('borrowbox_token');
          localStorage.removeItem('borrowbox_user');
          setUser(null);
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { user: u, token } = res.data.data;
    localStorage.setItem('borrowbox_token', token);
    localStorage.setItem('borrowbox_user', JSON.stringify(u));
    setUser(u);
    return u;
  };

  const register = async (data) => {
    const res = await authAPI.register(data);
    const { user: u, token } = res.data.data;
    localStorage.setItem('borrowbox_token', token);
    localStorage.setItem('borrowbox_user', JSON.stringify(u));
    setUser(u);
    return u;
  };

  const logout = () => {
    localStorage.removeItem('borrowbox_token');
    localStorage.removeItem('borrowbox_user');
    setUser(null);
  };

  const updateUser = (newData) => {
    const updated = { ...user, ...newData };
    setUser(updated);
    localStorage.setItem('borrowbox_user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
