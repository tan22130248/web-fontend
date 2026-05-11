import React from 'react';
import AdminIcon from './AdminIcon';

export default function AdminPageHeader({ roleFilter, onRoleFilterChange, onCreate }) {
  return (
    <section className="my-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <h1 className="m-0 text-[clamp(25px,3vw,30px)] font-black leading-tight text-[#b7451b]">
        Quản trị người dùng
      </h1>
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        <label className="flex min-h-10 items-center justify-center gap-2 rounded-[9px] bg-[#eeedcd] px-4 text-sm font-black text-[#c04e20]">
          <AdminIcon type="filter" />
          <select
            className="border-0 bg-transparent text-sm text-inherit outline-none"
            value={roleFilter}
            onChange={(event) => onRoleFilterChange(event.target.value)}
          >
            <option value="all">Lọc vai trò</option>
            <option value="buyer">Người mua</option>
            <option value="seller">Người bán</option>
            <option value="admin">Quản trị</option>
          </select>
        </label>
        <button
          type="button"
          className="flex min-h-10 items-center justify-center gap-2 rounded-[9px] bg-gradient-to-r from-[#c65520] to-[#fb734b] px-4 text-sm font-black text-white"
          onClick={onCreate}
        >
          <AdminIcon type="addUser" />
          <span>Thêm mới</span>
        </button>
      </div>
    </section>
  );
}
