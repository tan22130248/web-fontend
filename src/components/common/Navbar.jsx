import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

export default function Navbar({ onLogout, userName }) {
  const navigate = useNavigate();
  const { itemCount } = useCart();
  
  return (
    <nav style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 48px', backgroundColor: '#f9f4ee', borderBottom: '1px solid #ede5db'
    }}>
      <Link to="/home" style={{ color: '#c0392b', fontWeight: 700, fontSize: 20, fontStyle: 'italic', textDecoration: 'none' }}>
        Tiệm Cũ
      </Link>
      <div style={{ display: 'flex', gap: 32 }}>
        {['Khám Phá', 'Cửa Hàng', 'Về Chúng Tôi'].map(t => (
          <a key={t} href="#" style={{ color: '#666', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>
            {t}
          </a>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => navigate('/notifications')}>
          <span style={{ color: '#888', fontSize: 20 }}>🔔</span>
        </div>
        
        <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => navigate('/cart')}>
          <span style={{ color: '#888', fontSize: 20 }}>🛍</span>
          {itemCount > 0 && (
            <span style={{
              position: 'absolute', top: -6, right: -10,
              backgroundColor: '#c0392b', color: 'white',
              fontSize: 10, fontWeight: 'bold',
              minWidth: 16, height: 16, borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '0 4px'
            }}>
              {itemCount}
            </span>
          )}
        </div>
        
        <div 
          onClick={() => navigate('/profile')}
          style={{
            width: 32, height: 32, borderRadius: '50%', backgroundColor: '#5c3d3d',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', cursor: 'pointer', marginLeft: 8
          }}
        >
          <img src="https://i.pravatar.cc/32?img=47" alt="avatar" style={{ width: '100%', height: '100%' }} />
        </div>
      </div>
    </nav>
  );
}
