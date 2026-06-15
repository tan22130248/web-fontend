import React, { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import AdminModal from '../../components/admin/AdminModal';
import AdminPageHeader from '../../components/admin/AdminPageHeader';
import AdminRegistrationTable from '../../components/admin/AdminRegistrationTable';
import AdminRegistrationDetail from '../../components/admin/AdminRegistrationDetail';
import { adminPageSize } from '../../components/admin/adminConstants';
import adminService from '../../services/adminService';

export default function AdminRegistrationsPage() {
  const { query } = useOutletContext();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registrationFilter, setRegistrationFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState(null);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const response = await adminService.getSellerRegistrations({ status: registrationFilter, q: query });
      setRegistrations(response);
    } catch (error) {
      setRegistrations([]);
      toast.error(error?.response?.data?.message || 'Không thể tải danh sách đăng ký người bán');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [registrationFilter, query]);


  useEffect(() => {
    setPage(1);
  }, [query, registrationFilter]);

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

  const totalPages = Math.max(1, Math.ceil(filteredRegistrations.length / adminPageSize));
  const visibleRegistrations = filteredRegistrations.slice((page - 1) * adminPageSize, page * adminPageSize);

  const closeModal = () => {
    setModal(null);
    setSelectedRegistration(null);
    setRejectReason('');
    setRejectError(null);
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
        confirmButton:
          'bg-[#b32534] hover:bg-[#981f2a] text-white px-6 py-2.5 rounded-xl font-bold text-sm transition active:scale-[0.98] outline-none border-none mx-2 cursor-pointer',
        cancelButton:
          'bg-[#f4f1e2] hover:bg-[#e9e4ce] text-[#6d5d3f] px-6 py-2.5 rounded-xl font-bold text-sm transition active:scale-[0.98] outline-none border-none mx-2 cursor-pointer',
      },
    });

    if (!result.isConfirmed) {
      return;
    }

    try {
      await adminService.deleteSellerRegistration(item.id);
      toast.success('Đã xóa đăng ký người bán');
      setSelectedRegistration(null);
      setModal(null);
      fetchRegistrations();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Không thể xóa đăng ký');
    }
  };

  return (
    <>
      <AdminPageHeader
        title="Quản lý đăng ký người bán"
        filterValue={registrationFilter}
        filterOptions={[
          { value: 'all', label: 'Tất cả trạng thái' },
          { value: 'pending', label: 'Chờ duyệt' },
          { value: 'approved', label: 'Đã duyệt' },
          { value: 'rejected', label: 'Bị từ chối' },
        ]}
        onFilterChange={setRegistrationFilter}
      />

      <AdminRegistrationTable
        registrations={visibleRegistrations}
        loading={loading}
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
    </>
  );
}
