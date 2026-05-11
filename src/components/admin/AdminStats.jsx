import React from 'react';
import AdminIcon from './AdminIcon';

function StatCard({ title, value, delta, icon, iconClass }) {
  const isDown = delta.startsWith('-');

  return (
    <div className="min-h-[136px] rounded-[9px] bg-white px-6 py-[22px] shadow-[0_8px_28px_rgba(103,84,51,0.04)]">
      <div className="flex items-start justify-between gap-3 text-[13px] font-black uppercase text-[#72725c]">
        <span>{title}</span>
        <span className={`flex h-[42px] w-[42px] items-center justify-center rounded-[9px] ${iconClass}`}>
          <AdminIcon type={icon} />
        </span>
      </div>
      <strong className="mt-2 block text-[30px] leading-none text-[#3b392c]">{value}</strong>
      <p className="mt-4 text-[13px] text-[#71715f]">
        <span className={isDown ? 'font-bold text-[#df3535]' : 'font-bold text-[#4f8d3f]'}>{delta}</span> so với tháng trước
      </p>
    </div>
  );
}

export default function AdminStats({ stats }) {
  return (
    <section className="mb-5 grid grid-cols-1 gap-[22px] md:grid-cols-3" aria-label="Thống kê người dùng">
      <StatCard
        title="Tổng người dùng"
        value={stats.total.toLocaleString('vi-VN')}
        delta="+12%"
        icon="users"
        iconClass="bg-[#fff3c9] text-[#bd4c23]"
      />
      <StatCard
        title="Người bán mới"
        value={stats.sellers.toLocaleString('vi-VN')}
        delta="+5%"
        icon="shop"
        iconClass="bg-[#fff4bf] text-[#bf7f10]"
      />
      <StatCard
        title="Tài khoản bị khóa"
        value={stats.locked.toLocaleString('vi-VN')}
        delta="-2%"
        icon="lock"
        iconClass="bg-[#fff0c7] text-[#f04444]"
      />
    </section>
  );
}
