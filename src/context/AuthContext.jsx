import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

function repairVietnameseText(value) {
  if (typeof value !== 'string') return value;

  // Common mojibake pattern: UTF-8 bytes interpreted as Latin-1/Windows-1252.
  if (!/[ÃÂÄ]/.test(value)) return value;

  try {
    const bytes = Uint8Array.from(value.split('').map((char) => char.charCodeAt(0) & 0xff));
    const decoded = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
    return decoded.includes('\uFFFD') ? value : decoded;
  } catch {
    return value;
  }
}

function normalizeUserData(input) {
  if (Array.isArray(input)) return input.map(normalizeUserData);
  if (!input || typeof input !== 'object') return repairVietnameseText(input);

  return Object.fromEntries(
    Object.entries(input).map(([key, value]) => [key, normalizeUserData(value)])
  );
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      return normalizeUserData(storedUser);
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  const login = (userData, jwt) => {
    const normalizedUser = normalizeUserData(userData);
    setUser(normalizedUser);
    setToken(jwt);
    localStorage.setItem('user', JSON.stringify(normalizedUser));
    localStorage.setItem('token', jwt);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
