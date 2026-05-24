import React, { useState } from 'react';

export default function CancelOrderDialog({ open, onClose, onConfirm, reasons = [], title = "Xác nhận huỷ đơn hàng" }) {
  const [selectedReason, setSelectedReason] = useState('');
  
  if (!open) return null;

  const handleConfirm = () => {
    if (!selectedReason) return;
    onConfirm(selectedReason);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-cream">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        
        <div className="p-5">
          <p className="text-sm text-gray-600 mb-4">Vui lòng chọn lý do huỷ đơn hàng này:</p>
          
          <div className="space-y-3">
            {reasons.map((reason, idx) => (
              <label key={idx} className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center mt-0.5">
                  <input
                    type="radio"
                    name="cancelReason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    className="w-4 h-4 text-brand-500 border-gray-300 focus:ring-brand-500 cursor-pointer"
                  />
                </div>
                <span className="text-sm text-gray-700 group-hover:text-gray-900">{reason}</span>
              </label>
            ))}
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Giữ đơn hàng
          </button>
          <button 
            onClick={handleConfirm}
            disabled={!selectedReason}
            className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Xác nhận huỷ
          </button>
        </div>
      </div>
    </div>
  );
}
