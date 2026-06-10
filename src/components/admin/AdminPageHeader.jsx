import React from 'react';
import AdminIcon from './AdminIcon';

export default function AdminPageHeader({
  title,
  filterValue,
  filterOptions,
  onFilterChange,
  onCreate,
  createLabel = 'Thêm mới',
}) {
  return (
    <section className="my-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <h1 className="m-0 text-[clamp(25px,3vw,30px)] font-black leading-tight text-[#b7451b]">
        {title}
      </h1>
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        {filterOptions && (
          <label className="flex min-h-10 items-center justify-center gap-2 rounded-[9px] bg-[#eeedcd] px-4 text-sm font-black text-[#c04e20]">
            <AdminIcon type="filter" />
            <select
              className="border-0 bg-transparent text-sm text-inherit outline-none"
              value={filterValue}
              onChange={(event) => onFilterChange(event.target.value)}
            >
              {filterOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        )}
        {onCreate && (
          <button
            type="button"
            className="flex min-h-10 items-center justify-center gap-2 rounded-[9px] bg-gradient-to-r from-[#c65520] to-[#fb734b] px-4 text-sm font-black text-white"
            onClick={onCreate}
          >
            <AdminIcon type="addUser" />
            <span>{createLabel}</span>
          </button>
        )}
      </div>
    </section>
  );
}
