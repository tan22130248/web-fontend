import React from 'react';

export default function Navbar({ onLogout, userName }) {
  return (
    <nav style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 48px', backgroundColor: '#f9f4ee', borderBottom: '1px solid #ede5db'
    }}>
      <span style={{ color: '#c0392b', fontWeight: 700, fontSize: 20, fontStyle: 'italic' }}>
        Tiệm Cũ
      </span>
      <div style={{ display: 'flex', gap: 32 }}>
        {['Khám Phá', 'Cửa Hàng', 'Về Chúng Tôi'].map(t => (
          <a key={t} href="#" style={{ color: '#666', fontSize: 14, fontWeight: 500 }}>
            {t}
          </a>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ color: '#888', fontSize: 18, cursor: 'pointer' }}>♡</span>
        <span style={{ color: '#888', fontSize: 18, cursor: 'pointer' }}>🛍</span>
        <div style={{
          width: 32, height: 32, borderRadius: '50%', backgroundColor: '#5c3d3d',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          overflow: 'hidden', cursor: 'pointer'
        }}>
          <img src="https://i.pravatar.cc/32?img=47" alt="avatar" style={{ width: '100%', height: '100%' }} />
        </div>
      </div>
    </nav>
  );
}
