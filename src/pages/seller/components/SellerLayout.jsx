import React, { useEffect, useMemo, useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../../../components/common/Navbar';

const menuItems = [
  { path: '/seller/dashboard', label: 'Bảng điều khiển', icon: '📊' },
  { path: '/seller/products', label: 'Sản phẩm', icon: '👗' },
  { path: '/seller/orders', label: 'Đơn hàng', icon: '📦' },
  { path: '/seller/analytics', label: 'Phân tích', icon: '📈' },
  { path: '/seller/profile', label: 'Hồ sơ cửa hàng', icon: '🏪' },
];

export default function SellerLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const currentSection = useMemo(
    () => menuItems.find((item) => location.pathname === item.path || location.pathname.startsWith(`${item.path}/`)),
    [location.pathname]
  );

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  return (
    <div className="min-h-screen bg-[#FCFBF4] text-[#4A3B32] font-sans antialiased">
      <Navbar />
      {isMenuOpen && (
        <button type="button" aria-label="Đóng menu" onClick={() => setIsMenuOpen(false)} className="fixed inset-x-0 bottom-0 top-16 z-30 bg-black/30 md:hidden" />
      )}

      <aside className={`fixed bottom-0 left-0 top-16 z-40 flex w-64 flex-col justify-between border-r border-[#EBE7D9] bg-[#F7F5EC] p-4 transition-transform duration-200 md:translate-x-0 ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div>
          <div className="mb-6 flex justify-end px-4 py-3">
            <button type="button" onClick={() => setIsMenuOpen(false)} className="rounded-lg p-1 text-gray-500 hover:bg-[#EDE9DA] md:hidden" aria-label="Đóng menu">✕</button>
          </div>
          <nav className="space-y-1" aria-label="Điều hướng người bán">
            {menuItems.map((item) => (
              <Link key={item.path} to={item.path} className={`flex items-center space-x-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${isActive(item.path) ? 'bg-[#EFECCB] font-bold text-[#4A3B32]' : 'text-gray-500 hover:bg-[#EDE9DA] hover:text-[#4A3B32]'}`}>
                <span className="text-base">{item.icon}</span><span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
        <div className="space-y-2">
          <button type="button" onClick={() => navigate('/seller/products/create')} className="flex w-full items-center justify-center space-x-2 rounded-xl bg-[#C85C32] px-4 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#b04f29]"><span>+</span><span>Đăng sản phẩm</span></button>
          <Link to="/home" className="flex w-full items-center justify-center rounded-xl px-4 py-2 text-xs font-semibold text-gray-500 hover:bg-[#EDE9DA] hover:text-[#4A3B32]">← Quay lại trang mua sắm</Link>
        </div>
      </aside>

      <div className="flex min-h-[calc(100vh-64px)] flex-col md:pl-64">
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <button type="button" onClick={() => setIsMenuOpen(true)} className="mb-4 rounded-xl border border-[#EBE7D9] bg-white px-3 py-2 text-sm font-semibold text-[#4A3B32] md:hidden" aria-label="Mo menu">☰ Kênh bán</button>
          <Outlet />
        </main>
      </div>
    </div>
  );
}