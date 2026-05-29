import http from '../utils/http';

const productService = {
  /**
   * Lấy chi tiết 1 sản phẩm theo ID
   * GET /api/products/{id}
   * @returns {ProductDto} — id, name, description, price, stock, conditionStatus, images[], shopId, shopName, shopAvatarUrl, categoryId, categoryName, ...
   */
  getById: (id) => http.get(`/api/products/${id}`),

  /**
   * Lấy danh sách variants của sản phẩm
   * GET /api/products/{id}/variants
   * @returns {ProductVariant[]} — id, type, size, color, priceModifier, stock, stockQty, imageUrl
   */
  getVariants: (id) => http.get(`/api/products/${id}/variants`),

  /**
   * Lấy sản phẩm theo category (dùng cho "Sản phẩm tương tự")
   * GET /api/products?category=...&page=0&size=8
   */
  getByCategory: (categoryId, page = 0, size = 8) =>
    http.get('/api/products', { category: categoryId, page, size }),

  /**
   * Lấy sản phẩm theo shop (dùng cho "Gợi ý từ Tiệm")
   * GET /api/products?shop=...&page=0&size=4
   */
  getByShop: (shopId, page = 0, size = 4) =>
    http.get('/api/products', { shop: shopId, page, size }),

  /**
   * Lấy tất cả sản phẩm có phân trang
   * GET /api/products?page=0&size=20
   */
  getAll: (page = 0, size = 20) =>
    http.get('/api/products', { page, size }),

  /**
   * Tìm kiếm sản phẩm theo keyword
   * GET /api/products?keyword=...&page=0&size=20
   */
  search: (keyword, page = 0, size = 20) =>
    http.get('/api/products', { keyword, page, size }),

  /**
   * Lấy danh sách các tình trạng sản phẩm không trùng lặp
   * GET /api/products/conditions
   * @returns {String[]} — Ví dụ: ["good", "like_new", "new"]
   */
  getConditions: () => http.get('/api/products/conditions'),

  /**
   * Lọc tất cả sản phẩm theo bộ tiêu chí động (Category, Tình trạng, Giá) và Phân trang
   * GET /api/products/filter
   * @param {Object} params — Chứa các tham số lọc gửi lên Backend
   */
  filter: (params) => http.get('/api/products/filter', params),
};

export default productService;
