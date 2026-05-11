import React from 'react';

export default function OrderHistory() {
  const orders = [
    {
      id: '#TC-8492',
      name: 'Áo khoác Vintage Denim',
      date: '24 Tháng 10, 2023',
      status: 'Đang giao',
      actions: ['Chi tiết'],
      done: false,
    },
    {
      id: '#TC-8105',
      name: 'Túi xách da thủ công',
      date: '12 Tháng 10, 2023',
      status: 'Hoàn thành',
      actions: ['Mua lại', 'Đánh giá'],
      done: true,
    },
  ];

  return (
    <div style={{
      backgroundColor: 'white', borderRadius: 14, padding: '22px 24px',
      boxShadow: '0 1px 5px rgba(0,0,0,0.06)', border: '1px solid #ede5db'
    }}>
      <h2 style={{
        fontSize: 14, fontWeight: 600, color: '#555', marginBottom: 16,
        display: 'flex', alignItems: 'center', gap: 7
      }}>
        <span>🛍</span> Đơn hàng gần đây
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {orders.map(order => (
          <div
            key={order.id}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              border: '1px solid #f3ebe3', borderRadius: 12, padding: '14px 16px',
              backgroundColor: '#fffdf9'
            }}
          >
            {/* Left */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  backgroundColor: order.done ? '#f3f3f3' : '#fde8de',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 16
                }}
              >
                {order.done ? '✅' : '📦'}
              </div>
              <div>
                <p style={{
                  fontSize: 10, color: '#bbb', fontFamily: 'monospace',
                  marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.05em'
                }}>
                  Mã đơn · {order.id}
                </p>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 2 }}>
                  {order.name}
                </p>
                <p style={{ fontSize: 12, color: '#aaa' }}>{order.date}</p>
              </div>
            </div>

            {/* Right */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
              <span
                style={{
                  fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20,
                  backgroundColor: order.done ? '#f0f0f0' : '#e6f9ee',
                  color: order.done ? '#999' : '#27ae60'
                }}
              >
                {!order.done && '⟳ '}{order.status}
              </span>
              <div style={{ display: 'flex', gap: 12 }}>
                {order.actions.map(a => (
                  <button
                    key={a}
                    style={{
                      fontSize: 12, color: '#c0392b', fontWeight: 500,
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontFamily: 'inherit', padding: 0
                    }}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
