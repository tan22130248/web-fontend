import http from '../utils/http';

const shopService = {
  getShopById: (id) => http.get(`/api/shops/${id}`),

  getMyShop: () => http.get('/api/shops/my'),

  createShop: (shopData) => http.post('/api/shops', shopData),

  updateShop: (shopData) => http.put('/api/shops', shopData),
};

export default shopService;
