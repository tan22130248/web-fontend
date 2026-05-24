import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatPrice } from '../../utils/orderUtils';
import orderService from '../../services/orderService';

export default function CheckoutPage() {
  const { items, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    address: '',
    city: '',
    note: ''
  });
  
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (items.length === 0) {
      toast.info('Giỏ hàng trống, vui lòng thêm sản phẩm');
      navigate('/cart');
    }
  }, [items, navigate]);

  if (items.length === 0) return null;

  const totalAmount = items.reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0);
  const shippingFee = 30000;
  const finalTotal = totalAmount + shippingFee;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.phone || !form.address || !form.city) {
      toast.error('Vui lòng điền đầy đủ thông tin giao hàng');
      return;
    }
    
    setSubmitting(true);
    try {
      const payload = {
        shippingAddress: `${form.address}, ${form.city}`,
        note: form.note || null,
        items: items.map(i => ({
          productId: i.productId,
          variantId: i.variantId || null,
          quantity: i.quantity,
        })),
      };
      
      const response = await orderService.createOrder(payload);
      clearCart();

      // POST /api/orders returns an array of OrderDto (split by shop)
      const orders = response;
      const firstOrderId = Array.isArray(orders) && orders.length > 0
        ? orders[0].id
        : null;

      navigate('/order-success', {
        state: {
          orderId: firstOrderId,
          orderCount: Array.isArray(orders) ? orders.length : 1,
        },
      });
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Không thể tạo đơn hàng. Vui lòng thử lại.');
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f9f4ee] font-body text-[#3f3d2e]">
      <Navbar />
      
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#ac4218] mb-2 tracking-tight">Xác nhận đặt hàng</h1>
          <p className="text-[#646652]">Kiểm tra thông tin giao hàng và xác nhận đơn của bạn.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left Column */}
          <div className="flex-1 space-y-6 w-full">
            
            {/* Address Section */}
            <section className="bg-white rounded-2xl p-6 border border-[#ede5db] shadow-sm">
              <h2 className="text-lg font-bold text-[#3f3d2e] mb-5 border-b border-gray-100 pb-3">Địa chỉ giao hàng</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên người nhận</label>
                  <input
                    type="text"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    placeholder="Nguyễn Văn A"
                    className="w-full border border-[#ede5db] rounded-lg px-4 py-2.5 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 bg-[#fafafa]"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="0901234567"
                    className="w-full border border-[#ede5db] rounded-lg px-4 py-2.5 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 bg-[#fafafa]"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ chi tiết</label>
                  <input
                    type="text"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    placeholder="Số nhà, đường, phường/xã..."
                    className="w-full border border-[#ede5db] rounded-lg px-4 py-2.5 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 bg-[#fafafa]"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tỉnh / Thành phố</label>
                  <input
                    type="text"
                    name="city"
                    value={form.city}
                    onChange={handleChange}
                    placeholder="Hồ Chí Minh"
                    className="w-full border border-[#ede5db] rounded-lg px-4 py-2.5 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 bg-[#fafafa]"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú cho người bán (tuỳ chọn)</label>
                  <textarea
                    name="note"
                    value={form.note}
                    onChange={handleChange}
                    placeholder="Ví dụ: giao buổi sáng, gọi trước khi giao..."
                    className="w-full border border-[#ede5db] rounded-lg px-4 py-2.5 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 resize-none h-20 bg-[#fafafa]"
                  />
                </div>
              </div>
            </section>
            
            {/* Products Review */}
            <section className="bg-white rounded-2xl p-6 border border-[#ede5db] shadow-sm">
              <h2 className="text-lg font-bold text-[#3f3d2e] mb-5 border-b border-gray-100 pb-3">Sản phẩm đặt hàng</h2>
              
              <div className="space-y-4">
                {items.map((item, idx) => (
                  <div key={idx} className="flex gap-4 p-3 border border-[#ede5db] rounded-xl bg-white shadow-sm">
                    <div className="w-16 h-16 bg-[#fdf8f2] rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center border border-[#ede5db]">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xl opacity-20">🛍️</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h4 className="text-sm font-semibold text-[#3f3d2e] line-clamp-1">{item.name}</h4>
                      {item.selectedVariant && (
                        <p className="text-xs text-gray-500 mt-1">Phân loại: {item.selectedVariant}</p>
                      )}
                      <p className="text-xs text-[#ac4218] font-medium mt-1.5">
                        {item.quantity} x {formatPrice(item.price)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
            
          </div>
          
          {/* Right Column */}
          <div className="w-full lg:w-[380px] lg:shrink-0">
            <div className="bg-[#fbfbe0] border border-[#babba440] rounded-3xl p-6 md:p-8 sticky top-6 shadow-sm">
              <h2 className="text-lg font-bold text-[#373928] mb-6">Thanh toán</h2>
              
              <div className="space-y-4 mb-6 pb-6 border-b border-[#babba440]">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#646652]">Tiền hàng</span>
                  <span className="text-[#373928] font-medium">{formatPrice(totalAmount)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#646652]">Phí vận chuyển</span>
                  <span className="text-[#373928] font-medium">{formatPrice(shippingFee)}</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center mb-8">
                <span className="text-sm font-semibold text-[#646652]">Tổng thanh toán</span>
                <span className="text-2xl font-bold text-[#ac4218]">{formatPrice(finalTotal)}</span>
              </div>
              
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-[#646652] mb-3">Phương thức thanh toán</h3>
                <label className="flex items-center gap-3 p-3 border border-[#ac421840] bg-[#fff8f5] rounded-xl cursor-pointer">
                  <input type="radio" checked readOnly className="w-4 h-4 text-[#ac4218]" />
                  <span className="text-sm font-medium text-[#3f3d2e]">Thanh toán khi nhận hàng (COD)</span>
                </label>
              </div>
              
              <button 
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-gradient-to-r from-[#ac4218] to-[#fe7e4f] text-white rounded-xl font-bold text-base hover:opacity-90 disabled:opacity-70 disabled:cursor-not-allowed transition-opacity shadow-sm flex justify-center items-center"
              >
                {submitting ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}
              </button>
            </div>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
