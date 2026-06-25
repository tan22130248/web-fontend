export const ORDER_STATUS = {
  PENDING_PAYMENT: 'pending_payment',
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  SHIPPING: 'shipping',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
};

export const statusConfig = {
  [ORDER_STATUS.PENDING_PAYMENT]: { label: 'Chờ thanh toán', bgColor: 'bg-[#e0e7ff]', textColor: 'text-[#4338ca]' },
  [ORDER_STATUS.PENDING]: { label: 'Chờ giao', bgColor: 'bg-[#fddbc3]', textColor: 'text-[#a84b18]' },
  [ORDER_STATUS.CONFIRMED]: { label: 'Đã xác nhận', bgColor: 'bg-[#eff6ff]', textColor: 'text-[#3b82f6]' },
  [ORDER_STATUS.SHIPPING]: { label: 'Đang giao', bgColor: 'bg-[#e6eed2]', textColor: 'text-[#698336]' },
  [ORDER_STATUS.DELIVERED]: { label: 'Hoàn thành', bgColor: 'bg-[#cbf2c8]', textColor: 'text-[#3c822e]' },
  [ORDER_STATUS.CANCELLED]: { label: 'Đã hủy', bgColor: 'bg-[#f1f1f1]', textColor: 'text-[#999999]' },
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
