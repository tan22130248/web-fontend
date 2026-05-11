import React from 'react';
import { roleLabels } from './adminConstants';
import UserAvatar from './UserAvatar';
import { formatDate } from '../../utils/adminUsers';

export default function AdminUserDetail({ user }) {
  return (
    <div className="grid grid-cols-[54px_1fr] gap-4">
      <UserAvatar user={user} size="h-[54px] w-[54px]" />
      <div>
        <h3 className="m-0 mb-1 text-xl font-black text-[#3f3d2e]">{user.fullName}</h3>
        <p className="m-0 break-words text-[#777761]">{user.email}</p>
      </div>
      <dl className="col-span-2 mt-2.5 grid grid-cols-1 gap-3 md:grid-cols-2">
        {[
          ['Vai trò', roleLabels[user.role] || user.role],
          ['Trạng thái', user.isActive ? 'Hoạt động' : 'Bị khóa'],
          ['Số điện thoại', user.phone || 'Chưa cập nhật'],
          ['Ngày tham gia', formatDate(user.createdAt)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-[9px] border border-[#efedcf] bg-white px-3.5 py-[13px]">
            <dt className="text-xs font-black text-[#87886f]">{label}</dt>
            <dd className="m-0 mt-1 text-[15px] font-black text-[#3f3d2e]">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
