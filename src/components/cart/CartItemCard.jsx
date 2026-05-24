import React from 'react';
import { formatPrice } from '../../utils/orderUtils';

export default function CartItemCard({ item, onUpdateQty, onRemove }) {
  return (
    <div className="flex gap-4 p-4 bg-white border border-[#ede5db] rounded-xl shadow-sm transition-all hover:shadow-md">
      <div className="w-24 h-24 bg-[#fdf8f2] rounded-lg border border-[#ede5db] overflow-hidden flex-shrink-0 flex items-center justify-center">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <span className="text-3xl opacity-20">🛍️</span>
        )}
      </div>
      
      <div className="flex-1 flex flex-col justify-between min-w-0 py-1">
        <div>
          <h3 className="text-sm md:text-base font-semibold text-[#3f3d2e] line-clamp-2">{item.name}</h3>
          {item.selectedVariant && (
            <p className="text-xs text-gray-500 mt-1">Phân loại: {item.selectedVariant}</p>
          )}
          <p className="text-[#ac4218] font-bold mt-2">{formatPrice(item.price)}</p>
        </div>
      </div>
      
      <div className="flex flex-col items-end justify-between py-1">
        <button 
          onClick={() => onRemove(item.productId, item.selectedVariant)}
          className="text-gray-400 hover:text-red-500 transition-colors p-1"
          title="Xoá"
        >
          ✕
        </button>
        
        <div className="flex items-center border border-[#ede5db] rounded-lg overflow-hidden bg-white">
          <button 
            onClick={() => onUpdateQty(item.productId, item.selectedVariant, item.quantity - 1)}
            disabled={item.quantity <= 1}
            className="px-3 py-1 bg-[#fdf8f2] text-gray-600 hover:bg-[#f9e8d0] disabled:opacity-50 transition-colors"
          >
            -
          </button>
          <span className="px-3 py-1 text-sm text-[#3f3d2e] font-medium border-x border-[#ede5db] min-w-[2.5rem] text-center">
            {item.quantity}
          </span>
          <button 
            onClick={() => onUpdateQty(item.productId, item.selectedVariant, item.quantity + 1)}
            className="px-3 py-1 bg-[#fdf8f2] text-gray-600 hover:bg-[#f9e8d0] transition-colors"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
