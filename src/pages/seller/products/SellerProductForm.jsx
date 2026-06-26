import React, { useState, useEffect, useRef } from 'react';
import cloudinaryService from '../../../services/cloudinaryService';

export default function SellerProductForm({ product, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    price: '',
    stock: 1,
    categoryId: '',
    conditionStatus: 'GOOD',
    description: '',
    primaryImage: '',
    subImages: []
  });

  const primaryInputRef = useRef(null);
  const subInputRef = useRef(null);
  const [primaryImageFile, setPrimaryImageFile] = useState(null);
  const [subImageFiles, setSubImageFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        id: product.id || null,
        name: product.name || '',
        price: product.price || '',
        stock: product.stock !== undefined ? product.stock : 1,
        categoryId: product.categoryId || '',
        conditionStatus: product.conditionStatus || 'GOOD',
        description: product.description || '',
        primaryImage: product.imageUrl || '',
        subImages: product.images
          ? product.images.filter(img => img !== product.imageUrl)
          : []
      });
    }
  }, [product]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePrimaryImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setPrimaryImageFile(file);
      setFormData((prev) => ({ ...prev, primaryImage: imageUrl }));
    }
    e.target.value = '';
  };

  const handleSubImagesChange = (e) => {
    const files = Array.from(e.target.files);
    const maxAllowed = 5 - (formData.primaryImage ? 1 : 0) - formData.subImages.length;

    const selectedFiles = files.slice(0, maxAllowed);
    const newImageUrls = selectedFiles.map(file => URL.createObjectURL(file));

    setFormData((prev) => ({
      ...prev,
      subImages: [...prev.subImages, ...newImageUrls]
    }));
    setSubImageFiles((prev) => [...prev, ...selectedFiles]);
    e.target.value = '';
  };

  const allImagesPreview = [
    ...(formData.primaryImage ? [formData.primaryImage] : []),
    ...formData.subImages
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.primaryImage) {
      alert("Vui lòng điền đầy đủ Tên, Giá và ít nhất một Ảnh bìa!");
      return;
    }

    const parsedPrice = typeof formData.price === 'string'
      ? parseInt(formData.price.replace(/\D/g, ''), 10)
      : formData.price;
    setIsSubmitting(true);
    try {
      const primaryImage = primaryImageFile
        ? await cloudinaryService.uploadFile(primaryImageFile, 'fashion_marketplace/products')
        : formData.primaryImage;
      const uploadedSubImages = subImageFiles.length
        ? await cloudinaryService.uploadFiles(subImageFiles, 'fashion_marketplace/products')
        : [];
      const existingSubImages = formData.subImages.slice(0, formData.subImages.length - subImageFiles.length);
      const subImages = [...existingSubImages, ...uploadedSubImages];
      await onSave({ ...formData, primaryImage, subImages, imageUrl: primaryImage, images: subImages, price: parsedPrice, stock: parseInt(formData.stock, 10) });
    } catch (error) {
      console.error('Lỗi tải ảnh sản phẩm:', error);
      alert(error.message || 'Không thể tải ảnh sản phẩm. Vui lòng thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 -mb-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center justify-center w-8 h-8 rounded-xl bg-white border border-[#F0ECE0] hover:bg-[#FAF9F5] text-gray-600 transition-colors shadow-sm text-sm"
        >
          ←
        </button>
        <div className="text-xs text-gray-400 font-medium">
          {formData.id ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'} - Seller Center
        </div>
      </div>

      <h1 className="text-2xl font-black text-[#8C3B1A]">
        {formData.id ? 'Cập nhật thông tin sản phẩm' : 'Thông tin sản phẩm mới'}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        <div className="lg:col-span-7 space-y-6">

          <div className="bg-white p-6 rounded-2xl border border-[#F0ECE0] shadow-sm space-y-4">
            <h2 className="text-sm font-bold flex items-center gap-2">
              <span>🖼️</span> Hình ảnh sản phẩm
            </h2>

            <input
              type="file"
              accept="image/*"
              ref={primaryInputRef}
              onChange={handlePrimaryImageChange}
              className="hidden"
            />
            <input
              type="file"
              accept="image/*"
              multiple
              ref={subInputRef}
              onChange={handleSubImagesChange}
              className="hidden"
            />

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              <div
                onClick={() => primaryInputRef.current.click()}
                className="col-span-2 aspect-square border-2 border-dashed border-[#EBE7D9] hover:border-[#A14A24] rounded-xl flex flex-col items-center justify-center p-2 bg-[#FAF9F5]/40 cursor-pointer text-center group transition-colors relative overflow-hidden"
              >
                {formData.primaryImage ? (
                  <>
                    <img src={formData.primaryImage} alt="Primary" className="w-full h-full object-cover" />
                    <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[10px] text-white py-1 font-bold">Ảnh bìa chính</div>
                  </>
                ) : (
                  <>
                    <span className="text-2xl text-gray-400 group-hover:scale-110 transition-transform">📸</span>
                    <span className="text-[11px] font-bold text-gray-400 mt-2">Chưa có ảnh bìa (Bắt buộc)</span>
                  </>
                )}
              </div>

              {formData.subImages.map((img, index) => (
                <div key={index} className="aspect-square border border-[#EBE7D9] rounded-xl overflow-hidden bg-gray-50 relative group">
                  <img src={img} alt={`preview sub ${index}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFormData(prev => ({
                        ...prev,
                        subImages: prev.subImages.filter((_, i) => i !== index)
                      }));
                      setSubImageFiles(prev => {
                        const firstNewImageIndex = formData.subImages.length - prev.length;
                        if (index < firstNewImageIndex) return prev;
                        return prev.filter((_, i) => i !== index - firstNewImageIndex);
                      });
                    }}
                    className="absolute inset-0 bg-black/40 text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity text-xs flex items-center justify-center"
                  >
                    Xóa
                  </button>
                </div>
              ))}

              {allImagesPreview.length < 5 && (
                <div
                  onClick={() => subInputRef.current.click()}
                  className="aspect-square border-2 border-dashed border-[#EBE7D9] rounded-xl flex items-center justify-center text-gray-300 font-bold text-lg bg-[#FAF9F5]/20 cursor-pointer hover:bg-gray-50"
                >
                  +
                </div>
              )}
            </div>
            <p className="text-[10px] text-gray-400 italic">Hệ thống tự động đồng bộ ảnh bìa và bộ sưu tập ảnh chi tiết.</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#F0ECE0] shadow-sm space-y-4">
            <h2 className="text-sm font-bold flex items-center gap-2">
              <span>📝</span> Chi tiết cơ bản
            </h2>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#4A3B32]">Tên sản phẩm</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ví dụ: Áo khoác Jean Vintage Levis 501"
                className="w-full bg-[#FAF8F0] border border-[#EBE7D9] rounded-xl px-4 py-2.5 text-xs text-[#4A3B32] font-medium outline-none focus:ring-1 focus:ring-[#A14A24]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="col-span-2 space-y-1.5">
                <label className="text-xs font-bold text-[#4A3B32]">Giá bán (đ)</label>
                <div className="relative">
                  <input
                    type="text"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full bg-[#FAF8F0] border border-[#EBE7D9] rounded-xl pl-4 pr-8 py-2.5 text-xs font-bold text-[#A14A24] outline-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">đ</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#4A3B32]">Số lượng kho</label>
                <input
                  type="number"
                  name="stock"
                  min="0"
                  value={formData.stock}
                  onChange={handleChange}
                  className="w-full bg-[#FAF8F0] border border-[#EBE7D9] rounded-xl px-4 py-2.5 text-xs font-bold text-gray-600 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#4A3B32]">Danh mục</label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  className="w-full bg-[#FAF8F0] border border-[#EBE7D9] rounded-xl px-4 py-2.5 text-xs text-[#4A3B32] font-medium outline-none cursor-pointer"
                >
                  <option value="">Chọn danh mục</option>
                  <option value="cate-01">Áo khoác</option>
                  <option value="cate-02">Váy & Đầm</option>
                  <option value="cate-03">Quần</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#4A3B32]">Tình trạng sản phẩm</label>
                <div className="grid grid-cols-4 gap-1 p-0.5 bg-[#FAF8F0] border border-[#EBE7D9] rounded-xl text-[10px] font-bold text-center">
                  {[
                    { id: 'NEW', label: 'Mới' },
                    { id: 'LIKE_NEW', label: '99%' },
                    { id: 'GOOD', label: '95%' },
                    { id: 'OLD', label: 'Cũ' }
                  ].map((cond) => (
                    <div
                      key={cond.id}
                      onClick={() => setFormData(prev => ({ ...prev, conditionStatus: cond.id }))}
                      className={`py-2 rounded-lg cursor-pointer transition-colors ${formData.conditionStatus === cond.id ? 'bg-white shadow-sm text-[#A14A24]' : 'text-gray-400 hover:text-[#4A3B32]'}`}
                    >
                      {cond.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#4A3B32]">Mô tả chi tiết</label>
              <textarea
                name="description"
                rows="4"
                value={formData.description}
                onChange={handleChange}
                placeholder="Mô tả chi tiết về kích thước, màu sắc, chất liệu và tình trạng sản phẩm..."
                className="w-full bg-[#FAF8F0] border border-[#EBE7D9] rounded-xl px-4 py-3 text-xs text-gray-600 leading-relaxed outline-none focus:ring-1 focus:ring-[#A14A24]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="text-xs font-bold text-gray-500 hover:text-gray-700 px-4 py-2"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-[#C85C32] hover:bg-[#b04f29] text-white font-bold text-xs px-6 py-3 rounded-xl shadow-sm transition-colors"
            >
              {formData.id ? 'Lưu thay đổi' : 'Đăng sản phẩm'}
            </button>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">

          <div className="text-xs font-bold text-gray-400 tracking-wider uppercase pl-1">
            Xem trước hiển thị trên App
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-[#F0ECE0] overflow-hidden flex flex-col max-w-xs mx-auto lg:mx-0 w-full">
            <div className="relative aspect-[4/5] bg-gray-50">
              <img
                src={formData.primaryImage || "https://placehold.co/400x500?text=No+Image"}
                alt="preview card"
                className="w-full h-full object-cover"
              />
              <span className="absolute top-3 left-3 text-[9px] font-black bg-[#E3ECCB] text-[#556B2F] px-2 py-0.5 rounded tracking-wide uppercase">
                {formData.conditionStatus}
              </span>
            </div>

            <div className="p-4 flex flex-col justify-between min-h-[120px]">
              <div>
                <p className="text-[10px] font-medium text-gray-400">Thời trang nam • Seller Product</p>
                <h3 className="font-bold text-sm text-[#4A3B32] mt-0.5 line-clamp-2 leading-snug">
                  {formData.name || 'Chưa nhập tên sản phẩm'}
                </h3>
              </div>

              <div className="mt-4 flex items-baseline space-x-2">
                <span className="font-black text-base text-[#A14A24]">
                  {formData.price ? new Intl.NumberFormat('vi-VN').format(formData.price) : '0'}đ
                </span>
                <span className="text-[10px] text-gray-400 ml-2">(Kho: {formData.stock})</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}