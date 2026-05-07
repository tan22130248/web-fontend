import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ─── Auth ────────────────────────────────────────────────────────────────────

export const authService = {
  login: (data) => api.post('/api/auth/login', data),

  register: (data) => api.post('/api/auth/register', data),

  sendOtp: (email) => api.post('/api/auth/send-otp', { email }),

  verifyOtp: (email, otp) => api.post('/api/auth/verify-otp', { email, otp }),

  googleLogin: () => {
    window.location.href = `${process.env.REACT_APP_API_URL}/oauth2/authorization/google`;
  },

  facebookLogin: () => {
    window.location.href = `${process.env.REACT_APP_API_URL}/oauth2/authorization/facebook`;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

export default api;
