import React, { useState } from 'react';
import { X, Upload, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import PolicyModal from './PolicyModal';
import sellerService from '../../services/selllerService';
import cloudinaryService from '../../services/cloudinaryService';
import http from '../../utils/http';

export default function SellerRegistrationModal({ isOpen, onClose }) {
  const { user, updateUser } = useAuth();
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreePolicies, setAgreePolicies] = useState(false);
  const [cccdFront, setCccdFront] = useState(null);
  const [cccdBack, setCccdBack] = useState(null);
  const [cccdFrontPreview, setCccdFrontPreview] = useState(null);
  const [cccdBackPreview, setCccdBackPreview] = useState(null);

  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: user?.address || '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCccdChange = (e, side) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn tập tin hình ảnh');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước tập tin không được vượt quá 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (side === 'front') {
        setCccdFront(file);
        setCccdFrontPreview(reader.result);
      } else {
        setCccdBack(file);
        setCccdBackPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.fullName.trim()) {
      toast.error('Vui lòng nhập tên đầy đủ');
      return;
    }
    if (!formData.phone.trim()) {
      toast.error('Vui lòng nhập số điện thoại');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('Vui lòng nhập email');
      return;
    }
    if (!formData.address.trim()) {
      toast.error('Vui lòng nhập địa chỉ');
      return;
    }
    if (!cccdFront) {
      toast.error('Vui lòng tải lên ảnh mặt trước CCCD');
      return;
    }
    if (!cccdBack) {
      toast.error('Vui lòng tải lên ảnh mặt sau CCCD');
      return;
    }
    if (!agreePolicies) {
      toast.error('Vui lòng đồng ý với điều khoản và chính sách');
      return;
    }

    setLoading(true);
    try {
      toast.info('⏳ Đang tải ảnh CCCD lên...');
      
      const [cccdFrontUrl, cccdBackUrl] = await cloudinaryService.uploadFiles(
        [cccdFront, cccdBack],
        'fashion_marketplace/cccd'
      );

      const payload = {
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        cccdFrontUrl: cccdFrontUrl,
        cccdBackUrl: cccdBackUrl,
      };

      toast.info('📤 Đang gửi đơn đăng ký...');
      await sellerService.registerSeller(payload);

      toast.success('✅ Đăng ký người bán thành công! Chúng tôi sẽ xem xét đơn yêu cầu của bạn trong vòng 24 giờ.');
      
      onClose();
      
      try {
        const profile = await http.get('/api/user/profile');
        if (profile && updateUser) updateUser(profile);
      } catch (err) {
        console.warn('Unable to refresh profile after seller registration', err?.message || err);
      }
    } catch (error) {
      toast.error(error?.message || 'Có lỗi xảy ra. Vui lòng thử lại.');
      console.error('Registration error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />

      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-[#fdf8f2] to-[#f9e8d0] border-b border-[#ede5db] px-6 py-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-[#2d1f1f]">
                🏪 Đăng ký Người bán
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Trở thành người bán trên nền tảng của chúng tôi
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Info Box */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
              <AlertCircle size={20} className="text-amber-700 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <p className="font-semibold mb-1">Lưu ý</p>
                <p>Để đăng ký người bán, bạn cần cung cấp các thông tin chính xác và tải lên bản sao CCCD của bạn. Chúng tôi sẽ xác minh thông tin này để đảm bảo độ tin cậy.</p>
              </div>
            </div>

            {/* Form Section 1: Personal Info */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#2d1f1f] flex items-center gap-2">
                <span className="w-6 h-6 bg-[#d4711e] text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                Thông tin cá nhân
              </h3>

              <div className="space-y-3">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-semibold text-[#3f3d2e] mb-2">
                    Tên đầy đủ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="Nhập tên đầy đủ của bạn"
                    className="w-full px-4 py-2.5 border border-[#ede5db] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d4711e] focus:border-transparent transition-all"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold text-[#3f3d2e] mb-2">
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: 0123456789"
                    className="w-full px-4 py-2.5 border border-[#ede5db] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d4711e] focus:border-transparent transition-all"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-[#3f3d2e] mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: abc@example.com"
                    className="w-full px-4 py-2.5 border border-[#ede5db] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d4711e] focus:border-transparent transition-all"
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-semibold text-[#3f3d2e] mb-2">
                    Địa chỉ <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Nhập địa chỉ của bạn"
                    rows="3"
                    className="w-full px-4 py-2.5 border border-[#ede5db] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d4711e] focus:border-transparent transition-all resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Form Section 2: CCCD Upload */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-[#2d1f1f] flex items-center gap-2">
                <span className="w-6 h-6 bg-[#d4711e] text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                Chứng minh nhân dân
              </h3>

              <div className="grid grid-cols-2 gap-4">
                {/* CCCD Front */}
                <div>
                  <label className="block text-sm font-semibold text-[#3f3d2e] mb-2">
                    Mặt trước CCCD <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleCccdChange(e, 'front')}
                      className="hidden"
                      id="cccd-front"
                    />
                    <label
                      htmlFor="cccd-front"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#d4711e] rounded-xl cursor-pointer hover:bg-[#fdf8f2] transition-colors"
                    >
                      {cccdFrontPreview ? (
                        <img
                          src={cccdFrontPreview}
                          alt="CCCD Front"
                          className="h-full w-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center py-6">
                          <Upload size={20} className="text-[#d4711e] mb-1" />
                          <span className="text-xs font-semibold text-[#d4711e]">Tải lên</span>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                {/* CCCD Back */}
                <div>
                  <label className="block text-sm font-semibold text-[#3f3d2e] mb-2">
                    Mặt sau CCCD <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleCccdChange(e, 'back')}
                      className="hidden"
                      id="cccd-back"
                    />
                    <label
                      htmlFor="cccd-back"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#d4711e] rounded-xl cursor-pointer hover:bg-[#fdf8f2] transition-colors"
                    >
                      {cccdBackPreview ? (
                        <img
                          src={cccdBackPreview}
                          alt="CCCD Back"
                          className="h-full w-full object-cover rounded-lg"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center py-6">
                          <Upload size={20} className="text-[#d4711e] mb-1" />
                          <span className="text-xs font-semibold text-[#d4711e]">Tải lên</span>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Policies Agreement */}
            <div className="space-y-4 bg-[#fdf8f2] rounded-xl p-4 border border-[#ede5db]">
              <h3 className="text-sm font-bold text-[#2d1f1f] flex items-center gap-2">
                <span className="w-6 h-6 bg-[#d4711e] text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                Chính sách và Điều khoản
              </h3>

              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={agreePolicies}
                  onChange={(e) => setAgreePolicies(e.target.checked)}
                  className="w-5 h-5 mt-0.5 accent-[#d4711e] cursor-pointer rounded"
                />
                <div className="flex-1">
                  <p className="text-sm text-gray-700">
                    Tôi đồng ý với{' '}
                    <button
                      type="button"
                      onClick={() => setShowPolicyModal(true)}
                      className="text-[#d4711e] font-semibold hover:underline"
                    >
                      Chính sách giao dịch và bảo mật
                    </button>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Vui lòng đọc kỹ các điều khoản trước khi đăng ký
                  </p>
                </div>
              </label>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-[#ede5db]">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-[#ede5db] text-[#3f3d2e] font-semibold rounded-xl hover:bg-[#fdf8f2] transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-3 bg-[#d4711e] text-white font-semibold rounded-xl hover:bg-[#c25f10] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  '🚀 Đăng ký Người bán'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <PolicyModal
        isOpen={showPolicyModal}
        onClose={() => setShowPolicyModal(false)}
      />
    </>
  );
}
