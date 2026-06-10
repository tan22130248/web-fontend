import React from 'react';
import AdminIcon from './AdminIcon';
import { formatDate } from '../../utils/adminUsers';

const statusLabels = {
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Từ chối',
};

const statusClasses = {
  pending: 'text-[#0b5c7c]',
  approved: 'text-[#2f7f35]',
  rejected: 'text-[#b32534]',
};

export default function AdminRegistrationTable({
  registrations,
  loading,
  filteredCount,
  page,
  pageSize,
  totalPages,
  onPageChange,
  onView,
  onApprove,
  onReject,
  onDelete,
}) {
  const startIndex = filteredCount === 0 ? 0 : (page - 1) * pageSize + 1;
  const endIndex = Math.min(page * pageSize, filteredCount);

  const getVisiblePages = () => {
    const pages = [];
    pages.push(1);

    let start = Math.max(2, page - 1);
    let end = Math.min(totalPages - 1, page + 1);

    if (start > 2) {
      pages.push('...');
    }

    for (let i = start; i <= end; i += 1) {
      pages.push(i);
    }

    if (end < totalPages - 1) {
      pages.push('...');
    }

    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  return (
    <section className="overflow-hidden rounded-[9px] bg-white shadow-[0_8px_28px_rgba(103,84,51,0.04)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse">
          <thead>
            <tr className="bg-[#fffef5] text-left text-xs font-black uppercase text-[#777761]">
              <th className="border-b border-[#f0efe4] px-6 py-[18px]">Người đăng ký</th>
              <th className="border-b border-[#f0efe4] px-6 py-[18px]">Email</th>
              <th className="border-b border-[#f0efe4] px-6 py-[18px]">Trạng thái</th>
              <th className="border-b border-[#f0efe4] px-6 py-[18px]">Ngày gửi</th>
              <th className="border-b border-[#f0efe4] px-6 py-[18px]">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="5" className="h-[188px] border-b border-[#f0efe4] px-6 py-[18px] text-center text-[#8f907d]">
                  Đang tải đăng ký...
                </td>
              </tr>
            ) : registrations.length === 0 ? (
              <tr>
                <td colSpan="5" className="h-[188px] border-b border-[#f0efe4] px-6 py-[18px] text-center text-[#8f907d]">
                  Không có đăng ký nào.
                </td>
              </tr>
            ) : (
              registrations.map((item) => (
                <tr key={item.id} className="text-sm text-[#454638]">
                  <td className="border-b border-[#f0efe4] px-6 py-[18px] align-middle">
                    <strong className="block text-sm leading-tight text-[#3e3f31]">{item.fullName}</strong>
                    <span className="mt-1 block text-xs text-[#8f907d]">ID người dùng: {item.userId}</span>
                  </td>
                  <td className="max-w-[220px] break-words border-b border-[#f0efe4] px-6 py-[18px] align-middle">{item.email}</td>
                  <td className="border-b border-[#f0efe4] px-6 py-[18px] align-middle">
                    <span className={`inline-flex min-h-[25px] min-w-[90px] items-center justify-center rounded-[7px] px-2 text-xs font-black ${statusClasses[item.status] || 'text-[#6b6c58]'}`}>
                      {statusLabels[item.status] || item.status}
                    </span>
                  </td>
                  <td className="border-b border-[#f0efe4] px-6 py-[18px] align-middle">{formatDate(item.createdAt)}</td>
                  <td className="border-b border-[#f0efe4] px-6 py-[18px] align-middle">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        className="flex h-[30px] w-[30px] items-center justify-center rounded-lg text-[#61624e] hover:bg-[#f4f4dd] hover:text-[#bd4c23]"
                        onClick={() => onView(item)}
                        aria-label="Xem"
                      >
                        <AdminIcon type="eye" className="h-4 w-4" />
                      </button>
                      {item.status === 'pending' && (
                        <>
                          <button
                            type="button"
                            className="rounded-[9px] bg-[#d9f2e5] px-3 py-1 text-xs font-black text-[#257940] hover:bg-[#bde7cd]"
                            onClick={() => onApprove(item)}
                          >
                            Duyệt
                          </button>
                          <button
                            type="button"
                            className="rounded-[9px] bg-[#ffe3df] px-3 py-1 text-xs font-black text-[#b32534] hover:bg-[#f7c7c0]"
                            onClick={() => onReject(item)}
                          >
                            Từ chối
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        className="rounded-[9px] bg-[#f4f1e2] px-3 py-1 text-xs font-black text-[#6d5d3f] hover:bg-[#e9e4ce]"
                        onClick={() => onDelete(item)}
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <footer className="flex min-h-[76px] flex-col gap-4 px-6 py-[15px] text-[13px] text-[#686954] sm:flex-row sm:items-center sm:justify-between">
        <span>
          Hiển thị {startIndex}-{endIndex} của {filteredCount} đăng ký
        </span>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] bg-[#eeedce] font-black text-[#686954] disabled:cursor-not-allowed disabled:opacity-50 hover:bg-[#e2dfc7] transition-colors"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1}
          >
            ‹
          </button>
          {visiblePages.map((pageNumber, idx) => {
            if (pageNumber === '...') {
              return (
                <span key={`dots-${idx}`} className="px-2 text-[#8f907d] font-bold select-none">
                  ...
                </span>
              );
            }
            return (
              <button
                key={pageNumber}
                type="button"
                className={`flex h-[38px] w-[38px] items-center justify-center rounded-[10px] font-black transition-colors ${pageNumber === page ? 'bg-[#bd4c23] text-white' : 'bg-[#eeedce] text-[#686954] hover:bg-[#e2dfc7]'}`}
                onClick={() => onPageChange(pageNumber)}
              >
                {pageNumber}
              </button>
            );
          })}
          <button
            type="button"
            className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] bg-[#eeedce] font-black text-[#686954] disabled:cursor-not-allowed disabled:opacity-50 hover:bg-[#e2dfc7] transition-colors"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
          >
            ›
          </button>
        </div>
      </footer>
    </section>
  );
}
