import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import RoleBasedRoute from "./components/common/RoleBasedRoute";

import AuthPage from "./pages/auth/AuthPage";
import OAuth2RedirectPage from "./pages/auth/OAuth2RedirectPage";
import HomePage from "./pages/home/HomePage";
import ProfilePage from "./pages/profile";
import AdminPage from "./pages/admin";

// Order & Delivery routes
import CartPage from "./pages/cart";
import CheckoutPage from "./pages/checkout";
import OrderSuccessPage from "./pages/order-success";
import OrdersPage from "./pages/orders";
import OrderDetailPage from "./pages/orders/OrderDetailPage";
import SellerOrdersPage from "./pages/seller/orders";
import SellerOrderDetailPage from "./pages/seller/orders/SellerOrderDetailPage";
import NotificationsPage from "./pages/notifications";

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/oauth2/redirect" element={<OAuth2RedirectPage />} />

            <Route
              path="/home"
              element={
                <RoleBasedRoute allowedRoles={["buyer", "seller"]}>
                  <HomePage />
                </RoleBasedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <RoleBasedRoute allowedRoles={["buyer", "seller"]}>
                  <ProfilePage />
                </RoleBasedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <RoleBasedRoute allowedRoles={["admin"]}>
                  <AdminPage />
                </RoleBasedRoute>
              }
            />

            {/* New Order & Delivery Routes */}
            <Route
              path="/cart"
              element={
                <RoleBasedRoute allowedRoles={["buyer", "seller"]}>
                  <CartPage />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/checkout"
              element={
                <RoleBasedRoute allowedRoles={["buyer", "seller"]}>
                  <CheckoutPage />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/order-success"
              element={
                <RoleBasedRoute allowedRoles={["buyer", "seller"]}>
                  <OrderSuccessPage />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <RoleBasedRoute allowedRoles={["buyer", "seller"]}>
                  <OrdersPage />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/orders/:id"
              element={
                <RoleBasedRoute allowedRoles={["buyer", "seller"]}>
                  <OrderDetailPage />
                </RoleBasedRoute>
              }
            />

            <Route
              path="/seller/orders"
              element={
                <RoleBasedRoute allowedRoles={["seller"]}>
                  <SellerOrdersPage />
                </RoleBasedRoute>
              }
            />
            <Route
              path="/seller/orders/:id"
              element={
                <RoleBasedRoute allowedRoles={["seller"]}>
                  <SellerOrderDetailPage />
                </RoleBasedRoute>
              }
            />

            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <NotificationsPage />
                </ProtectedRoute>
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
          toastStyle={{ fontFamily: "Be Vietnam Pro, sans-serif" }}
        />
      </CartProvider>
    </AuthProvider>
  );
}
