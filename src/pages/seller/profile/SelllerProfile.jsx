import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import shopService from "../../../services/shopService";

export default function SellerProfile() {
  const [isNewShop, setIsNewShop] = useState(true);
  const [shopData, setShopData] = useState({
    shopName: "",
    description: "",
    address: "",
    avatarUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    coverUrl:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&auto=format&fit=crop&q=80",
    ghnToken: "",
    ghnShopId: "",
  });

  useEffect(() => {
    shopService
      .getMyShop()
      .then((data) => {
        setShopData((prev) => ({
          shopName: data.shopName || "",
          description: data.description || "",
          address: data.address || "",
          avatarUrl: data.avatarUrl || prev.avatarUrl,
          coverUrl: data.coverUrl || prev.coverUrl,
          ghnToken: data.ghnToken || "",
          ghnShopId: data.ghnShopId || "",
        }));
        setIsNewShop(false);
      })
      .catch((err) => {
        setIsNewShop(true);
        toast.info("Hãy cập nhật thông tin để mở cửa hàng của bạn!");
      });
  }, []);

  return (
    <div className="space-y-6">
      {/* Tiêu đề phụ nhỏ góc trên */}
      <div className="text-xs text-gray-400 font-medium -mt-2">
        Hồ sơ cửa hàng - seller
      </div>

      {/* Tiêu đề chính */}
      <div>
        <h1 className="text-2xl font-black text-[#4A3B32]">Hồ sơ cửa hàng</h1>
        <p className="text-xs text-gray-400 mt-1">
          Cập nhật thông tin nhận diện thương hiệu của bạn để khách hàng dễ dàng
          tìm thấy.
        </p>
      </div>

      {/* BỐ CỤC CHÍNH CHIA LÀM 2 CỘT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ================= CỘT TRÁI: FORM NHẬP THÔNG TIN (7 CỘT) ================= */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. KHỐI HÌNH ẢNH ĐẠI DIỆN */}
          <div className="bg-white p-6 rounded-2xl border border-[#F0ECE0] shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Hình ảnh đại diện
            </h3>
            <div className="flex items-center space-x-6 bg-[#FAF9F5]/40 p-4 rounded-xl border border-[#FAF8F2]">
              <div className="relative w-20 h-20 shrink-0">
                <img
                  src={shopData.avatarUrl}
                  alt="Shop Avatar"
                  className="w-full h-full object-cover rounded-2xl border-2 border-white shadow-sm"
                />
              </div>
              <div className="flex-1 space-y-2">
                <label className="text-xs font-bold text-[#4A3B32]">
                  URL Ảnh Đại Diện
                </label>
                <input
                  type="text"
                  name="avatarUrl"
                  value={shopData.avatarUrl}
                  onChange={handleChange}
                  className="w-full bg-[#FAF8F0] border border-[#EBE7D9] rounded-xl px-3 py-2 text-xs text-gray-600 outline-none focus:ring-1 focus:ring-[#A14A24]"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          {/* 2. KHỐI ẢNH BÌA CỬA HÀNG */}
          <div className="bg-white p-6 rounded-2xl border border-[#F0ECE0] shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
              Ảnh bìa cửa hàng
            </h3>
            <div className="relative h-32 w-full rounded-xl overflow-hidden bg-gray-100 border border-[#EBE7D9]">
              <img
                src={shopData.coverUrl}
                alt="Shop Cover"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#4A3B32]">
                URL Ảnh Bìa
              </label>
              <input
                type="text"
                name="coverUrl"
                value={shopData.coverUrl}
                onChange={handleChange}
                className="w-full bg-[#FAF8F0] border border-[#EBE7D9] rounded-xl px-3 py-2 text-xs text-gray-600 outline-none focus:ring-1 focus:ring-[#A14A24]"
                placeholder="https://..."
              />
            </div>
          </div>

          {/* 3. KHỐI THÔNG TIN CHI TIẾT CHỮ */}
          <div className="bg-white p-6 rounded-2xl border border-[#F0ECE0] shadow-sm space-y-4">
            {/* Tên cửa hàng */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#4A3B32]">
                Tên cửa hàng
              </label>
              <input
                type="text"
                name="shopName"
                value={shopData.shopName}
                onChange={handleChange}
                className="w-full bg-[#FAF8F0] border border-[#EBE7D9] rounded-xl px-4 py-2.5 text-xs font-bold text-[#4A3B32] outline-none focus:ring-1 focus:ring-[#A14A24]"
              />
            </div>

            {/* Mô tả ngắn */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#4A3B32]">
                Mô tả Ngắn
              </label>
              <textarea
                name="description"
                rows="4"
                value={shopData.description}
                onChange={handleChange}
                className="w-full bg-[#FAF8F0] border border-[#EBE7D9] rounded-xl px-4 py-3 text-xs text-gray-600 leading-relaxed outline-none focus:ring-1 focus:ring-[#A14A24]"
              />
            </div>

            {/* Địa chỉ / Khu vực */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#4A3B32]">
                Địa chỉ / Khu vực
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="address"
                  value={shopData.address}
                  onChange={handleChange}
                  className="w-full bg-[#FAF8F0] border border-[#EBE7D9] rounded-xl pl-4 pr-10 py-2.5 text-xs text-gray-600 outline-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs">
                  📍
                </span>
              </div>
            </div>

            {/* Cấu hình GHN */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-[#F0ECE0] pt-4 mt-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#4A3B32]">
                  GHN Shop ID
                </label>
                <input
                  type="number"
                  name="ghnShopId"
                  value={shopData.ghnShopId}
                  onChange={handleChange}
                  placeholder="ID trên hệ thống GHN"
                  className="w-full bg-[#FAF8F0] border border-[#EBE7D9] rounded-xl px-4 py-2.5 text-xs text-gray-600 outline-none"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#4A3B32]">
                  GHN Token
                </label>
                <input
                  type="text"
                  name="ghnToken"
                  value={shopData.ghnToken}
                  onChange={handleChange}
                  placeholder="API Token GHN"
                  className="w-full bg-[#FAF8F0] border border-[#EBE7D9] rounded-xl px-4 py-2.5 text-xs text-gray-600 outline-none"
                />
              </div>
            </div>
          </div>

          {/* Nút lưu thay đổi dưới chân form */}
          <div className="flex justify-center pt-2">
            <button
              onClick={handleSave}
              className="bg-[#C85C32] hover:bg-[#b04f29] text-white font-bold text-xs px-12 py-3 rounded-xl shadow-md transition-colors w-full sm:w-auto"
            >
              {isNewShop ? "Tạo cửa hàng" : "Lưu thay đổi"}
            </button>
          </div>
        </div>

        {/* ================= CỘT PHẢI: XEM TRƯỚC CỬA HÀNG TRÊN MOBILE (5 CỘT) ================= */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          <div className="text-xs font-bold text-gray-400 tracking-wider uppercase pl-1 flex items-center gap-1.5">
            <span>👁️</span> XEM TRƯỚC CỬA HÀNG
          </div>

          {/* Khung mô phỏng màn hình App Điện thoại */}
          <div className="bg-white rounded-[32px] border border-[#EBE7D9] shadow-lg overflow-hidden max-w-[280px] mx-auto lg:mx-0 w-full p-2.5 bg-gradient-to-b from-gray-50 to-white">
            <div className="rounded-[24px] border border-[#F0ECE0] bg-[#FCFBF7] overflow-hidden flex flex-col min-h-[460px] relative shadow-inner">
              {/* 1. Header ảnh bìa của Mobile Preview */}
              <div className="h-24 relative bg-gray-100">
                <img
                  src={shopData.coverUrl}
                  alt="Preview Cover"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40"></div>
              </div>

              {/* 2. Avatar & Badge vị trí đè lên ảnh nền */}
              <div className="px-3 -mt-6 relative z-10 flex items-end justify-between">
                <img
                  src={shopData.avatarUrl}
                  alt="Preview Avatar"
                  className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-sm bg-white"
                />
                <span className="text-[8px] font-black bg-[#E3ECCB] text-[#556B2F] px-1.5 py-0.5 rounded shadow-sm tracking-wide uppercase">
                  TOP SELLER
                </span>
              </div>

              {/* 3. Tên shop & Địa điểm */}
              <div className="px-3 mt-2">
                <h4 className="font-black text-xs text-[#4A3B32]">
                  {shopData.shopName || "Tên cửa hàng"}
                </h4>
                <p className="text-[9px] text-gray-400 flex items-center gap-0.5 mt-0.5 line-clamp-1">
                  📍 {shopData.address || "Chưa cập nhật địa chỉ"}
                </p>
              </div>

              {/* 4. Khối 3 thông số: Sản phẩm - Đánh giá - Phản hồi */}
              <div className="grid grid-cols-3 gap-1 px-3 mt-3 text-center">
                <div className="bg-[#FAF9F5] py-1.5 rounded-lg border border-[#F2EFE4]">
                  <span className="text-[10px] font-black text-[#4A3B32] block">
                    -
                  </span>
                  <span className="text-[7px] font-bold text-gray-400 uppercase">
                    Sản phẩm
                  </span>
                </div>
                <div className="bg-[#FAF9F5] py-1.5 rounded-lg border border-[#F2EFE4]">
                  <span className="text-[10px] font-black text-[#4A3B32] block">
                    5.0
                  </span>
                  <span className="text-[7px] font-bold text-gray-400 uppercase">
                    Đánh giá
                  </span>
                </div>
                <div className="bg-[#FAF9F5] py-1.5 rounded-lg border border-[#F2EFE4]">
                  <span className="text-[10px] font-black text-[#4A3B32] block">
                    100%
                  </span>
                  <span className="text-[7px] font-bold text-gray-400 uppercase">
                    Phản hồi
                  </span>
                </div>
              </div>

              {/* 5. Dòng tiểu sử (Bio) shop */}
              <div className="px-3 mt-3">
                <p className="text-[9px] text-gray-500 leading-normal line-clamp-3 italic">
                  {shopData.description || "Chưa viết lời giới thiệu..."}
                </p>
              </div>

              {/* 6. Lưới sản phẩm demo nhỏ phía dưới đáy màn hình điện thoại */}
              <div className="mt-auto p-3 border-t border-[#FAF8F2] bg-[#FAF9F5]/40 grid grid-cols-2 gap-2">
                <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden border border-gray-100">
                  <img
                    src="https://images.unsplash.com/photo-1551028719-00167b16eac5?w=120"
                    alt="demo 1"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden border border-gray-100">
                  <img
                    src="https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=120"
                    alt="demo 2"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Khối mẹo nhỏ tối ưu hiển thị dưới chân */}
          <div className="bg-[#EBF5E6] border border-[#D5E8CD] p-4 rounded-xl flex items-start space-x-3 max-w-[280px] mx-auto lg:mx-0">
            <span className="text-sm">💡</span>
            <div className="text-[11px] leading-relaxed text-[#2E4213]">
              <span className="font-bold">Mẹo nhỏ:</span> Cập nhật GHN Shop ID
              và Token để tự động tính phí vận chuyển và đẩy đơn sang Giao Hàng
              Nhanh.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

