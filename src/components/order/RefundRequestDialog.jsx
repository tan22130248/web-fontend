import React, { useState } from 'react';

export default function RefundRequestDialog({ open, onClose, onSubmit, reasons = [] }) {
  const [selectedReason, setSelectedReason] = useState('');
  const [description, setDescription] = useState('');
  
  if (!open) return null;

  const handleSubmit = () => {
    if (!selectedReason) return;
    onSubmit({ reason: selectedReason, description });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-fade-in">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-cream">
          <h2 className="text-lg font-bold text-gray-900">Yêu cầu hoàn tiền</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>
        
        <div className="p-5">
          <p className="text-sm text-gray-600 mb-4">Vui lòng chọn lý do hoàn tiền:</p>
          
          <div className="space-y-3 mb-5">
            {reasons.map((reason, idx) => (
              <label key={idx} className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center mt-0.5">
                  <input
                    type="radio"
                    name="refundReason"
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
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả chi tiết (Tuỳ chọn)</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Nhập thông tin chi tiết về vấn đề..."
              className="w-full rounded-lg border-gray-300 border p-3 text-sm focus:ring-brand-500 focus:border-brand-500 h-24 resize-none"
            ></textarea>
          </div>
        </div>
        
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Hủy bỏ
          </button>
          <button 
            onClick={handleSubmit}
            disabled={!selectedReason}
            className="px-4 py-2 text-sm font-medium text-white bg-brand-500 rounded-lg hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Gửi yêu cầu
          </button>
        </div>
      </div>
    </div>
  );
}
