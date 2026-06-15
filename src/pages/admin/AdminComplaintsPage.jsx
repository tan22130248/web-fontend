import React, { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { toast } from 'react-toastify';
import AdminIcon from '../../components/admin/AdminIcon';
import AdminModal from '../../components/admin/AdminModal';
import { adminPageSize, complaintPriorityConfig } from '../../components/admin/adminConstants';
import { getInitials } from '../../utils/adminUsers';
import adminService from '../../services/adminService';

const PRIORITY_OPTIONS = [
  { value: 'all', label: 'Mức độ: Tất cả' },
  { value: 'high', label: 'Cao' },
  { value: 'medium', label: 'Trung bình' },
  { value: 'low', label: 'Thấp' },
];

function formatDateTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - ${d.toLocaleDateString('vi-VN')}`;
}

function StatCard({ title, value, icon, iconClass }) {
  return (
    <div className="rounded-[12px] bg-white px-5 py-4 shadow-[0_8px_28px_rgba(103,84,51,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <span className="text-xs font-black uppercase text-[#72725c]">{title}</span>
        <span className={`flex h-9 w-9 items-center justify-center rounded-[9px] ${iconClass}`}>
          <AdminIcon type={icon} />
        </span>
      </div>
      <strong className="mt-2 block text-[28px] leading-none text-[#3b392c]">{value}</strong>
    </div>
  );
}

export default function AdminComplaintsPage() {
  const { query } = useOutletContext();
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const [list, statsResp] = await Promise.all([
        adminService.getComplaints({ priority: priorityFilter, q: query }),
        adminService.getComplaintStats(),
      ]);
      setComplaints(Array.isArray(list) ? list : []);
      setStats(statsResp || {});
    } catch (error) {
      setComplaints([]);
      toast.error(error?.response?.data?.message || 'Không thể tải danh sách khiếu nại');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [priorityFilter, query]);


  useEffect(() => {
    setPage(1);
  }, [query, priorityFilter]);

  const totalPages = Math.max(1, Math.ceil(complaints.length / adminPageSize));
  const visible = complaints.slice((page - 1) * adminPageSize, page * adminPageSize);
  const startIndex = complaints.length === 0 ? 0 : (page - 1) * adminPageSize + 1;
  const endIndex = Math.min(page * adminPageSize, complaints.length);

  return (
    <>
      <section className="my-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="m-0 text-[clamp(25px,3vw,30px)] font-black leading-tight text-[#b7451b]">
          Quản lý khiếu nại
        </h1>
      </section>

      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard title="Tổng khiếu nại" value={stats.total ?? 0} icon="customers" iconClass="bg-[#fff3c9] text-[#bd4c23]" />
        <StatCard title="Ưu tiên cao" value={stats.high ?? 0} icon="bell" iconClass="bg-[#ffe0d8] text-[#b32534]" />
        <StatCard title="Ưu tiên trung bình" value={stats.medium ?? 0} icon="refresh" iconClass="bg-[#fdecd2] text-[#b9762a]" />
        <StatCard title="Ưu tiên thấp" value={stats.low ?? 0} icon="check" iconClass="bg-[#e4eccb] text-[#6d7a33]" />
      </div>

      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
        <label className="flex h-[42px] items-center gap-2 rounded-[10px] bg-[#eeedcd] px-4 text-sm font-black text-[#c04e20]">
          <AdminIcon type="filter" />
          <select
            className="border-0 bg-transparent text-sm text-inherit outline-none"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            {PRIORITY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <section className="overflow-hidden rounded-[9px] bg-white shadow-[0_8px_28px_rgba(103,84,51,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse">
            <thead>
              <tr className="bg-[#fffef5] text-left text-xs font-black uppercase text-[#777761]">
                <th className="border-b border-[#f0efe4] px-6 py-[18px]">Mã ticket</th>
                <th className="border-b border-[#f0efe4] px-6 py-[18px]">Người gửi</th>
                <th className="border-b border-[#f0efe4] px-6 py-[18px]">Chủ đề</th>
                <th className="border-b border-[#f0efe4] px-6 py-[18px]">Thời gian</th>
                <th className="border-b border-[#f0efe4] px-6 py-[18px]">Ưu tiên</th>
                <th className="border-b border-[#f0efe4] px-6 py-[18px]">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="h-[188px] px-6 py-[18px] text-center text-[#8f907d]">
                    Đang tải danh sách khiếu nại...
                  </td>
                </tr>
              ) : visible.length === 0 ? (
                <tr>
                  <td colSpan="6" className="h-[188px] px-6 py-[18px] text-center text-[#8f907d]">
                    Không có khiếu nại nào.
                  </td>
                </tr>
              ) : (
                visible.map((c) => {
                  const cfg = complaintPriorityConfig[c.priority] || complaintPriorityConfig.low;
                  return (
                    <tr key={c.id} className="text-sm text-[#454638]">
                      <td className="border-b border-[#f0efe4] px-6 py-[18px] align-middle font-black text-[#bd4c23]">
                        {c.ticketCode}
                      </td>
                      <td className="border-b border-[#f0efe4] px-6 py-[18px] align-middle">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-8 w-8 flex-none items-center justify-center overflow-hidden rounded-full bg-[#fff0ea] text-[10px] font-black text-[#c04e20]">
                            {c.reporterAvatarUrl ? (
                              <img src={c.reporterAvatarUrl} alt={c.reporterName} className="h-full w-full object-cover" />
                            ) : (
                              getInitials(c.reporterName || '')
                            )}
                          </span>
                          <strong className="text-xs text-[#3e3f31]">{c.reporterName || 'Ẩn danh'}</strong>
                        </div>
                      </td>
                      <td className="max-w-[260px] border-b border-[#f0efe4] px-6 py-[18px] align-middle">
                        <span className="block truncate">{c.subject}</span>
                      </td>
                      <td className="border-b border-[#f0efe4] px-6 py-[18px] align-middle text-[#6f7059]">
                        {formatDateTime(c.createdAt)}
                      </td>
                      <td className="border-b border-[#f0efe4] px-6 py-[18px] align-middle">
                        <span className={`inline-flex items-center rounded-[7px] px-2.5 py-1 text-xs font-black ${cfg.bgColor} ${cfg.textColor}`}>
                          {cfg.label}
                        </span>
                      </td>
                      <td className="border-b border-[#f0efe4] px-6 py-[18px] align-middle">
                        <button
                          type="button"
                          className="rounded-[9px] bg-[#f4f1e2] px-3 py-1.5 text-xs font-black text-[#6d5d3f] hover:bg-[#e9e4ce]"
                          onClick={() => setSelected(c)}
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
            Hiển thị {startIndex}-{endIndex} của {complaints.length} kết quả
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] bg-[#eeedce] font-black text-[#686954] transition-colors hover:bg-[#e2dfc7] disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                className={`flex h-[38px] w-[38px] items-center justify-center rounded-[10px] font-black transition-colors ${
                  n === page ? 'bg-[#bd4c23] text-white' : 'bg-[#eeedce] text-[#686954] hover:bg-[#e2dfc7]'
                }`}
                onClick={() => setPage(n)}
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] bg-[#eeedce] font-black text-[#686954] transition-colors hover:bg-[#e2dfc7] disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
            >
              ›
            </button>
          </div>
        </footer>
      </section>

      {selected && (
        <AdminModal title={`Khiếu nại ${selected.ticketCode}`} onClose={() => setSelected(null)}>
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <Info label="Người gửi" value={selected.reporterName} />
              <Info label="Email" value={selected.reporterEmail} />
              <Info label="Cửa hàng bị khiếu nại" value={selected.shopName} />
              <Info label="Sản phẩm" value={selected.productName} />
              <Info label="Đánh giá" value={`${selected.rating} sao`} />
              <Info label="Thời gian" value={formatDateTime(selected.createdAt)} />
            </div>
            <div className="rounded-[10px] border border-[#efedcf] bg-white p-4">
              <p className="text-xs font-black uppercase text-[#87886f]">Nội dung khiếu nại</p>
              <p className="mt-2 whitespace-pre-line text-sm text-[#3f3d2e]">
                {selected.content || 'Người dùng không để lại nội dung.'}
              </p>
            </div>
            <p className="text-xs text-[#a3a48f]">
              Khiếu nại được tổng hợp từ đánh giá sản phẩm có điểm thấp (≤ 3 sao).
            </p>
          </div>
        </AdminModal>
      )}
    </>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-[10px] border border-[#efedcf] bg-white p-4">
      <p className="text-xs font-black uppercase text-[#87886f]">{label}</p>
      <p className="mt-2 text-sm font-black text-[#3f3d2e]">{value || 'Chưa cập nhật'}</p>
    </div>
  );
}
