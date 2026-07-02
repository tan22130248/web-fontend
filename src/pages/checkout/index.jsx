import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatPrice } from '../../utils/orderUtils';
import ghnService from '../../services/ghnService';
import orderService from '../../services/orderService';
import addressService from '../../services/addressService';

export default function CheckoutPage() {
  const { items, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    address: '',
    provinceId: '',
    districtId: '',
    wardCode: '',
    note: '',
    paymentMethod: 'cod'
  });
  
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  
  const [submitting, setSubmitting] = useState(false);
  const [shippingFee, setShippingFee] = useState(0);
  const [calculatingFee, setCalculatingFee] = useState(false);

  const [savedAddresses, setSavedAddresses] = useState([]);
  const [showAddressModal, setShowAddressModal] = useState(false);

  // Load saved addresses on mount or when user changes
  useEffect(() => {
    const fetchAddresses = async () => {
      if (user?.id) {
        try {
          const res = await addressService.getAddresses();
          setSavedAddresses(res || []);
        } catch (e) {
          console.error('Không thể tải địa chỉ đã lưu:', e);
        }
      }
    };
    fetchAddresses();
  }, [user]);

  // Fetch provinces on mount
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const res = await ghnService.getProvinces();
        setProvinces(res?.data || []);
      } catch (error) {
        toast.error('Không thể tải danh sách Tỉnh/Thành phố');
      }
    };
    fetchProvinces();
  }, []);

  // Fetch districts when province changes
  useEffect(() => {
    const fetchDistricts = async () => {
      if (!form.provinceId) {
        setDistricts([]);
        return;
      }
      try {
        const res = await ghnService.getDistricts(form.provinceId);
        setDistricts(res?.data || []);
      } catch (error) {
        toast.error('Không thể tải danh sách Quận/Huyện');
      }
    };
    fetchDistricts();
  }, [form.provinceId]);

  // Fetch wards when district changes
  useEffect(() => {
    const fetchWards = async () => {
      if (!form.districtId) {
        setWards([]);
        return;
      }
      try {
        const res = await ghnService.getWards(form.districtId);
        setWards(res?.data || []);
      } catch (error) {
        toast.error('Không thể tải danh sách Phường/Xã');
      }
    };
    fetchWards();
  }, [form.districtId]);

  // Calculate dynamic shipping fee
  useEffect(() => {
    const fetchFee = async () => {
      if (form.districtId && form.wardCode && items.length > 0) {
        setCalculatingFee(true);
        try {
          const payload = {
            toDistrictId: Number(form.districtId),
            toWardCode: form.wardCode,
            items: items.map(i => ({
              productId: i.productId,
              variantId: i.variantId || null,
              quantity: i.quantity,
            })),
          };
          const res = await orderService.calculateFee(payload);
          // Assuming backend returns { totalFee: 35000 } or wrapped in Response
          const feeData = res?.totalFee !== undefined ? res : res?.data;
          setShippingFee(feeData?.totalFee || 0);
        } catch (error) {
          toast.error(error?.response?.data?.message || 'Lỗi tính phí giao hàng');
          setShippingFee(0);
        } finally {
          setCalculatingFee(false);
        }
      } else {
        setShippingFee(0);
      }
    };
    
    // Use debounce to prevent multiple calls if user clicks too fast
    const timeoutId = setTimeout(() => {
      fetchFee();
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [form.districtId, form.wardCode, items]);

  useEffect(() => {
    if (items.length === 0) {
      toast.info('Giỏ hàng trống, vui lòng thêm sản phẩm');
      navigate('/cart');
    }
  }, [items, navigate]);

  if (items.length === 0) return null;

  const totalAmount = items.reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0);
  const finalTotal = totalAmount + shippingFee;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.phone || !form.address || !form.provinceId || !form.districtId || !form.wardCode) {
      toast.error('Vui lòng điền đầy đủ thông tin giao hàng');
      return;
    }
    
    setSubmitting(true);
    try {
      const provinceName = provinces.find(p => p.ProvinceID == form.provinceId)?.ProvinceName || '';
      const districtName = districts.find(d => d.DistrictID == form.districtId)?.DistrictName || '';
      const wardName = wards.find(w => w.WardCode === form.wardCode)?.WardName || '';
      
      const fullAddress = `${form.address}, ${wardName}, ${districtName}, ${provinceName}`;

      // Save to database
      if (user?.id) {
        const newAddr = {
          fullName: form.fullName,
          phone: form.phone,
          address: form.address,
          provinceId: Number(form.provinceId),
          districtId: Number(form.districtId),
          wardCode: form.wardCode,
          provinceName,
          districtName,
          wardName
        };
        try {
          await addressService.createAddress(newAddr);
        } catch (e) {
          console.error('Không thể lưu địa chỉ vào DB:', e);
        }
      }

      const payload = {
        shippingAddress: fullAddress,
        toDistrictId: Number(form.districtId),
        toWardCode: form.wardCode,
        note: form.note || null,
        paymentMethod: form.paymentMethod,
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
      const firstOrder = Array.isArray(orders) && orders.length > 0 ? orders[0] : null;

      if (form.paymentMethod === 'vnpay' && firstOrder?.paymentUrl) {
        window.location.href = firstOrder.paymentUrl;
      } else {
        navigate('/order-success', {
          state: {
            orderId: firstOrder?.orderCode || firstOrder?.id,
            orderCount: Array.isArray(orders) ? orders.length : 1,
          },
        });
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Không thể tạo đơn hàng. Vui lòng thử lại.');
      setSubmitting(false);
    }
  };

  const applySavedAddress = (addr) => {
    setForm({
      ...form,
      fullName: addr.fullName,
      phone: addr.phone,
      address: addr.address,
      provinceId: addr.provinceId,
      districtId: addr.districtId,
      wardCode: addr.wardCode,
    });
    setShowAddressModal(false);
    toast.success('Đã áp dụng địa chỉ đã lưu');
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
              <div className="flex justify-between items-center mb-5 border-b border-gray-100 pb-3">
                <h2 className="text-lg font-bold text-[#3f3d2e]">Địa chỉ giao hàng</h2>
                {savedAddresses.length > 0 && (
                  <button 
                    type="button" 
                    onClick={() => setShowAddressModal(true)}
                    className="text-sm font-medium text-[#ac4218] hover:underline"
                  >
                    Chọn địa chỉ đã lưu
                  </button>
                )}
              </div>
              
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
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tỉnh / Thành phố</label>
                    <select
                      name="provinceId"
                      value={form.provinceId}
                      onChange={handleChange}
                      className="w-full border border-[#ede5db] rounded-lg px-4 py-2.5 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 bg-[#fafafa]"
                      required
                    >
                      <option value="">Chọn Tỉnh/Thành phố</option>
                      {provinces.map(p => (
                        <option key={p.ProvinceID} value={p.ProvinceID}>{p.ProvinceName}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quận / Huyện</label>
                    <select
                      name="districtId"
                      value={form.districtId}
                      onChange={handleChange}
                      className="w-full border border-[#ede5db] rounded-lg px-4 py-2.5 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 bg-[#fafafa]"
                      required
                      disabled={!form.provinceId}
                    >
                      <option value="">Chọn Quận/Huyện</option>
                      {districts.map(d => (
                        <option key={d.DistrictID} value={d.DistrictID}>{d.DistrictName}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phường / Xã</label>
                    <select
                      name="wardCode"
                      value={form.wardCode}
                      onChange={handleChange}
                      className="w-full border border-[#ede5db] rounded-lg px-4 py-2.5 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 bg-[#fafafa]"
                      required
                      disabled={!form.districtId}
                    >
                      <option value="">Chọn Phường/Xã</option>
                      {wards.map(w => (
                        <option key={w.WardCode} value={w.WardCode}>{w.WardName}</option>
                      ))}
                    </select>
                  </div>
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
                  <span className="text-[#373928] font-medium">
                    {calculatingFee ? 'Đang tính...' : formatPrice(shippingFee)}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-between items-center mb-8">
                <span className="text-sm font-semibold text-[#646652]">Tổng thanh toán</span>
                <span className="text-2xl font-bold text-[#ac4218]">{formatPrice(finalTotal)}</span>
              </div>
              
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-[#646652] mb-3">Phương thức thanh toán</h3>
                <div className="space-y-3">
                  <label className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-colors ${form.paymentMethod === 'cod' ? 'border-[#ac4218] bg-[#fff8f5]' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="cod" 
                      checked={form.paymentMethod === 'cod'} 
                      onChange={handleChange}
                      className="w-4 h-4 text-[#ac4218] focus:ring-[#ac4218]" 
                    />
                    <span className="text-sm font-medium text-[#3f3d2e] flex-1">Thanh toán khi nhận hàng (COD)</span>
                    <span className="text-2xl">💵</span>
                  </label>
                  
                  <label className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-colors ${form.paymentMethod === 'vnpay' ? 'border-[#ac4218] bg-[#fff8f5]' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                    <input 
                      type="radio" 
                      name="paymentMethod" 
                      value="vnpay" 
                      checked={form.paymentMethod === 'vnpay'} 
                      onChange={handleChange}
                      className="w-4 h-4 text-[#ac4218] focus:ring-[#ac4218]" 
                    />
                    <span className="text-sm font-medium text-[#3f3d2e] flex-1">Ví VNPAY / Thẻ Ngân Hàng</span>
                    <span className="text-2xl font-bold tracking-tight text-[#005BAA]">VN<span className="text-[#ED1B24]">PAY</span></span>
                  </label>
                </div>
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

      {/* Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-[#3f3d2e]">Địa chỉ đã lưu</h3>
              <button 
                type="button"
                onClick={() => setShowAddressModal(false)} 
                className="text-gray-500 hover:text-black font-bold text-xl"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3">
              {savedAddresses.map((addr, idx) => (
                <div 
                  key={idx} 
                  className="border border-[#ede5db] rounded-xl p-4 cursor-pointer hover:border-[#ac4218] bg-[#fafafa] hover:bg-[#fff8f5] transition-colors"
                  onClick={() => applySavedAddress(addr)}
                >
                  <p className="font-semibold text-[#3f3d2e]">{addr.fullName} - {addr.phone}</p>
                  <p className="text-sm text-gray-600 mt-1">{addr.address}, {addr.wardName}, {addr.districtName}, {addr.provinceName}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
