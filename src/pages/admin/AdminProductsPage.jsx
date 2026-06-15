import React, { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import AdminIcon from '../../components/admin/AdminIcon';
import AdminModal from '../../components/admin/AdminModal';
import { adminPageSize, productStatusConfig } from '../../components/admin/adminConstants';
import { formatPrice } from '../../utils/orderUtils';
import { getInitials, formatDate } from '../../utils/adminUsers';
import adminService from '../../services/adminService';

const TABS = [
  { key: 'all', label: 'Tất cả' },
  { key: 'active', label: 'Đang bán' },
  { key: 'pending', label: 'Chờ duyệt' },
  { key: 'violation', label: 'Vi phạm' },
];

function deriveStatus(product) {
  if (!product.active && !product.isActive) return 'violation';
  if (product.stock === 0) return 'pending';
  return 'active';
}

export default function AdminProductsPage() {
  const { query } = useOutletContext();
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, pending: 0, violation: 0 });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [innerQuery, setInnerQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const [list, statsResp] = await Promise.all([
        adminService.getProducts({ status: activeTab }),
        adminService.getProductStats(),
      ]);
      setProducts(Array.isArray(list) ? list : []);
      setStats(statsResp || {});
    } catch (error) {
      setProducts([]);
      toast.error(error?.response?.data?.message || 'Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [activeTab]);


  useEffect(() => {
    setPage(1);
  }, [query, innerQuery, activeTab]);

  const filtered = useMemo(() => {
    const keyword = `${query} ${innerQuery}`.trim().toLowerCase();
    if (!keyword) return products;
    return products.filter(
      (p) =>
        p.name?.toLowerCase().includes(keyword) ||
        p.sku?.toLowerCase().includes(keyword) ||
        p.sellerName?.toLowerCase().includes(keyword)
    );
  }, [products, query, innerQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / adminPageSize));
  const visible = filtered.slice((page - 1) * adminPageSize, page * adminPageSize);
  const startIndex = filtered.length === 0 ? 0 : (page - 1) * adminPageSize + 1;
  const endIndex = Math.min(page * adminPageSize, filtered.length);

  const getVisiblePages = () => {
    const pages = [];
    pages.push(1);

    const start = Math.max(2, page - 1);
    const end = Math.min(totalPages - 1, page + 1);

    if (start > 2) {
      pages.push('...');
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPages - 1) {
      pages.push('...');
    }

    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();


  const handleApprove = async (item) => {
    try {
      await adminService.approveProduct(item.id);
      toast.success('Đã duyệt sản phẩm');
      fetchProducts();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Không thể duyệt sản phẩm');
    }
  };

  const handleViolation = async (item) => {
    try {
      await adminService.flagProductViolation(item.id);
      toast.success('Đã đánh dấu sản phẩm vi phạm và gỡ khỏi sàn');
      fetchProducts();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Không thể cập nhật sản phẩm');
    }
  };

  const handleDelete = async (item) => {
    const result = await Swal.fire({
      title: 'Xóa sản phẩm?',
      text: `Hành động này sẽ xóa vĩnh viễn "${item.name}".`,
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
    if (!result.isConfirmed) return;

    try {
      await adminService.deleteProduct(item.id);
      toast.success('Đã xóa sản phẩm');
      setSelected(null);
      fetchProducts();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Không thể xóa sản phẩm');
    }
  };

  const tabCount = (key) => {
    if (key === 'all') return stats.total ?? 0;
    return stats[key] ?? 0;
  };

  return (
    <>
      <section className="my-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="m-0 text-[clamp(25px,3vw,30px)] font-black leading-tight text-[#b7451b]">
          Quản trị sản phẩm
        </h1>
      </section>

      {/* Status tabs */}
      <div className="mb-5 flex flex-wrap gap-2.5">
        {TABS.map((tab) => {
          const active = activeTab === tab.key;
          const count = tabCount(tab.key);
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 rounded-[10px] px-4 py-2.5 text-sm font-black transition ${
                active ? 'bg-[#ededc5] text-[#bd4c23]' : 'bg-[#f4f3df] text-[#7c7d63] hover:bg-[#ededc5]'
              }`}
            >
              {tab.label}
              <span
                className={`inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-xs ${
                  active ? 'bg-[#bd4c23] text-white' : 'bg-[#e2e0c2] text-[#7c7d63]'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search bar */}
      <div className="mb-5 flex h-[44px] items-center gap-2.5 rounded-[12px] bg-[#eceecb] px-4 text-[#777861]">
        <AdminIcon type="search" />
        <input
          className="w-full border-0 bg-transparent text-sm text-[#454632] outline-none placeholder:text-[#96977e]"
          value={innerQuery}
          onChange={(e) => setInnerQuery(e.target.value)}
          placeholder="Tìm theo tên sản phẩm, mã SKU..."
        />
      </div>

      <section className="overflow-hidden rounded-[9px] bg-white shadow-[0_8px_28px_rgba(103,84,51,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse">
            <thead>
              <tr className="bg-[#fffef5] text-left text-xs font-black uppercase text-[#777761]">
                <th className="border-b border-[#f0efe4] px-6 py-[18px]">Hình ảnh</th>
                <th className="border-b border-[#f0efe4] px-6 py-[18px]">Tên sản phẩm</th>
                <th className="border-b border-[#f0efe4] px-6 py-[18px]">Người bán</th>
                <th className="border-b border-[#f0efe4] px-6 py-[18px]">Giá</th>
                <th className="border-b border-[#f0efe4] px-6 py-[18px]">Trạng thái</th>
                <th className="border-b border-[#f0efe4] px-6 py-[18px]">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="h-[188px] px-6 py-[18px] text-center text-[#8f907d]">
                    Đang tải danh sách sản phẩm...
                  </td>
                </tr>
              ) : visible.length === 0 ? (
                <tr>
                  <td colSpan="6" className="h-[188px] px-6 py-[18px] text-center text-[#8f907d]">
                    Không tìm thấy sản phẩm phù hợp.
                  </td>
                </tr>
              ) : (
                visible.map((item) => {
                  const status = deriveStatus(item);
                  const cfg = productStatusConfig[status];
                  return (
                    <tr key={item.id} className="text-sm text-[#454638]">
                      <td className="border-b border-[#f0efe4] px-6 py-[18px] align-middle">
                        <div className="h-12 w-12 overflow-hidden rounded-[10px] bg-[#f3f0e2]">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-[#bcae93]">
                              <AdminIcon type="products" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="border-b border-[#f0efe4] px-6 py-[18px] align-middle">
                        <strong className={`block text-sm leading-tight ${status === 'violation' ? 'text-[#a08f86] line-through' : 'text-[#3e3f31]'}`}>
                          {item.name}
                        </strong>
                        <span className="mt-1 block text-xs text-[#8f907d]">SKU: {item.sku}</span>
                      </td>
                      <td className="border-b border-[#f0efe4] px-6 py-[18px] align-middle">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-[#fff0ea] text-[10px] font-black text-[#c04e20]">
                            {getInitials(item.sellerName || '')}
                          </span>
                          <div>
                            <strong className="block text-xs text-[#3e3f31]">{item.sellerName || 'Không rõ'}</strong>
                            <span className="block text-[11px] text-[#8f907d]">{item.shopName || ''}</span>
                          </div>
                        </div>
                      </td>
                      <td className="border-b border-[#f0efe4] px-6 py-[18px] align-middle font-black text-[#bd4c23]">
                        {formatPrice(item.price)}
                      </td>
                      <td className="border-b border-[#f0efe4] px-6 py-[18px] align-middle">
                        <span className={`inline-flex items-center gap-1.5 rounded-[7px] px-2.5 py-1 text-xs font-black ${cfg.bgColor} ${cfg.textColor}`}>
                          <span className="h-1.5 w-1.5 rounded-full bg-current" />
                          {cfg.label}
                        </span>
                      </td>
                      <td className="border-b border-[#f0efe4] px-6 py-[18px] align-middle">
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            className="flex h-[30px] w-[30px] items-center justify-center rounded-lg text-[#61624e] hover:bg-[#f4f4dd] hover:text-[#bd4c23]"
                            onClick={() => setSelected(item)}
                            aria-label="Xem chi tiết"
                          >
                            <AdminIcon type="eye" className="h-4 w-4" />
                          </button>
                          {status === 'pending' && (
                            <button
                              type="button"
                              className="flex h-[30px] w-[30px] items-center justify-center rounded-lg text-[#257940] hover:bg-[#e0f3e8]"
                              onClick={() => handleApprove(item)}
                              aria-label="Duyệt"
                            >
                              <AdminIcon type="check" className="h-4 w-4" />
                            </button>
                          )}
                          {status === 'violation' ? (
                            <button
                              type="button"
                              className="flex h-[30px] w-[30px] items-center justify-center rounded-lg text-[#b32534] hover:bg-[#fbe3df]"
                              onClick={() => handleDelete(item)}
                              aria-label="Xóa"
                            >
                              <AdminIcon type="trash" className="h-4 w-4" />
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="flex h-[30px] w-[30px] items-center justify-center rounded-lg text-[#61624e] hover:bg-[#f4f4dd] hover:text-[#b32534]"
                              onClick={() => handleViolation(item)}
                              aria-label="Đánh dấu vi phạm"
                            >
                              <AdminIcon type="ban" className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <footer className="flex min-h-[76px] flex-col gap-4 px-6 py-[15px] text-[13px] text-[#686954] sm:flex-row sm:items-center sm:justify-between">
          <span>
            Hiển thị {startIndex}-{endIndex} của {filtered.length} sản phẩm
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] bg-[#eeedce] font-black text-[#686954] transition-colors hover:bg-[#e2dfc7] disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              ‹
            </button>
            {visiblePages.map((pageNumber, idx) => {
              if (pageNumber === '...') {
                return (
                  <span key={`dots-${idx}`} className="px-2 font-bold text-[#8f907d] select-none">
                    ...
                  </span>
                );
              }
              return (
                <button
                  key={pageNumber}
                  type="button"
                  className={`flex h-[38px] w-[38px] items-center justify-center rounded-[10px] font-black transition-colors ${
                    pageNumber === page ? 'bg-[#bd4c23] text-white' : 'bg-[#eeedce] text-[#686954] hover:bg-[#e2dfc7]'
                  }`}
                  onClick={() => setPage(pageNumber)}
                >
                  {pageNumber}
                </button>
              );
            })}
            <button
              type="button"
              className="flex h-[38px] w-[38px] items-center justify-center rounded-[10px] bg-[#eeedce] font-black text-[#686954] transition-colors hover:bg-[#e2dfc7] disabled:cursor-not-allowed disabled:opacity-50"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
            >
              ›
            </button>
          </div>
        </footer>
      </section>

      {selected && (
        <AdminModal title="Chi tiết sản phẩm" onClose={() => setSelected(null)}>
          <div className="space-y-5">
            <div className="flex gap-4">
              <div className="h-28 w-28 flex-none overflow-hidden rounded-[12px] bg-[#f3f0e2]">
                {selected.imageUrl ? (
                  <img src={selected.imageUrl} alt={selected.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[#bcae93]">
                    <AdminIcon type="products" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <h3 className="text-lg font-black text-[#3f3d2e]">{selected.name}</h3>
                <p className="mt-1 text-sm text-[#8f907d]">SKU: {selected.sku}</p>
                <p className="mt-2 text-base font-black text-[#bd4c23]">{formatPrice(selected.price)}</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Info label="Người bán" value={selected.sellerName} />
              <Info label="Cửa hàng" value={selected.shopName} />
              <Info label="Danh mục" value={selected.categoryName} />
              <Info label="Tồn kho" value={String(selected.stock)} />
              <Info label="Đã bán" value={String(selected.soldCount)} />
              <Info label="Lượt xem" value={String(selected.viewCount)} />
              <Info label="Tình trạng" value={selected.conditionStatus} />
              <Info label="Ngày tạo" value={formatDate(selected.createdAt)} />
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="rounded-[10px] bg-[#d9f2e5] px-4 py-3 text-sm font-black text-[#257940] hover:bg-[#bde7cd]"
                onClick={() => {
                  handleApprove(selected);
                  setSelected(null);
                }}
              >
                Duyệt / Cho lên kệ
              </button>
              <button
                type="button"
                className="rounded-[10px] bg-[#ffe3df] px-4 py-3 text-sm font-black text-[#b32534] hover:bg-[#f7c7c0]"
                onClick={() => {
                  handleViolation(selected);
                  setSelected(null);
                }}
              >
                Đánh dấu vi phạm
              </button>
              <button
                type="button"
                className="rounded-[10px] bg-[#f4f1e2] px-4 py-3 text-sm font-black text-[#6d5d3f] hover:bg-[#e9e4ce]"
                onClick={() => handleDelete(selected)}
              >
                Xóa sản phẩm
              </button>
            </div>
          </div>
        </AdminModal>
      )}
    </>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-[10px] border border-[#efedcf] bg-white p-4">
      <p className="text-xs font-black uppercase text-[#87886f]">{label}</p>
      <p className="mt-2 text-sm font-black text-[#3f3d2e]">{value || 'Chưa cập nhật'}</p>
    </div>
  );
}
