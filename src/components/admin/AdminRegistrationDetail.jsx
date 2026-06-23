import React from 'react';
import { formatDate } from '../../utils/adminUsers';

const statusLabels = {
  pending: 'Chờ duyệt',
  approved: 'Đã duyệt',
  rejected: 'Từ chối',
};

export default function AdminRegistrationDetail({ registration }) {
  if (!registration) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-[10px] border border-[#efedcf] bg-white p-4">
          <p className="text-xs font-black uppercase text-[#87886f]">Họ và tên</p>
          <p className="mt-2 text-sm font-black text-[#3f3d2e]">{registration.fullName}</p>
        </div>
        <div className="rounded-[10px] border border-[#efedcf] bg-white p-4">
          <p className="text-xs font-black uppercase text-[#87886f]">Email</p>
          <p className="mt-2 text-sm font-black text-[#3f3d2e]">{registration.email}</p>
        </div>
        <div className="rounded-[10px] border border-[#efedcf] bg-white p-4">
          <p className="text-xs font-black uppercase text-[#87886f]">Số điện thoại</p>
          <p className="mt-2 text-sm font-black text-[#3f3d2e]">{registration.phone || 'Chưa cập nhật'}</p>
        </div>
        <div className="rounded-[10px] border border-[#efedcf] bg-white p-4">
          <p className="text-xs font-black uppercase text-[#87886f]">Trạng thái</p>
          <p className="mt-2 text-sm font-black text-[#3f3d2e]">{statusLabels[registration.status] || registration.status}</p>
        </div>
      </div>

      <div className="rounded-[10px] border border-[#efedcf] bg-white p-4">
        <p className="text-xs font-black uppercase text-[#87886f]">Địa chỉ</p>
        <p className="mt-2 text-sm text-[#3f3d2e] whitespace-pre-line">{registration.address || 'Chưa cập nhật'}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-[10px] border border-[#efedcf] bg-white p-4">
          <p className="text-xs font-black uppercase text-[#87886f]">CCCD mặt trước</p>
          <img src={registration.cccdFrontUrl} alt="CCCD mặt trước" className="mt-4 w-full rounded-[10px] object-cover" />
        </div>
        <div className="rounded-[10px] border border-[#efedcf] bg-white p-4">
          <p className="text-xs font-black uppercase text-[#87886f]">CCCD mặt sau</p>
          <img src={registration.cccdBackUrl} alt="CCCD mặt sau" className="mt-4 w-full rounded-[10px] object-cover" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-[10px] border border-[#efedcf] bg-white p-4">
          <p className="text-xs font-black uppercase text-[#87886f]">Ngày tạo</p>
          <p className="mt-2 text-sm text-[#3f3d2e]">{formatDate(registration.createdAt)}</p>
        </div>
        <div className="rounded-[10px] border border-[#efedcf] bg-white p-4">
          <p className="text-xs font-black uppercase text-[#87886f]">Cập nhật</p>
          <p className="mt-2 text-sm text-[#3f3d2e]">{formatDate(registration.updatedAt)}</p>
        </div>
      </div>

      {registration.rejectionReason && (
        <div className="rounded-[10px] border border-[#f7d1d1] bg-[#fff1f1] p-4">
          <p className="text-xs font-black uppercase text-[#b32534]">Lý do từ chối</p>
          <p className="mt-2 text-sm text-[#662029] whitespace-pre-line">{registration.rejectionReason}</p>
        </div>
      )}
    </div>
  );
}
