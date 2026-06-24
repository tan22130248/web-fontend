import React from 'react';
import OrderStatusBadge from './OrderStatusBadge';
import { formatPrice, formatOrderDate } from '../../utils/orderUtils';

export default function OrderCard({ order, onClick, actions, onReviewClick }) {
  return (
    <div 
      className="bg-white rounded-xl border border-[#ede5db] p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col gap-4"
      onClick={() => onClick(order.id)}
    >
      <div className="flex justify-between items-center border-b border-gray-100 pb-3">
        <div className="flex items-center gap-3">
          <span className="font-medium text-[#3f3d2e]">{order.shopName || 'Tiệm Cũ'}</span>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">Mã: {order.orderCode || order.id}</span>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      <div className="flex flex-col gap-4">
        {order.items && order.items.map((item, idx) => {
          const name = item.productName || item.name;
          const imageUrl = item.productImageUrl || item.imageUrl;
          const variant = item.variantSize || item.variantColor
            ? [item.variantSize, item.variantColor].filter(Boolean).join(' / ')
            : item.variant;

          return (
            <div key={item.id || idx} className="flex gap-4 items-center border-b border-gray-50 pb-3 last:border-0 last:pb-0">
              <div className="w-16 h-16 bg-gray-50 rounded-lg border border-gray-100 overflow-hidden flex-shrink-0">
                {imageUrl ? (
                  <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-cream" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-800 line-clamp-1">{name}</h3>
                {variant && (
                  <p className="text-xs text-gray-500 mt-0.5">Phân loại: {variant}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">Số lượng: {item.quantity}</p>
              </div>
              {/* Review Button if Delivered */}
              {order.status === 'delivered' && (
                <div className="flex-shrink-0 ml-4">
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
                      className="px-4 py-1.5 text-xs font-bold text-white bg-[#ac4218] hover:bg-[#8e3512] rounded-lg shadow-sm transition-all animate-pulse-subtle"
                    >
                      Đánh giá
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <div className="flex justify-between items-center pt-3 border-t border-gray-50">
        <div className="text-xs text-gray-500">
          Ngày đặt: {formatOrderDate(order.createdAt)}
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            {order.paymentMethod === 'vnpay' && (
              <span className="text-[10px] font-bold text-[#005BAA] bg-[#eef6ff] border border-[#d1e5fd] px-1.5 py-0.5 rounded mr-2 uppercase tracking-wide">
                VN<span className="text-[#ED1B24]">PAY</span>
              </span>
            )}
            <span className="text-xs text-gray-500 mr-2">Tổng tiền:</span>
            <span className="text-brand-600 font-bold text-base">{formatPrice(order.totalAmount)}</span>
          </div>
          
          {actions && actions.length > 0 && (
            <div className="flex gap-2 ml-4">
              {actions.map((action, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    action.onClick(order);
                  }}
                  className={`px-4 py-1.5 text-sm font-medium rounded-lg ${
                    action.primary 
                      ? 'bg-brand-500 text-white hover:bg-brand-600' 
                      : 'border border-gray-300 text-gray-700 bg-white hover:bg-gray-50'
                  }`}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
