import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // 👇 Only for local development (don't commit to production)
    if (process.env.NODE_ENV === "development") {
      const devUser = {
        id: "dev-user",
        name: "Local Developer",
        token: "fake-dev-token",
      };
      setUser(devUser);
      localStorage.setItem('user', JSON.stringify(devUser));
      localStorage.setItem('token', devUser.token);
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userData.token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);