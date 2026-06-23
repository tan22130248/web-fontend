import http from '../utils/http';

const ADMIN_USERS_PATH = '/api/admin/users';
const ADMIN_REGISTRATIONS_PATH = '/api/admin/seller-registrations';
const ADMIN_PRODUCTS_PATH = '/api/admin/products';
const ADMIN_ORDERS_PATH = '/api/admin/orders';
const ADMIN_COMPLAINTS_PATH = '/api/admin/complaints';

export const adminService = {
  // ── Users ──────────────────────────────────────────────────────────
  getUsers: (params = {}) => http.get(ADMIN_USERS_PATH, params),

  createUser: (data) => http.post(ADMIN_USERS_PATH, data),

  updateUser: (id, data) => http.put(`${ADMIN_USERS_PATH}/${id}`, data),

  updateUserStatus: (id, isActive) =>
    http.patch(`${ADMIN_USERS_PATH}/${id}/status`, { isActive }),

  deleteUser: (id) => http.delete(`${ADMIN_USERS_PATH}/${id}`),

  // ── Seller registrations ─────────────────────────────────────────────
  getSellerRegistrations: (params = {}) => http.get(ADMIN_REGISTRATIONS_PATH, params),

  getSellerRegistration: (id) => http.get(`${ADMIN_REGISTRATIONS_PATH}/${id}`),

  approveSellerRegistration: (id) => http.patch(`${ADMIN_REGISTRATIONS_PATH}/${id}/approve`),

  rejectSellerRegistration: (id, reason) =>
    http.patch(`${ADMIN_REGISTRATIONS_PATH}/${id}/reject`, { reason }),

  deleteSellerRegistration: (id) => http.delete(`${ADMIN_REGISTRATIONS_PATH}/${id}`),

  // ── Products ──────────────────────────────────────────────────────────
  getProducts: (params = {}) => http.get(ADMIN_PRODUCTS_PATH, params),

  getProductStats: () => http.get(`${ADMIN_PRODUCTS_PATH}/stats`),

  getProduct: (id) => http.get(`${ADMIN_PRODUCTS_PATH}/${id}`),

  approveProduct: (id) => http.patch(`${ADMIN_PRODUCTS_PATH}/${id}/approve`),

  flagProductViolation: (id) => http.patch(`${ADMIN_PRODUCTS_PATH}/${id}/violation`),

  deleteProduct: (id) => http.delete(`${ADMIN_PRODUCTS_PATH}/${id}`),

  // ── Orders ────────────────────────────────────────────────────────────
  getOrders: (params = {}) => http.get(ADMIN_ORDERS_PATH, params),

  getOrderStats: () => http.get(`${ADMIN_ORDERS_PATH}/stats`),

  getOrder: (id) => http.get(`${ADMIN_ORDERS_PATH}/${id}`),

  // ── Complaints ────────────────────────────────────────────────────────
  getComplaints: (params = {}) => http.get(ADMIN_COMPLAINTS_PATH, params),

  getComplaintStats: () => http.get(`${ADMIN_COMPLAINTS_PATH}/stats`),

  getComplaint: (id) => http.get(`${ADMIN_COMPLAINTS_PATH}/${id}`),
};

export default adminService;
