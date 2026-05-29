import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import notificationService from '../../services/notificationService';
import { formatOrderDate } from '../../utils/orderUtils';

const mockNotifications = [
  { id: 1, title: 'Đơn hàng đã được xác nhận', message: 'Đơn hàng #TC-8492 của bạn đã được người bán xác nhận và đang chuẩn bị hàng.', isRead: false, createdAt: '2023-10-24T10:15:00Z', link: '/orders/TC-8492' },
  { id: 2, title: 'Giao hàng thành công', message: 'Đơn hàng #TC-8105 đã được giao thành công. Vui lòng kiểm tra và xác nhận.', isRead: true, createdAt: '2023-10-15T09:00:00Z', link: '/orders/TC-8105' },
  { id: 3, title: 'Đơn hàng bị từ chối', message: 'Đơn hàng #TC-9999 đã bị hủy bởi người bán do: Hết hàng.', isRead: true, createdAt: '2023-11-01T10:00:00Z', link: '/orders/TC-9999' }
];

export default function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await notificationService.getAll();
        setNotifications(res);
      } catch (error) {
        setNotifications(mockNotifications);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifs();
  }, []);

  const handleRead = async (id, link) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    }
    if (link) navigate(link);
  };

  const markAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch {
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#f9f4ee] font-body text-[#3f3d2e]">
      <Navbar />
      
      <main className="flex-1 min-h-[95vh] max-w-3xl w-full mx-auto px-4 py-8 md:py-12">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#ac4218]">Thông báo của bạn</h1>
          {unreadCount > 0 && (
            <button 
              onClick={markAllRead}
              className="text-sm font-medium text-brand-600 hover:text-brand-800 transition-colors"
            >
              Đánh dấu tất cả đã đọc
            </button>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-[#ede5db] overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-gray-500 font-medium">Đang tải thông báo...</div>
          ) : notifications.length === 0 ? (
            <div className="p-16 text-center">
              <div className="text-5xl opacity-30 mb-4">🔕</div>
              <p className="text-gray-500 text-lg">Bạn chưa có thông báo nào.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#ede5db]">
              {notifications.map(notif => (
                <div 
                  key={notif.id}
                  onClick={() => handleRead(notif.id, notif.link)}
                  className={`p-5 flex gap-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    !notif.isRead ? 'bg-[#fff8f5]' : ''
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 text-xl border ${
                    !notif.isRead ? 'bg-brand-100 text-brand-600 border-brand-200' : 'bg-gray-100 text-gray-400 border-gray-200'
                  }`}>
                    {notif.title.includes('thành công') ? '✅' : notif.title.includes('hủy') ? '❌' : '📦'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className={`font-semibold text-base ${!notif.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                        {notif.title}
                      </h3>
                      <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                        {new Date(notif.createdAt).toLocaleDateString('vi-VN', { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
                      </span>
                    </div>
                    <p className={`text-sm ${!notif.isRead ? 'text-gray-700 font-medium' : 'text-gray-500'}`}>
                      {notif.message}
                    </p>
                  </div>
                  {!notif.isRead && (
                    <div className="w-2.5 h-2.5 rounded-full bg-brand-500 self-center flex-shrink-0"></div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
