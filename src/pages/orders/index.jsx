import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import OrderCard from '../../components/order/OrderCard';
import CancelOrderDialog from '../../components/order/CancelOrderDialog';
import RefundRequestDialog from '../../components/order/RefundRequestDialog';
import { ORDER_STATUS } from '../../utils/orderUtils';
import orderService from '../../services/orderService';

const TABS = [
  { key: 'all', label: 'Tất cả' },
  { key: ORDER_STATUS.PENDING_PAYMENT, label: 'Chờ thanh toán' },
  { key: ORDER_STATUS.PENDING, label: 'Chờ xác nhận' },
  { key: ORDER_STATUS.CONFIRMED, label: 'Đã xác nhận' },
  { key: ORDER_STATUS.SHIPPING, label: 'Đang giao' },
  { key: ORDER_STATUS.DELIVERED, label: 'Đã giao' },
  { key: ORDER_STATUS.CANCELLED, label: 'Đã huỷ' },
  { key: ORDER_STATUS.REFUNDED, label: 'Hoàn tiền' },
];

const PAGE_SIZE = 10;

export default function OrdersPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('all');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  
  // Dialog states
  const [cancelDialog, setCancelDialog] = useState({ open: false, orderId: null });
  const [refundDialog, setRefundDialog] = useState({ open: false, orderId: null });

  const fetchOrders = useCallback(async (pageNum = 0) => {
    setLoading(true);
    try {
      const response = await orderService.getMyOrders({ page: pageNum, size: PAGE_SIZE });
      const data = response;

      // Spring Page response: { content: [...], totalPages, totalElements, ... }
      if (data && Array.isArray(data.content)) {
        setOrders(data.content);
        setTotalPages(data.totalPages || 0);
      } else if (Array.isArray(data)) {
        // Fallback if backend returns plain array
        setOrders(data);
        setTotalPages(1);
      } else {
        setOrders([]);
        setTotalPages(0);
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Không thể tải danh sách đơn hàng');
      setOrders([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders(page);
  }, [page, fetchOrders]);

  // Client-side filter by tab (status)
  const filteredOrders = useMemo(() => {
    if (activeTab === 'all') return orders;
    return orders.filter(o => o.status === activeTab);
  }, [orders, activeTab]);

  const handleCancel = async (reason) => {
    try {
      const response = await orderService.cancelOrder(cancelDialog.orderId, reason);
      toast.success('Đã huỷ đơn hàng');
      // Update with server response data
      const updated = response;
      setOrders(prev => prev.map(o => o.id === cancelDialog.orderId ? { ...o, ...updated } : o));
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Không thể huỷ đơn hàng');
    } finally {
      setCancelDialog({ open: false, orderId: null });
    }
  };

  const handleRefund = async (data) => {
    try {
      const reason = typeof data === 'string' ? data : data?.reason || '';
      const response = await orderService.requestRefund(refundDialog.orderId, reason);
      toast.success('Đã gửi yêu cầu hoàn tiền');
      const updated = response;
      setOrders(prev => prev.map(o => o.id === refundDialog.orderId ? { ...o, ...updated } : o));
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Không thể gửi yêu cầu hoàn tiền');
    } finally {
      setRefundDialog({ open: false, orderId: null });
    }
  };

  const handleRetryPayment = async (orderCode) => {
    try {
      const res = await orderService.retryPayment(orderCode);
      if (res?.paymentUrl) {
        window.location.href = res.paymentUrl;
      } else {
        toast.error('Không tìm thấy link thanh toán, vui lòng thử lại sau.');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Không thể tạo lại thanh toán');
    }
  };

  const getOrderActions = (order) => {
    const actions = [];
    if (order.status === ORDER_STATUS.PENDING_PAYMENT) {
      actions.push({ label: 'Thanh toán lại', onClick: () => handleRetryPayment(order.orderCode), primary: true });
    }
    if (order.status === ORDER_STATUS.PENDING || order.status === ORDER_STATUS.CONFIRMED) {
      actions.push({ label: 'Huỷ đơn', onClick: () => setCancelDialog({ open: true, orderId: order.id }) });
    }
    if (order.status === ORDER_STATUS.DELIVERED) {
      actions.push({ label: 'Yêu cầu hoàn tiền', onClick: () => setRefundDialog({ open: true, orderId: order.id }), primary: true });
    }
    return actions;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f9f4ee] font-body text-[#3f3d2e]">
      <Navbar />
      
      <main className="flex-1 min-h-[95vh] max-w-5xl w-full mx-auto px-4 py-8 md:py-12">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#ac4218] mb-1">Đơn hàng của tôi</h1>
          <p className="text-sm text-gray-500">Quản lý và theo dõi trạng thái các đơn hàng bạn đã mua.</p>
        </div>
        
        {/* Tabs */}
        <div className="flex overflow-x-auto hide-scrollbar bg-white rounded-xl shadow-sm border border-[#ede5db] mb-8 p-1.5">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2 text-sm font-semibold rounded-lg whitespace-nowrap transition-colors ${
                activeTab === tab.key 
                  ? 'bg-[#fff8f5] text-[#ac4218] shadow-sm border border-[#ac421830]' 
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        {/* List */}
        <div className="space-y-5">
          {loading ? (
            <div className="text-center py-16 text-gray-500">Đang tải thông tin đơn hàng...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white rounded-2xl p-16 text-center border border-[#ede5db] shadow-sm flex flex-col items-center">
              <div className="text-6xl opacity-30 mb-4">📦</div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Chưa có đơn hàng nào</h3>
              <p className="text-gray-500 mb-6 max-w-sm">Không tìm thấy đơn hàng nào trong trạng thái này. Bạn hãy thử xem ở mục khác nhé!</p>
              <button onClick={() => navigate('/home')} className="px-6 py-2.5 bg-[#ac4218] text-white font-medium rounded-xl hover:bg-[#8e3512] transition-colors">
                Tiếp tục mua sắm
              </button>
            </div>
          ) : (
            filteredOrders.map(order => (
              <OrderCard 
                key={order.id} 
                order={order} 
                onClick={(id) => navigate(`/orders/${id}`)}
                actions={getOrderActions(order)}
              />
            ))
          )}
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-10">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ← Trang trước
            </button>
            <span className="text-sm text-gray-600 font-medium">
              Trang {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Trang sau →
            </button>
          </div>
        )}
      </main>

      <Footer />
      
      <CancelOrderDialog 
        open={cancelDialog.open} 
        onClose={() => setCancelDialog({ open: false, orderId: null })}
        onConfirm={handleCancel}
        reasons={['Đổi ý không muốn mua nữa', 'Muốn thay đổi địa chỉ giao hàng', 'Tìm được sản phẩm khác giá tốt hơn', 'Lý do khác']}
      />
      
      <RefundRequestDialog
        open={refundDialog.open}
        onClose={() => setRefundDialog({ open: false, orderId: null })}
        onSubmit={handleRefund}
        reasons={['Hàng không đúng mô tả', 'Hàng bị lỗi hoặc hư hỏng', 'Nhận sai sản phẩm', 'Lý do khác']}
      />
    </div>
  );
}
