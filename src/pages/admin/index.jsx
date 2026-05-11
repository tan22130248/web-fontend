import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <span className="font-bold text-2xl text-red-700">Admin Dashboard</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">Xin chào, <strong>{user?.username || 'Admin'}</strong></span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors"
          >
            Đăng xuất
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">Admin xin chào 👋</h1>
          <p className="text-gray-600 text-xl mb-8">
            Chào mừng đến trang quản trị hệ thống
          </p>
          <div className="space-y-4">
            <p className="text-gray-500">Các tính năng quản trị sẽ được phát triển sớm:</p>
            <ul className="text-gray-600 space-y-2 inline-block text-left">
              <li>✓ Quản lý người dùng</li>
              <li>✓ Quản lý sản phẩm</li>
              <li>✓ Quản lý đơn hàng</li>
              <li>✓ Quản lý danh mục</li>
              <li>✓ Báo cáo thống kê</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
