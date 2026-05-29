import React, { useState, useEffect } from 'react';
import SellerProductForm from './SellerProductForm';
import sellerProductService from '../../../services/selllerService';

export default function SellerProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await sellerProductService.getProducts(page, size, searchKeyword, activeTab);

      setProducts(response.content || []);
      setTotalPages(response.totalPages || 0);
      setTotalElements(response.totalElements || 0);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách sản phẩm:", error);
      alert("Không thể tải danh sách sản phẩm!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, activeTab]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(0);
    fetchProducts();
  };

  const handleEditClick = async (id) => {
    try {
      const fullProductDetail = await sellerProductService.getById(id);
      setSelectedProduct(fullProductDetail);
      setIsEditMode(true);
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết sản phẩm:", error);
      alert("Không thể tải thông tin sản phẩm!");
    }
  };

  const handleSaveProduct = async (updatedProduct) => {
    try {
      if (updatedProduct.id) {
        await sellerProductService.updateProduct(updatedProduct.id, updatedProduct);
        alert("Cập nhật sản phẩm thành công!");
      } else {
        await sellerProductService.createProduct(updatedProduct);
        alert("Đăng sản phẩm mới thành công!");
      }
      setIsEditMode(false);
      setSelectedProduct(null);
      fetchProducts();
    } catch (error) {
      console.error("Lỗi khi lưu sản phẩm:", error);
      alert("Đã xảy ra lỗi trong quá trình lưu!");
    }
  };

  const handleSoftDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn ẩn sản phẩm này?")) {
      try {
        const response = await sellerProductService.deleteProduct(id);
        alert(response.message || "Sản phẩm đã được ẩn thành công!");
        fetchProducts();
      } catch (error) {
        console.error("Lỗi khi ẩn sản phẩm:", error);
        alert("Không thể ẩn sản phẩm này!");
      }
    }
  };

  const handleExportCsv = async () => {
    try {
      const response = await sellerProductService.exportInventoryReport();
      const url = window.URL.createObjectURL(new Blob([response]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `inventory_report_${new Date().getTime()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Lỗi khi xuất file CSV:", error);
      alert("Xuất báo cáo thất bại!");
    }
  };

  const formatVND = (num) => new Intl.NumberFormat('vi-VN').format(num) + 'đ';

  if (isEditMode) {
    return (
      <SellerProductForm
        product={selectedProduct}
        onSave={handleSaveProduct}
        onCancel={() => {
          setIsEditMode(false);
          setSelectedProduct(null);
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-xs text-gray-400 font-medium -mt-2">Quản lý sản phẩm - seller</div>

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black text-[#8C3B1A]">Quản lý sản phẩm</h1>
        <button
          onClick={handleExportCsv}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1"
        >
          📥 Xuất báo cáo (.CSV)
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <span className="absolute inset-y-0 left-3 flex items-center text-gray-400 text-xs">
            <button type="submit">🔍</button>
          </span>
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="Tìm theo tên và nhấn Enter..."
            className="w-full bg-[#FAF8F0] border border-[#EBE7D9] rounded-xl pl-9 pr-4 py-2 text-xs outline-none focus:border-[#A14A24]"
          />
        </form>

        <div className="flex flex-wrap gap-2 text-xs font-semibold text-gray-500">
          {[
            { id: 'ALL', label: 'Tất cả' },
            { id: 'ACTIVE', label: 'Đang bán' },
            { id: 'OUT_OF_STOCK', label: 'Hết hàng' },
            { id: 'HIDDEN', label: 'Đã ẩn' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setPage(0);
              }}
              className={`px-4 py-2 rounded-xl transition-all ${activeTab === tab.id
                ? 'bg-white text-[#A14A24] border border-[#F0ECE0] shadow-sm'
                : 'hover:text-[#4A3B32]'
                }`}
            >
              {tab.label} {activeTab === tab.id && totalElements > 0 ? `(${totalElements})` : ''}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#F0ECE0] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#F5F2E6] text-[10px] font-bold text-gray-400 uppercase bg-[#FAF9F5]/50">
                <th className="py-4 px-6 w-24">Hình ảnh</th>
                <th className="py-4 px-6">Tên sản phẩm</th>
                <th className="py-4 px-6 w-32">Giá (VNĐ)</th>
                <th className="py-4 px-6 w-24">Kho hàng</th>
                <th className="py-4 px-6 w-32 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F2E6] text-xs text-[#4A3B32]">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-400 font-medium">
                    🔄 Đang tải dữ liệu...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-400 font-medium">
                    📭 Không tìm thấy sản phẩm nào phù hợp.
                  </td>
                </tr>
              ) : (
                products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-[#FAF9F5]/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="w-12 h-12 rounded-xl overflow-hidden border border-[#EBE7D9]">
                        <img
                          src={prod.images?.[0] || prod.imageUrl || 'https://placehold.co/150'}
                          alt={prod.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-sm">{prod.name}</div>
                      <div className="text-[11px] text-gray-400 mt-0.5">
                        {prod.categoryName || 'Chưa phân loại'} • Trạng thái: <span className="font-semibold">{prod.status}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-bold text-[#A14A24]">{formatVND(prod.price)}</td>
                    <td className="py-4 px-6 font-semibold text-gray-600">{prod.stock}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center space-x-3 text-gray-400">
                        <button onClick={() => handleEditClick(prod.id)} className="hover:text-[#4A3B32]" title="Xem chi tiết">👁️</button>
                        <button onClick={() => handleEditClick(prod.id)} className="hover:text-blue-600" title="Chỉnh sửa">✏️</button>
                        <button onClick={() => handleSoftDelete(prod.id)} className="hover:text-red-500" title="Ẩn sản phẩm">🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-4 bg-[#FAF9F5]/50 border-t border-[#F5F2E6] flex items-center justify-between text-xs text-gray-500">
            <div>Hiển thị {products.length}/{totalElements} sản phẩm</div>
            <div className="flex items-center gap-1">
              <button
                disabled={page === 0}
                onClick={() => setPage(prev => Math.max(0, prev - 1))}
                className="px-3 py-1.5 rounded-lg border bg-white disabled:opacity-40"
              >
                ◀ Trước
              </button>
              <span className="px-3">Trang {page + 1} / {totalPages}</span>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage(prev => prev + 1)}
                className="px-3 py-1.5 rounded-lg border bg-white disabled:opacity-40"
              >
                Sau ▶
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}