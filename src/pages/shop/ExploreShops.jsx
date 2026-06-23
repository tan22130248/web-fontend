import React, { useState, useEffect } from 'react';
import shopService from '../../services/shopService';

import { useNavigate } from 'react-router-dom';

export default function ExploreShops() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [featuredShops, setFeaturedShops] = useState([]);
  const [newVerifiedShops, setNewVerifiedShops] = useState([]);
  const [weeklyShop, setWeeklyShop] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    
    shopService.getFeatured()
      .then(data => {
        console.log('Featured shops:', data);
        if (mounted) setFeaturedShops(data);
      })
      .catch(err => console.error('Error fetching featured:', err));
    
    shopService.getWeekly()
      .then(data => {
        console.log('Weekly shop:', data);
        if (mounted) setWeeklyShop(data);
      })
      .catch(err => console.error('Error fetching weekly:', err));
    
    shopService.getNewlyVerified()
      .then(data => {
        console.log('Newly verified:', data);
        if (mounted) setNewVerifiedShops(data);
      })
      .catch(err => console.error('Error fetching newly verified:', err));
    
    return () => { mounted = false; };
  }, []);

  return (
    <div className="min-h-screen bg-[#FCFBF4] text-[#4A3B32] font-sans antialiased flex flex-col justify-between">
      
      {/* 1. TOP NAVBAR (Dành riêng cho giao diện Khách mua hàng) */}
      <header className="h-16 border-b border-[#EBE7D9] px-4 md:px-16 flex items-center justify-between bg-[#FCFBF4] sticky top-0 z-50">
        <div className="text-lg font-black italic text-[#A14A24] tracking-wider">Tủ cũ chill</div>
        
        {/* Menu điều hướng chính */}
        <nav className="hidden md:flex items-center space-x-6 text-xs font-bold text-gray-500">
          <a href="#discover" className="text-[#A14A24] border-b-2 border-[#A14A24] pb-1">Khám Phá</a>
          <a href="#shops" className="hover:text-[#4A3B32]">Cửa Hàng</a>
          <a href="#trends" className="hover:text-[#4A3B32]">Xu Hướng</a>
        </nav>

        {/* Cụm công cụ tìm kiếm & Icons tiện ích */}
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <button className="hover:text-[#A14A24]">🔍</button>
          <button className="hover:text-[#A14A24]">🔔</button>
          <button className="hover:text-[#A14A24]">🛒</button>
          <div className="w-7 h-7 rounded-full bg-orange-200 border border-white overflow-hidden cursor-pointer">
            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" alt="user avatar" className="w-full h-full object-cover" />
          </div>
        </div>
      </header>

      {/* 2. KHỐI NỘI DUNG CHÍNH (MAIN BODY CONTAINER) */}
      <main className="max-w-5xl w-full mx-auto px-4 py-8 space-y-10">
        
        {/* Tiêu đề trang & Bộ lọc nhanh Tag */}
        <div className="space-y-4">
          <h1 className="text-3xl font-black text-[#8C3B1A]">Khám Phá Cửa Hàng</h1>
          <div className="flex flex-wrap gap-2 text-[10px] font-bold">
            <button className="border border-[#EBE7D9] bg-white px-3 py-1.5 rounded-lg text-gray-500 flex items-center gap-1">🎛️ Lọc</button>
            <button className="bg-[#E3ECCB] text-[#556B2F] px-3 py-1.5 rounded-lg">Uy Tín Cao</button>
            <button className="bg-white border border-[#EBE7D9] text-gray-500 px-3 py-1.5 rounded-lg">Gần Tôi</button>
            <button className="bg-white border border-[#EBE7D9] text-gray-500 px-3 py-1.5 rounded-lg">Thời Trang Y2K</button>
          </div>
        </div>

        {/* BOX LỚN: SHOP CỦA TUẦN (BANNER HIGHLIGHT) */}
        <div className="bg-gradient-to-r from-[#FFF6EC] to-[#FFEAD1] border border-[#F5E2CD] p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row items-center gap-6 shadow-sm">
          <img 
            src={weeklyShop?.imageUrl || "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=300&auto=format&fit=crop&q=80"} 
            alt={weeklyShop?.name || "Shop of the week"} 
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-white shadow-sm shrink-0"
          />
          <div className="space-y-2 text-center sm:text-left flex-1">
            <div className="flex flex-wrap justify-center sm:justify-start gap-1.5 items-center">
              <span className="text-[8px] font-black tracking-wide bg-[#C85C32] text-white px-2 py-0.5 rounded-md uppercase">Shop Của Tuần</span>
              <span className="text-[8px] font-black tracking-wide bg-white text-orange-700 border border-orange-200 px-2 py-0.5 rounded-md uppercase">{weeklyShop ? '✓ Xác Nhận' : '✓ Xác Nhận'}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#4A3B32]">{weeklyShop?.name || 'Vintage Saigon'}</h2>
            <p className="text-xs text-gray-500 max-w-md leading-relaxed">{weeklyShop?.description || 'Chuyên đồ si tuyển chọn phong cách retro & minimalism.'}</p>
            
            {/* Nhóm badge điểm số uy tín nhỏ */}
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-1 text-[10px] font-bold text-gray-500">
              <span className="bg-white/80 border border-orange-100 px-2 py-1 rounded-md text-amber-600">★ {weeklyShop?.rating || '4.9'}</span>
              <span className="bg-white/80 border border-orange-100 px-2 py-1 rounded-md">🛍️ {weeklyShop?.totalSold ? `${weeklyShop.totalSold} đã bán` : '12k đã bán'}</span>
              <span className="bg-white/80 border border-orange-100 px-2 py-1 rounded-md text-emerald-700">💬 {weeklyShop?.responseRate ? `${weeklyShop.responseRate}% phản hồi` : '98% phản hồi'}</span>
            </div>
            
            <div className="pt-2">
              <button className="bg-[#C85C32] hover:bg-[#b04f29] text-white font-bold text-xs px-5 py-2 rounded-xl transition-all shadow-sm">
                Ghé thăm shop →
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 1: GIAN HÀNG NỔI BẬT (GRID 6 SHOP NHỎ) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-black text-[#4A3B32]">Gian Hàng Nổi Bật</h3>
            <a href="#all" className="text-[11px] font-bold text-amber-700 hover:underline">Xem tất cả &gt;</a>
          </div>

          {/* Thanh tab nhỏ phân loại */}
          <div className="flex flex-wrap gap-1.5 text-[10px] font-bold">
            <button className="bg-[#8C3B1A] text-white px-3 py-1.5 rounded-lg" onClick={() => setActiveCategory('all')}>Tất cả</button>
            <button className="bg-white border border-[#EBE7D9] text-gray-400 px-3 py-1.5 rounded-lg hover:text-[#4A3B32]">Quần áo nữ</button>
            <button className="bg-white border border-[#EBE7D9] text-gray-400 px-3 py-1.5 rounded-lg hover:text-[#4A3B32]">Đồ nam</button>
            <button className="bg-white border border-[#EBE7D9] text-gray-400 px-3 py-1.5 rounded-lg hover:text-[#4A3B32]">Phụ kiện</button>
            <button className="bg-white border border-[#EBE7D9] text-gray-400 px-3 py-1.5 rounded-lg hover:text-[#4A3B32]">Giày dép</button>
          </div>

          {/* Lưới hiển thị các thẻ shop nổi bật */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredShops.length > 0 ? featuredShops.map((shop, i) => (
              <div key={i} onClick={() => navigate(`/shop/${shop.id}`)} className="bg-white p-4 rounded-2xl border border-[#F0ECE0] shadow-sm flex items-center justify-between hover:border-[#C85C32] transition-colors cursor-pointer">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-[#FAF9F5] border border-[#EBE7D9] flex items-center justify-center text-lg shadow-inner">
                    {shop.icon || '🏪'}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-[#4A3B32]">{shop.name}</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">{shop.category || 'Danh mục'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-black text-amber-500">★ {shop.rating?.toFixed(1) || '5.0'}</div>
                  <span className="text-[8px] font-bold text-gray-400 border border-gray-200 px-1 py-0.5 rounded uppercase tracking-tight block mt-1">
                    {shop.badge}
                  </span>
                </div>
              </div>
            )) : <div className="col-span-3 text-center text-gray-400 py-8">Chưa có gian hàng nổi bật</div>}
          </div>
        </div>

        {/* SECTION 2: SHOP MỚI ĐƯỢC XÁC NHẬN (LƯỚI THẺ ẢNH) */}
        <div className="space-y-4">
          <h3 className="text-base font-black text-[#4A3B32]">SHOP MỚI ĐƯỢC XÁC NHẬN</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {newVerifiedShops.length > 0 ? newVerifiedShops.map((item, idx) => (
              <div key={idx} className="group cursor-pointer space-y-2">
                {/* Khối card ảnh bọc tràn viền */}
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-sm border border-[#F0ECE0] bg-gray-100">
                  <img 
                    src={item.imageUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80"}
                    alt={item.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  />
                  {/* Nhãn tag "MỚI" đỏ cam nhỏ góc trái */}
                  <span className="absolute top-3 left-3 bg-[#E87745] text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider">
                    MỚI
                  </span>
                  {/* Tên shop gắn sát đáy nằm trên nền overlay mờ đen */}
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-4 flex items-center space-x-2">
                    <div className="w-5 h-5 rounded-full bg-white/20 text-white flex items-center justify-center text-[9px] backdrop-blur font-bold">🛒</div>
                    <span className="text-xs font-bold text-white tracking-wide">{item.name}</span>
                  </div>
                </div>
                {/* Thời gian tham gia hiển thị dưới card */}
                <p className="text-[10px] text-gray-400 pl-1 font-medium">{item.joinDateRelative || 'Tham gia gần đây'}</p>
              </div>
            )) : <div className="col-span-3 text-center text-gray-400 py-8">Chưa có shop mới được xác nhận</div>}
          </div>
        </div>

      </main>

      {/* 3. RETRO FOOTER TRANG NỀN TẢNG TIỆM CŨ */}
      <footer className="w-full bg-[#FCFBF4] border-t border-[#EBE7D9] py-8 text-center text-[11px] text-gray-400 font-medium space-y-3 mt-12">
        <div className="font-bold text-xs text-[#8C3B1A] uppercase tracking-wider">Tiệm Cũ</div>
        <div className="flex justify-center space-x-6 text-gray-400">
          <a href="#about" className="hover:underline">Về chúng mình</a>
          <a href="#privacy" className="hover:underline">Chính sách bảo mật</a>
          <a href="#payment" className="hover:underline">Hướng dẫn thanh toán</a>
          <a href="#contact" className="hover:underline">Liên hệ</a>
        </div>
        <p className="text-[10px] opacity-75">© 2026 Tiệm Cũ - Chạm vào ký ức, sẻ chia phong cách.</p>
      </footer>

    </div>
  );
}