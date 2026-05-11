import React, { useEffect, useState } from 'react';

export default function AdminUserForm({ initialValue, mode, saving, onSubmit, onCancel }) {
  const [form, setForm] = useState(initialValue);

  useEffect(() => {
    setForm(initialValue);
  }, [initialValue]);

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const submit = (event) => {
    event.preventDefault();
    onSubmit(form);
  };

  const inputClass =
    'min-h-[42px] rounded-[9px] border border-[#e4e2c4] bg-white px-3 font-body text-sm text-[#3f3d2e] outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15';

  return (
    <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={submit}>
      <label className="grid gap-2">
        <span className="text-[13px] font-black text-[#676854]">Họ và tên</span>
        <input
          className={inputClass}
          value={form.fullName}
          onChange={(event) => update('fullName', event.target.value)}
          placeholder="Nhập họ tên"
          required
        />
      </label>
      <label className="grid gap-2">
        <span className="text-[13px] font-black text-[#676854]">Email</span>
        <input
          className={inputClass}
          type="email"
          value={form.email}
          onChange={(event) => update('email', event.target.value)}
          placeholder="user@email.com"
          required
        />
      </label>
      <label className="grid gap-2">
        <span className="text-[13px] font-black text-[#676854]">Số điện thoại</span>
        <input className={inputClass} value={form.phone} onChange={(event) => update('phone', event.target.value)} placeholder="090..." />
      </label>
      <label className="grid gap-2">
        <span className="text-[13px] font-black text-[#676854]">Ảnh đại diện</span>
        <input
          className={inputClass}
          value={form.avatarUrl}
          onChange={(event) => update('avatarUrl', event.target.value)}
          placeholder="https://..."
        />
      </label>
      <label className="grid gap-2">
        <span className="text-[13px] font-black text-[#676854]">Vai trò</span>
        <select className={inputClass} value={form.role} onChange={(event) => update('role', event.target.value)}>
          <option value="buyer">Người mua</option>
          <option value="seller">Người bán</option>
          <option value="admin">Quản trị</option>
        </select>
      </label>
      <label className="grid gap-2">
        <span className="text-[13px] font-black text-[#676854]">Trạng thái</span>
        <select className={inputClass} value={form.isActive ? 'active' : 'locked'} onChange={(event) => update('isActive', event.target.value === 'active')}>
          <option value="active">Hoạt động</option>
          <option value="locked">Bị khóa</option>
        </select>
      </label>
      {mode === 'create' && (
        <label className="grid gap-2 md:col-span-2">
          <span className="text-[13px] font-black text-[#676854]">Mật khẩu tạm</span>
          <input
            className={inputClass}
            type="password"
            value={form.password}
            onChange={(event) => update('password', event.target.value)}
            placeholder="Tối thiểu 6 ký tự"
            minLength={6}
            required
          />
        </label>
      )}
      <div className="mt-1 flex justify-end gap-3 md:col-span-2">
        <button type="button" className="min-h-10 rounded-[9px] bg-[#eeeece] px-4 text-sm font-black text-[#5d5f4d]" onClick={onCancel}>
          Hủy
        </button>
        <button
          type="submit"
          className="min-h-10 rounded-[9px] bg-gradient-to-r from-[#c65520] to-[#fb734b] px-4 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-60"
          disabled={saving}
        >
          {saving ? 'Đang lưu...' : mode === 'create' ? 'Thêm người dùng' : 'Lưu thay đổi'}
        </button>
      </div>
    </form>
  );
}
