import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AdminIcon from '../../components/admin/AdminIcon';
import { getInitials } from '../../utils/adminUsers';
import { formatPrice, statusConfig } from '../../utils/orderUtils';
import adminService from '../../services/adminService';

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'pending', label: 'Chờ xác nhận' },
  { value: 'confirmed', label: 'Đã xác nhận' },
  { value: 'shipping', label: 'Đang giao' },
  { value: 'delivered', label: 'Đã giao' },
  { value: 'cancelled', label: 'Đã huỷ' },
  { value: 'refunded', label: 'Hoàn tiền' },
];

const DATE_FILTER_OPTIONS = [
  { value: 'all', label: 'Tất cả thời gian' },
  { value: 'today', label: 'Hôm nay' },
  { value: 'yesterday', label: 'Hôm qua' },
  { value: 'week', label: 'Tuần này' },
  { value: 'month', label: 'Tháng này' },
];

const PAGE_SIZE = 10;

function formatOrderDateTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function filterOrdersByDate(orders, dateFilter) {
  if (!dateFilter || dateFilter === 'all') return orders;
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  return orders.filter(order => {
    const orderDate = new Date(order.createdAt);
    
    switch (dateFilter) {
      case 'today':
        return orderDate >= today;
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        return orderDate >= yesterday && orderDate < today;
      case 'week':
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return orderDate >= weekAgo;
      case 'month':
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return orderDate >= monthAgo;
      default:
        return true;
    }
  });
}

