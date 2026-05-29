import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

export default function SellerLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { path: '/seller/dashboard', label: 'Bảng điều khiển', icon: '📊' },
    { path: '/seller/products', label: 'Sản phẩm', icon: '👗' },
    { path: '/seller/orders', label: 'Đơn hàng', icon: '📦' },
    { path: '/seller/analytics', label: 'Phân tích', icon: '📈' },
    { path: '/seller/profile', label: 'Hồ sơ cửa hàng', icon: '🏪' },
  ];

  return (
    <div className="min-h-screen bg-[#FCFBF4] flex text-[#4A3B32] font-sans antialiased">

      <aside className="w-64 bg-[#F7F5EC] border-r border-[#EBE7D9] flex flex-col justify-between p-4 fixed h-full top-0 left-0 z-20">
        <div>
          <div className="text-xl font-black italic tracking-wider text-[#A14A24] px-4 py-3 mb-6">
            Tủ cũ chill
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive
                    ? 'bg-[#EFECCB] text-[#4A3B32] font-bold'
                    : 'text-gray-500 hover:bg-[#EDE9DA] hover:text-[#4A3B32]'
                    }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <button
          onClick={() => navigate('/seller/products/create')}
          className="w-full bg-[#C85C32] hover:bg-[#b04f29] text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center space-x-2 shadow-sm transition-all text-sm"
        >          <span>+</span>
          <span>Đăng sản phẩm</span>
        </button>
      </aside>

      <div className="flex-1 pl-64 flex flex-col min-h-screen">

        <header className="h-16 border-b border-[#EBE7D9] px-8 flex items-center justify-between bg-[#FCFBF4]/80 backdrop-blur sticky top-0 z-10">
          <div className="relative w-96">
            <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Tìm kiếm người dùng, email..."
              className="w-full bg-[#EDE9DA]/60 border-none rounded-full pl-9 pr-4 py-2 text-xs focus:ring-1 focus:ring-[#A14A24] placeholder-gray-400 outline-none"
            />
          </div>

          <div className="flex items-center space-x-4">
            <button className="text-gray-500 hover:text-[#A14A24] relative p-1">
              🔔
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <div className="flex items-center space-x-2 cursor-pointer">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&auto=format&fit=crop&q=60"
                alt="Avatar"
                className="w-8 h-8 rounded-full object-cover border border-[#EBE7D9]"
              />
            </div>
          </div>
        </header>

        <main className="p-8 flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}