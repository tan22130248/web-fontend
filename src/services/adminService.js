import http from '../utils/http';

const ADMIN_USERS_PATH = '/api/admin/users';
const ADMIN_REGISTRATIONS_PATH = '/api/admin/seller-registrations';

export const adminService = {
  getUsers: (params = {}) => http.get(ADMIN_USERS_PATH, params),

  createUser: (data) => http.post(ADMIN_USERS_PATH, data),

  updateUser: (id, data) => http.put(`${ADMIN_USERS_PATH}/${id}`, data),

  updateUserStatus: (id, isActive) =>
    http.patch(`${ADMIN_USERS_PATH}/${id}/status`, { isActive }),

  deleteUser: (id) => http.delete(`${ADMIN_USERS_PATH}/${id}`),

  getSellerRegistrations: (params = {}) => http.get(ADMIN_REGISTRATIONS_PATH, params),

  getSellerRegistration: (id) => http.get(`${ADMIN_REGISTRATIONS_PATH}/${id}`),

  approveSellerRegistration: (id) => http.patch(`${ADMIN_REGISTRATIONS_PATH}/${id}/approve`),

  rejectSellerRegistration: (id, reason) =>
    http.patch(`${ADMIN_REGISTRATIONS_PATH}/${id}/reject`, { reason }),

  deleteSellerRegistration: (id) => http.delete(`${ADMIN_REGISTRATIONS_PATH}/${id}`),
};

export default adminService;
