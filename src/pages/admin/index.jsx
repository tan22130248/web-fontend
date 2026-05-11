import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import AdminModal from '../../components/admin/AdminModal';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminStats from '../../components/admin/AdminStats';
import AdminTopbar from '../../components/admin/AdminTopbar';
import AdminUserDetail from '../../components/admin/AdminUserDetail';
import AdminUserForm from '../../components/admin/AdminUserForm';
import AdminUserTable from '../../components/admin/AdminUserTable';
import { adminPageSize, emptyUserForm } from '../../components/admin/adminConstants';
import { useAuth } from '../../context/AuthContext';
import adminService from '../../services/adminService';
import { normalizeUser, unpackUsers } from '../../utils/adminUsers';

export default function AdminPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await adminService.getUsers();
      setUsers(unpackUsers(response).map(normalizeUser));
    } catch (error) {
      setUsers([]);
      toast.error(error?.response?.data?.message || 'Không thể tải danh sách người dùng từ backend');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [query, roleFilter]);

  const filteredUsers = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return users.filter((item) => {
      const matchRole = roleFilter === 'all' || item.role === roleFilter;
      const matchKeyword =
        !keyword ||
        item.fullName.toLowerCase().includes(keyword) ||
        item.email.toLowerCase().includes(keyword) ||
        item.phone.toLowerCase().includes(keyword);
      return matchRole && matchKeyword;
    });
  }, [users, query, roleFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / adminPageSize));
  const visibleUsers = filteredUsers.slice((page - 1) * adminPageSize, page * adminPageSize);

  const stats = useMemo(() => {
    return {
      total: users.length,
      sellers: users.filter((item) => item.role === 'seller').length,
      locked: users.filter((item) => !item.isActive).length,
    };
  }, [users]);

  const formInitialValue = selectedUser
    ? {
        fullName: selectedUser.fullName,
        email: selectedUser.email,
        phone: selectedUser.phone,
        avatarUrl: selectedUser.avatarUrl,
        role: selectedUser.role,
        isActive: selectedUser.isActive,
        password: '',
      }
    : emptyUserForm;

  const closeModal = () => {
    setModal(null);
    setSelectedUser(null);
  };

  const upsertLocalUser = (nextUser) => {
    setUsers((current) => {
      const exists = current.some((item) => item.id === nextUser.id);
      if (exists) return current.map((item) => (item.id === nextUser.id ? nextUser : item));
      return [nextUser, ...current];
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const handleCreate = () => {
    setSelectedUser(null);
    setModal('create');
  };

  const handleView = (item) => {
    setSelectedUser(item);
    setModal('detail');
  };

  const handleEdit = (item) => {
    setSelectedUser(item);
    setModal('edit');
  };

  const saveUser = async (form) => {
    setSaving(true);
    const payload = {
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      avatarUrl: form.avatarUrl.trim(),
      role: form.role,
      isActive: form.isActive,
    };

    try {
      if (modal === 'create') {
        const response = await adminService.createUser({ ...payload, password: form.password });
        upsertLocalUser(normalizeUser(response.data));
        toast.success('Đã thêm người dùng');
      } else if (selectedUser) {
        const response = await adminService.updateUser(selectedUser.id, payload);
        upsertLocalUser(normalizeUser(response.data));
        toast.success('Đã cập nhật người dùng');
      }
      closeModal();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Không thể lưu người dùng');
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (item) => {
    const nextStatus = !item.isActive;
    try {
      const response = await adminService.updateUserStatus(item.id, nextStatus);
      upsertLocalUser(normalizeUser(response.data));
      toast.success(nextStatus ? 'Đã mở khóa tài khoản' : 'Đã khóa tài khoản');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Không thể đổi trạng thái tài khoản');
    }
  };

  return (
    <div className="grid min-h-screen grid-cols-1 bg-[#fefee5] font-body text-[#3f3d2e] lg:grid-cols-[250px_minmax(0,1fr)]">
      <AdminSidebar />

      <main className="min-w-0 px-3.5 py-3.5 sm:px-7 sm:py-[18px]">
        <AdminTopbar user={user} query={query} onQueryChange={setQuery} onLogout={handleLogout} />
        <AdminPageHeader roleFilter={roleFilter} onRoleFilterChange={setRoleFilter} onCreate={handleCreate} />
        <AdminStats stats={stats} />
        <AdminUserTable
          users={visibleUsers}
          loading={loading}
          filteredCount={filteredUsers.length}
          page={page}
          pageSize={adminPageSize}
          totalPages={totalPages}
          onPageChange={setPage}
          onView={handleView}
          onEdit={handleEdit}
          onToggleStatus={toggleStatus}
        />
      </main>

      {(modal === 'create' || modal === 'edit') && (
        <AdminModal title={modal === 'create' ? 'Thêm người dùng' : 'Chỉnh sửa người dùng'} onClose={closeModal}>
          <AdminUserForm
            initialValue={formInitialValue}
            mode={modal}
            saving={saving}
            onSubmit={saveUser}
            onCancel={closeModal}
          />
        </AdminModal>
      )}

      {modal === 'detail' && selectedUser && (
        <AdminModal title="Chi tiết người dùng" onClose={closeModal}>
          <AdminUserDetail user={selectedUser} />
        </AdminModal>
      )}
    </div>
  );
}
