import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Navbar from "../../../components/common/Navbar";
import Footer from "../../../components/common/Footer";
import OrderStatusBadge from "../../../components/order/OrderStatusBadge";
import {
  ORDER_STATUS,
  formatPrice,
  formatOrderDate,
} from "../../../utils/orderUtils";
import orderService from "../../../services/orderService";

const SELLER_TABS = [
  { key: "all", label: "Tất cả đơn hàng" },
  { key: ORDER_STATUS.PENDING, label: "Chờ xác nhận" },
  { key: ORDER_STATUS.CONFIRMED, label: "Đã xác nhận" },
  { key: ORDER_STATUS.SHIPPING, label: "Đang giao" },
  { key: ORDER_STATUS.DELIVERED, label: "Đã giao" },
  { key: "problem", label: "Huỷ / Hoàn tiền" },
];

const PAGE_SIZE = 10;

export default function SellerOrdersPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const fetchOrders = useCallback(async (pageNum = 0) => {
    setLoading(true);
    try {
      const response = await orderService.getSellerOrders({
        page: pageNum,
        size: PAGE_SIZE,
      });
      const data = response;

      // Spring Page response
      if (data && Array.isArray(data.content)) {
        setOrders(data.content);
        setTotalPages(data.totalPages || 0);
      } else if (Array.isArray(data)) {
        setOrders(data);
        setTotalPages(1);
      } else {
        setOrders([]);
        setTotalPages(0);
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Không thể tải danh sách đơn hàng",
      );
      setOrders([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders(page);
  }, [page, fetchOrders]);

  const filteredOrders = useMemo(() => {
    if (activeTab === "all") return orders;
    if (activeTab === "problem")
      return orders.filter(
        (o) =>
          o.status === ORDER_STATUS.CANCELLED ||
          o.status === ORDER_STATUS.REFUNDED,
      );
    return orders.filter((o) => o.status === activeTab);
  }, [orders, activeTab]);

  return (
    <div className="min-h-screen flex flex-col font-body text-[#3f3d2e]">
      <main className="flex-1 w-full px-4 py-4">
        <div className="mb-6 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-[#ac4218] mb-2 tracking-tight">
              Quản lý Đơn hàng
            </h1>
            <p className="text-sm text-gray-500 font-medium">
              Kênh người bán - Theo dõi và xử lý đơn hàng của cửa hàng bạn.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto hide-scrollbar bg-white rounded-t-2xl border border-b-0 border-[#ede5db] p-4 gap-3">
          {SELLER_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2.5 text-sm font-semibold rounded-xl whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? "bg-brand-50 text-brand-700 shadow-sm border border-brand-100"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50 border border-transparent"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-b-2xl border border-[#ede5db] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-[#fcfaf8] text-[#646652] border-b border-[#ede5db]">
                <tr>
                  <th className="px-6 py-4 font-bold tracking-wider">Mã đơn</th>
                  <th className="px-6 py-4 font-bold tracking-wider">
                    Ngày đặt
                  </th>
                  <th className="px-6 py-4 font-bold tracking-wider">
                    Người mua
                  </th>
                  <th className="px-6 py-4 font-bold tracking-wider">
                    Tổng tiền
                  </th>
                  <th className="px-6 py-4 font-bold tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-4 font-bold tracking-wider text-right">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ede5db]">
                {loading ? (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-16 text-center text-gray-500 font-medium"
                    >
                      Đang tải dữ liệu đơn hàng...
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-16 text-center">
                      <div className="text-5xl opacity-30 mb-4">📦</div>
                      <p className="text-gray-500 font-medium text-base">
                        Không có đơn hàng nào.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-[#fafafa] transition-colors"
                    >
                      <td className="px-6 py-5 font-mono font-bold text-gray-800 uppercase">
                        {order.id}
                      </td>
                      <td className="px-6 py-5 text-gray-600 font-medium">
                        {formatOrderDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-5 text-[#3f3d2e] font-bold">
                        {order.buyerName}
                      </td>
                      <td className="px-6 py-5 font-bold text-brand-600 text-base">
                        {formatPrice(order.totalAmount)}
                      </td>
                      <td className="px-6 py-5">
                        <OrderStatusBadge status={order.status} />
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button
                          onClick={() => navigate(`/seller/orders/${order.id}`)}
                          className="text-brand-600 font-bold hover:text-brand-800 hover:bg-brand-50 px-4 py-2 rounded-lg transition-colors border border-brand-100"
                        >
                          Xử lý ngay
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              ← Trang trước
            </button>
            <span className="text-sm text-gray-600 font-medium">
              Trang {page + 1} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-4 py-2 text-sm font-medium border border-gray-200 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Trang sau →
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
