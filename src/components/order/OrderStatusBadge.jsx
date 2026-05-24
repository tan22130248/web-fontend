import React from 'react';
import { ORDER_STATUS, statusConfig } from '../../utils/orderUtils';

export default function OrderStatusBadge({ status, className = '' }) {
  const config = statusConfig[status] || { label: status, bgColor: 'bg-gray-100', textColor: 'text-gray-600' };
  
  return (
    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${config.bgColor} ${config.textColor} ${className}`}>
      {config.label}
    </span>
  );
}
