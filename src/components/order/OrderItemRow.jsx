import React from 'react';
import { formatPrice } from '../../utils/orderUtils';

export default function OrderItemRow({ item, orderStatus, onReviewClick }) {
  // Support both old mock fields and real API fields
  const name = item.productName || item.name;
  const imageUrl = item.productImageUrl || item.imageUrl;
  const price = item.unitPrice ?? item.price;
  const variant = buildVariantLabel(item);

  return (
    <div className="flex gap-4 py-4 border-b border-gray-100 last:border-0 items-center">
      <div className="w-16 h-16 bg-cream rounded-md border border-gray-100 overflow-hidden flex-shrink-0">
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-cream" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-gray-800">{name}</h4>
        {variant && <p className="text-xs text-gray-500 mt-1">Phân loại: {variant}</p>}
        <div className="flex items-center gap-1 mt-2">
          <span className="text-xs text-gray-500">x{item.quantity}</span>
        </div>
      </div>
      <div className="text-right flex-shrink-0 mr-4">
        <p className="text-sm font-medium text-brand-600">{formatPrice(price)}</p>
        {item.totalPrice != null && item.quantity > 1 && (
          <p className="text-xs text-gray-400 mt-1">{formatPrice(item.totalPrice)}</p>
        )}
      </div>
      {orderStatus === 'delivered' && onReviewClick && (
        <div className="flex-shrink-0">
          {item.reviewed ? (
            <span className="inline-flex items-center text-xs font-bold text-gray-400 bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-lg select-none">
              Đã đánh giá
            </span>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onReviewClick(item);
              }}
              className="px-4 py-1.5 text-xs font-bold text-white bg-[#ac4218] hover:bg-[#8e3512] rounded-lg shadow-sm transition-all"
            >
              Đánh giá
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/** Build variant label from API fields (variantSize / variantColor) or old mock field (variant) */
function buildVariantLabel(item) {
  if (item.variantSize || item.variantColor) {
    return [item.variantSize, item.variantColor].filter(Boolean).join(' / ');
  }
  return item.variant || null;
}
