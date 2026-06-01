import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

export default function OAuth2RedirectPage() {
  const [searchParams] = useSearchParams();
  const { login }      = useAuth();
  const navigate       = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      toast.error('Đăng nhập OAuth thất bại: ' + error);
      navigate('/auth', { replace: true });
      return;
    }

    if (token) {
      try {
        // Properly decode base64url payload into UTF-8 string
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=');
        const bytes = Uint8Array.from(atob(padded).split('').map((c) => c.charCodeAt(0)));
        const decoded = new TextDecoder().decode(bytes);
        const payload = JSON.parse(decoded);

        const user = {
          id:       payload.sub,
          username: payload.username || payload.sub,
          fullName: payload.fullName || payload.username || payload.sub,
          email:    payload.email,
          phone:    payload.phone,
          avatarUrl: payload.avatarUrl,
          role:     payload.role,
        };

        login(user, token);
        toast.success('Đăng nhập thành công!');

        if (user.role === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          navigate('/home', { replace: true });
        }
      } catch (err) {
        console.error('OAuth2 redirect parse error:', err);
        toast.error('Phiên đăng nhập không hợp lệ');
        navigate('/auth', { replace: true });
      }
    } else {
      navigate('/auth', { replace: true });
    }
  }, [searchParams, login, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      <div className="text-center space-y-3">
        <div className="w-10 h-10 border-4 border-brand-400 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-brand-600 font-medium">Đang xử lý đăng nhập...</p>
      </div>
    </div>
  );
}
