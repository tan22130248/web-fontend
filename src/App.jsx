import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import RoleBasedRoute from './components/common/RoleBasedRoute';
import AuthPage from './pages/auth/AuthPage';
import OAuth2RedirectPage from './pages/auth/OAuth2RedirectPage';
import HomePage from './pages/home/HomePage';
import ProfilePage from './pages/profile';
import AdminPage from './pages/admin';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/oauth2/redirect" element={<OAuth2RedirectPage />} />
          
          <Route
            path="/home"
            element={
              <RoleBasedRoute allowedRoles={['buyer', 'seller']}>
                <HomePage />
              </RoleBasedRoute>
            }
          />
          
          <Route
            path="/profile"
            element={
              <RoleBasedRoute allowedRoles={['buyer', 'seller']}>
                <ProfilePage />
              </RoleBasedRoute>
            }
          />
          
          <Route
            path="/admin"
            element={
              <RoleBasedRoute allowedRoles={['admin']}>
                <AdminPage />
              </RoleBasedRoute>
            }
          />
          
          <Route path="/" element={<Navigate to="/auth" replace />} />
          <Route path="*" element={<Navigate to="/auth" replace />} />
        </Routes>
      </BrowserRouter>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        toastStyle={{ fontFamily: 'DM Sans, sans-serif' }}
      />
    </AuthProvider>
  );
}
