import React, { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { toast } from 'react-toastify';
import AdminModal from '../../components/admin/AdminModal';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminStats from '../../components/admin/AdminStats';
import AdminUserDetail from '../../components/admin/AdminUserDetail';
import AdminUserForm from '../../components/admin/AdminUserForm';
import AdminUserTable from '../../components/admin/AdminUserTable';
import { adminPageSize, emptyUserForm } from '../../components/admin/adminConstants';
import adminService from '../../services/adminService';
import { normalizeUser, unpackUsers } from '../../utils/adminUsers';

export default function AdminUsersPage() {
  const { query } = useOutletContext();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

  const stats = useMemo(
    () => ({
      total: users.length,
      sellers: users.filter((item) => item.role === 'seller').length,
      locked: users.filter((item) => !item.isActive).length,
    }),
    [users]
  );

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
        upsertLocalUser(normalizeUser(response));
        toast.success('Đã thêm người dùng');
      } else if (selectedUser) {
        const response = await adminService.updateUser(selectedUser.id, payload);
        upsertLocalUser(normalizeUser(response));
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
      upsertLocalUser(normalizeUser(response));
      toast.success(nextStatus ? 'Đã mở khóa tài khoản' : 'Đã khóa tài khoản');
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Không thể đổi trạng thái tài khoản');
    }
  };

  return (
    <>
      <AdminPageHeader
        title="Quản trị người dùng"
        filterValue={roleFilter}
        filterOptions={[
          { value: 'all', label: 'Lọc vai trò' },
          { value: 'buyer', label: 'Người mua' },
          { value: 'seller', label: 'Người bán' },
          { value: 'admin', label: 'Quản trị' },
        ]}
        onFilterChange={setRoleFilter}
        onCreate={handleCreate}
        createLabel="Thêm người dùng"
      />
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
    </>
  );
}
