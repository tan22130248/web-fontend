export function normalizeUser(user) {
  return {
    id: user.id,
    fullName: user.fullName || user.full_name || user.username || 'Chưa đặt tên',
    email: user.email || '',
    phone: user.phone || '',
    avatarUrl: user.avatarUrl || user.avatar_url || '',
    role: String(user.role || 'buyer').toLowerCase(),
    isActive:
      typeof user.isActive === 'boolean'
        ? user.isActive
        : typeof user.active === 'boolean'
          ? user.active
          : user.is_active !== false,
    createdAt: user.createdAt || user.created_at || null,
    updatedAt: user.updatedAt || user.updated_at || null,
  };
}

export function unpackUsers(response) {
  const data = response;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.users)) return data.users;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

export function formatDate(date) {
  if (!date) return 'Chưa rõ';
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return 'Chưa rõ';
  return parsed.toLocaleDateString('vi-VN');
}

export function getInitials(name = '') {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'TC';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}
