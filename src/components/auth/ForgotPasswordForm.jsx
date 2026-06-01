import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { authService } from '../../services/authService';

export default function ForgotPasswordForm({ onSwitch }) {
  const navigate = useNavigate();
  const [step, setStep] = useState('email'); // 'email' | 'otp' | 'reset'
  const [form, setForm] = useState({
    emailOrPhone: '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!form.emailOrPhone.trim()) {
      toast.error('Vui lòng nhập email hoặc số điện thoại');
      return;
    }
    setLoading(true);
    try {
      // Call forgot-password endpoint to verify user and send OTP
      const response = await authService.forgotPassword(form.emailOrPhone);
      if (response?.id) {
        setUserId(response.id);
        toast.success('Mã OTP đã được gửi');
        setStep('otp');
      } else {
        toast.error(response?.message || 'Lỗi khi gửi OTP');
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || 
        error.message || 
        'Tài khoản không tồn tại hoặc lỗi hệ thống'
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!form.otp.trim()) {
      toast.error('Vui lòng nhập mã OTP');
      return;
    }
    setLoading(true);
    try {
      await authService.verifyOtp(form.emailOrPhone, form.otp);
      toast.success('Mã OTP hợp lệ');
      setStep('reset');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Mã OTP không hợp lệ');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!form.newPassword || !form.confirmPassword) {
      toast.error('Vui lòng nhập đầy đủ mật khẩu');
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      toast.error('Mật khẩu nhập lại không khớp');
      return;
    }
    if (form.newPassword.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    setLoading(true);
    try {
      await authService.resetPassword({
        emailOrPhone: form.emailOrPhone,
        otp: form.otp,
        newPassword: form.newPassword,
      });
      toast.success('Mật khẩu đã được đặt lại thành công');
      // Reset form and go back to login
      setStep('email');
      setForm({ emailOrPhone: '', otp: '', newPassword: '', confirmPassword: '' });
      setUserId(null);
      onSwitch && onSwitch();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Lỗi đặt lại mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="slide-in-right w-full">
      <h2 className="font-display text-2xl font-bold text-dark mb-1">Đặt lại mật khẩu</h2>
      <p className="text-brand-400 text-sm mb-6">Nhập thông tin xác thực bên dưới để thiết lập lại mật khẩu an toàn của bạn</p>

      {/* STEP 1: Email/Phone */}
      {step === 'email' && (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-brand-700 mb-1">
              Email hoặc Số điện thoại
            </label>
            <input
              type="text"
              name="emailOrPhone"
              value={form.emailOrPhone}
              onChange={handleChange}
              placeholder="your@email.com hoặc +84912345678"
              className="form-input"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Đang gửi...' : 'Gửi OTP'}
          </button>
        </form>
      )}

      {/* STEP 2: OTP Verification */}
      {step === 'otp' && (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-brand-700 mb-1">
              Mã xác thực OTP
            </label>
            <p className="text-xs text-brand-400 mb-2">
              Nhập mã OTP được gửi tới {form.emailOrPhone}
            </p>
            <input
              type="text"
              name="otp"
              value={form.otp}
              onChange={handleChange}
              placeholder="000000"
              maxLength="6"
              className="form-input text-center text-lg tracking-widest"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Đang xác thực...' : 'Xác thực OTP'}
          </button>

          <button
            type="button"
            onClick={() => setStep('email')}
            className="w-full text-xs text-brand-500 hover:text-brand-700 transition-colors py-2"
          >
            Quay lại nhập email/số điện thoại
          </button>
        </form>
      )}

      {/* STEP 3: New Password */}
      {step === 'reset' && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-brand-700 mb-1">
              Mật khẩu mới
            </label>
            <input
              type="password"
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              placeholder="••••••••"
              className="form-input"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-brand-700 mb-1">
              Xác nhận mật khẩu mới
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              className="form-input"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>

          <button
            type="button"
            onClick={() => {
              setStep('email');
              setForm({ emailOrPhone: '', otp: '', newPassword: '', confirmPassword: '' });
              setUserId(null);
            }}
            className="w-full text-xs text-brand-500 hover:text-brand-700 transition-colors py-2"
          >
            Quay lại đăng nhập
          </button>
        </form>
      )}
    </div>
  );
}
