import http from '../utils/http';

// ─── Auth ────────────────────────────────────────────────────────────────────

export const authService = {
  login: (data) => http.post('/api/auth/login', data),

  register: (data) => http.post('/api/auth/register', data),

  sendOtp: (email) => http.post('/api/auth/send-otp', { email }),

  verifyOtp: (email, otp) => http.post('/api/auth/verify-otp', { email, otp }),

  forgotPassword: (emailOrPhone) => http.post('/api/auth/forgot-password', { emailOrPhone }),

  resetPassword: (data) => http.post('/api/auth/reset-password', data),

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

export default http;
