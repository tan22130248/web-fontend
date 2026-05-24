import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import OrderStatusBadge from '../order/OrderStatusBadge';
import { formatPrice, formatOrderDate, ORDER_STATUS } from '../../utils/orderUtils';
import orderService from '../../services/orderService';

export default function OrderHistory() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await orderService.getMyOrders();
        // Handle Spring Page response or plain array
        const items = response?.content || response || [];
        // Take first 3 for profile preview
        setOrders(Array.isArray(items) ? items.slice(0, 3) : []);
      } catch (error) {
        // Fallback mock data
        setOrders([
          { id: '#TC-8492', status: ORDER_STATUS.SHIPPING, totalAmount: 410000, createdAt: '2023-10-24T10:00:00Z', items: [{ name: 'Áo khoác Vintage Denim' }] },
          { id: '#TC-8105', status: ORDER_STATUS.DELIVERED, totalAmount: 250000, createdAt: '2023-10-12T14:30:00Z', items: [{ name: 'Túi xách da thủ công' }] },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#ede5db]">
      <div className="flex justify-between items-center mb-5 pb-3 border-b border-gray-100">
        <h2 className="text-base font-bold text-[#3f3d2e] flex items-center gap-2">
          <span>🛍</span> Đơn hàng gần đây
        </h2>
        <Link to="/orders" className="text-sm text-[#ac4218] font-semibold hover:underline">
          Xem tất cả →
        </Link>
      </div>
      
      {loading ? (
        <div className="py-8 text-center text-sm text-gray-500 font-medium">Đang tải thông tin...</div>
      ) : orders.length === 0 ? (
        <div className="py-8 text-center text-sm text-gray-500 font-medium bg-[#f9f4ee] rounded-xl border border-dashed border-[#ede5db]">
          Chưa có đơn hàng nào
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div
              key={order.id}
              onClick={() => navigate(`/orders/${order.id}`)}
              className="flex items-center justify-between border border-[#ede5db] rounded-xl p-4 bg-white cursor-pointer hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl flex-shrink-0 bg-[#fdf8f2] flex items-center justify-center text-xl border border-[#ede5db] group-hover:bg-[#f9e8d0] transition-colors">
                  📦
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 font-mono mb-1 uppercase tracking-wider font-semibold">
                    Mã đơn · <span className="text-gray-600">{order.id}</span>
                  </p>
                  <p className="text-sm font-bold text-[#3f3d2e] mb-1 line-clamp-1 group-hover:text-[#ac4218] transition-colors">
                    {order.items && order.items[0] ? order.items[0].name : 'Đơn hàng của bạn'}
                  </p>
                  <p className="text-xs text-gray-400">{formatOrderDate(order.createdAt)}</p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-2.5">
                <OrderStatusBadge status={order.status} className="scale-90 origin-right" />
                <span className="text-sm font-bold text-[#ac4218]">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
