import http from '../utils/http';

export const orderService = {
  getMyOrders: (params = {}) =>
    http.get('/api/orders', { role: 'buyer', ...params }),

  getOrderById: (id) => http.get(`/api/orders/${id}`),

  createOrder: (data) => http.post('/api/orders', data),

  calculateFee: (data) => http.post('/api/orders/calculate-fee', data),

  cancelOrder: (id, reason) =>
    http.patch(`/api/orders/${id}/cancel`, reason ? { reason } : {}),

  requestRefund: (id, reason) =>
    http.patch(`/api/orders/${id}/refund`, reason ? { reason } : {}),

  getSellerOrders: (params = {}) =>
    http.get('/api/orders', { role: 'seller', ...params }),

  getSellerOrderById: (id) => http.get(`/api/orders/${id}`),

  confirmOrder: (id) => http.patch(`/api/orders/${id}/confirm`),

  shipOrder: (id) => http.patch(`/api/orders/${id}/ship`),

  deliverOrder: (id) => http.patch(`/api/orders/${id}/deliver`),

  cancelSellerOrder: (id, reason) =>
    http.patch(`/api/orders/${id}/cancel`, reason ? { reason } : {}),

  getSellerRegistrationStatus: () => http.get('/api/seller/check-seller-status'),
};

export default orderService;
