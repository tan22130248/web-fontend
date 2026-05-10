import React, { useState } from 'react';

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    console.log('Subscribe:', email);
    setEmail('');
  };

  return (
    <footer style={{ borderTop: '1px solid #ede5db', padding: '36px 48px', backgroundColor: '#f9f4ee' }}>
      <div style={{ maxWidth: 800, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 32 }}>
        <div>
          <p style={{ color: '#c0392b', fontWeight: 700, fontSize: 18, fontStyle: 'italic', marginBottom: 8 }}>
            Tiệm Cũ
          </p>
          <p style={{ fontSize: 12, color: '#aaa', lineHeight: 1.7 }}>
            Mang đến những sản phẩm thời trang và phong cách sống đậm chất riêng.
          </p>
        </div>
        {[
          { title: 'Về Tiệm Cũ', links: ['Câu chuyện', 'Cửa hàng', 'Liên hệ'] },
          { title: 'Hỗ trợ', links: ['Chính sách đổi trả', 'Hướng dẫn mua hàng', 'FAQ'] },
        ].map(col => (
          <div key={col.title}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 12 }}>
              {col.title}
            </p>
            {col.links.map(l => (
              <p key={l} style={{ fontSize: 12, color: '#aaa', marginBottom: 7, cursor: 'pointer' }}>
                {l}
              </p>
            ))}
          </div>
        ))}
        <div>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#555', marginBottom: 12 }}>
            Đăng ký nhận tin
          </p>
          <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: 6 }}>
            <input
              type="email"
              placeholder="Email của bạn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                flex: 1,
                border: '1px solid #e0d6cc',
                borderRadius: 8,
                padding: '7px 12px',
                fontSize: 12,
                outline: 'none',
                fontFamily: 'inherit',
                backgroundColor: 'white',
              }}
            />
            <button
              type="submit"
              style={{
                backgroundColor: '#c0392b',
                color: 'white',
                fontSize: 12,
                fontWeight: 600,
                padding: '7px 14px',
                borderRadius: 8,
                border: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Gửi
            </button>
          </form>
        </div>
      </div>
    </footer>
  );
}
