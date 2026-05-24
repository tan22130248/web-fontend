export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  SHIPPING: 'shipping',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
};

export const statusConfig = {
  [ORDER_STATUS.PENDING]: { label: 'Chờ xác nhận', bgColor: 'bg-[#fff5e5]', textColor: 'text-[#f59e0b]' },
  [ORDER_STATUS.CONFIRMED]: { label: 'Đã xác nhận', bgColor: 'bg-[#eff6ff]', textColor: 'text-[#3b82f6]' },
  [ORDER_STATUS.SHIPPING]: { label: 'Đang giao', bgColor: 'bg-[#eef2ff]', textColor: 'text-[#6366f1]' },
  [ORDER_STATUS.DELIVERED]: { label: 'Đã giao', bgColor: 'bg-[#f0fdf4]', textColor: 'text-[#22c55e]' },
  [ORDER_STATUS.CANCELLED]: { label: 'Đã huỷ', bgColor: 'bg-[#fef2f2]', textColor: 'text-[#ef4444]' },
  [ORDER_STATUS.REFUNDED]: { label: 'Hoàn tiền', bgColor: 'bg-[#f3f4f6]', textColor: 'text-[#6b7280]' },
};

export const formatPrice = (amount) => {
  if (amount == null) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

export const formatOrderDate = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};
