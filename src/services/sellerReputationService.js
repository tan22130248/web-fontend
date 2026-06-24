import http from '../utils/http';

const sellerReputationService = {
  getSummary: () => http.get('/api/seller/reputation/summary'),
};

export default sellerReputationService;
