import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

export default function LoginForm({ onSwitch, onForgotPassword }) {
  const [form, setForm]     = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login }           = useAuth();
  const navigate            = useNavigate();

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    setLoading(true);
    try {
      const res = await authService.login(form);
      login(res.user, res.token);
      toast.success('Đăng nhập thành công!');
      
      if (res.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/home');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đăng nhập thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="slide-in-right w-full">
      <h2 className="font-display text-2xl font-bold text-dark mb-1">Chào mừng trở lại</h2>
      <p className="text-brand-400 text-sm mb-6">Đăng nhập để tiếp tục mua sắm</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-brand-700 mb-1">Tên đăng nhập</label>
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="Nhập tên đăng nhập"
            className="form-input"
            autoComplete="username"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-brand-700 mb-1">Mật khẩu</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            className="form-input"
            autoComplete="current-password"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-xs text-brand-500 hover:text-brand-700 transition-colors"
          >
            Quên mật khẩu?
          </button>
        </div>

        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>

      <p className="text-center text-xs text-brand-400 mt-5">
        Chưa có tài khoản?{' '}
        <button
          onClick={onSwitch}
          className="text-brand-600 font-semibold hover:underline"
        >
          Đăng ký ngay
        </button>
      </p>
    </div>
  );
}
