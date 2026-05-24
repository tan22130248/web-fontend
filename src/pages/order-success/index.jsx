import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';

export default function OrderSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const orderId = location.state?.orderId;
  const orderCount = location.state?.orderCount || 1;

  useEffect(() => {
    // If accessed directly without orderId, redirect home
    if (!orderId) {
      navigate('/home');
    }
  }, [orderId, navigate]);

  if (!orderId) return null;

  return (
    <div className="min-h-screen flex flex-col bg-[#f9f4ee] font-body text-[#3f3d2e]">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="bg-white rounded-3xl p-10 md:p-12 text-center max-w-lg w-full border border-[#ede5db] shadow-sm">
          <div className="w-20 h-20 bg-[#e6f9ee] text-[#27ae60] rounded-full flex items-center justify-center mx-auto mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h1 className="text-2xl md:text-3xl font-bold text-[#3f3d2e] mb-3">Đặt hàng thành công!</h1>
          <p className="text-[#646652] mb-8 leading-relaxed">
            Cảm ơn bạn đã mua sắm tại Tiệm Cũ. Đơn hàng của bạn đang được xử lý và sẽ sớm được giao đến bạn.
          </p>
          
          <div className="bg-[#fafafa] rounded-xl p-4 mb-4 inline-block border border-gray-100 min-w-[200px]">
            <span className="text-sm text-gray-500 block mb-1">Mã đơn hàng của bạn</span>
            <span className="text-lg font-bold text-[#ac4218] tracking-wide">{orderId}</span>
          </div>

          {orderCount > 1 && (
            <p className="text-sm text-gray-500 mb-6">
              Giỏ hàng của bạn đã được tách thành <span className="font-bold text-[#ac4218]">{orderCount} đơn hàng</span> (mỗi cửa hàng một đơn).
            </p>
          )}
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
            <button 
              onClick={() => navigate(`/orders`)}
              className="px-6 py-3.5 font-semibold text-[#ac4218] bg-[#fff8f5] border border-[#ac421840] rounded-xl hover:bg-[#ffece4] transition-colors"
            >
              Xem đơn hàng
            </button>
            <button 
              onClick={() => navigate('/home')}
              className="px-6 py-3.5 font-bold text-white bg-gradient-to-r from-[#ac4218] to-[#fe7e4f] rounded-xl hover:opacity-90 transition-opacity shadow-sm"
            >
              Tiếp tục mua sắm
            </button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
