import React, { useState } from 'react';
import { Star, X } from 'lucide-react';
import { toast } from 'react-toastify';
import reviewService from '../../services/reviewService';

export default function ReviewModal({ open, onClose, product, onSuccess }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!open || !product) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.warning('Vui lòng nhập nội dung đánh giá');
      return;
    }
    setSubmitting(true);
    try {
      await reviewService.createReview(product.productId, rating, comment);
      toast.success('Gửi đánh giá thành công!');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || 'Có lỗi xảy ra khi gửi đánh giá');
    } finally {
      setSubmitting(false);
    }
  };

  const getRatingLabel = (stars) => {
    switch (stars) {
      case 5: return 'Rất tốt ⭐⭐⭐⭐⭐';
      case 4: return 'Tốt ⭐⭐⭐⭐';
      case 3: return 'Bình thường ⭐⭐⭐';
      case 2: return 'Chưa tốt ⭐⭐';
      case 1: return 'Rất tệ ⭐';
      default: return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-2xl border border-[#ede5db] shadow-xl overflow-hidden text-[#3f3d2e] font-body">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-[#fbf9f6]">
          <div>
            <h3 className="font-bold text-lg text-[#ac4218]">Đánh giá sản phẩm</h3>
            <p className="text-xs text-gray-500 mt-0.5">Đơn hàng đã giao thành công</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
          </button>
        </div>

        {/* Product Info */}
        <div className="p-6 pb-4 border-b border-gray-50 flex gap-4 items-center">
          <div className="w-14 h-14 bg-gray-50 rounded-lg border border-gray-100 overflow-hidden flex-shrink-0">
            {product.productImageUrl ? (
              <img src={product.productImageUrl} alt={product.productName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-cream" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-gray-800 line-clamp-1">{product.productName}</h4>
            {(product.variantSize || product.variantColor) && (
              <p className="text-xs text-gray-500 mt-0.5">
                Phân loại: {[product.variantSize, product.variantColor].filter(Boolean).join(' / ')}
              </p>
            )}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Star Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">Chọn số sao:</label>
            <div className="flex items-center space-x-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform active:scale-90"
                >
                  <Star
                    className={`w-9 h-9 transition-colors ${
                      star <= (hoverRating || rating)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-gray-200'
                    }`}
                  />
                </button>
              ))}
              <span className="text-sm font-semibold text-amber-600 ml-3">
                {getRatingLabel(hoverRating || rating)}
              </span>
            </div>
          </div>

          {/* Comment Text */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider">Nội dung đánh giá:</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Chia sẻ cảm nhận của bạn về sản phẩm này (chất liệu, kích cỡ, mức độ hài lòng...)"
              rows={4}
              className="w-full text-sm p-3 rounded-xl border border-[#ede5db] focus:outline-none focus:ring-2 focus:ring-[#ac4218]/20 focus:border-[#ac4218] bg-[#fffcf9] text-[#3f3d2e]"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-all"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-[#ac4218] hover:bg-[#8e3512] disabled:bg-gray-300 text-white text-sm font-bold shadow-sm transition-all"
            >
              {submitting ? 'Đang gửi...' : 'Gửi đánh giá'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
