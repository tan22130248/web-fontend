import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';
import Navbar from '../../components/common/Navbar';
import Sidebar from '../../components/profile/Sidebar';
import ProfileForm from '../../components/profile/ProfileForm';
import OrderHistory from '../../components/profile/OrderHistory';
import Footer from '../../components/common/Footer';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('profile');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
        confirmButton: 'bg-[#d4711e] hover:bg-[#c25f10] text-white px-6 py-2.5 rounded-xl font-bold text-sm transition active:scale-[0.98] outline-none border-none mx-2 cursor-pointer',
        cancelButton: 'bg-[#a89d91] hover:bg-[#96897c] text-white px-6 py-2.5 rounded-xl font-bold text-sm transition active:scale-[0.98] outline-none border-none mx-2 cursor-pointer'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        toast.success('Đăng xuất thành công!');
        navigate('/home');
      }
    });
  };

  const menuItems = [
    { key: 'profile', label: 'Thông tin cá nhân', icon: '👤' },
    { key: 'orders', label: 'Lịch sử mua hàng', icon: '🕐' },
    { key: 'wishlist', label: 'Yêu thích', icon: '🤍' },
  ];

  return (
    <div style={{ fontFamily: "'Be Vietnam Pro', sans-serif", minHeight: '100vh', backgroundColor: '#f9f4ee' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input, textarea { font-family: inherit; }
        a { text-decoration: none; }
      `}</style>

      <Navbar userName={user?.username || user?.email} />

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '28px 20px 60px', minHeight: '95vh' }}>
        {/* HERO CARD */}
        <div style={{
          borderRadius: 16,
          padding: '24px 28px',
          marginBottom: 24,
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(120deg, #fffaf7 50%, #fce5d8 100%)',
          boxShadow: '0 1px 6px rgba(0,0,0,0.06)'
        }}>
          <div style={{
            position: 'absolute', right: 30, top: -10, width: 160, height: 120,
            borderRadius: '50%', background: 'radial-gradient(circle, #f8c4ae 0%, transparent 65%)',
            opacity: 0.45, pointerEvents: 'none'
          }} />

          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div style={{
              width: 60, height: 88, backgroundColor: '#3a2828', borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.25)'
            }}>
              <div style={{
                width: 44, height: 76, borderRadius: 8,
                background: 'linear-gradient(160deg,#c4a07a,#9a6f4a)', overflow: 'hidden'
              }}>
                <div style={{ width: '100%', height: 28, marginTop: 28, background: 'rgba(0,0,0,0.15)' }} />
              </div>
            </div>
            <div style={{
              position: 'absolute', bottom: -4, right: -4, width: 20, height: 20,
              backgroundColor: '#c0392b', borderRadius: '50%', display: 'flex',
              alignItems: 'center', justifyContent: 'center', color: 'white',
              fontSize: 10, boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
            }}>✎</div>
          </div>

          <div>
            <h1 style={{ fontSize: 26, fontWeight: 700, color: '#2d1f1f', marginBottom: 4 }}>
              Xin chào, {user?.fullName || user?.username || user?.email}
            </h1>
            {user?.phone && (
              <p style={{ fontSize: 14, color: '#6b5a52', marginBottom: 8 }}>
                Số điện thoại: {user.phone}
              </p>
            )}
            <p style={{ fontSize: 13, color: '#9e8c82', marginBottom: 12 }}>
              Thành viên thân thiết • {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'Tham gia'}
            </p>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 20,
              padding: '5px 14px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
            }}>
              <span style={{ color: '#e0a020', fontSize: 13 }}>★</span>
              <span style={{ fontSize: 11, color: '#9e8c82', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Tiệm Points
              </span>
              <span style={{ fontSize: 13, color: '#c0392b', fontWeight: 700 }}>1.250 điểm</span>
            </div>
          </div>
        </div>

        {/* TWO-COLUMN */}
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} menuItems={menuItems} onLogout={handleLogout} />

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}>
            {activeTab === 'profile' && <ProfileForm />}
            {activeTab === 'orders' && <OrderHistory />}
            {activeTab === 'wishlist' && (
              <div style={{
                backgroundColor: 'white', borderRadius: 14, padding: '22px 24px',
                boxShadow: '0 1px 5px rgba(0,0,0,0.06)', border: '1px solid #ede5db'
              }}>
                <h2 style={{ fontSize: 14, fontWeight: 600, color: '#555', marginBottom: 18 }}>
                  <span>🤍</span> Danh sách yêu thích
                </h2>
                <p style={{ color: '#999', textAlign: 'center', padding: '40px 20px' }}>
                  Chức năng đang được phát triển
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
