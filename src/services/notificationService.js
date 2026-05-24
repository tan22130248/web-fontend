import http from '../utils/http';

export const notificationService = {
  getAll: (params) => http.get('/api/notifications', params),
  markAsRead: (id) => http.patch(`/api/notifications/${id}/read`),
  markAllAsRead: () => http.patch('/api/notifications/read-all'),
};

export default notificationService;
