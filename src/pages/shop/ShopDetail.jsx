import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import shopService from '../../services/shopService';
import { ArrowLeft } from 'lucide-react';

export default function ShopDetail() {
  const { shopId } = useParams();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSize, setSelectedSize] = useState('all');
  const [sortBy, setSortBy] = useState('Mới Nhất');
  const [shopInfo, setShopInfo] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([{ id: 'all', name: 'Tất Cả Sản Phẩm' }]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shopId) return;
    let cancelled = false;
    setLoading(true);
    Promise.all([
      shopService.getById(shopId),
      shopService.getProducts(shopId, 0, 12)
    ]).then(([shopRes, productsRes]) => {
      if (cancelled) return;
      setShopInfo(shopRes || null);
      setProducts(productsRes || []);
      
      // Extract unique categories from products
      const uniqueCats = new Set(
        (productsRes || [])
          .map(p => p.categoryName)
          .filter(Boolean)
      );
      setCategories([
        { id: 'all', name: 'Tất Cả Sản Phẩm' },
        ...Array.from(uniqueCats).map(cat => ({
          id: cat.toLowerCase().replace(/\s+/g, '-'),
          name: cat
        }))
      ]);
      
      setLoading(false);
    }).catch(err => {
      console.error('Failed to load shop detail', err);
      if (!cancelled) setLoading(false);
    });

    return () => { cancelled = true; };
  }, [shopId]);

  // Filter products based on selected category and size
  useEffect(() => {
    let filtered = products;
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => 
        p.categoryName?.toLowerCase().replace(/\s+/g, '-') === selectedCategory
      );
    }
    
    setFilteredProducts(filtered);
  }, [products, selectedCategory]);

  // Static sizes list (can be enhanced later with variant fetching)
  const sizes = ['S', 'M', 'L', 'XL', 'Freesize'];

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate('/explore');
  };

  return (
    <div className="min-h-screen bg-[#FCFBF4] text-[#4A3B32] font-sans antialiased flex flex-col justify-between">
      <div className="max-w-5xl w-full mx-auto px-4 pt-4">
        <button
          type="button"
          onClick={handleBack}
          aria-label="Quay lại trang trước"
          className="inline-flex items-center gap-2 rounded-full border border-[#EBE7D9] bg-white px-4 py-2 text-xs font-bold text-[#8C3B1A] shadow-sm transition-all hover:border-[#C85C32] hover:text-[#C85C32] active:scale-[0.98]"
        >
          <ArrowLeft size={16} strokeWidth={2.5} />
          Quay lại
        </button>
      </div>

      {/* Tiêu đề ẩn hỗ trợ SEO hoặc định danh cấu trúc */}
      <div className="max-w-5xl w-full mx-auto px-4 pt-4 text-xs text-gray-400 font-medium">
        Cửa hàng {shopInfo?.shopName || 'Tiệm Cũ'} - Danh sách sản phẩm
      </div>

      {/* 2. MAIN CONTAINER */}
      <main className="max-w-5xl w-full mx-auto px-4 py-4 space-y-8 flex-1">
        
        {/* BANNER THÔNG TIN SHOP CHÍNH */}
        <div className="bg-gradient-to-r from-[#FFF9EE] to-[#FFF1DE] border border-[#F3E5D3] p-6 rounded-3xl flex flex-col sm:flex-row items-center gap-6 shadow-sm relative overflow-hidden">
          {/* Avatar Shop */}
          <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-sm shrink-0">
            <img 
              src={shopInfo?.avatarUrl || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300'} 
              alt={shopInfo?.shopName || 'Shop'} 
              className="w-full h-full object-cover"
            />
            {/* Tích xanh uy tín nhỏ ở góc */}
            <span className="absolute bottom-1 right-1 bg-emerald-500 text-white text-[8px] p-0.5 rounded-full" title="Shop xác minh">✓</span>
          </div>

          {/* Chi tiết text của Shop */}
          <div className="flex-1 text-center sm:text-left space-y-2">
            <h1 className="text-2xl font-black text-[#8C3B1A]">{shopInfo?.shopName || 'Tên cửa hàng'}</h1>
            <p className="text-xs text-gray-500 max-w-xl leading-relaxed">
              {shopInfo?.description || 'Mô tả cửa hàng tạm thời.'}
            </p>
            
            {/* Thống kê phụ của shop */}
            <div className="flex flex-wrap justify-center sm:justify-start items-center gap-x-4 gap-y-1 text-[10px] text-gray-400 font-medium">
              <span className="text-amber-600 font-bold">★ {shopInfo?.rating || '—'} <span className="text-gray-400 font-normal">({shopInfo?.reviewCount || '—'} đánh giá)</span></span>
              <span>📍 {shopInfo?.address || '—'}</span>
              <span>📅 Tham gia {shopInfo?.joinDate ? new Date(shopInfo.joinDate).getFullYear() : '—'}</span>
            </div>
          </div>

          {/* Cụm nút tương tác bên phải */}
          <div className="flex items-center space-x-2 shrink-0 self-center sm:self-start md:self-center">
            <button className="bg-[#C85C32] hover:bg-[#b04f29] text-white font-bold text-xs px-5 py-2 rounded-xl transition-colors shadow-sm flex items-center gap-1">
              <span>+</span> Theo Dõi
            </button>
            <button className="bg-white hover:bg-[#FAF8F0] border border-[#EBE7D9] p-2 rounded-xl text-gray-500 transition-colors shadow-sm">
              💬
            </button>
          </div>
        </div>

        {/* BỐ CỤC PHÂN TRANG: BỘ LỌC TRÁI & SẢN PHẨM PHẢI */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* ================= BỘ LỌC BÊN TRÁI (3 CỘT) ================= */}
          <aside className="md:col-span-3 space-y-6 bg-[#FAF9F3] p-5 rounded-2xl border border-[#F0ECE0]">
            <div className="text-xs font-black uppercase tracking-wider text-[#4A3B32] flex items-center gap-1">
              <span>🎛️</span> Bộ Lọc
            </div>

            {/* Khối lọc danh mục */}
            <div className="space-y-2.5">
              <span className="text-[10px] font-bold text-gray-400 tracking-wide uppercase block">Danh Mục</span>
              <div className="space-y-2">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className="flex items-center space-x-2 w-full text-left text-xs font-bold transition-colors group"
                  >
                    <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                      selectedCategory === cat.id ? 'border-[#C85C32] bg-[#C85C32]' : 'border-gray-300 bg-white'
                    }`}>
                      {selectedCategory === cat.id && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                    </span>
                    <span className={selectedCategory === cat.id ? 'text-[#C85C32]' : 'text-gray-500 group-hover:text-[#4A3B32]'}>
                      {cat.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Khối lọc kích cỡ */}
            <div className="space-y-2.5 pt-2 border-t border-[#EBE7D9]">
              <span className="text-[10px] font-bold text-gray-400 tracking-wide uppercase block">Kích Cỡ</span>
              <div className="flex flex-wrap gap-1.5">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`text-[10px] font-bold px-2.5 py-1.5 rounded-lg border transition-all ${
                      selectedSize === size
                        ? 'bg-[#8C3B1A] border-[#8C3B1A] text-white'
                        : 'bg-white border-[#EBE7D9] text-gray-500 hover:border-gray-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* ================= LƯỚI SẢN PHẨM BÊN PHẢI (9 CỘT) ================= */}
          <section className="md:col-span-9 space-y-4">
            {/* Thanh điều khiển sắp xếp sản phẩm */}
            <div className="flex justify-end items-center space-x-2 text-xs">
              <span className="text-gray-400 font-medium">Sắp xếp:</span>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent font-bold text-[#8C3B1A] outline-none cursor-pointer border-none p-0 pr-1"
              >
                <option value="Mới Nhất">Mới Nhất</option>
                <option value="Giá Thấp">Giá: Thấp đến Cao</option>
                <option value="Giá Cao">Giá: Cao đến Thấp</option>
              </select>
            </div>

            {/* Grid hiển thị danh sách sản phẩm */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.length > 0 ? filteredProducts.map((product) => (
                <div key={product.id} onClick={() => navigate(`/products/${product.id}`)} className="group cursor-pointer space-y-2">
                  
                  {/* Khung ảnh sản phẩm hình chữ nhật đứng dọc */}
                  <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-gray-100 border border-[#F0ECE0] shadow-sm">
                    <img 
                      src={product.imageUrl || product.img} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                    
                    {/* Nhãn Tag điều kiện góc ảnh nếu có */}
                    {product.tag && (
                      <span className={`absolute top-3 left-3 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${
                        product.tagType === 'green' ? 'bg-[#E3ECCB] text-[#556B2F]' : 'bg-[#FCE3D9] text-[#A14A24]'
                      }`}>
                        {product.tag === 'LIKE NEW' ? '✳ LIKE NEW' : '🔥 ' + product.tag}
                      </span>
                    )}
                  </div>

                  {/* Thông tin Text mô tả chân sản phẩm */}
                  <div className="space-y-0.5 px-1">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-bold text-xs text-[#4A3B32] line-clamp-1 group-hover:text-[#8C3B1A] transition-colors">
                        {product.name}
                      </h4>
                      <span className="font-black text-xs text-[#8C3B1A] shrink-0">{product.price ? (Number(product.price).toLocaleString('vi-VN') + 'đ') : (product.priceLabel || '––')}</span>
                    </div>
                    <p className="text-[10px] text-gray-400 font-medium">{product.desc}</p>
                  </div>

                </div>
              )) : (
                <div className="col-span-3 text-center text-gray-400 py-8">
                  <p className="text-sm font-medium">Không có sản phẩm nào</p>
                </div>
              )}
            </div>
          </section>

        </div>
      </main>

      {/* 3. RETRO FOOTER */}
      <footer className="w-full bg-[#FCFBF4] border-t border-[#EBE7D9] py-6 text-center text-[11px] text-gray-400 font-medium mt-16">
        <p className="text-[10px] opacity-75">© 2026 Tiệm Cũ - Nền tảng kết nối thời trang cổ điển.</p>
      </footer>

    </div>
  );
}