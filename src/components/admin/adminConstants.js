export const roleLabels = {
  buyer: 'Người mua',
  seller: 'Người bán',
  admin: 'Quản trị',
};

export const roleClasses = {
  buyer: 'bg-[#baf0a5] text-[#32661f]',
  seller: 'bg-[#f5be8d] text-[#8f431c]',
  admin: 'bg-[#ffd2c6] text-[#b03c22]',
};

export const adminPageSize = 5;

export const emptyUserForm = {
  fullName: '',
  email: '',
  phone: '',
  avatarUrl: '',
  role: 'buyer',
  isActive: true,
  password: '',
};

export const adminMenuItems = [
  ['warehouse', 'Kho Hàng'],
  ['orders', 'Đơn Hàng'],
  ['customers', 'Khách Hàng'],
  ['products', 'Sản phẩm'],
  ['users', 'Người dùng'],
  ['settings', 'Cài Đặt'],
];
