import React, { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import categoryService from '../../services/categoryService';
import productService from '../../services/productService';

export default function ProductsPage() {
  const [filters, setFilters] = useState(() => {
    try {
      const saved = sessionStorage.getItem('products_filters');
        return saved ? JSON.parse(saved) : {
        categoryId: '',
        conditionStatus: '',
        minPrice: '',
        maxPrice: '',
        keyword: '',
        sortBy: 'soldCount,desc',
        page: 0,
        size: 9,
      };
    } catch {
      return {
        categoryId: '',
        conditionStatus: '',
        minPrice: '',
        maxPrice: '',
        keyword: '',
        sortBy: 'soldCount,desc',
        page: 0,
        size: 9,
      };
    }
  });

  const [priceInput, setPriceInput] = useState(() => {
    try {
      const saved = sessionStorage.getItem('products_price_input');
      return saved ? JSON.parse(saved) : { min: '', max: '' };
    } catch {
      return { min: '', max: '' };
    }
  });

  useEffect(() => {
    sessionStorage.setItem('products_filters', JSON.stringify(filters));
  }, [filters]);

  useEffect(() => {
    sessionStorage.setItem('products_price_input', JSON.stringify(priceInput));
  }, [priceInput]);

  const [categories, setCategories] = useState([]);
  const [conditions, setConditions] = useState([]);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({
    totalElements: 0,
    totalPages: 0,
    isFirst: true,
    isLast: true,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSuggestionsOpen, setIsSuggestionsOpen] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    categoryService
      .getAll()
      .then((response) => setCategories(response?.data || response || []))
      .catch((error) => console.error('Lỗi khi lấy danh mục:', error));

    productService
      .getConditions()
      .then((response) => setConditions(response?.data || response || []))
      .catch((error) => console.error('Lỗi khi lấy danh sách tình trạng:', error));
  }, []);

  useEffect(() => {
    const params = {};
    Object.keys(filters).forEach((key) => {
      if (filters[key] !== '' && filters[key] !== null && filters[key] !== undefined) {
        params[key] = filters[key];
      }
    });
    if (filters.keyword && filters.keyword.trim() !== '') {
      productService
        .search(filters.keyword, filters.page, filters.size)
        .then((response) => {
          const pageData = response?.data || response;
          if (pageData?.content) {
            setProducts(pageData.content);
            setPagination({
              totalElements: pageData.totalElements,
              totalPages: pageData.totalPages,
              isFirst: pageData.first,
              isLast: pageData.last,
            });
          } else {
            setProducts([]);
          }
        })
        .catch((error) => console.error('Lỗi khi tìm kiếm sản phẩm:', error));
    } else {
      productService
        .filter(params)
        .then((response) => {
          const pageData = response?.data || response;
          if (pageData?.content) {
            setProducts(pageData.content);
            setPagination({
              totalElements: pageData.totalElements,
              totalPages: pageData.totalPages,
              isFirst: pageData.first,
              isLast: pageData.last,
            });

            const savedScroll = sessionStorage.getItem('products_scroll_pos');
            if (savedScroll) {
              setTimeout(() => {
                window.scrollTo(0, parseInt(savedScroll, 10));
                sessionStorage.removeItem('products_scroll_pos');
              }, 100);
            }
          } else {
            setProducts([]);
          }
        })
        .catch((error) => console.error('Lỗi khi lọc danh sách sản phẩm:', error));
    }
  }, [filters]);

  useEffect(() => {
    if (!searchQuery || searchQuery.trim() === '') {
      setSuggestions([]);
      setIsSuggestionsOpen(false);
      return;
    }

    const timer = setTimeout(() => {
      productService
        .search(searchQuery.trim(), 0, 8)
        .then((response) => {
          const content = response?.data?.content || response?.content || [];
          setSuggestions(content);
          setIsSuggestionsOpen(true);
        })
        .catch(() => {
          setSuggestions([]);
          setIsSuggestionsOpen(false);
        });
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const onClick = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSuggestionsOpen(false);
      }
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  const handleCategoryChange = (id) => {
    setFilters((prev) => ({ ...prev, categoryId: prev.categoryId === id ? '' : id, page: 0 }));
  };

  const handleConditionChange = (status) => {
    setFilters((prev) => ({ ...prev, conditionStatus: prev.conditionStatus === status ? '' : status, page: 0 }));
  };

  const handleSortChange = (event) => {
    setFilters((prev) => ({ ...prev, sortBy: event.target.value, page: 0 }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      setFilters((prev) => ({ ...prev, page: newPage }));
    }
  };

  const handlePriceSubmit = (event) => {
    event.preventDefault();
    setFilters((prev) => ({
      ...prev,
      minPrice: priceInput.min,
      maxPrice: priceInput.max,
      page: 0,
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      categoryId: '',
      conditionStatus: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'soldCount,desc',
      page: 0,
      size: 9,
    });
    setPriceInput({ min: '', max: '' });
  };

  const formatVND = (value) => {
    if (!value) return '0đ';
    return new Intl.NumberFormat('vi-VN').format(value) + 'đ';
  };

  return (
    <div className="min-h-screen bg-[#FCFBF4] text-[#4A3B32] font-sans antialiased">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-60 shrink-0">
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-[#EBE7D9]">
            <h2 className="font-bold text-lg text-[#8C3B1A]">Bộ lọc</h2>
            {(filters.categoryId || filters.conditionStatus || filters.minPrice || filters.maxPrice) && (
              <button onClick={handleResetFilters} className="text-xs text-red-600 hover:underline font-medium">
                Xóa tất cả
              </button>
            )}
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-sm mb-3">Danh mục</h3>
            <div className="space-y-2 text-sm text-gray-600">
              {categories.map((cat) => (
                <label key={cat.id} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={filters.categoryId === cat.id}
                    onChange={() => handleCategoryChange(cat.id)}
                    className="rounded text-[#A14A24] focus:ring-[#A14A24] border-gray-300 accent-[#A14A24]"
                  />
                  <span className={filters.categoryId === cat.id ? 'font-medium text-[#4A3B32]' : ''}>{cat.name}</span>
                </label>
              ))}
              {categories.length === 0 && <p className="text-xs text-gray-400 italic">Đang tải danh mục...</p>}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-sm mb-3">Tình trạng</h3>
            <div className="space-y-2 text-sm text-gray-600">
              {conditions.map((status) => (
                <label key={status} className="flex items-center space-x-2 cursor-pointer uppercase">
                  <input
                    type="checkbox"
                    checked={filters.conditionStatus === status}
                    onChange={() => handleConditionChange(status)}
                    className="rounded text-[#A14A24] focus:ring-[#A14A24] border-gray-300 accent-[#A14A24]"
                  />
                  <span className={filters.conditionStatus === status ? 'font-medium text-[#4A3B32]' : ''}>
                    {status.replace('_', ' ')}
                  </span>
                </label>
              ))}
              {conditions.length === 0 && <p className="text-xs text-gray-400 italic">Đang tải tình trạng...</p>}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-sm mb-3">Mức giá</h3>
            <form onSubmit={handlePriceSubmit} className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  placeholder="Từđ"
                  value={priceInput.min}
                  onChange={(event) => setPriceInput((prev) => ({ ...prev, min: event.target.value }))}
                  className="w-full bg-[#EDE9DA] border-none rounded px-3 py-1.5 text-xs focus:ring-1 focus:ring-[#A14A24] placeholder-gray-500 outline-none"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  placeholder="Đếnđ"
                  value={priceInput.max}
                  onChange={(event) => setPriceInput((prev) => ({ ...prev, max: event.target.value }))}
                  className="w-full bg-[#EDE9DA] border-none rounded px-3 py-1.5 text-xs focus:ring-1 focus:ring-[#A14A24] placeholder-gray-500 outline-none"
                />
              </div>
              <button type="submit" className="w-full text-center text-xs bg-[#A14A24] text-white py-1.5 rounded hover:bg-[#8C3B1A] font-medium transition-colors">
                Áp dụng khoảng giá
              </button>
            </form>
          </div>
        </aside>

        <main className="flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-[#EBE7D9] gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#8C3B1A]">
                {filters.categoryId ? categories.find((c) => c.id === filters.categoryId)?.name : 'Tất cả sản phẩm'}
              </h1>
              <p className="text-xs text-gray-500 mt-1">Tìm thấy {pagination.totalElements} sản phẩm</p>
            </div>

            <div className="flex items-center space-x-2 self-end sm:self-auto">
              <div ref={searchRef} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const kw = searchQuery.trim();
                      setFilters((prev) => ({ ...prev, keyword: kw, page: 0 }));
                      setIsSuggestionsOpen(false);
                    }
                  }}
                  placeholder="Tìm tên sản phẩm..."
                  className="w-64 bg-white border border-[#EBE7D9] rounded px-3 py-1.5 text-sm text-[#4A3B32] focus:ring-1 focus:ring-[#A14A24] outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setFilters((prev) => ({ ...prev, keyword: '', page: 0 }));
                      setIsSuggestionsOpen(false);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
                    aria-label="Clear search"
                  >
                    ✕
                  </button>
                )}
                {isSuggestionsOpen && suggestions.length > 0 && (
                  <div className="absolute right-0 left-0 mt-1 bg-white border border-[#EDE9DA] rounded shadow-md z-50 overflow-hidden">
                    {suggestions.map((p) => (
                      <Link
                        key={p.id}
                        to={`/products/${p.id}`}
                        onClick={() => {
                          setSearchQuery('');
                          setIsSuggestionsOpen(false);
                        }}
                        className="block px-3 py-2 text-sm text-[#4A3B32] hover:bg-gray-50"
                      >
                        {p.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Link
                key={product.id}
                to={`/products/${product.id}`}
                onClick={() => {
                  sessionStorage.setItem('products_scroll_pos', window.scrollY.toString());
                }}
                className="bg-white rounded-xl shadow-sm border border-[#F0ECE0] overflow-hidden flex flex-col group hover:shadow-md transition-shadow cursor-pointer block"
              >
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

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-sm text-[#4A3B32] line-clamp-1 mb-1">{product.name}</h3>
                    <p className="font-bold text-base text-[#A14A24]">{formatVND(product.price)}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Đã bán: {product.soldCount || 0}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#F7F5EE] flex items-center justify-between text-[11px] text-gray-500">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-orange-300 text-white flex items-center justify-center font-bold text-[9px]">
                        {product.shopName ? product.shopName.substring(0, 2).toUpperCase() : 'TC'}
                      </div>
                      <p className="font-medium text-[#4A3B32]">{product.shopName || 'Tiệm đồ cũ'}</p>
                    </div>
                    <span className="bg-[#F4F1E6] px-1.5 py-0.5 rounded text-gray-600 font-medium tracking-wide">
                      {product.categoryName || 'Đồ Chill'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {products.length === 0 && <div className="text-center py-16 text-gray-400 italic">Không có sản phẩm nào khớp với bộ lọc bạn chọn.</div>}

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
                  return (
                    <span key={index} className="text-gray-400 text-xs px-0.5">
                      ...
                    </span>
                  );
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

      <footer className="bg-[#F5F2E6] border-t border-[#EBE7D9] mt-20 py-10 text-center">
        <div className="max-w-7xl mx-auto px-4">
          <h3 className="font-bold text-lg text-[#8C3B1A] mb-2">Tủ cũ chill</h3>
          <p className="text-[11px] text-gray-400">© 2026 Tiệm Cũ - Chạm vào ký ức, sẻ chia phong cách.</p>
        </div>
      </footer>
    </div>
  );
}
