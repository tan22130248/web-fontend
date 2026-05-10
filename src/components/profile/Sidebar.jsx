import React from 'react';

export default function Sidebar({ activeTab, setActiveTab, menuItems, onLogout }) {
  return (
    <div style={{
      flexShrink: 0, width: 172, backgroundColor: 'white', borderRadius: 14,
      boxShadow: '0 1px 5px rgba(0,0,0,0.06)', overflow: 'hidden', border: '1px solid #ede5db'
    }}>
      {menuItems.map(item => {
        const active = activeTab === item.key;
        return (
          <button
            key={item.key}
            onClick={() => setActiveTab(item.key)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '11px 14px', fontSize: 13, fontWeight: active ? 600 : 400,
              color: active ? '#c0392b' : '#666',
              backgroundColor: active ? '#fdf0ea' : 'transparent',
              border: 'none',
              borderLeft: active ? '3px solid #c0392b' : '3px solid transparent',
              cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
              transition: 'background 0.15s'
            }}
          >
            <span style={{ fontSize: 15 }}>{item.icon}</span>
            {item.label}
          </button>
        );
      })}
      <div style={{ borderTop: '1px solid #f3ebe3' }}>
        <button
          onClick={onLogout}
          style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 10,
            padding: '11px 14px', fontSize: 13, color: '#aaa', backgroundColor: 'transparent',
            border: 'none', borderLeft: '3px solid transparent', cursor: 'pointer',
            textAlign: 'left', fontFamily: 'inherit'
          }}
        >
          <span>↩</span> Đăng xuất
        </button>
      </div>
    </div>
  );
}
