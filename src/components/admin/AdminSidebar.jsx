import React from 'react';
import AdminIcon from './AdminIcon';
import { adminMenuItems } from './adminConstants';

export default function AdminSidebar({ activeTab, onTabChange }) {
  return (
    <aside className="flex min-h-0 flex-col gap-4 border-b border-[#6f6f43]/15 p-[18px] lg:min-h-screen lg:gap-7 lg:border-b-0 lg:border-r lg:px-[22px] lg:py-[34px]">
      <div className="pl-0 text-[22px] font-black italic text-[#b7451b] lg:pl-10">Tiệm Cũ</div>
      <nav className="grid grid-cols-2 gap-[9px] sm:grid-cols-3 lg:grid-cols-1" aria-label="Admin">
        {adminMenuItems.map(({ icon, label, key }) => {
          const active = activeTab === key;
          return (
            <button
              key={key}
              type="button"
              className={`flex h-10 items-center justify-center gap-3 rounded-[22px] px-3 text-left text-[13px] font-black transition lg:justify-start lg:px-[18px] ${
                active ? 'bg-[#ededc5] text-[#bd4c23]' : 'text-[#5d5f4d] hover:bg-[#ededc5] hover:text-[#bd4c23]'
              }`}
              onClick={() => onTabChange(key)}
              aria-current={active ? 'page' : undefined}
            >
              <AdminIcon type={icon} />
              <span>{label}</span>
            </button>
          );
        })}
      </nav>
      <button
        type="button"
        className="mt-auto h-11 w-full rounded-[10px] bg-gradient-to-r from-[#bf4d1b] to-[#fb7148] text-[13px] font-black text-white shadow-[0_12px_28px_rgba(191,77,27,0.18)] lg:w-[174px]"
      >
        Đăng Sản Phẩm
      </button>
    </aside>
  );
}
