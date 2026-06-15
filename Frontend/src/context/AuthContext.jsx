import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const API_BASE_URL = 'http://localhost:8000/api/auth';

export const AuthProvider = ({ children }) => {
  // Mock registry state kept for UI compatibility if needed, though authenticating with API
  const [usersRegistry, setUsersRegistry] = useState([]);

  // Currently logged-in user (null by default to enforce auth gate!)
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('clickcart_current_user') || localStorage.getItem('nexus_current_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.username === 'admin' || parsed.username === 'user')) {
          return null;
        }
        return parsed;
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      localStorage.setItem('clickcart_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('clickcart_current_user');
      localStorage.removeItem('nexus_current_user');
    }
  }, [user]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (user && user.role === 'admin') {
        try {
          const res = await fetch(`${API_BASE_URL}/users`, {
            headers: {
              'X-Username': user.username
            }
          });
          if (res.ok) {
            const data = await res.json();
            setUsersRegistry(data);
          }
        } catch (err) {
          console.error("Failed to fetch registered users list:", err);
        }
      }
    };
    fetchUsers();
  }, [user]);

  // Strict Login function calling the backend API
  const login = async (usernameOrEmail, password) => {
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          usernameOrEmail: usernameOrEmail.trim(),
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Login failed. Please verify credentials.');
      }

      setUser(data);
      return { success: true, user: data };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  // Sign up function calling the backend API
  const signup = async (username, email, password, role = 'user') => {
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
          password: password,
          role: role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Signup failed. Please try again.');
      }

      setUser(data);
      return { success: true, user: data };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const changePassword = async (username, newPassword) => {
    try {
      const response = await fetch(`${API_BASE_URL}/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          newPassword: newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to change password.');
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const updateProfile = async (username, newEmail) => {
    try {
      const response = await fetch(`${API_BASE_URL}/update-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          newEmail: newEmail,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Failed to update profile.');
      }

      setUser(data);
      return { success: true, user: data };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    setUser(null);
  };

  const switchRole = (newRole) => {
    if (user) {
      const updatedUser = { ...user, role: newRole };
      setUser(updatedUser);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      usersRegistry,
      error,
      login,
      signup,
      logout,
      switchRole,
      changePassword,
      updateProfile,
      setError
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
