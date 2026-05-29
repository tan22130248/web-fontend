import React, { useState, useEffect } from 'react';
import categoryService from '../../services/categoryService';
import productService from '../../services/productService'; // Đảm bảo import đúng file chứa hàm filter/getConditions
import { Link } from 'react-router-dom';

export default function ProductsPage() {
  // 1. Quản lý bộ lọc để gửi lên API Backend
  const [filters, setFilters] = useState({
    categoryId: '',
    conditionStatus: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'soldCount,desc', // Mặc định sắp xếp theo bán chạy nhất (soldCount) như bạn yêu cầu
    page: 0,
    size: 9
  });

  // State cục bộ lưu giá trị khi người dùng đang gõ (Tránh trigger API liên tục)
  const [priceInput, setPriceInput] = useState({ min: '', max: '' });

  // 2. Trạng thái lưu dữ liệu từ các API trả về
  const [categories, setCategories] = useState([]);
  const [conditions, setConditions] = useState([]);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({
    totalElements: 0,
    totalPages: 0,
    isFirst: true,
    isLast: true
  });

  // 3. Tải danh mục và danh sách tình trạng (Chạy duy nhất 1 lần khi load trang)
  useEffect(() => {
    categoryService.getAll()
      .then((response) => setCategories(response.data || response))
      .catch((error) => console.error("Lỗi khi lấy danh mục:", error));

    productService.getConditions()
      .then((response) => setConditions(response.data || response))
      .catch((error) => console.error("Lỗi khi lấy danh sách tình trạng:", error));
  }, []);

  // 4. Lọc sản phẩm nâng cao (Chạy lại mỗi khi đối tượng filters thay đổi)
  // 4. Lọc sản phẩm nâng cao (Chạy lại mỗi khi đối tượng filters thay đổi)
  useEffect(() => {
    // Làm sạch params: Loại bỏ chuỗi rỗng, null, hoặc undefined
    const params = {};
    Object.keys(filters).forEach(key => {
      if (filters[key] !== '' && filters[key] !== null && filters[key] !== undefined) {
        // Ép dữ liệu về dạng chuỗi hoặc số chuẩn để Axios không tự bọc thêm ký tự lạ
        params[key] = filters[key];
      }
    });

    console.log("👉 Tham số thực tế gửi xuống Backend:", params);

    // Gọi tới API endpoint /api/products/filter
    productService.filter(params)
      .then((response) => {
        // Đảm bảo bóc tách data an toàn dù qua helper http.js nào
        const pageData = response.data || response;
        console.log("=== Kết quả trả về từ Backend ===", pageData);

        if (pageData && pageData.content) {
          // Cập nhật danh sách sản phẩm từ mảng content
          setProducts(pageData.content);

          // Cập nhật thông tin phân trang dựa trên cấu trúc JSON thực tế
          setPagination({
            totalElements: pageData.totalElements,
            totalPages: pageData.totalPages,
            isFirst: pageData.first,
            isLast: pageData.last
          });
        }
      })
      .catch((error) => console.error("Lỗi khi lọc danh sách sản phẩm:", error));
  }, [filters]);

  // 5. Các hàm xử lý tương tác bộ lọc
  const handleCategoryChange = (id) => {
    // Nếu click lại danh mục cũ thì bỏ chọn (Reset về chuỗi rỗng)
    setFilters(prev => ({ ...prev, categoryId: prev.categoryId === id ? '' : id, page: 0 }));
  };

  const handleConditionChange = (status) => {
    // Nếu click lại tình trạng cũ thì bỏ chọn
    setFilters(prev => ({ ...prev, conditionStatus: prev.conditionStatus === status ? '' : status, page: 0 }));
  };

  const handleSortChange = (e) => {
    setFilters(prev => ({ ...prev, sortBy: e.target.value, page: 0 }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      setFilters(prev => ({ ...prev, page: newPage }));
    }
  };

  const handlePriceSubmit = (e) => {
    e.preventDefault();
    setFilters(prev => ({
      ...prev,
      minPrice: priceInput.min,
      maxPrice: priceInput.max,
      page: 0
    }));
  };

  const handleResetFilters = () => {
    setFilters({ categoryId: '', conditionStatus: '', minPrice: '', maxPrice: '', sortBy: 'soldCount,desc', page: 0, size: 9 });
    setPriceInput({ min: '', max: '' });
  };

  // Định dạng hiển thị tiền tệ
  const formatVND = (value) => {
    if (!value) return '0đ';
    return new Intl.NumberFormat('vi-VN').format(value) + 'đ';
  };

  return (
    <div className="min-h-screen bg-[#FCFBF4] text-[#4A3B32] font-sans antialiased">
      {/* 1. HEADER */}
      <header className="border-b border-[#EBE7D9] bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="text-xl font-bold tracking-wider text-[#A14A24] border-2 border-dashed border-[#A14A24] px-3 py-1">
            Tủ cũ chill
          </div>
          <nav className="hidden md:flex space-x-8 font-medium text-sm text-[#6B5A4E]">
            <a href="#kham-pha" className="hover:text-[#A14A24]">Khám Phá</a>
            <a href="#cua-hang" className="text-[#A14A24] font-semibold border-b-2 border-[#A14A24] pb-1">Cửa Hàng</a>
            <a href="#xu-huong" className="hover:text-[#A14A24]">Xu Hướng</a>
          </nav>
          <div className="flex items-center space-x-5 text-gray-600">
            <button className="hover:text-[#A14A24]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </button>
            <div className="w-8 h-8 rounded-full bg-orange-200 border border-orange-300 flex items-center justify-center text-xs font-bold text-orange-800">U</div>
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">

        {/* 2. SIDEBAR FILTER */}
        <aside className="w-full lg:w-60 shrink-0">
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-[#EBE7D9]">
            <h2 className="font-bold text-lg text-[#8C3B1A]">Bộ Lọc</h2>
            {(filters.categoryId || filters.conditionStatus || filters.minPrice || filters.maxPrice) && (
              <button
                onClick={handleResetFilters}
                className="text-xs text-red-600 hover:underline font-medium"
              >
                Xóa tất cả
              </button>
            )}
          </div>

          {/* Danh mục Động từ API */}
          <div className="mb-6">
            <h3 className="font-semibold text-sm mb-3">Danh Mục</h3>
            <div className="space-y-2 text-sm text-gray-600">
              {categories.map((cat) => (
                <label key={cat.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.categoryId === cat.id}
                    onChange={() => handleCategoryChange(cat.id)}
                    className="rounded text-[#A14A24] focus:ring-[#A14A24] border-gray-300 accent-[#A14A24]"
                  />
                  <span className={filters.categoryId === cat.id ? "font-medium text-[#4A3B32]" : ""}>
                    {cat.name}
                  </span>
                </label>
              ))}
              {categories.length === 0 && <p className="text-xs text-gray-400 italic">Đang tải danh mục...</p>}
            </div>
          </div>

          {/* Tình trạng Động từ API */}
          <div className="mb-6">
            <h3 className="font-semibold text-sm mb-3">Tình Trạng</h3>
            <div className="space-y-2 text-sm text-gray-600">
              {conditions.map((status) => (
                <label key={status} className="flex items-center space-x-2 cursor-pointer uppercase">
                  <input
                    type="checkbox"
                    checked={filters.conditionStatus === status}
                    onChange={() => handleConditionChange(status)}
                    className="rounded text-[#A14A24] focus:ring-[#A14A24] border-gray-300 accent-[#A14A24]"
                  />
                  <span className={filters.conditionStatus === status ? "font-medium text-[#4A3B32]" : ""}>
                    {status.replace('_', ' ')}
                  </span>
                </label>
              ))}
              {conditions.length === 0 && <p className="text-xs text-gray-400 italic">Đang tải tình trạng...</p>}
            </div>
          </div>

          {/* Mức Giá Form */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Mức Giá</h3>
            <form onSubmit={handlePriceSubmit} className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  placeholder="Từđ"
                  value={priceInput.min}
                  onChange={(e) => setPriceInput(prev => ({ ...prev, min: e.target.value }))}
                  className="w-full bg-[#EDE9DA] border-none rounded px-3 py-1.5 text-xs focus:ring-1 focus:ring-[#A14A24] placeholder-gray-500 outline-none"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  placeholder="Đếnđ"
                  value={priceInput.max}
                  onChange={(e) => setPriceInput(prev => ({ ...prev, max: e.target.value }))}
                  className="w-full bg-[#EDE9DA] border-none rounded px-3 py-1.5 text-xs focus:ring-1 focus:ring-[#A14A24] placeholder-gray-500 outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full text-center text-xs bg-[#A14A24] text-white py-1.5 rounded hover:bg-[#8C3B1A] font-medium transition-colors"
              >
                Áp dụng khoảng giá
              </button>
            </form>
          </div>
        </aside>

        {/* 3. PRODUCT CONTENT AREA */}
        <main className="flex-1">
          {/* Content Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-[#EBE7D9] gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#8C3B1A]">
                {filters.categoryId ? categories.find(c => c.id === filters.categoryId)?.name : "Tất Cả Sản Phẩm"}
              </h1>
              <p className="text-xs text-gray-500 mt-1">Tìm thấy {pagination.totalElements} sản phẩm</p>
            </div>

            <div className="flex items-center space-x-2 self-end sm:self-auto">
              <span className="text-xs text-gray-500">Sắp xếp theo:</span>
              <select
                value={filters.sortBy}
                onChange={handleSortChange}
                className="bg-white border border-[#EBE7D9] rounded px-3 py-1.5 text-xs text-[#4A3B32] font-medium focus:ring-1 focus:ring-[#A14A24] outline-none cursor-pointer"
              >
                <option value="soldCount,desc">Bán chạy nhất</option>
                <option value="createdAt,desc">Mới nhất</option>
                <option value="price,asc">Giá tăng dần</option>
                <option value="price,desc">Giá giảm dần</option>
              </select>
            </div>
          </div>

          {/* Product Grid Động */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Link
                key={product.id}
                to={`/products/${product.id}`}
                className="bg-white rounded-xl shadow-sm border border-[#F0ECE0] overflow-hidden flex flex-col group hover:shadow-md transition-shadow cursor-pointer block"
              >
                {/* Image & Tag */}
                <div className="relative aspect-[4/5] bg-gray-100 overflow-hidden">
                  <img
                    src={product.imageUrl || 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=500&auto=format&fit=crop&q=60'}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 left-3 text-[10px] font-bold text-white px-2 py-0.5 rounded bg-[#E87745] tracking-wide uppercase">
                    {product.conditionStatus ? product.conditionStatus.replace('_', ' ') : 'GOOD'}
                  </span>
                </div>

                {/* Info Body */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-sm text-[#4A3B32] line-clamp-1 mb-1">{product.name}</h3>
                    <p className="font-bold text-base text-[#A14A24]">{formatVND(product.price)}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Đã bán: {product.soldCount || 0}</p>
                  </div>

                  {/* Seller Info Footer */}
                  <div className="mt-4 pt-3 border-t border-[#F7F5EE] flex items-center justify-between text-[11px] text-gray-500">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-orange-300 text-white flex items-center justify-center font-bold text-[9px]">
                        {product.shopName ? product.shopName.substring(0, 2).toUpperCase() : 'TC'}
                      </div>
                      <p className="font-medium text-[#4A3B32]">{product.shopName || "Tiệm đồ cũ"}</p>
                    </div>
                    <span className="bg-[#F4F1E6] px-1.5 py-0.5 rounded text-gray-600 font-medium tracking-wide">
                      {product.categoryName || "Đồ Chill"}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Fallback khi rỗng kết quả */}
          {products.length === 0 && (
            <div className="text-center py-16 text-gray-400 italic">
              Không có sản phẩm nào khớp với bộ lọc bạn chọn.
            </div>
          )}

          {/* 4. PAGINATION ĐỘNG */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center items-center space-x-1.5 mt-12">
              <button
                disabled={pagination.isFirst}
                onClick={() => handlePageChange(filters.page - 1)}
                className={`w-8 h-8 rounded flex items-center justify-center text-xs transition-colors ${pagination.isFirst ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#EDE9DA] text-gray-600 hover:bg-[#E2DDC9]'}`}
              >
                &lt;
              </button>

              {[...Array(pagination.totalPages)].map((_, index) => {
                if (index === 0 || index === pagination.totalPages - 1 || Math.abs(filters.page - index) <= 1) {
                  return (
                    <button
                      key={index}
                      onClick={() => handlePageChange(index)}
                      className={`w-8 h-8 rounded text-xs font-bold transition-colors ${filters.page === index ? 'bg-[#A14A24] text-white' : 'bg-[#EDE9DA] text-gray-700 hover:bg-[#E2DDC9]'}`}
                    >
                      {index + 1}
                    </button>
                  );
                }
                if (index === 1 || index === pagination.totalPages - 2) {
                  return <span key={index} className="text-gray-400 text-xs px-0.5">...</span>;
                }
                return null;
              })}

              <button
                disabled={pagination.isLast}
                onClick={() => handlePageChange(filters.page + 1)}
                className={`w-8 h-8 rounded flex items-center justify-center text-xs transition-colors ${pagination.isLast ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-[#EDE9DA] text-gray-600 hover:bg-[#E2DDC9]'}`}
              >
                &gt;
              </button>
            </div>
          )}
        </main>
      </div>

      {/* 5. FOOTER */}
      <footer className="bg-[#F5F2E6] border-t border-[#EBE7D9] mt-20 py-10 text-center">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="font-bold text-lg text-[#8C3B1A] mb-2">Tủ cũ chill</h3>
          <p className="text-[11px] text-gray-400">© 2026 Tiệm Cũ - Chạm vào ký ức, sẻ chia phong cách.</p>
        </div>
      </footer>
    </div>
  );
}