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

const PAGE_SIZE = 10;

function formatOrderDateTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AdminOrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
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

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    if (!kw) return orders;
    return orders.filter(
      (o) =>
        o.id?.toLowerCase().includes(kw) ||
        o.buyerName?.toLowerCase().includes(kw) ||
        o.shopName?.toLowerCase().includes(kw)
    );
  }, [orders, keyword]);

  const pendingCount = stats.pending ?? 0;
  const startIndex = totalElements === 0 ? 0 : page * PAGE_SIZE + 1;
  const endIndex = Math.min((page + 1) * PAGE_SIZE, totalElements);

  return (
    <>
      <section className="my-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="m-0 text-[clamp(25px,3vw,30px)] font-black leading-tight text-[#b7451b]">
          Quản trị đơn hàng
        </h1>
      </section>

      <div className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        {/* Filters */}
        <div className="flex flex-col gap-3 rounded-[12px] bg-[#fffdf0] p-4 shadow-[0_8px_28px_rgba(103,84,51,0.04)] sm:flex-row sm:items-center">
          <div className="flex h-[42px] flex-1 items-center gap-2.5 rounded-[10px] bg-[#eceecb] px-4 text-[#777861]">
            <AdminIcon type="search" />
            <input
              className="w-full border-0 bg-transparent text-sm text-[#454632] outline-none placeholder:text-[#96977e]"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm theo mã đơn, khách hàng, cửa hàng..."
            />
          </div>
          <label className="flex h-[42px] items-center gap-2 rounded-[10px] bg-[#eeedcd] px-4 text-sm font-black text-[#c04e20]">
            <AdminIcon type="filter" />
            <select
              className="border-0 bg-transparent text-sm text-inherit outline-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Pending highlight card */}
        <div className="flex items-center justify-between rounded-[12px] bg-gradient-to-r from-[#c65520] to-[#fb734b] px-5 py-4 text-white shadow-[0_12px_28px_rgba(191,77,27,0.18)]">
          <div>
            <p className="text-xs font-black uppercase opacity-90">Đơn chờ xử lý</p>
            <strong className="mt-1 block text-[34px] leading-none">{pendingCount}</strong>
            <p className="mt-1 text-xs opacity-90">Cần được xác nhận sớm</p>
          </div>
          <AdminIcon type="truck" className="h-12 w-12 opacity-80" />
        </div>
      </div>

      <section className="overflow-hidden rounded-[9px] bg-white shadow-[0_8px_28px_rgba(103,84,51,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse">
            <thead>
              <tr className="bg-[#fffef5] text-left text-xs font-black uppercase text-[#777761]">
                <th className="border-b border-[#f0efe4] px-6 py-[18px]">Mã đơn hàng</th>
                <th className="border-b border-[#f0efe4] px-6 py-[18px]">Khách hàng</th>
                <th className="border-b border-[#f0efe4] px-6 py-[18px]">Ngày đặt</th>
                <th className="border-b border-[#f0efe4] px-6 py-[18px]">Tổng tiền</th>
                <th className="border-b border-[#f0efe4] px-6 py-[18px]">Trạng thái</th>
                <th className="border-b border-[#f0efe4] px-6 py-[18px]">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="h-[188px] px-6 py-[18px] text-center text-[#8f907d]">
                    Đang tải danh sách đơn hàng...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="h-[188px] px-6 py-[18px] text-center text-[#8f907d]">
                    Không có đơn hàng phù hợp.
                  </td>
                </tr>
              ) : (
                filtered.map((order) => {
                  const cfg = statusConfig[order.status] || statusConfig.pending;
                  const code = `#${order.id?.substring(0, 8).toUpperCase()}`;
                  return (
                    <tr key={order.id} className="text-sm text-[#454638]">
                      <td className="border-b border-[#f0efe4] px-6 py-[18px] align-middle font-black text-[#bd4c23]">
                        {code}
                      </td>
                      <td className="border-b border-[#f0efe4] px-6 py-[18px] align-middle">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-[#fff0ea] text-[10px] font-black text-[#c04e20]">
                            {getInitials(order.buyerName || '')}
                          </span>
                          <div>
                            <strong className="block text-xs text-[#3e3f31]">{order.buyerName || 'Không rõ'}</strong>
                            <span className="block text-[11px] text-[#8f907d]">{order.shopName || ''}</span>
                          </div>
                        </div>
                      </td>
                      <td className="border-b border-[#f0efe4] px-6 py-[18px] align-middle text-[#6f7059]">
                        {formatOrderDateTime(order.createdAt)}
                      </td>
                      <td className="border-b border-[#f0efe4] px-6 py-[18px] align-middle font-black text-[#3e3f31]">
                        {formatPrice(order.totalAmount)}
                      </td>
                      <td className="border-b border-[#f0efe4] px-6 py-[18px] align-middle">
                        <span className={`inline-flex items-center gap-1.5 rounded-[7px] px-2.5 py-1 text-xs font-black ${cfg.bgColor} ${cfg.textColor}`}>
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="border-b border-[#f0efe4] px-6 py-[18px] align-middle">
                        <button
                          type="button"
                          className="rounded-[9px] bg-[#f4f1e2] px-3 py-1.5 text-xs font-black text-[#6d5d3f] hover:bg-[#e9e4ce]"
                          onClick={() => navigate(`/admin/orders/${order.id}`)}
                        >
                          Chi tiết
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <footer className="flex min-h-[76px] flex-col gap-4 px-6 py-[15px] text-[13px] text-[#686954] sm:flex-row sm:items-center sm:justify-between">
          <span>
            Hiển thị {startIndex}-{endIndex} của {totalElements} đơn hàng
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] bg-[#eeedce] font-black text-[#686954] transition-colors hover:bg-[#e2dfc7] disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i).map((n) => (
              <button
                key={n}
                type="button"
                className={`flex h-[38px] w-[38px] items-center justify-center rounded-[10px] font-black transition-colors ${
                  n === page ? 'bg-[#bd4c23] text-white' : 'bg-[#eeedce] text-[#686954] hover:bg-[#e2dfc7]'
                }`}
                onClick={() => setPage(n)}
              >
                {n + 1}
              </button>
            ))}
            <button
              type="button"
              className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] bg-[#eeedce] font-black text-[#686954] transition-colors hover:bg-[#e2dfc7] disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
            >
              ›
            </button>
          </div>
        </footer>
      </section>
    </>
  );
}
