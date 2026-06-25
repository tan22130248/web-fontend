import React, { createContext, useContext, useState, useEffect } from 'react';
import http from '../services/authService';

const AuthContext = createContext(null);

function repairVietnameseText(value) {
  if (typeof value !== 'string') return value;

  // Detect common mojibake patterns where UTF-8 bytes were decoded as Latin-1/Windows-1252.
  // Valid Vietnamese strings normally do not contain two consecutive Latin-1 extended chars.
  if (!/([\u00C0-\u00FF]{2,})/.test(value)) return value;

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
    // If backend login response omits some profile fields, fetch full profile
    if (!normalizedUser?.phone || !normalizedUser?.avatarUrl || !normalizedUser?.fullName) {
      (async () => {
        try {
          const profile = await http.get('/api/user/profile');
          if (profile) updateUser(profile);
        } catch (e) {
          // Non-fatal; keep the partial user
          console.warn('Unable to fetch full profile after login', e?.message || e);
        }
      })();
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const updateUser = (userData) => {
    const normalizedUser = normalizeUserData(userData);
    setUser(normalizedUser);
    localStorage.setItem('user', JSON.stringify(normalizedUser));
  };

  const getAuthHeader = () => {
    if (token) {
      return { 'Authorization': `Bearer ${token}` };
    }
    return {};
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      login, 
      logout, 
      updateUser, 
      getAuthHeader,
      isAuthenticated: !!token 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
