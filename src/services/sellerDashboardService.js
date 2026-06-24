import http from '../utils/http';

const sellerDashboardService = {
  getSummary: () => http.get('/api/seller/dashboard/summary'),

  getRevenueChart: (days = 7) => http.get('/api/seller/dashboard/revenue-chart', { days }),

  getCategoryChart: () => http.get('/api/seller/dashboard/category-chart'),
};

export default sellerDashboardService;
