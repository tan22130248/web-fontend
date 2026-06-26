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
import AdminLayout from "./pages/admin/AdminLayout";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminRegistrationsPage from "./pages/admin/AdminRegistrationsPage";
import AdminProductsPage from "./pages/admin/AdminProductsPage";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage";
import AdminOrderDetailPage from "./pages/admin/AdminOrderDetailPage";
import AdminComplaintsPage from "./pages/admin/AdminComplaintsPage";

// Order & Delivery routes
import CartPage from "./pages/cart";
import CheckoutPage from "./pages/checkout";
import OrderSuccessPage from "./pages/order-success";
import OrdersPage from "./pages/orders";
import OrderDetailPage from "./pages/orders/OrderDetailPage";
import SellerOrdersPage from "./pages/seller/orders";
import SellerOrderDetailPage from "./pages/seller/orders/SellerOrderDetailPage";
import NotificationsPage from "./pages/notifications";
import PaymentResultPage from "./pages/payment-result";

// Product
import ProductsPage from "./pages/products/ProductListPage";
import ProductDetailPage from "./pages/products/ProductDetailPage";
import ImageSearchResultsPage from "./pages/image-search/ImageSearchResultsPage";

// Seller
import SellerLayout from "./pages/seller/components/SellerLayout";
import SellerDashboardPage from "./pages/seller/dash/SellerDashboardPage";
import SellerProducts from "./pages/seller/products/SellerProducts";
import SellerProductCreate from "./pages/seller/products/SellerProductCreate";
import SellerAnalytics from "./pages/seller/analytics/SellerAnalytics";
import SelllerProfile from "./pages/seller/profile/SelllerProfile";
import ExploreShops from "./pages/shop/ExploreShops";
import ShopDetail from "./pages/shop/ShopDetail";

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/oauth2/redirect" element={<OAuth2RedirectPage />} />

            <Route path="/home" element={<HomePage />} />

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
                  <AdminLayout />
                </RoleBasedRoute>
              }
            >
              <Route
                index
                element={<Navigate to="/admin/products" replace />}
              />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="orders" element={<AdminOrdersPage />} />
              <Route path="orders/:id" element={<AdminOrderDetailPage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route
                path="registrations"
                element={<AdminRegistrationsPage />}
              />
              <Route path="complaints" element={<AdminComplaintsPage />} />
            </Route>

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
              path="/payment/result"
              element={
                <RoleBasedRoute allowedRoles={["buyer", "seller"]}>
                  <PaymentResultPage />
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

            {/* Products and Seller Management Routes */}
            <Route
              path="/seller"
              element={
                <RoleBasedRoute allowedRoles={["seller"]}>
                  <SellerLayout />
                </RoleBasedRoute>
              }
            >
              <Route path="orders" element={<SellerOrdersPage />} />
              <Route path="orders/:id" element={<SellerOrderDetailPage />} />
              <Route
                index
                element={<Navigate to="/seller/dashboard" replace />}
              />
              <Route path="dashboard" element={<SellerDashboardPage />} />
              <Route path="products" element={<SellerProducts />} />
              <Route path="products/:id" element={<ProductDetailPage />} />
              <Route path="products/create" element={<SellerProductCreate />} />
              <Route path="analytics" element={<SellerAnalytics />} />
              <Route path="profile" element={<SelllerProfile />} />
            </Route>

            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/image-search" element={<ImageSearchResultsPage />} />

            <Route path="/explore" element={<ExploreShops />} />
            <Route path="/shop/:shopId" element={<ShopDetail />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />

            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <NotificationsPage />
                </ProtectedRoute>
              }
            />

            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </BrowserRouter>

        <ToastContainer
          position="bottom-right"
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
