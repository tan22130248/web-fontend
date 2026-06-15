import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import AdminIcon from '../../components/admin/AdminIcon';
import { formatPrice, statusConfig } from '../../utils/orderUtils';
import adminService from '../../services/adminService';

function formatDateTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const resp = await adminService.getOrder(id);
        if (active) setOrder(resp);
      } catch (error) {
        toast.error(error?.response?.data?.message || 'Không thể tải chi tiết đơn hàng');
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return <p className="py-16 text-center text-[#8f907d]">Đang tải chi tiết đơn hàng...</p>;
  }

  if (!order) {
    return (
      <div className="py-16 text-center">
        <p className="text-[#8f907d]">Không tìm thấy đơn hàng.</p>
        <button
          type="button"
          className="mt-4 rounded-[10px] bg-[#f4f1e2] px-4 py-2 text-sm font-black text-[#6d5d3f] hover:bg-[#e9e4ce]"
          onClick={() => navigate('/admin/orders')}
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const cfg = statusConfig[order.status] || statusConfig.pending;
  const code = `#${order.id?.substring(0, 8).toUpperCase()}`;

  return (
    <div className="space-y-5 py-2">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f4f1e2] text-[#6d5d3f] hover:bg-[#e9e4ce]"
            onClick={() => navigate('/admin/orders')}
            aria-label="Quay lại"
          >
            ‹
          </button>
          <h1 className="m-0 text-[clamp(22px,3vw,28px)] font-black leading-tight text-[#b7451b]">
            Đơn hàng {code}
          </h1>
          <span className={`inline-flex items-center gap-1.5 rounded-[7px] px-2.5 py-1 text-xs font-black ${cfg.bgColor} ${cfg.textColor}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-current" />
            {cfg.label}
          </span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <InfoCard title="Khách hàng">
          <p className="text-sm font-black text-[#3f3d2e]">{order.buyerName || 'Không rõ'}</p>
          <p className="mt-1 text-sm text-[#6f7059]">{order.buyerEmail}</p>
        </InfoCard>
        <InfoCard title="Cửa hàng">
          <p className="text-sm font-black text-[#3f3d2e]">{order.shopName || 'Không rõ'}</p>
        </InfoCard>
        <InfoCard title="Thanh toán">
          <p className="text-sm font-black text-[#3f3d2e]">{(order.type || 'cod').toUpperCase()}</p>
          <p className="mt-1 text-sm text-[#6f7059]">Đặt lúc {formatDateTime(order.createdAt)}</p>
        </InfoCard>
      </div>

      <InfoCard title="Địa chỉ giao hàng">
        <p className="whitespace-pre-line text-sm text-[#3f3d2e]">{order.shippingAddress || 'Chưa cập nhật'}</p>
        {order.note && <p className="mt-2 text-sm text-[#8f907d]">Ghi chú: {order.note}</p>}
      </InfoCard>

      {/* Items */}
      <section className="overflow-hidden rounded-[12px] bg-white shadow-[0_8px_28px_rgba(103,84,51,0.04)]">
        <div className="border-b border-[#f0efe4] px-6 py-4 text-sm font-black uppercase text-[#777761]">
          Sản phẩm
        </div>
        <div className="divide-y divide-[#f3f1e6]">
          {(order.items || []).map((item) => (
            <div key={item.id} className="flex items-center gap-4 px-6 py-4">
              <div className="h-14 w-14 flex-none overflow-hidden rounded-[10px] bg-[#f3f0e2]">
                {item.productImageUrl ? (
                  <img src={item.productImageUrl} alt={item.productName} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[#bcae93]">
                    <AdminIcon type="products" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <strong className="block text-sm text-[#3e3f31]">{item.productName}</strong>
                {(item.variantSize || item.variantColor) && (
                  <span className="block text-xs text-[#8f907d]">
                    {[item.variantSize, item.variantColor].filter(Boolean).join(' / ')}
                  </span>
                )}
                <span className="block text-xs text-[#8f907d]">x{item.quantity}</span>
              </div>
              <div className="text-sm font-black text-[#bd4c23]">{formatPrice(item.totalPrice)}</div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-[#f0efe4] px-6 py-4">
          <span className="text-sm font-black uppercase text-[#777761]">Tổng tiền</span>
          <span className="text-lg font-black text-[#bd4c23]">{formatPrice(order.totalAmount)}</span>
        </div>
      </section>

      {/* History */}
      {order.history && order.history.length > 0 && (
        <section className="overflow-hidden rounded-[12px] bg-white shadow-[0_8px_28px_rgba(103,84,51,0.04)]">
          <div className="border-b border-[#f0efe4] px-6 py-4 text-sm font-black uppercase text-[#777761]">
            Lịch sử trạng thái
          </div>
          <ol className="space-y-4 px-6 py-5">
            {order.history.map((h) => (
              <li key={h.id} className="flex gap-3">
                <span className="mt-1.5 h-2.5 w-2.5 flex-none rounded-full bg-[#d4711e]" />
                <div>
                  <p className="text-sm font-black text-[#3f3d2e]">
                    {(statusConfig[h.newStatus]?.label) || h.newStatus}
                    <span className="ml-2 text-xs font-normal text-[#8f907d]">bởi {h.changedBy}</span>
                  </p>
                  {h.note && <p className="text-sm text-[#6f7059]">{h.note}</p>}
                  <p className="text-xs text-[#a3a48f]">{formatDateTime(h.createdAt)}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}

function InfoCard({ title, children }) {
  return (
    <div className="rounded-[12px] bg-white p-5 shadow-[0_8px_28px_rgba(103,84,51,0.04)]">
      <p className="text-xs font-black uppercase text-[#87886f]">{title}</p>
      <div className="mt-2">{children}</div>
    </div>
  );
}
