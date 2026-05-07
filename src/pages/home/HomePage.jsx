import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function HomePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* Navbar */}
      <header className="bg-white border-b border-brand-100 px-6 py-4 flex items-center justify-between">
        <span className="font-display text-2xl font-bold text-brand-700">FashionHub</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-brand-600">Xin chào, <strong>{user?.username || user?.email}</strong></span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg bg-brand-500 text-white text-sm font-medium hover:bg-brand-600 transition-colors"
          >
            Đăng xuất
          </button>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-5xl mx-auto px-6 py-16 text-center">
        <h1 className="font-display text-5xl font-bold text-dark mb-4">
          Chào mừng đến FashionHub
        </h1>
        <p className="text-brand-500 text-lg">
          Khám phá hàng ngàn sản phẩm thời trang độc đáo từ các thương hiệu hàng đầu.
        </p>
      </main>
    </div>
  );
}
