import React from 'react';
import { formatPrice } from '../../utils/orderUtils';

export default function CartSummary({ items, onCheckout }) {
  const totalAmount = items.reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  
  return (
    <div className="bg-[#fbfbe0] border border-[#babba440] rounded-3xl p-6 md:p-8 sticky top-6 shadow-sm">
      <h2 className="text-lg font-bold text-[#373928] mb-6">Tóm tắt đơn hàng</h2>
      
      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-center text-sm">
          <span className="text-[#646652]">Tổng tiền hàng ({itemCount} sản phẩm)</span>
          <span className="text-[#373928] font-medium">{formatPrice(totalAmount)}</span>
        </div>
      </div>
      
      <div className="pt-4 border-t border-[#babba440] mb-8">
        <div className="flex justify-between items-center">
          <span className="text-sm font-semibold text-[#646652]">Tạm tính</span>
          <span className="text-xl md:text-2xl font-bold text-[#ac4218]">{formatPrice(totalAmount)}</span>
        </div>
      </div>
      
      <button 
        onClick={onCheckout}
        disabled={items.length === 0}
        className="w-full py-3.5 bg-gradient-to-r from-[#ac4218] to-[#fe7e4f] text-white rounded-xl font-bold text-base hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity shadow-sm"
      >
        Tiến hành đặt hàng
      </button>
    </div>
  );
}
