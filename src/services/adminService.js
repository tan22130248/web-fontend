import http from '../utils/http';

const ADMIN_USERS_PATH = '/api/admin/users';

export const adminService = {
  getUsers: (params = {}) => http.get(ADMIN_USERS_PATH, params),

  createUser: (data) => http.post(ADMIN_USERS_PATH, data),

  updateUser: (id, data) => http.put(`${ADMIN_USERS_PATH}/${id}`, data),

  updateUserStatus: (id, isActive) =>
    http.patch(`${ADMIN_USERS_PATH}/${id}/status`, { isActive }),

  deleteUser: (id) => http.delete(`${ADMIN_USERS_PATH}/${id}`),
};

export default adminService;
