import http from '../utils/http';

export const cartService = {
  validateItems: (productIds) => http.post('/api/products/batch', { ids: productIds }),
};

export default cartService;
