import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, X, Upload, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import productService from '../../services/productService';

/**
 * Premium image-search upload modal.
 *
 * Props:
 *   isOpen   — boolean, whether the modal is visible
 *   onClose  — callback to close the modal
 */
export default function ImageSearchModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

  const resetState = useCallback(() => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setIsDragOver(false);
    setIsSearching(false);
  }, []);

  const handleClose = useCallback(() => {
    if (isSearching) return; // don't close while searching
    resetState();
    onClose();
  }, [isSearching, resetState, onClose]);

  const validateFile = useCallback((file) => {
    if (!file) return false;
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Chỉ hỗ trợ ảnh JPG, PNG hoặc WEBP');
      return false;
    }
    if (file.size > MAX_SIZE) {
      toast.error('Ảnh quá lớn, tối đa 10MB');
      return false;
    }
    return true;
  }, []);

  const handleFileSelect = useCallback((file) => {
    if (!validateFile(file)) return;
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  }, [validateFile]);

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  // ── Drag & Drop ──────────────────────────────────────────
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  // ── Search ───────────────────────────────────────────────
  const handleSearch = async () => {
    if (!selectedFile) {
      toast.error('Vui lòng chọn một ảnh');
      return;
    }

    setIsSearching(true);
    try {
      const results = await productService.searchByImage(selectedFile);
      const data = results?.data || results;

      // Navigate to results page with state
      navigate('/image-search', {
        state: {
          results: Array.isArray(data) ? data : [],
          previewUrl,
          fileName: selectedFile.name,
        },
      });
      resetState();
      onClose();
    } catch (error) {
      toast.error(
        error?.response?.data?.message || 'Không thể tìm kiếm. Vui lòng thử lại.'
      );
    } finally {
      setIsSearching(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center p-4 img-search-backdrop"
      style={{ backgroundColor: 'rgba(26, 15, 0, 0.45)', backdropFilter: 'blur(6px)' }}
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-lg bg-[#fdf8f2] rounded-3xl shadow-2xl border border-[#ede5db] img-search-modal-enter"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleClose}
          disabled={isSearching}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center rounded-full bg-white/80 hover:bg-white border border-[#ede5db] text-[#8c8a79] hover:text-[#b14f25] transition-all duration-200 disabled:opacity-40"
          aria-label="Đóng"
        >
          <X size={16} strokeWidth={2.5} />
        </button>

        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-[#b14f25] mb-1.5">
              Tìm kiếm bằng hình ảnh
            </h2>
            <p className="text-sm text-[#8c8a79] leading-relaxed max-w-[320px] mx-auto">
              Bạn đang tìm kiếm một món đồ cụ thể?
              <br />
              Tải lên một bức ảnh và chúng tôi sẽ tìm nó cho bạn.
            </p>
          </div>

          <div className="flex gap-5 items-start">
            {/* Dropzone */}
            <div
              className={`flex-1 relative rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer ${
                isDragOver
                  ? 'dropzone-dragover'
                  : selectedFile
                    ? 'border-[#d4711e]/40 bg-[#fef6ee]'
                    : 'border-[#e4a06f] bg-[#fefcf8] dropzone-pulse'
              }`}
              onClick={() => !isSearching && fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleInputChange}
                className="hidden"
                disabled={isSearching}
              />

              {!selectedFile ? (
                <div className="flex flex-col items-center justify-center py-10 px-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#fef0e0] to-[#fde8d0] flex items-center justify-center mb-4 shadow-sm">
                    <Camera size={28} className="text-[#d4711e]" strokeWidth={1.8} />
                  </div>
                  <p className="text-sm font-semibold text-[#4A3B32] mb-1">
                    Kéo thả ảnh vào đây
                  </p>
                  <p className="text-xs text-[#8c8a79]">
                    hoặc{' '}
                    <span className="text-[#d4711e] font-semibold underline underline-offset-2">
                      Chọn từ máy tính
                    </span>
                  </p>
                </div>
              ) : (
                <div className="relative p-3">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-40 object-cover rounded-xl"
                  />
                  {isSearching && (
                    <div className="absolute inset-3 rounded-xl overflow-hidden">
                      <div className="scan-line" />
                      <div className="absolute inset-0 bg-[#d4711e]/5 rounded-xl" />
                    </div>
                  )}
                  {!isSearching && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFile(null);
                        setPreviewUrl(null);
                      }}
                      className="absolute top-5 right-5 w-6 h-6 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors"
                      aria-label="Xóa ảnh"
                    >
                      <X size={12} strokeWidth={3} />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Right side preview / status */}
            <div className="w-28 shrink-0 flex flex-col items-center justify-center gap-3">
              {selectedFile ? (
                <>
                  <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-[#ede5db] shadow-sm">
                    <img
                      src={previewUrl}
                      alt="Thumbnail"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {isSearching ? (
                    <div className="flex items-center gap-1.5 text-[#d4711e]">
                      <Loader2 size={14} className="animate-spin" />
                      <span className="text-xs font-bold tracking-wide">ĐANG QUÉT...</span>
                    </div>
                  ) : (
                    <p className="text-[10px] text-[#8c8a79] text-center font-medium leading-tight">
                      Sẵn sàng
                      <br />
                      tìm kiếm
                    </p>
                  )}
                </>
              ) : (
                <div className="w-20 h-20 rounded-xl bg-[#f5ede4] border border-dashed border-[#d9cfc2] flex items-center justify-center">
                  <Upload size={20} className="text-[#c4b8a8]" />
                </div>
              )}
            </div>
          </div>

          {/* Search button */}
          <button
            onClick={handleSearch}
            disabled={!selectedFile || isSearching}
            className="mt-6 w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#d4711e] to-[#b14f25] hover:from-[#c25f10] hover:to-[#963f1c] text-white font-bold text-sm tracking-wide shadow-lg shadow-[#d4711e]/20 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {isSearching ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Đang tìm kiếm...</span>
              </>
            ) : (
              <>
                <Camera size={18} strokeWidth={2.2} />
                <span>Tìm kiếm bằng ảnh</span>
              </>
            )}
          </button>

          {/* Supported formats hint */}
          <p className="mt-3 text-center text-[10px] text-[#b4b19a]">
            Hỗ trợ JPG, PNG, WEBP • Tối đa 10MB
          </p>
        </div>
      </div>
    </div>
  );
}
