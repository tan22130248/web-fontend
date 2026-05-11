import api from './authService';

const ADMIN_USERS_PATH = '/api/admin/users';

export const adminService = {
  getUsers: (params = {}) => api.get(ADMIN_USERS_PATH, { params }),

  createUser: (data) => api.post(ADMIN_USERS_PATH, data),

  updateUser: (id, data) => api.put(`${ADMIN_USERS_PATH}/${id}`, data),

  updateUserStatus: (id, isActive) =>
    api.patch(`${ADMIN_USERS_PATH}/${id}/status`, { isActive }),

  deleteUser: (id) => api.delete(`${ADMIN_USERS_PATH}/${id}`),
};

export default adminService;
