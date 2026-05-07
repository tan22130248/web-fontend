import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { authService } from '../../services/authService';
import OtpInput from './OtpInput';

const STEPS = { FORM: 'form', OTP: 'otp' };

export default function RegisterForm({ onSwitch }) {
  const [step, setStep]   = useState(STEPS.FORM);
  const [otp, setOtp]     = useState('');
  const [sending, setSending]   = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [otpSent, setOtpSent]   = useState(false);
  const [form, setForm]   = useState({
    username: '', password: '', confirmPassword: '', email: '',
  });

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSendOtp = async () => {
    if (!form.email) { toast.error('Vui lòng nhập email trước'); return; }
    setSending(true);
    try {
      await authService.sendOtp(form.email);
      setOtpSent(true);
      setStep(STEPS.OTP);
      toast.success('Mã OTP đã được gửi đến email!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gửi OTP thất bại');
    } finally {
      setSending(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!form.username || !form.password || !form.email) {
      toast.error('Vui lòng nhập đầy đủ thông tin'); return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error('Mật khẩu nhập lại không khớp'); return;
    }
    if (!otpSent) { toast.error('Vui lòng gửi và xác thực OTP'); return; }
    if (otp.length !== 6) { toast.error('Vui lòng nhập đủ 6 số OTP'); return; }

    setRegistering(true);
    try {
      await authService.register({ ...form, otp });
      toast.success('Đăng ký thành công! Vui lòng đăng nhập.');
      onSwitch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="slide-in-right w-full">
      <h2 className="font-display text-2xl font-bold text-dark mb-1">Tạo tài khoản</h2>
      <p className="text-brand-400 text-sm mb-5">Tham gia cộng đồng mua sắm thời trang</p>

      <form onSubmit={handleRegister} className="space-y-3">
        {/* Username */}
        <div>
          <label className="block text-xs font-medium text-brand-700 mb-1">Tên đăng nhập</label>
          <input name="username" value={form.username} onChange={handleChange}
            placeholder="username" className="form-input" />
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-medium text-brand-700 mb-1">Mật khẩu</label>
          <input type="password" name="password" value={form.password} onChange={handleChange}
            placeholder="••••••••" className="form-input" />
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-medium text-brand-700 mb-1">Nhập lại mật khẩu</label>
          <input type="password" name="confirmPassword" value={form.confirmPassword}
            onChange={handleChange} placeholder="••••••••" className="form-input" />
        </div>

        {/* Email + Send OTP */}
        <div>
          <label className="block text-xs font-medium text-brand-700 mb-1">Email</label>
          <div className="flex gap-2">
            <input type="email" name="email" value={form.email} onChange={handleChange}
              placeholder="example@email.com" className="form-input" />
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={sending || otpSent}
              className="whitespace-nowrap px-3 py-2.5 rounded-xl bg-brand-100 hover:bg-brand-200 text-brand-700 text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-brand-200"
            >
              {sending ? '...' : otpSent ? '✓ Đã gửi' : 'Gửi OTP'}
            </button>
          </div>
        </div>

        {/* OTP */}
        {step === STEPS.OTP && (
          <div className="slide-in-right">
            <label className="block text-xs font-medium text-brand-700 mb-2 text-center">
              Nhập mã OTP (kiểm tra email)
            </label>
            <OtpInput value={otp} onChange={setOtp} length={6} />
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={sending}
              className="text-xs text-brand-400 hover:text-brand-600 block mx-auto mt-1"
            >
              Gửi lại OTP
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={registering}
          className="btn-primary !mt-5"
        >
          {registering ? 'Đang đăng ký...' : 'Đăng ký'}
        </button>
      </form>

      <p className="text-center text-xs text-brand-400 mt-4">
        Đã có tài khoản?{' '}
        <button onClick={onSwitch} className="text-brand-600 font-semibold hover:underline">
          Đăng nhập
        </button>
      </p>
    </div>
  );
}
