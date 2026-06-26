import http from '../utils/http';

const sellerDashboardService = {
  getSummary: () => {
    console.log('📡 API Call: GET /api/seller/dashboard/summary');
    return http.get('/api/seller/dashboard/summary');
  },

  getRevenueChart: (days = 7) => {
    console.log('📡 API Call: GET /api/seller/dashboard/revenue-chart?days=' + days);
    return http.get('/api/seller/dashboard/revenue-chart', { days });
  },

  getRevenueChartByMonthAndDays: (month, year, days) => {
    console.log('📡 API Call: GET /api/seller/dashboard/revenue-chart-by-month-days', { month, year, days });
    return http.get('/api/seller/dashboard/revenue-chart-by-month-days', { month, year, days });
  },

  getCategoryChart: (month, year) => {
    // Always include params, use current date if not provided
    const now = new Date();
    const params = {
      month: month || (now.getMonth() + 1),
      year: year || now.getFullYear()
    };
    console.log('📡 API Call: GET /api/seller/dashboard/category-chart', params);
    return http.get('/api/seller/dashboard/category-chart', params);
  },
};

export default sellerDashboardService;
