import React from 'react';

export default function AdminIcon({ type, className = 'h-[18px] w-[18px]' }) {
  const icons = {
    warehouse: (
      <path d="M4 10.5 12 6l8 4.5v7.5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-7.5Zm4 7.5v-5h8v5M7 10h10" />
    ),
    orders: (
      <path d="M4 7h11l2 4h3v5h-2.2M6.2 16H4V7m4.5 9a1.8 1.8 0 1 0 0 .1Zm7.8 0a1.8 1.8 0 1 0 0 .1Z" />
    ),
    customers: (
      <path d="M8.5 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7-1a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM3 19a5.5 5.5 0 0 1 11 0m-1.5-3.8A4.6 4.6 0 0 1 21 19" />
    ),
    products: (
      <path d="m6 8 6-3 6 3-6 3-6-3Zm0 0v7l6 3 6-3V8m-6 3v7" />
    ),
    users: (
      <path d="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm6.5-1.5V6m-1.7 1.8h3.4M3.5 19a5.5 5.5 0 0 1 11 0m3.3-5v4.5m-2.2-2.3H20" />
    ),
    settings: (
      <path d="M12 15.2a3.2 3.2 0 1 0 0-6.4 3.2 3.2 0 0 0 0 6.4Zm7.2-3.2a7.4 7.4 0 0 0-.1-1l2-1.6-2-3.4-2.4 1a7.8 7.8 0 0 0-1.8-1L14.5 3h-5l-.4 3a7.8 7.8 0 0 0-1.8 1L5 6l-2 3.4L5 11a7.4 7.4 0 0 0 0 2l-2 1.6L5 18l2.3-1a7.8 7.8 0 0 0 1.8 1l.4 3h5l.4-3a7.8 7.8 0 0 0 1.8-1l2.3 1 2-3.4-2-1.6c.1-.3.2-.7.2-1Z" />
    ),
    search: <path d="m20 20-4.3-4.3M18 11a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />,
    bell: (
      <path d="M18 16H6l1.4-1.8V10a4.6 4.6 0 0 1 9.2 0v4.2L18 16Zm-4 2a2 2 0 0 1-4 0" />
    ),
    filter: <path d="M4 6h16M7 12h10m-7 6h4" />,
    addUser: (
      <path d="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7-4v5m-2.5-2.5h5M3.5 19a5.5 5.5 0 0 1 11 0" />
    ),
    shop: <path d="M5 10h14l-1-5H6l-1 5Zm1 0v9h12v-9M9 19v-5h6v5" />,
    lock: <path d="M7 11V8a5 5 0 0 1 10 0v3m-9 0h8a1 1 0 0 1 1 1v7H7v-7a1 1 0 0 1 1-1Z" />,
    eye: <path d="M3 12s3.2-5 9-5 9 5 9 5-3.2 5-9 5-9-5-9-5Zm9 2.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />,
    edit: <path d="m5 19 4.1-1 9.8-9.8a2 2 0 0 0-2.8-2.8L6.3 15.2 5 19Zm10.4-12.2 2.8 2.8" />,
    ban: <path d="M5 5 19 19M19 12A7 7 0 0 1 7.1 17M5 12A7 7 0 0 1 16.9 7" />,
    logout: <path d="M10 17 15 12l-5-5m5 5H3m7 8h9a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-9" />,
    check: <path d="m5 13 4 4L19 7" />,
    trash: <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m2 0v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7m4 4v6m4-6v6" />,
    truck: <path d="M3 7h11v8H3V7Zm11 3h4l3 3v2h-7v-5Zm-7 8a1.6 1.6 0 1 0 0 .1Zm10 0a1.6 1.6 0 1 0 0 .1Z" />,
    calendar: <path d="M5 7h14v13H5V7Zm0 4h14M8 4v4m8-4v4" />,
    refresh: <path d="M5 12a7 7 0 0 1 12-5l2 2m0-4v4h-4M19 12a7 7 0 0 1-12 5l-2-2m0 4v-4h4" />,
  };


  return (
    <svg
      aria-hidden="true"
      className={`${className} flex-none`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {icons[type]}
    </svg>
  );
}
