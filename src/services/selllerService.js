import http from '../utils/http';

const sellerProductService = {
  /**
   * 1. Lấy danh sách sản phẩm phân trang + tìm kiếm + lọc theo tab status
   * GET /api/seller/products?page=0&size=10&keyword=...&status=ALL
   * @returns {Page<ProductSellerDto>} — content[], pageable, totalElements, totalPages, ...
   */
  getProducts: (page = 0, size = 10, keyword = '', status = 'ALL') => {
    // Tạo object params, tự động loại bỏ keyword nếu để trống để URL sạch hơn
    const params = { page, size, status };
    if (keyword) {
      params.keyword = keyword;
    }
    return http.get('/api/seller/products', params);
  },

  /**
   * 2. Đăng sản phẩm mới (Nút cam)
   * POST /api/seller/products
   * @param {Object} productData — Object chứa thông tin Product model
   * @returns {Product} — Trả về thông tin sản phẩm vừa tạo thành công
   */
  createProduct: (productData) => http.post('/api/seller/products', productData),

  /**
   * 3. Xem chi tiết sản phẩm (Icon con mắt / Form sửa)
   * GET /api/seller/products/{id}
   * @returns {Product} — Chi tiết đối tượng Product
   */
  getById: (id) => http.get(`/api/seller/products/${id}`),

  /**
   * 4. Chỉnh sửa sản phẩm (Icon cây bút)
   * PUT /api/seller/products/{id}
   * @param {String} id — ID của sản phẩm
   * @param {Object} updatedData — Object chứa thông tin Product cần cập nhật
   * @returns {Product} — Trả về thông tin sản phẩm sau khi cập nhật thành công
   */
  updateProduct: (id, updatedData) => http.put(`/api/seller/products/${id}`, updatedData),

  /**
   * 5. Xóa mềm / Ẩn sản phẩm (Icon thùng rác)
   * DELETE /api/seller/products/{id}
   * @returns {Object} — Ví dụ: { message: "Sản phẩm đã được ẩn thành công" }
   */
  deleteProduct: (id) => http.delete(`/api/seller/products/${id}`),

  /**
   * 6. Xuất báo cáo tồn kho (.CSV)
   * GET /api/seller/products/export
   * @returns {Blob/ArrayBuffer} — File CSV dạng nhị phân để Client tải về
   */
  exportInventoryReport: () => {
    // Lưu ý: Đối với việc tải file, bạn có thể cần cấu hình responseType: 'blob' 
    // tùy thuộc vào cách viết của hàm `http.get` trong dự án của bạn.
    return http.get('/api/seller/products/export', {}, { responseType: 'blob' });
  }
};

export default sellerProductService;