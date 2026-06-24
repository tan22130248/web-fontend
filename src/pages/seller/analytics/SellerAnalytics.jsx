import React, { useState, useEffect } from "react";
import sellerDashboardService from "../../../services/sellerDashboardService";
import sellerReputationService from "../../../services/sellerReputationService";

export default function SellerAnalytics() {
  const [dashboardData, setDashboardData] = useState({
    totalRevenue: 0,
    newOrders: 0,
    productsOnline: 0,
  });

  const [reputationData, setReputationData] = useState({
    averageRating: 0.0,
    totalReviews: 0,
    responseRate: 1.0,
    cancellationRate: 0.0,
    currentPoints: 100,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      sellerDashboardService.getSummary(),
      sellerReputationService.getSummary(),
    ])
      .then(([dashboardRes, reputationRes]) => {
        setDashboardData(dashboardRes);
        setReputationData(reputationRes);
      })
      .catch((err) => {
        console.error("Lỗi khi lấy dữ liệu phân tích:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getRankInfo = (points) => {
    if (points >= 2000)
      return {
        name: "Hạng Vàng",
        color: "bg-yellow-100 text-yellow-700",
        nextLevel: 5000,
      };
    if (points >= 1000)
      return {
        name: "Hạng Bạc",
        color: "bg-gray-200 text-gray-700",
        nextLevel: 2000,
      };
    return {
      name: "Hạng Đồng",
      color: "bg-[#EDE9DA] text-gray-600",
      nextLevel: 1000,
    };
  };

  const rank = getRankInfo(reputationData.currentPoints);
  const pointsToNext = rank.nextLevel - reputationData.currentPoints;

  const stats = [
    {
      label: "Tổng Doanh Thu",
      value: formatCurrency(dashboardData.totalRevenue),
      change: null,
      status: "good",
      icon: "💰",
    },
    {
      label: "Đánh giá trung bình",
      value: `${reputationData.averageRating.toFixed(1)} / 5.0`,
      change: `${reputationData.totalReviews} lượt`,
      status: "normal",
      icon: "⭐",
    },
    {
      label: "Tỉ lệ phản hồi",
      value: `${(reputationData.responseRate * 100).toFixed(0)}%`,
      change: null,
      status: reputationData.responseRate > 0.8 ? "good" : "warning",
      icon: "💬",
    },
    {
      label: "Tỉ lệ hủy đơn",
      value: `${(reputationData.cancellationRate * 100).toFixed(1)}%`,
      change: null,
      status: reputationData.cancellationRate < 0.05 ? "good" : "warning",
      icon: "📋",
    },
  ];

  // Dữ liệu giả lập lịch sử tích điểm uy tín
  const historyLog = [
    {
      date: "24/10/2023",
      event: "Hoàn thành đơn #12345",
      points: "+10",
      total: reputationData.currentPoints,
      type: "plus",
    },
  ];

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500 font-medium">
        Đang tải dữ liệu...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-xs text-gray-400 font-medium -mt-2">
        Trang đánh giá tích điểm - seller
      </div>

      {/* KHỐI ĐIỂM SỐ UY TÍN CHÍNH */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#F0ECE0] shadow-sm flex flex-col md:flex-row items-center gap-8">
        {/* Vòng tròn điểm số tiến trình (Progress Circle) */}
        <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
          <div className="absolute inset-0 rounded-full border-[6px] border-[#FAF8F0]"></div>
          {/* Một thanh progress giả lập xoay 45 độ - Trong thực tế cần dùng SVG stroke-dasharray */}
          <div className="absolute inset-0 rounded-full border-[6px] border-t-[#A14A24] border-r-[#A14A24] border-b-[#FAF8F0] border-l-[#FAF8F0] rotate-45"></div>

          <div className="text-center z-10">
            <span className="text-2xl font-black text-[#4A3B32]">
              {reputationData.currentPoints}
            </span>
            <span className="text-[10px] text-gray-400 block border-t border-gray-100 mt-0.5 pt-0.5 font-medium">
              / {rank.nextLevel} điểm
            </span>
          </div>
        </div>

        {/* Thông tin xếp hạng cụ thể */}
        <div className="flex-1 text-center md:text-left space-y-2">
          <span
            className={`text-[9px] font-black tracking-wider px-2 py-0.5 rounded-md inline-block uppercase ${rank.color}`}
          >
            🏆 {rank.name}
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-[#4A3B32] leading-tight">
            Cửa hàng đang hoạt động rất tốt.
          </h2>
          <p className="text-xs text-gray-500 max-w-xl leading-relaxed">
            Còn{" "}
            <span className="font-bold text-[#A14A24]">
              {pointsToNext > 0 ? pointsToNext : 0} điểm
            </span>{" "}
            nữa để lên cấp tiếp theo! Hãy tiếp tục duy trì dịch vụ tuyệt vời này
            nhé.
          </p>

          <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-2">
            <button className="bg-[#E87745] hover:bg-[#d66534] text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors shadow-sm">
              Xem đặc quyền Hạng Vàng
            </button>
            <button className="bg-[#FAF8F2] border border-[#EBE7D9] text-[#4A3B32] hover:bg-[#EDE9DA] font-bold text-xs px-4 py-2.5 rounded-xl transition-colors">
              Cách kiếm điểm
            </button>
          </div>
        </div>
      </div>

      {/* TÓM TẮT ĐƠN HÀNG VÀ SẢN PHẨM */}
      <div className="flex flex-wrap gap-4">
        <div className="bg-[#EBF5E6] text-[#2E4213] p-4 rounded-xl flex-1 min-w-[200px] border border-[#D5E8CD]">
          <div className="text-[10px] font-bold uppercase tracking-wider mb-1">
            Đơn hàng chờ xử lý
          </div>
          <div className="text-2xl font-black">{dashboardData.newOrders}</div>
        </div>
        <div className="bg-[#F0F4F8] text-[#2C3E50] p-4 rounded-xl flex-1 min-w-[200px] border border-[#DCE4EC]">
          <div className="text-[10px] font-bold uppercase tracking-wider mb-1">
            Sản phẩm đang bán
          </div>
          <div className="text-2xl font-black">
            {dashboardData.productsOnline}
          </div>
        </div>
      </div>

      {/* KHỐI LƯỚI 4 CHỈ SỐ VẬN HÀNH */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((item, idx) => (
          <div
            key={idx}
            className="bg-white p-4 rounded-2xl border border-[#F0ECE0] shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[105px]"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-gray-400 tracking-wide">
                  {item.label}
                </span>
                {item.change && (
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      item.status === "good"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {item.change}
                  </span>
                )}
              </div>
              <div className="text-lg font-black text-[#4A3B32] mt-2">
                {item.value}
              </div>
            </div>

            <span className="absolute bottom-2 right-3 opacity-10 text-xl pointer-events-none">
              {item.icon}
            </span>
          </div>
        ))}
      </div>

      {/* BẢNG LỊCH SỬ UY TÍN */}
      <div className="bg-white rounded-2xl border border-[#F0ECE0] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[#FAF8F0]">
          <h3 className="font-bold text-sm text-[#4A3B32]">
            Lịch sử điểm Uy tín
          </h3>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Ghi nhận các hoạt động ảnh hưởng đến điểm số của cửa hàng.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-bold tracking-wider text-gray-400 bg-[#FAF9F5]/60 uppercase border-b border-[#FAF8F0]">
                <th className="py-3 px-6 w-32">Ngày</th>
                <th className="py-3 px-6">Sự kiện</th>
                <th className="py-3 px-6 w-28 text-center">Số điểm</th>
                <th className="py-3 px-6 w-32 text-right">Tổng tích lũy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FAF8F0] text-xs text-[#4A3B32]">
              {historyLog.map((log, i) => (
                <tr key={i} className="hover:bg-[#FAF9F5]/30 transition-colors">
                  <td className="py-4 px-6 font-medium text-gray-400">
                    {log.date}
                  </td>
                  <td className="py-4 px-6 font-medium">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs">
                        {log.type === "plus" ? "✅" : "❌"}
                      </span>
                      <span>{log.event}</span>
                    </div>
                  </td>
                  <td
                    className={`py-4 px-6 text-center font-bold ${
                      log.type === "plus" ? "text-emerald-600" : "text-red-500"
                    }`}
                  >
                    {log.points}
                  </td>
                  <td className="py-4 px-6 text-right font-bold text-gray-600">
                    {log.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

