import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      toast.success(`Đăng ký nhận tin thành công với email: ${email}`);
      setEmail('');
    }
  };

  return (
    <footer className="border-t border-[#ede5db] bg-[#f9f4ee] py-12 font-body text-[#3f3d2e]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
          {/* Cột 1: Logo và mô tả */}
          <div className="space-y-3">
            <Link to="/home" className="font-display text-2xl font-bold italic text-[#b14f25] hover:opacity-90 transition">
              Tiệm Cũ
            </Link>
            <p className="text-sm leading-relaxed text-[#8c8a79] max-w-[240px]">
              Mang đến những sản phẩm thời trang và phong cách sống đậm chất riêng.
            </p>
          </div>

          {/* Cột 2: Về Tiệm Cũ */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold tracking-wider text-[#3f3d2e] uppercase">
              Về Tiệm Cũ
            </h4>
            <ul className="space-y-2 text-sm text-[#8c8a79]">
              <li>
                <Link to="/products" className="hover:text-[#b14f25] transition-colors">
                  Câu chuyện
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-[#b14f25] transition-colors">
                  Cửa hàng
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#b14f25] transition-colors">
                  Liên hệ
                </Link>
              </li>
            </ul>
          </div>

          {/* Cột 3: Hỗ trợ */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold tracking-wider text-[#3f3d2e] uppercase">
              Hỗ trợ
            </h4>
            <ul className="space-y-2 text-sm text-[#8c8a79]">
              <li>
                <a href="#return-policy" className="hover:text-[#b14f25] transition-colors">
                  Chính sách đổi trả
                </a>
              </li>
              <li>
                <a href="#buying-guide" className="hover:text-[#b14f25] transition-colors">
                  Hướng dẫn mua hàng
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-[#b14f25] transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Cột 4: Đăng ký nhận tin */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold tracking-wider text-[#3f3d2e] uppercase">
              Đăng ký nhận tin
            </h4>
            <form onSubmit={handleSubscribe} className="flex gap-2 max-w-sm">
              <input
                type="email"
                placeholder="Email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-[#e0d6cc] bg-white px-4 py-2.5 text-sm text-[#3f3d2e] placeholder-[#b4b19a] focus:border-[#b14f25] focus:outline-none transition-colors"
              />
              <button
                type="submit"
                className="rounded-xl bg-[#c0392b] px-6 py-2.5 text-sm font-bold text-white hover:bg-[#a93226] active:scale-95 transition-all whitespace-nowrap"
              >
                Gửi
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 border-t border-[#ede5db] pt-6 text-center text-xs text-[#9f9c89]">
          <p>© 2026 Tiệm Cũ - Chợ đồ cũ có gu tại Việt Nam. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
}
