import React from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Bell, Package, ShoppingCart, User, Store, LogOut, Camera } from 'lucide-react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import ImageSearchModal from './ImageSearchModal';

export default function Navbar({ onLogout, userName }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { itemCount } = useCart();
  const { user, isAuthenticated, logout } = useAuth();

  const [showDropdown, setShowDropdown] = React.useState(false);
  const [isImageSearchOpen, setIsImageSearchOpen] = React.useState(false);
  const dropdownRef = React.useRef(null);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

  const isSeller = user?.role === 'seller';
  const isActive = (path) => location.pathname === path || location.pathname.startsWith(`${path}/`);

  const navItems = [
    { label: 'Khám phá', to: '/home' },
    { label: 'Cửa hàng', to: '/products' },
    ...(isAuthenticated ? [
      ...(isSeller ? [{ label: 'Kênh bán', to: '/seller/dashboard' }] : []),
      { label: 'Đơn hàng', to: isSeller ? '/seller/orders' : '/orders' },
    ] : []),
  ];

  return (
    <>
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 48px',
        backgroundColor: 'rgba(249, 244, 238, 0.95)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        borderBottom: '1px solid #ede5db',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <Link
        to="/home"
        style={{
          color: '#c0392b',
          fontWeight: 700,
          fontSize: 20,
          fontStyle: 'italic',
          textDecoration: 'none',
        }}
      >
        Tủ cũ chill
      </Link>

      <div
        style={{
          display: 'flex',
          gap: 24,
          position: 'absolute',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        {navItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            onClick={() => {
              if (item.to === '/products') {
                sessionStorage.removeItem('products_filters');
                sessionStorage.removeItem('products_price_input');
                sessionStorage.removeItem('products_scroll_pos');
              }
            }}
            style={{
              color: isActive(item.to) ? '#d4711e' : '#666',
              fontSize: 14,
              fontWeight: isActive(item.to) ? 700 : 500,
              textDecoration: 'none',
            }}
          >
            {item.label}
          </Link>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        {/* Image search camera icon */}
        <div
          style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
          onClick={() => setIsImageSearchOpen(true)}
          title="Tìm kiếm bằng hình ảnh"
        >
          <Camera size={20} color="#888" strokeWidth={2} />
        </div>

        {isAuthenticated ? (
          <>
            <div style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center' }} onClick={() => navigate('/notifications')} title="Thông báo">
              <Bell size={20} color="#888" strokeWidth={2} />
            </div>

            <div style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center' }} onClick={() => navigate(isSeller ? '/seller/orders' : '/orders')} title="Đơn hàng">
              <Package size={20} color="#888" strokeWidth={2} />
            </div>
 
            <div style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center' }} onClick={() => navigate('/cart')} title="Giỏ hàng">
              <ShoppingCart size={20} color="#888" strokeWidth={2} />
              {itemCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: -6,
                    right: -10,
                    backgroundColor: '#c0392b',
                    color: 'white',
                    fontSize: 10,
                    fontWeight: 'bold',
                    minWidth: 16,
                    height: 16,
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 4px',
                  }}
                >
                  {itemCount}
                </span>
              )}
            </div>

            {onLogout && (
              <button
                onClick={onLogout}
                style={{
                  border: '1px solid #d9cfc2',
                  backgroundColor: '#fff',
                  color: '#7a3516',
                  borderRadius: 10,
                  fontSize: 13,
                  fontWeight: 600,
                  padding: '7px 10px',
                  cursor: 'pointer',
                }}
              >
                Đăng xuất
              </button>
            )}

            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <div
                onClick={() => setShowDropdown(!showDropdown)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  backgroundColor: '#5c3d3d',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  marginLeft: 8,
                  border: '2px solid #ede5db',
                  transition: 'border-color 0.2s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#d4711e'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#ede5db'; }}
                title={userName || user?.username || user?.email || 'Tài khoản'}
              >
                <img src="https://i.pravatar.cc/32?img=47" alt="avatar" style={{ width: '100%', height: '100%' }} />
              </div>

              {showDropdown && (
                <div
                  style={{
                    position: 'absolute',
                    top: '110%',
                    right: 0,
                    backgroundColor: '#fff',
                    borderRadius: 12,
                    boxShadow: '0 4px 15px rgba(122, 53, 22, 0.15)',
                    border: '1px solid #ede5db',
                    padding: '8px 0',
                    minWidth: 170,
                    zIndex: 200,
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div
                    style={{
                      padding: '8px 16px',
                      borderBottom: '1px solid #f5ede4',
                      marginBottom: 4,
                    }}
                  >
                    <p style={{ fontSize: 13, fontWeight: 700, color: '#3f3d2e', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user?.username || user?.email || 'Người dùng'}
                    </p>
                    <p style={{ fontSize: 10, color: '#a89d91', margin: '2px 0 0 0', textTransform: 'uppercase', fontWeight: 600 }}>
                      {user?.role === 'seller' ? 'Người bán' : 'Người mua'}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      navigate('/profile');
                    }}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: '#4A3B32',
                      textAlign: 'left',
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      width: '100%',
                      transition: 'background-color 0.2s, color 0.2s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fdf8f2'; e.currentTarget.style.color = '#d4711e'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#4A3B32'; }}
                  >
                    <User size={16} strokeWidth={2} />
                    <span>Trang cá nhân</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      navigate(isSeller ? '/seller/orders' : '/orders');
                    }}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: '#4A3B32',
                      textAlign: 'left',
                      fontSize: 13,
                      fontWeight: 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      width: '100%',
                      transition: 'background-color 0.2s, color 0.2s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fdf8f2'; e.currentTarget.style.color = '#d4711e'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#4A3B32'; }}
                  >
                    <Package size={16} strokeWidth={2} />
                    <span>Đơn mua của tôi</span>
                  </button>

                  {isSeller && (
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        navigate('/seller/dashboard');
                      }}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: '#4A3B32',
                        textAlign: 'left',
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        width: '100%',
                        transition: 'background-color 0.2s, color 0.2s',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fdf8f2'; e.currentTarget.style.color = '#d4711e'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#4A3B32'; }}
                    >
                      <Store size={16} strokeWidth={2} />
                      <span>Kênh bán hàng</span>
                    </button>
                  )}

                  <div style={{ height: 1, backgroundColor: '#f5ede4', margin: '4px 0' }} />

                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      handleLogout();
                    }}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: '#c0392b',
                      textAlign: 'left',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      width: '100%',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fdf8f2'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <LogOut size={16} strokeWidth={2} />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div style={{ position: 'relative', cursor: 'pointer', marginRight: 8, display: 'flex', alignItems: 'center' }} onClick={() => navigate('/cart')} title="Giỏ hàng">
              <ShoppingCart size={20} color="#888" strokeWidth={2} />
              {itemCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: -6,
                    right: -10,
                    backgroundColor: '#c0392b',
                    color: 'white',
                    fontSize: 10,
                    fontWeight: 'bold',
                    minWidth: 16,
                    height: 16,
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 4px',
                  }}
                >
                  {itemCount}
                </span>
              )}
            </div>

            <Link
              to="/auth?mode=login"
              style={{
                border: '1px solid #d4711e',
                backgroundColor: 'transparent',
                color: '#d4711e',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                padding: '7px 15px',
                cursor: 'pointer',
                textDecoration: 'none',
              }}
            >
              Đăng nhập
            </Link>
            <Link
              to="/auth?mode=register"
              style={{
                backgroundColor: '#d4711e',
                color: '#fff',
                borderRadius: 10,
                fontSize: 13,
                fontWeight: 600,
                padding: '7px 15px',
                cursor: 'pointer',
                textDecoration: 'none',
              }}
            >
              Đăng ký
            </Link>
          </>
        )}
      </div>
    </nav>
    <ImageSearchModal isOpen={isImageSearchOpen} onClose={() => setIsImageSearchOpen(false)} />
    </>
  );
}
