import http from '../utils/http';

const reviewService = {
  /**
   * Lấy tóm tắt đánh giá sản phẩm (trung bình sao, phân phối sao, trạng thái mua hàng/đánh giá)
   * GET /api/products/{productId}/reviews/summary
   */
  getSummary: (productId) => http.get(`/api/products/${productId}/reviews/summary`),

  /**
   * Lấy danh sách đánh giá có phân trang (và lọc theo số sao nếu cần)
   * GET /api/products/{productId}/reviews
   */
  getReviews: (productId, rating = null, page = 0, size = 10) => {
    const params = { page, size };
    if (rating !== null && rating !== undefined) {
      params.rating = rating;
    }
    return http.get(`/api/products/${productId}/reviews`, params);
  },

  /**
   * Tạo đánh giá mới (chỉ dành cho người mua hàng)
   * POST /api/products/{productId}/reviews
   */
  createReview: (productId, rating, comment) =>
    http.post(`/api/products/${productId}/reviews`, { rating, comment }),

  /**
   * Lấy danh sách bình luận/hỏi đáp của sản phẩm
   * GET /api/products/{productId}/comments
   */
  getComments: (productId, buyerOnly = false, page = 0, size = 10) =>
    http.get(`/api/products/${productId}/comments`, { buyerOnly, page, size }),

  /**
   * Tạo bình luận/hỏi đáp mới
   * POST /api/products/{productId}/comments
   */
  createComment: (productId, content) =>
    http.post(`/api/products/${productId}/comments`, { content }),
};

export default reviewService;
