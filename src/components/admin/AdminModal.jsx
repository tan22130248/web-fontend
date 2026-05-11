import React from 'react';

export default function AdminModal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2c2d22]/30 p-5" role="presentation" onMouseDown={onClose}>
      <div
        className="max-h-[calc(100vh-44px)] w-full max-w-[620px] overflow-auto rounded-[10px] bg-[#fffef7] p-[22px] shadow-[0_30px_80px_rgba(41,35,20,0.22)]"
        role="dialog"
        aria-modal="true"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="m-0 text-[22px] font-bold text-[#b7451b]">{title}</h2>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full border-0 bg-transparent text-[#37382a] hover:bg-[#eeeece]"
            onClick={onClose}
            aria-label="Đóng"
          >
            x
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
