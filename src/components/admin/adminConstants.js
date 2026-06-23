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

// Route-based sidebar navigation. Each item maps to a nested route under /admin.
export const adminMenuItems = [
  { icon: 'products', label: 'Sản phẩm', path: '/admin/products' },
  { icon: 'orders', label: 'Đơn hàng', path: '/admin/orders' },
  { icon: 'users', label: 'Người dùng', path: '/admin/users' },
  { icon: 'shop', label: 'Đăng ký người bán', path: '/admin/registrations' },
  { icon: 'customers', label: 'Khiếu nại', path: '/admin/complaints' },
];

// Product status model (mirrors AdminProductController backend mapping).
export const productStatusConfig = {
  active: { label: 'Đang bán', bgColor: 'bg-[#d9f2e5]', textColor: 'text-[#257940]' },
  pending: { label: 'Chờ duyệt', bgColor: 'bg-[#fdecd2]', textColor: 'text-[#b9762a]' },
  violation: { label: 'Vi phạm', bgColor: 'bg-[#ffd9d2]', textColor: 'text-[#b32534]' },
};

export const complaintPriorityConfig = {
  high: { label: 'CAO', bgColor: 'bg-[#ffd9d2]', textColor: 'text-[#b32534]' },
  medium: { label: 'TRUNG BÌNH', bgColor: 'bg-[#fdecd2]', textColor: 'text-[#b9762a]' },
  low: { label: 'THẤP', bgColor: 'bg-[#e4eccb]', textColor: 'text-[#6d7a33]' },
};