export default function AdminOrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const [resp, statsResp] = await Promise.all([
        adminService.getOrders({ status: statusFilter, page, size: PAGE_SIZE }),
        adminService.getOrderStats(),
      ]);
      setOrders(resp?.content || []);
      setTotalPages(resp?.totalPages || 1);
      setTotalElements(resp?.totalElements || 0);
      setStats(statsResp || {});
    } catch (error) {
      setOrders([]);
      toast.error(error?.response?.data?.message || 'Không thể tải danh sách đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, page]);

  useEffect(() => {
    setPage(0);
  }, [statusFilter]);

  const handleDeleteOrder = async (orderId, orderCode) => {
    if (!window.confirm(`Bạn có chắc muốn xóa đơn hàng ${orderCode}?\n\nHành động này không thể hoàn tác!`)) {
      return;
    }

    try {
      await adminService.deleteOrder(orderId);
      toast.success('Đã xóa đơn hàng thành công');
      
      // Remove from local state
      setOrders(prev => prev.filter(o => o.id !== orderId));
      
      // Refresh to get updated stats
      fetchOrders();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Không thể xóa đơn hàng');
    }
  };

  const filtered = useMemo(() => {
    let result = orders;
    
    // Filter by keyword
    const kw = keyword.trim().toLowerCase();
    if (kw) {
      result = result.filter(
        (o) =>
          o.id?.toLowerCase().includes(kw) ||
          o.buyerName?.toLowerCase().includes(kw) ||
          o.shopName?.toLowerCase().includes(kw)
      );
    }
    
    // Filter by date
    result = filterOrdersByDate(result, dateFilter);
    
    return result;
  }, [orders, keyword, dateFilter]);

  const pendingCount = stats.pending ?? 0;
  const startIndex = filtered.length === 0 ? 0 : page * PAGE_SIZE + 1;
  const endIndex = Math.min((page + 1) * PAGE_SIZE, filtered.length);

  return (
    <>
      <section className="my-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="m-0 text-[clamp(28px,4vw,36px)] font-extrabold leading-tight text-[#c04924] tracking-tight">
          Quản trị đơn hàng
        </h1>
      </section>

      <div className="mb-5 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Filters */}
        <div className="flex flex-col gap-3 rounded-[20px] bg-white p-6 shadow-[0_4px_15px_rgba(0,0,0,0.02)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Search Box */}
            <div className="flex h-[48px] flex-1 items-center gap-3 rounded-[12px] bg-[#f0efdb] px-5 text-[#777861]">
              <AdminIcon type="search" className="h-4 w-4" />
              <input
                className="w-full border-0 bg-transparent text-[15px] text-[#333] outline-none placeholder:text-[#777]"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Tìm theo mã đơn, khách hàng..."
              />
            </div>
            
            {/* Date Filter */}
            <div className="flex h-[48px] items-center gap-2 rounded-[12px] bg-[#f0efdb] px-5 text-[#c04924] min-w-[200px]">
              <AdminIcon type="calendar" className="h-4 w-4" />
              <select
                className="border-0 bg-transparent text-[15px] font-semibold text-inherit outline-none cursor-pointer"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              >
                {DATE_FILTER_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            
            {/* Status Filter */}
            <div className="flex h-[48px] items-center gap-2 rounded-[12px] bg-[#f0efdb] px-5 text-[#c04924] min-w-[180px]">
              <AdminIcon type="filter" className="h-4 w-4" />
              <select
                className="border-0 bg-transparent text-[15px] font-semibold text-inherit outline-none cursor-pointer"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Pending highlight card */}
        <div className="flex items-center justify-between rounded-[20px] bg-gradient-to-br from-[#d35c3b] to-[#de6e48] px-6 py-6 text-white shadow-[0_8px_20px_rgba(192,73,36,0.2)] relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-[15px] font-semibold opacity-90">Đơn Chờ Xử Lý</h3>
            <div className="text-[40px] font-extrabold leading-none my-2">{pendingCount}</div>
            <p className="text-[13px] opacity-90">Cần giao trước 15:00 hôm nay</p>
          </div>
          <div className="absolute right-[-10px] bottom-[-10px] text-[80px] opacity-15">
            🚚
          </div>
        </div>
      </div>

      <section className="overflow-hidden rounded-[20px] bg-white shadow-[0_4px_15px_rgba(0,0,0,0.02)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse">
            <thead>
              <tr className="bg-[#fffef5] text-left text-[13px] font-extrabold uppercase text-[#777761] tracking-wide">
                <th className="border-b border-[#f0efe4] px-6 py-5">Mã đơn hàng</th>
                <th className="border-b border-[#f0efe4] px-6 py-5">Khách hàng</th>
                <th className="border-b border-[#f0efe4] px-6 py-5">Ngày đặt</th>
                <th className="border-b border-[#f0efe4] px-6 py-5">Tổng tiền</th>
                <th className="border-b border-[#f0efe4] px-6 py-5">Trạng thái</th>
                <th className="border-b border-[#f0efe4] px-6 py-5 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="h-[200px] px-6 py-5 text-center text-[15px] text-[#8f907d]">
                    Đang tải danh sách đơn hàng...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="h-[200px] px-6 py-5 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="text-5xl opacity-30">📦</div>
                      <p className="text-[15px] text-[#8f907d]">Không có đơn hàng phù hợp.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((order) => {
                  const cfg = statusConfig[order.status] || statusConfig.pending;
                  const code = `#TC-${order.id?.substring(0, 4).toUpperCase()}`;
                  const isCancelled = order.status === 'cancelled';
                  
                  return (
                    <tr key={order.id} className={`text-[15px] border-b border-[#f0f0f0] last:border-0 ${isCancelled ? 'opacity-60' : ''}`}>
                      <td className="px-6 py-5 align-middle">
                        <span className={`font-bold ${isCancelled ? 'text-[#b5b5b5]' : 'text-[#c04924]'}`}>
                          {code}
                        </span>
                      </td>
                      <td className="px-6 py-5 align-middle">
                        <div className="flex items-center gap-3">
                          {/* Avatar */}
                          {order.buyerAvatar ? (
                            <img 
                              src={order.buyerAvatar} 
                              alt={order.buyerName || ''} 
                              className="h-9 w-9 flex-none rounded-full object-cover bg-[#e5e0cc]"
                            />
                          ) : (
                            <div className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-[#e5e0cc] text-[13px] font-semibold text-[#666]">
                              {getInitials(order.buyerName || '')}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className={`text-[15px] font-semibold leading-tight ${isCancelled ? 'text-[#b5b5b5]' : 'text-[#333]'}`}>
                              {order.buyerName || 'Không rõ'}
                            </div>
                            <div className={`text-[13px] mt-1 ${isCancelled ? 'text-[#b5b5b5]' : 'text-[#777]'}`}>
                              {order.shopName || ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className={`px-6 py-5 align-middle ${isCancelled ? 'text-[#b5b5b5]' : 'text-[#666]'}`}>
                        {formatOrderDateTime(order.createdAt)}
                      </td>
                      <td className={`px-6 py-5 align-middle font-bold ${isCancelled ? 'text-[#b5b5b5]' : 'text-[#333]'}`}>
                        {formatPrice(order.totalAmount)}
                      </td>
                      <td className="px-6 py-5 align-middle">
                        <span className={`inline-flex items-center gap-2 rounded-[20px] px-3 py-1.5 text-[13px] font-semibold ${cfg.bgColor} ${cfg.textColor}`}>
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="px-6 py-5 align-middle text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            className="rounded-[12px] bg-[#f4f1e2] px-4 py-2 text-[13px] font-semibold text-[#6d5d3f] hover:bg-[#e9e4ce] transition-colors"
                            onClick={() => navigate(`/admin/orders/${order.id}`)}
                          >
                            Chi tiết
                          </button>
                          <button
                            type="button"
                            className="flex h-[36px] w-[36px] items-center justify-center rounded-[12px] bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                            onClick={() => handleDeleteOrder(order.id, code)}
                            title="Xóa đơn hàng"
                          >
                            <AdminIcon type="trash" className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <footer className="flex min-h-[76px] flex-col gap-4 px-6 py-5 text-[14px] text-[#686954] font-medium sm:flex-row sm:items-center sm:justify-between border-t border-[#f0efe4]">
          <span>
            Hiển thị {startIndex}-{endIndex} của {filtered.length} đơn hàng
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="flex h-[36px] w-[36px] items-center justify-center rounded-[8px] bg-[#eeedce] font-semibold text-[#686954] transition-colors hover:bg-[#e2dfc7] disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
            >
              ‹
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let pageNum = i;
              if (totalPages <= 5) {
                pageNum = i;
              } else if (page < 3) {
                pageNum = i;
              } else if (page >= totalPages - 3) {
                pageNum = totalPages - 5 + i;
              } else {
                pageNum = page - 2 + i;
              }
              
              return (
                <button
                  key={pageNum}
                  type="button"
                  className={`flex h-[36px] w-[36px] items-center justify-center rounded-[8px] font-semibold transition-colors ${
                    pageNum === page 
                      ? 'bg-[#c04924] text-white' 
                      : 'bg-[#eeedce] text-[#686954] hover:bg-[#e2dfc7]'
                  }`}
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum + 1}
                </button>
              );
            })}
            <button
              type="button"
              className="flex h-[36px] w-[36px] items-center justify-center rounded-[8px] bg-[#eeedce] font-semibold text-[#686954] transition-colors hover:bg-[#e2dfc7] disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page === totalPages - 1}
            >
              ›
            </button>
          </div>
        </footer>
      </section>
    </>
  );
}
