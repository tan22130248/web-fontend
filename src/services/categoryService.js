import http from '../utils/http';

const categoryService = {
    /**
     * Lấy tất cả danh mục (dùng để đổ dữ liệu vào bộ lọc Checkbox)
     * GET /api/categories
     * @returns {Category[]} — Mảng danh sách danh mục gồm id, name, slug, parentId, isActive...
     */
    getAll: () => http.get('/api/categories'),

    /**
     * Lấy chi tiết 1 danh mục theo ID`
     * GET /api/categories/{id}
     */
    getById: (id) => http.get(`/api/categories/${id}`),
};

export default categoryService;