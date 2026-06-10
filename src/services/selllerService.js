import http from '../utils/http';

const sellerProductService = {
  /**
   * @returns {Page<ProductSellerDto>} 
   */
  getProducts: (page = 0, size = 10, keyword = '', status = 'ALL') => {
    const params = { page, size, status };
    if (keyword) {
      params.keyword = keyword;
    }
    return http.get('/api/seller/products', params);
  },

  /**
   * @param {Object} productData 
   * @returns {Product} 
   */
  createProduct: (productData) => http.post('/api/seller/products', productData),

  /**
   * @returns {Product} 
   */
  getById: (id) => http.get(`/api/seller/products/${id}`),

  /**
   * @param {String} id 
   * @param {Object} updatedData 
   * @returns {Product}
   */
  updateProduct: (id, updatedData) => http.put(`/api/seller/products/${id}`, updatedData),

  /**
   * @returns {Object}
   */
  deleteProduct: (id) => http.delete(`/api/seller/products/${id}`),

  /**
   * @returns {Blob/ArrayBuffer} 
   */
  exportInventoryReport: () => {
    return http.get('/api/seller/products/export', {}, { responseType: 'blob' });
  }
  ,
  /**
   * @param {Object} payload 
   */
  registerSeller: (payload) => http.post('/api/seller/register', payload),
};

export default sellerProductService;