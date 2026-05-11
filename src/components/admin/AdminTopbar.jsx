import React from 'react';
import AdminIcon from './AdminIcon';
import { getInitials } from '../../utils/adminUsers';

export default function AdminTopbar({ user, query, onQueryChange, onLogout }) {
  const displayName = user?.username || user?.email || 'Admin';

  return (
    <header className="flex min-h-[54px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex h-[38px] w-full items-center gap-2.5 rounded-[22px] bg-[#eceecb] px-4 text-[#777861] sm:max-w-[430px]">
        <AdminIcon type="search" />
        <input
          className="w-full border-0 bg-transparent text-sm text-[#454632] outline-none placeholder:text-[#96977e]"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Tìm kiếm người dùng, email..."
        />
      </div>
      <div className="flex items-center justify-end gap-2.5">
        <button
          type="button"
          className="flex h-[34px] w-[34px] items-center justify-center rounded-full text-[#37382a] hover:bg-[#eeeece]"
          aria-label="Thông báo"
        >
          <AdminIcon type="bell" />
        </button>
        <button
          type="button"
          className="flex h-[38px] w-[38px] items-center justify-center overflow-hidden rounded-full bg-[#d4b493] text-xs font-black text-white"
          title={displayName}
        >
          {user?.avatarUrl ? (
            <img className="h-full w-full object-cover" src={user.avatarUrl} alt={displayName} />
          ) : (
            getInitials(displayName)
          )}
        </button>
        <button
          type="button"
          className="flex h-[34px] items-center gap-1.5 rounded-[18px] bg-[#bd4c23]/10 px-3 text-xs font-black text-[#b7451b]"
          onClick={onLogout}
        >
          <AdminIcon type="logout" className="h-4 w-4" />
          <span>Thoát</span>
        </button>
      </div>
    </header>
  );
}
