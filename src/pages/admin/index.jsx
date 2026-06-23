import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import AdminModal from '../../components/admin/AdminModal';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminStats from '../../components/admin/AdminStats';
import AdminTopbar from '../../components/admin/AdminTopbar';
import AdminUserDetail from '../../components/admin/AdminUserDetail';
import AdminUserForm from '../../components/admin/AdminUserForm';
import AdminUserTable from '../../components/admin/AdminUserTable';
import AdminRegistrationTable from '../../components/admin/AdminRegistrationTable';
import AdminRegistrationDetail from '../../components/admin/AdminRegistrationDetail';
import { adminPageSize, emptyUserForm } from '../../components/admin/adminConstants';
import { useAuth } from '../../context/AuthContext';
import adminService from '../../services/adminService';
import { normalizeUser, unpackUsers } from '../../utils/adminUsers';

export default function AdminPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registrationsLoading, setRegistrationsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [registrationFilter, setRegistrationFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState(null);
  const [activeTab, setActiveTab] = useState('users');

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

  const fetchRegistrations = async () => {
    setRegistrationsLoading(true);
    try {
      const response = await adminService.getSellerRegistrations({ status: registrationFilter, q: query });
      setRegistrations(response);
    } catch (error) {
      setRegistrations([]);
      toast.error(error?.response?.data?.message || 'Không thể tải danh sách đăng ký người bán');
    } finally {
      setRegistrationsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (activeTab === 'registrations') {
      fetchRegistrations();
    }
  }, [activeTab, registrationFilter, query]);

  useEffect(() => {
    setPage(1);
  }, [query, roleFilter, registrationFilter, activeTab]);

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

  const filteredRegistrations = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return registrations.filter((item) => {
      const matchKeyword =
        !keyword ||
        item.fullName.toLowerCase().includes(keyword) ||
        item.email.toLowerCase().includes(keyword) ||
        item.phone?.toLowerCase().includes(keyword);
      return matchKeyword;
    });
  }, [registrations, query]);

  const totalPages = Math.max(1, Math.ceil((activeTab === 'registrations' ? filteredRegistrations.length : filteredUsers.length) / adminPageSize));
  const visibleUsers = filteredUsers.slice((page - 1) * adminPageSize, page * adminPageSize);
  const visibleRegistrations = filteredRegistrations.slice((page - 1) * adminPageSize, page * adminPageSize);

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
    setSelectedRegistration(null);
    setRejectReason('');
    setRejectError(null);
  };

  const upsertLocalUser = (nextUser) => {
    setUsers((current) => {
      const exists = current.some((item) => item.id === nextUser.id);
      if (exists) return current.map((item) => (item.id === nextUser.id ? nextUser : item));
      return [nextUser, ...current];
    });
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setModal(null);
    setSelectedUser(null);
    setSelectedRegistration(null);
    setPage(1);
    if (tab === 'registrations') {
      fetchRegistrations();
    }
  };

  const handleViewRegistration = (item) => {
    setSelectedRegistration(item);
    setModal('registrationDetail');
  };

  const handleApproveRegistration = async (item) => {
    try {
      const response = await adminService.approveSellerRegistration(item.id);
      toast.success('Đã duyệt đăng ký người bán');
      setSelectedRegistration(response);
      fetchRegistrations();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Không thể duyệt đăng ký');
    }
  };

  const handleRejectRegistration = (item) => {
    setSelectedRegistration(item);
    setRejectReason(item.rejectionReason || '');
    setRejectError(null);
    setModal('rejectRegistration');
  };

  const submitRejectReason = async () => {
    if (!rejectReason.trim()) {
      setRejectError('Bạn cần nhập lý do từ chối.');
      return;
    }

    try {
      const response = await adminService.rejectSellerRegistration(selectedRegistration.id, rejectReason.trim());
      toast.success('Đã từ chối đăng ký người bán và gửi email thông báo');
      setSelectedRegistration(response);
      setModal('registrationDetail');
      setRejectReason('');
      setRejectError(null);
      fetchRegistrations();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Không thể từ chối đăng ký');
    }
  };

  const handleDeleteRegistration = async (item) => {
    const result = await Swal.fire({
      title: 'Xóa đăng ký?',
      text: 'Hành động này sẽ xóa vĩnh viễn hồ sơ đăng ký người bán.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
      background: '#fdf8f2',
      color: '#3f3d2e',
      buttonsStyling: false,
      customClass: {
        popup: 'rounded-2xl border border-[#ede5db] p-6',
        confirmButton: 'bg-[#b32534] hover:bg-[#981f2a] text-white px-6 py-2.5 rounded-xl font-bold text-sm transition active:scale-[0.98] outline-none border-none mx-2 cursor-pointer',
        cancelButton: 'bg-[#f4f1e2] hover:bg-[#e9e4ce] text-[#6d5d3f] px-6 py-2.5 rounded-xl font-bold text-sm transition active:scale-[0.98] outline-none border-none mx-2 cursor-pointer'
      }
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      await adminService.deleteSellerRegistration(item.id);
      toast.success('Đã xóa đăng ký người bán');
      setSelectedRegistration(null);
      fetchRegistrations();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Không thể xóa đăng ký');
    }
  };

  const handleLogout = () => {
    Swal.fire({
      title: 'Đăng xuất',
      text: 'Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Đăng xuất',
      cancelButtonText: 'Hủy',
      background: '#fdf8f2',
      color: '#3f3d2e',
      buttonsStyling: false,
      customClass: {
        popup: 'rounded-2xl border border-[#ede5db] p-6',
        confirmButton: 'bg-[#d4711e] hover:bg-[#c25f10] text-white px-6 py-2.5 rounded-xl font-bold text-sm transition active:scale-[0.98] outline-none border-none mx-2 cursor-pointer',
        cancelButton: 'bg-[#a89d91] hover:bg-[#96897c] text-white px-6 py-2.5 rounded-xl font-bold text-sm transition active:scale-[0.98] outline-none border-none mx-2 cursor-pointer'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        toast.success('Đăng xuất thành công!');
        navigate('/home');
      }
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
    <div className="grid min-h-screen grid-cols-1 bg-[#fefee5] font-body text-[#3f3d2e] lg:grid-cols-[250px_minmax(0,1fr)]">
      <AdminSidebar activeTab={activeTab} onTabChange={handleTabChange} />

      <main className="min-w-0 px-3.5 py-3.5 sm:px-7 sm:py-[18px]">
        <AdminTopbar user={user} query={query} onQueryChange={setQuery} onLogout={handleLogout} />
        <AdminPageHeader
          title={activeTab === 'registrations' ? 'Quản lý đăng ký người bán' : 'Quản trị người dùng'}
          filterValue={activeTab === 'registrations' ? registrationFilter : roleFilter}
          filterOptions={
            activeTab === 'registrations'
              ? [
                  { value: 'all', label: 'Tất cả trạng thái' },
                  { value: 'pending', label: 'Chờ duyệt' },
                  { value: 'approved', label: 'Đã duyệt' },
                  { value: 'rejected', label: 'Bị từ chối' },
                ]
              : [
                  { value: 'all', label: 'Lọc vai trò' },
                  { value: 'buyer', label: 'Người mua' },
                  { value: 'seller', label: 'Người bán' },
                  { value: 'admin', label: 'Quản trị' },
                ]
          }
          onFilterChange={activeTab === 'registrations' ? setRegistrationFilter : setRoleFilter}
          onCreate={activeTab === 'users' ? handleCreate : undefined}
          createLabel="Thêm người dùng"
        />
        {activeTab === 'users' && <AdminStats stats={stats} />}

        {activeTab === 'users' ? (
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
        ) : (
          <AdminRegistrationTable
            registrations={visibleRegistrations}
            loading={registrationsLoading}
            filteredCount={filteredRegistrations.length}
            page={page}
            pageSize={adminPageSize}
            totalPages={totalPages}
            onPageChange={setPage}
            onView={handleViewRegistration}
            onApprove={handleApproveRegistration}
            onReject={handleRejectRegistration}
            onDelete={handleDeleteRegistration}
          />
        )}
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

      {modal === 'registrationDetail' && selectedRegistration && (
        <AdminModal title="Chi tiết đăng ký người bán" onClose={closeModal}>
          <AdminRegistrationDetail registration={selectedRegistration} />
          <div className="mt-6 flex flex-wrap gap-3">
            {selectedRegistration.status === 'pending' && (
              <>
                <button
                  type="button"
                  className="rounded-[10px] bg-[#d9f2e5] px-4 py-3 text-sm font-black text-[#257940] hover:bg-[#bde7cd]"
                  onClick={() => handleApproveRegistration(selectedRegistration)}
                >
                  Duyệt
                </button>
                <button
                  type="button"
                  className="rounded-[10px] bg-[#ffe3df] px-4 py-3 text-sm font-black text-[#b32534] hover:bg-[#f7c7c0]"
                  onClick={() => handleRejectRegistration(selectedRegistration)}
                >
                  Từ chối
                </button>
              </>
            )}
            <button
              type="button"
              className="rounded-[10px] bg-[#f4f1e2] px-4 py-3 text-sm font-black text-[#6d5d3f] hover:bg-[#e9e4ce]"
              onClick={() => handleDeleteRegistration(selectedRegistration)}
            >
              Xóa đăng ký
            </button>
          </div>
        </AdminModal>
      )}

      {modal === 'rejectRegistration' && selectedRegistration && (
        <AdminModal title="Từ chối đăng ký người bán" onClose={closeModal}>
          <div className="space-y-5">
            <p className="text-sm text-[#3f3d2e]">
              Vui lòng nhập lý do từ chối để gửi thông báo cho người đăng ký. Lý do này cũng sẽ được gửi vào email của họ.
            </p>
            <div>
              <label className="block text-sm font-black text-[#686954] mb-2">Lý do từ chối</label>
              <textarea
                value={rejectReason}
                onChange={(event) => {
                  setRejectReason(event.target.value);
                  setRejectError(null);
                }}
                rows={6}
                className="w-full rounded-[14px] border border-[#e5dfcd] bg-[#fdfaf6] px-4 py-3 text-sm text-[#3f3d2e] outline-none transition focus:border-[#d4711e] focus:ring-2 focus:ring-[#f1d3b7]"
                placeholder="Nhập lý do từ chối, ví dụ: CCCD không rõ nét hoặc thông tin không đầy đủ..."
              />
              {rejectError && <p className="mt-2 text-sm font-black text-[#b32534]">{rejectError}</p>}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="rounded-[10px] bg-[#b32534] px-4 py-3 text-sm font-black text-white hover:bg-[#981f2a]"
                onClick={submitRejectReason}
              >
                Xác nhận từ chối
              </button>
              <button
                type="button"
                className="rounded-[10px] bg-[#f4f1e2] px-4 py-3 text-sm font-black text-[#6d5d3f] hover:bg-[#e9e4ce]"
                onClick={closeModal}
              >
                Hủy
              </button>
            </div>
          </div>
        </AdminModal>
      )}
    </div>
  );
}
