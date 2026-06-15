import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminTopbar from '../../components/admin/AdminTopbar';
import { useAuth } from '../../context/AuthContext';

/**
 * Shared shell for every admin screen. Renders the route-aware sidebar + topbar
 * and exposes the global search query to nested pages via the <Outlet /> context.
 */
export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const handleLogout = () => {
    Swal.fire({
      title: 'Đăng xuất',
      text: 'Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Đăng xuất',
      cancelButtonText: 'Hủy',
      background: '#fdf8f2',
      color: '#3f3d2e',
      buttonsStyling: false,
      customClass: {
        popup: 'rounded-2xl border border-[#ede5db] p-6',
        confirmButton:
          'bg-[#d4711e] hover:bg-[#c25f10] text-white px-6 py-2.5 rounded-xl font-bold text-sm transition active:scale-[0.98] outline-none border-none mx-2 cursor-pointer',
        cancelButton:
          'bg-[#a89d91] hover:bg-[#96897c] text-white px-6 py-2.5 rounded-xl font-bold text-sm transition active:scale-[0.98] outline-none border-none mx-2 cursor-pointer',
      },
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        toast.success('Đăng xuất thành công!');
        navigate('/home');
      }
    });
  };

  return (
    <div className="grid min-h-screen grid-cols-1 bg-[#fefee5] font-body text-[#3f3d2e] lg:grid-cols-[250px_minmax(0,1fr)]">
      <AdminSidebar />
      <main className="min-w-0 px-3.5 py-3.5 sm:px-7 sm:py-[18px]">
        <AdminTopbar user={user} query={query} onQueryChange={setQuery} onLogout={handleLogout} />
        <Outlet context={{ query, setQuery }} />
      </main>
    </div>
  );
}
