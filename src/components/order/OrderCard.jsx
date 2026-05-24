import React from 'react';
import OrderStatusBadge from './OrderStatusBadge';
import { formatPrice, formatOrderDate } from '../../utils/orderUtils';

export default function OrderCard({ order, onClick, actions }) {
  // Support both old mock item fields and real API fields
  const firstItem = order.items?.[0];
  const itemName = firstItem ? (firstItem.productName || firstItem.name) : null;
  const itemImage = firstItem ? (firstItem.productImageUrl || firstItem.imageUrl) : null;
  const itemVariant = firstItem
    ? (firstItem.variantSize || firstItem.variantColor
        ? [firstItem.variantSize, firstItem.variantColor].filter(Boolean).join(' / ')
        : firstItem.variant)
    : null;

  return (
    <div 
      className="bg-white rounded-xl border border-[#ede5db] p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col gap-4"
      onClick={() => onClick(order.id)}
    >
      <div className="flex justify-between items-center border-b border-gray-100 pb-3">
        <div className="flex items-center gap-3">
          <span className="font-medium text-[#3f3d2e]">{order.shopName || 'Tiệm Cũ'}</span>
          <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">Mã: {order.id}</span>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>
      
      <div className="flex gap-4 items-start">
        {firstItem && (
          <>
            <div className="w-20 h-20 bg-gray-50 rounded-lg border border-gray-100 overflow-hidden flex-shrink-0">
              {itemImage ? (
                 <img src={itemImage} alt={itemName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-cream" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-800 line-clamp-2">{itemName}</h3>
              {itemVariant && (
                <p className="text-xs text-gray-500 mt-1">Phân loại: {itemVariant}</p>
              )}
              <div className="flex justify-between items-center mt-2">
                <span className="text-sm text-gray-600">x{firstItem.quantity}</span>
                {order.items.length > 1 && (
                  <span className="text-xs text-gray-400">+{order.items.length - 1} sản phẩm khác</span>
                )}
              </div>
            </div>
          </>
        )}
      </div>
      
      <div className="flex justify-between items-center pt-3 border-t border-gray-50">
        <div className="text-xs text-gray-500">
          Ngày đặt: {formatOrderDate(order.createdAt)}
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
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
