import React from 'react';
import { getInitials } from '../../utils/adminUsers';

export default function UserAvatar({ user, size = 'h-10 w-10' }) {
  return (
    <div className={`${size} flex flex-none items-center justify-center overflow-hidden rounded-full bg-[#fff0ea] text-xs font-black text-[#c04e20]`}>
      {user.avatarUrl ? (
        <img className="h-full w-full object-cover" src={user.avatarUrl} alt={user.fullName} />
      ) : (
        getInitials(user.fullName)
      )}
    </div>
  );
}
