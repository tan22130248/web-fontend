import React, { useState } from 'react';

export default function SellerProfile() {
    // Quản lý trạng thái thông tin cửa hàng để đồng bộ trực tiếp sang khung Preview
    const [shopData, setShopData] = useState({
        name: 'Tiệm Cũ Boutique',
        bio: 'Chào mừng bạn đến với Tiệm Cũ Boutique. Chúng mình chuyên cung cấp các mặt hàng vintage tuyển chọn, từ quần áo đến đồ trang trí nhà cửa, mang đậm hơi thở thời gian và tinh thần bền vững.',
        phone: '090 123 4567',
        email: 'contact@tiemcu.vn',
        location: 'Quận 1, TP. Hồ Chí Minh',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        cover: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&auto=format&fit=crop&q=80'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setShopData((prev) => ({ ...prev, [name]: value }));
    };

    return (
        <div className="space-y-6">
            {/* Tiêu đề phụ nhỏ góc trên */}
            <div className="text-xs text-gray-400 font-medium -mt-2">
                Hồ sơ cửa hàng - seller
            </div>

            {/* Tiêu đề chính */}
            <div>
                <h1 className="text-2xl font-black text-[#4A3B32]">Hồ sơ cửa hàng</h1>
                <p className="text-xs text-gray-400 mt-1">Cập nhật thông tin nhận diện thương hiệu của bạn để khách hàng dễ dàng tìm thấy.</p>
            </div>

            {/* BỐ CỤC CHÍNH CHIA LÀM 2 CỘT */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* ================= CỘT TRÁI: FORM NHẬP THÔNG TIN (7 CỘT) ================= */}
                <div className="lg:col-span-7 space-y-6">

                    {/* 1. KHỐI HÌNH ẢNH ĐẠI DIỆN */}
                    <div className="bg-white p-6 rounded-2xl border border-[#F0ECE0] shadow-sm space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Hình ảnh đại diện</h3>
                        <div className="flex items-center space-x-6 bg-[#FAF9F5]/40 p-4 rounded-xl border border-[#FAF8F2]">
                            <div className="relative w-20 h-20 shrink-0">
                                <img
                                    src={shopData.avatar}
                                    alt="Shop Avatar"
                                    className="w-full h-full object-cover rounded-2xl border-2 border-white shadow-sm"
                                />
                                <button className="absolute -bottom-1 -right-1 bg-[#C85C32] text-white p-1 rounded-full text-xs shadow hover:bg-[#b04f29] transition-colors" title="Đổi ảnh">
                                    ✏️
                                </button>
                            </div>
                            <div className="text-[11px] text-gray-400 leading-normal">
                                <p className="font-bold text-gray-500 mb-1">Khuyến dùng ảnh hình vuông, tối thiểu 500x500px.</p>
                                <p>Định dạng JPG, PNG.</p>
                                {/* Thanh tiến trình giả lập độ hoàn thiện hồ sơ */}
                                <div className="w-48 h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
                                    <div className="w-4/5 h-full bg-emerald-500 rounded-full"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 2. KHỐI ẢNH BÌA CỬA HÀNG */}
                    <div className="bg-white p-6 rounded-2xl border border-[#F0ECE0] shadow-sm space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Ảnh bìa cửa hàng</h3>
                        <div className="relative h-32 w-full rounded-xl overflow-hidden group bg-gray-100 border border-[#EBE7D9]">
                            <img
                                src={shopData.cover}
                                alt="Shop Cover"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                <span className="text-xs font-bold text-white bg-black/50 px-3 py-1.5 rounded-xl">Thay đổi ảnh bìa</span>
                            </div>
                        </div>
                    </div>

                    {/* 3. KHỐI THÔNG TIN CHI TIẾT CHỮ */}
                    <div className="bg-white p-6 rounded-2xl border border-[#F0ECE0] shadow-sm space-y-4">

                        {/* Tên cửa hàng */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#4A3B32]">Tên cửa hàng</label>
                            <input
                                type="text"
                                name="name"
                                value={shopData.name}
                                onChange={handleChange}
                                className="w-full bg-[#FAF8F0] border border-[#EBE7D9] rounded-xl px-4 py-2.5 text-xs font-bold text-[#4A3B32] outline-none focus:ring-1 focus:ring-[#A14A24]"
                            />
                        </div>

                        {/* Mô tả ngắn */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#4A3B32]">Mô tả Ngắn</label>
                            <textarea
                                name="bio"
                                rows="4"
                                value={shopData.bio}
                                onChange={handleChange}
                                className="w-full bg-[#FAF8F0] border border-[#EBE7D9] rounded-xl px-4 py-3 text-xs text-gray-600 leading-relaxed outline-none focus:ring-1 focus:ring-[#A14A24]"
                            />
                        </div>

                        {/* Số điện thoại & Email liên hệ */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[#4A3B32]">Số điện thoại</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={shopData.phone}
                                    onChange={handleChange}
                                    className="w-full bg-[#FAF8F0] border border-[#EBE7D9] rounded-xl px-4 py-2.5 text-xs text-gray-600 outline-none"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[#4A3B32]">Email liên hệ</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={shopData.email}
                                    onChange={handleChange}
                                    className="w-full bg-[#FAF8F0] border border-[#EBE7D9] rounded-xl px-4 py-2.5 text-xs text-gray-600 outline-none"
                                />
                            </div>
                        </div>

                        {/* Địa chỉ / Khu vực */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#4A3B32]">Địa chỉ / Khu vực</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    name="location"
                                    value={shopData.location}
                                    onChange={handleChange}
                                    className="w-full bg-[#FAF8F0] border border-[#EBE7D9] rounded-xl pl-4 pr-10 py-2.5 text-xs text-gray-600 outline-none"
                                />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs">📍</span>
                            </div>
                        </div>
                    </div>

                    {/* Nút lưu thay đổi dưới chân form */}
                    <div className="flex justify-center pt-2">
                        <button className="bg-[#C85C32] hover:bg-[#b04f29] text-white font-bold text-xs px-12 py-3 rounded-xl shadow-md transition-colors w-full sm:w-auto">
                            Lưu thay đổi
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
                                <img src={shopData.cover} alt="Preview Cover" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40"></div>
                            </div>

                            {/* 2. Avatar & Badge vị trí đè lên ảnh nền */}
                            <div className="px-3 -mt-6 relative z-10 flex items-end justify-between">
                                <img
                                    src={shopData.avatar}
                                    alt="Preview Avatar"
                                    className="w-12 h-12 rounded-xl object-cover border-2 border-white shadow-sm"
                                />
                                <span className="text-[8px] font-black bg-[#E3ECCB] text-[#556B2F] px-1.5 py-0.5 rounded shadow-sm tracking-wide uppercase">
                                    TOP SELLER
                                </span>
                            </div>

                            {/* 3. Tên shop & Địa điểm */}
                            <div className="px-3 mt-2">
                                <h4 className="font-black text-xs text-[#4A3B32]">{shopData.name || 'Tên cửa hàng'}</h4>
                                <p className="text-[9px] text-gray-400 flex items-center gap-0.5 mt-0.5">
                                    📍 {shopData.location || 'Chưa cập nhật'}
                                </p>
                            </div>

                            {/* 4. Khối 3 thông số: Sản phẩm - Đánh giá - Phản hồi */}
                            <div className="grid grid-cols-3 gap-1 px-3 mt-3 text-center">
                                <div className="bg-[#FAF9F5] py-1.5 rounded-lg border border-[#F2EFE4]">
                                    <span className="text-[10px] font-black text-[#4A3B32] block">124</span>
                                    <span className="text-[7px] font-bold text-gray-400 uppercase">Sản phẩm</span>
                                </div>
                                <div className="bg-[#FAF9F5] py-1.5 rounded-lg border border-[#F2EFE4]">
                                    <span className="text-[10px] font-black text-[#4A3B32] block">4.9/5</span>
                                    <span className="text-[7px] font-bold text-gray-400 uppercase">Đánh giá</span>
                                </div>
                                <div className="bg-[#FAF9F5] py-1.5 rounded-lg border border-[#F2EFE4]">
                                    <span className="text-[10px] font-black text-[#4A3B32] block">98%</span>
                                    <span className="text-[7px] font-bold text-gray-400 uppercase">Phản hồi</span>
                                </div>
                            </div>

                            {/* 5. Dòng tiểu sử (Bio) shop */}
                            <div className="px-3 mt-3">
                                <p className="text-[9px] text-gray-500 leading-normal line-clamp-3 italic">
                                    {shopData.bio || 'Chưa viết lời giới thiệu...'}
                                </p>
                            </div>

                            {/* 6. Lưới sản phẩm demo nhỏ phía dưới đáy màn hình điện thoại */}
                            <div className="mt-auto p-3 border-t border-[#FAF8F2] bg-[#FAF9F5]/40 grid grid-cols-2 gap-2">
                                <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden border border-gray-100">
                                    <img src="https://images.unsplash.com/photo-1551028719-00167b16eac5?w=120" alt="demo 1" className="w-full h-full object-cover" />
                                </div>
                                <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden border border-gray-100">
                                    <img src="https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=120" alt="demo 2" className="w-full h-full object-cover" />
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Khối mẹo nhỏ tối ưu hiển thị dưới chân */}
                    <div className="bg-[#EBF5E6] border border-[#D5E8CD] p-4 rounded-xl flex items-start space-x-3 max-w-[280px] mx-auto lg:mx-0">
                        <span className="text-sm">💡</span>
                        <div className="text-[11px] leading-relaxed text-[#2E4213]">
                            <span className="font-bold">Mẹo nhỏ:</span> Sử dụng ảnh bìa có tông màu trung tính sẽ làm nổi bật logo và thông tin của hàng của bạn hơn trên thiết bị di động.
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}