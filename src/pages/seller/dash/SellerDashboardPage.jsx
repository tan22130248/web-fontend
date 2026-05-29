// src/pages/seller/SellerDashboard.jsx
import React from 'react';

export default function SellerDashboardPage() {
  return (
    <div className="space-y-6">
      
      <div className="text-xs text-gray-400 font-medium mb-2 -mt-2">
        Bảng điều khiển Người bán - seller
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-[#F0ECE0] shadow-sm relative overflow-hidden">
          <span className="text-[11px] font-bold tracking-wider text-gray-400 uppercase">Doanh thu tổng</span>
          <span className="absolute top-5 right-5 text-[10px] bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded-full">+12.5%</span>
          <div className="text-2xl font-black text-[#A14A24] mt-2">12.450.000đ</div>
          <div className="flex items-end space-x-1 h-6 mt-4 opacity-40">
            <div className="bg-[#A14A24] w-full h-2 rounded-sm"></div>
            <div className="bg-[#A14A24] w-full h-4 rounded-sm"></div>
            <div className="bg-[#A14A24] w-full h-3 rounded-sm"></div>
            <div className="bg-[#A14A24] w-full h-5 rounded-sm"></div>
            <div className="bg-[#A14A24] w-full h-6 rounded-sm"></div>
            <div className="bg-[#A14A24] w-full h-3 rounded-sm"></div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#F0ECE0] shadow-sm relative">
          <span className="text-[11px] font-bold tracking-wider text-gray-400 uppercase">Đơn hàng mới</span>
          <div className="absolute top-5 right-5 w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-sm">🛒</div>
          <div className="flex items-baseline space-x-2 mt-2">
            <span className="text-3xl font-black text-[#4A3B32]">08</span>
            <span className="text-xs text-gray-400">đơn chưa xử lý</span>
          </div>
          <div className="flex -space-x-2 mt-4 overflow-hidden">
            <div className="w-5 h-5 rounded-full bg-blue-400 border border-white text-[8px] flex items-center justify-center text-white">A</div>
            <div className="w-5 h-5 rounded-full bg-green-400 border border-white text-[8px] flex items-center justify-center text-white">B</div>
            <div className="w-5 h-5 rounded-full bg-orange-400 border border-white text-[8px] flex items-center justify-center text-white">C</div>
            <div className="w-5 h-5 rounded-full bg-gray-300 border border-white text-[8px] flex items-center justify-center text-gray-600 font-bold">+5</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#F0ECE0] shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold tracking-wider text-gray-400 uppercase">Sản phẩm đang bán</span>
            <div className="mt-3 space-y-1 text-xs">
              <div className="flex items-center space-x-2"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> <span className="text-gray-500">Hoạt động (32)</span></div>
              <div className="flex items-center space-x-2"><span className="w-2 h-2 rounded-full bg-amber-400"></span> <span className="text-gray-500">Chờ duyệt (10)</span></div>
            </div>
          </div>
          <div className="w-16 h-16 rounded-full border-4 border-emerald-500 border-t-amber-400 flex items-center justify-center flex-col shadow-inner">
            <span className="text-sm font-black text-[#4A3B32]">42</span>
            <span className="text-[8px] text-gray-400 uppercase font-bold">món</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-[#F0ECE0] shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-base text-[#4A3B32]">Doanh thu theo thời gian</h3>
            <select className="bg-[#FAF8F2] border border-[#EBE7D9] text-xs px-2.5 py-1 rounded-lg outline-none font-medium">
              <option>30 ngày qua</option>
            </select>
          </div>
          <div className="flex items-end justify-between h-48 pt-4 px-2 border-b border-gray-100">
            <div className="bg-[#EFECCB]/60 w-16 h-20 rounded-t-lg relative group"><span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] hidden group-hover:block bg-black text-white p-1 rounded">2.1M</span></div>
            <div className="bg-[#EFECCB]/60 w-16 h-28 rounded-t-lg"></div>
            <div className="bg-[#EFECCB]/60 w-16 h-16 rounded-t-lg"></div>
            <div className="bg-[#E87745] w-16 h-40 rounded-t-lg shadow-sm"></div>
            <div className="bg-[#EFECCB]/60 w-16 h-24 rounded-t-lg"></div>
            <div className="bg-[#EFECCB]/60 w-16 h-32 rounded-t-lg"></div>
            <div className="bg-[#EFECCB]/60 w-16 h-14 rounded-t-lg"></div>
          </div>
          <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase mt-3 px-2">
            <span>Tuần 1</span><span>Tuần 2</span><span>Tuần 3</span><span>Tuần 4</span>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-[#F0ECE0] shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-base text-[#4A3B32] mb-4">Thông báo mới nhất</h3>
            <div className="space-y-4">

              <div className="flex items-start space-x-3 text-xs">
                <span className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center shrink-0">📦</span>
                <div>
                  <h4 className="font-bold text-[#4A3B32]">Đơn hàng #TC1204 mới!</h4>
                  <p className="text-gray-500 mt-0.5 leading-relaxed">Lan Anh vừa đặt "Váy Vintage Hoa Nhí". Cần xác nhận ngay.</p>
                  <span className="text-[10px] text-gray-400 block mt-1">10 phút trước</span>
                </div>
              </div>
              <div className="flex items-start space-x-3 text-xs">
                <span className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">💬</span>
                <div>
                  <h4 className="font-bold text-[#4A3B32]">Câu hỏi khách hàng</h4>
                  <p className="text-gray-500 mt-0.5 leading-relaxed">"Áo len này có bị xù lông không shop ơi?" từ Minh Tú.</p>
                  <span className="text-[10px] text-gray-400 block mt-1">2 giờ trước</span>
                </div>
              </div>
            </div>
          </div>
          <button className="w-full border border-[#EBE7D9] hover:bg-[#FAF8F2] text-[#4A3B32] font-semibold py-2 rounded-xl text-xs mt-4 transition-colors">
            Xem tất cả
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-[#F0ECE0] shadow-sm">
          <h3 className="font-bold text-base text-[#4A3B32] mb-6">Doanh thu theo danh mục</h3>
          <div className="flex items-center justify-around h-32">
            <div className="text-center">
              <span className="text-3xl font-black text-[#4A3B32]">100%</span>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
              <div className="flex items-center space-x-2"><span className="w-2.5 h-2.5 rounded-sm bg-[#A14A24]"></span> <span className="text-gray-500">Áo (40%)</span></div>
              <div className="flex items-center space-x-2"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-600"></span> <span className="text-gray-500">Váy (20%)</span></div>
              <div className="flex items-center space-x-2"><span className="w-2.5 h-2.5 rounded-sm bg-amber-700"></span> <span className="text-gray-500">Quần (30%)</span></div>
              <div className="flex items-center space-x-2"><span className="w-2.5 h-2.5 rounded-sm bg-orange-300"></span> <span className="text-gray-500">Phụ kiện (10%)</span></div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-[#F0ECE0] shadow-sm">
          <h3 className="font-bold text-base text-[#4A3B32] mb-1">Hành động nhanh</h3>
          <p className="text-xs text-gray-400 mb-6">Quản lý cửa hàng của bạn một cách tối ưu nhất.</p>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-[#D96B43] to-[#E87745] p-4 rounded-xl text-white cursor-pointer hover:shadow-md transition-shadow">
              <div className="text-xl mb-2">🖼️</div>
              <h4 className="font-bold text-sm">Đăng sản phẩm mới</h4>
              <p className="text-[10px] text-orange-100 mt-1 leading-normal">Bắt đầu giới thiệu bộ sưu tập mới của bạn</p>
            </div>
            <div className="bg-gradient-to-br from-[#A66041] to-[#BA7353] p-4 rounded-xl text-white cursor-pointer hover:shadow-md transition-shadow">
              <div className="text-xl mb-2">📋</div>
              <h4 className="font-bold text-sm">Xem danh sách đơn hàng</h4>
              <p className="text-[10px] text-amber-100 mt-1 leading-normal">Theo dõi tiến độ giao nhận và thanh toán</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}