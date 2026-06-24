import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import orderService from '../../services/orderService';

export default function PaymentResultPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Hỗ trợ cả 2 định dạng: URL do BE redirect về, hoặc VNPay trả thẳng về FE
  const vnpResponseCode = searchParams.get('vnp_ResponseCode');
  const vnpTxnRef = searchParams.get('vnp_TxnRef');
  
  const statusParam = searchParams.get('status');
  const orderCodeParam = searchParams.get('orderCode');

  const isSuccess = (vnpResponseCode === '00') || (statusParam === 'success');
  const orderCode = vnpTxnRef || orderCodeParam;

  const handleRetryPayment = async () => {
    if (!orderCode) return;
    setLoading(true);
    try {
      const res = await orderService.retryPayment(orderCode);
      if (res?.paymentUrl) {
        window.location.href = res.paymentUrl;
      } else {
        toast.error('Không tìm thấy link thanh toán, vui lòng thử lại sau.');
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Không thể tạo lại thanh toán');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex flex-col bg-[#f9f4ee] font-body text-[#3f3d2e]">
      <Navbar />
      
      <main className="flex-1 min-h-[95vh] flex items-center justify-center p-4 py-12">
        <div className="bg-white rounded-3xl p-10 md:p-12 text-center max-w-lg w-full border border-[#ede5db] shadow-sm">
          {isSuccess ? (
            <div className="w-20 h-20 bg-[#e6f9ee] text-[#27ae60] rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          ) : (
            <div className="w-20 h-20 bg-[#fef2f2] text-[#ef4444] rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          )}
          
          <h1 className="text-2xl md:text-3xl font-bold text-[#3f3d2e] mb-3">
            {isSuccess ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
          </h1>
          <p className="text-[#646652] mb-8 leading-relaxed">
            {isSuccess 
              ? 'Cảm ơn bạn đã mua sắm tại Tiệm Cũ. Đơn hàng của bạn đã được thanh toán và đang được xử lý.'
              : 'Rất tiếc, giao dịch của bạn đã bị huỷ hoặc có lỗi xảy ra. Vui lòng thử lại.'}
          </p>
          
          <div className="bg-[#fafafa] rounded-xl p-4 mb-8 inline-block border border-gray-100 min-w-[200px]">
            <span className="text-sm text-gray-500 block mb-1">Mã đơn hàng của bạn</span>
            <span className="text-lg font-bold text-[#ac4218] tracking-wide">{orderCode || 'N/A'}</span>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-2">
            <button 
              onClick={() => navigate('/orders')}
              className="px-6 py-3.5 font-semibold text-[#ac4218] bg-[#fff8f5] border border-[#ac421840] rounded-xl hover:bg-[#ffece4] transition-colors"
            >
              Xem đơn hàng
            </button>
            {isSuccess ? (
              <button 
                onClick={() => navigate('/home')}
                className="px-6 py-3.5 font-bold text-white bg-gradient-to-r from-[#ac4218] to-[#fe7e4f] rounded-xl hover:opacity-90 transition-opacity shadow-sm"
              >
                Tiếp tục mua sắm
              </button>
            ) : (
              <button 
                onClick={handleRetryPayment}
                disabled={loading}
                className="px-6 py-3.5 font-bold text-white bg-gradient-to-r from-[#ac4218] to-[#fe7e4f] rounded-xl hover:opacity-90 disabled:opacity-70 disabled:cursor-not-allowed transition-opacity shadow-sm flex justify-center items-center gap-2"
              >
                {loading ? 'Đang xử lý...' : 'Thanh toán lại'}
              </button>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
