import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import LoginForm from '../../components/auth/LoginForm';
import RegisterForm from '../../components/auth/RegisterForm';
import SocialLogin from '../../components/auth/SocialLogin';
import { useAuth } from '../../context/AuthContext';

const BG_URL = 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=1600&q=80';

/* ─── Left panel decorative icons ─────────────────────────── */
function ShoppingBagIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z"/>
    </svg>
  );
}

/* ─── Auth Page ────────────────────────────────────────────── */
export default function AuthPage() {
  const [mode, setMode]   = useState('login'); // 'login' | 'register'
  const { login, isAuthenticated, user } = useAuth();
  const navigate          = useNavigate();
  const [searchParams]    = useSearchParams();

  // Handle OAuth2 redirect with token in URL
  useEffect(() => {
    const token = searchParams.get('token');
    const userRaw = searchParams.get('user');
    if (token) {
      try {
        const decodedUser = userRaw ? JSON.parse(userRaw) : {};
        login(decodedUser, token);
        if (decodedUser?.role === 'admin' || decodedUser?.role === 'ADMIN') {
          navigate('/admin', { replace: true });
        } else {
          navigate('/home', { replace: true });
        }
      } catch {
        toast.error('Đăng nhập OAuth thất bại');
      }
    }
  }, [searchParams, login, navigate]);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user?.role === 'admin' || user?.role === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/home', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  // Handle mode query param (?mode=login|register)
  useEffect(() => {
    const m = searchParams.get('mode');
    if (m === 'register') {
      setMode('register');
    } else if (m === 'login') {
      setMode('login');
    }
  }, [searchParams]);

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center relative"
      style={{
        backgroundImage: `url(${BG_URL})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-dark/50 backdrop-blur-[2px]" />

      {/* Floating Back to Home Button */}
      <Link
        to="/home"
        className="absolute left-6 top-6 z-20 flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur border border-white/20 hover:bg-white/20 transition shadow-lg"
      >
        ← Quay lại Trang chủ
      </Link>

      {/* Book card */}
      <div className="relative z-10 w-full max-w-4xl mx-4 rounded-3xl overflow-hidden shadow-2xl flex min-h-[580px]"
           style={{ boxShadow: '0 25px 80px rgba(26,15,0,0.5)' }}>

        {/* ── Left panel ─────────────────────────── */}
        <div
          className="hidden md:flex flex-col justify-between p-10 w-[42%] flex-shrink-0"
          style={{
            background: 'linear-gradient(145deg, #7a3516 0%, #b85815 50%, #d4711e 100%)',
          }}
        >
          {/* Logo */}
          <div>
            <div className="flex items-center gap-2 mb-8">
              <ShoppingBagIcon className="w-8 h-8 text-white" />
              <span className="font-display text-2xl font-bold text-white tracking-wide">
                Tiệm Cũ
              </span>
            </div>
            <p className="text-brand-100 text-sm leading-relaxed">
              Khám phá phong cách thời trang độc đáo, mua sắm dễ dàng và an toàn.
            </p>
          </div>

          {/* Mode switch buttons */}
          <div className="space-y-3">
            <p className="text-brand-200 text-xs font-medium uppercase tracking-widest mb-3">
              Truy cập nhanh
            </p>
            <button
              onClick={() => setMode('login')}
              className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                mode === 'login'
                  ? 'bg-white text-brand-700 border-white'
                  : 'bg-transparent text-white border-white/40 hover:border-white/80 hover:bg-white/10'
              }`}
            >
              Đăng nhập
            </button>
            <button
              onClick={() => setMode('register')}
              className={`w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                mode === 'register'
                  ? 'bg-white text-brand-700 border-white'
                  : 'bg-transparent text-white border-white/40 hover:border-white/80 hover:bg-white/10'
              }`}
            >
              Đăng ký
            </button>

            {/* Social logins on left too */}
            <div className="pt-2 space-y-2">
              <button
                onClick={() => window.location.href = `${process.env.REACT_APP_API_URL}/oauth2/authorization/google`}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/30 text-white text-sm transition-all"
              >
                <svg width="16" height="16" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                Google
              </button>
              <button
                onClick={() => window.location.href = `${process.env.REACT_APP_API_URL}/oauth2/authorization/facebook`}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/30 text-white text-sm transition-all"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#fff">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </button>
            </div>
          </div>
        </div>

        {/* ── Right panel ─────────────────────────── */}
        <div className="flex-1 bg-cream p-8 md:p-10 flex flex-col justify-center overflow-y-auto">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-6 md:hidden">
            <ShoppingBagIcon className="w-6 h-6 text-brand-500" />
            <span className="font-display text-xl font-bold text-dark">Tiệm Cũ</span>
          </div>

          {mode === 'login'
            ? <LoginForm  onSwitch={() => setMode('register')} />
            : <RegisterForm onSwitch={() => setMode('login')} />
          }
        </div>
      </div>
    </div>
  );
}
