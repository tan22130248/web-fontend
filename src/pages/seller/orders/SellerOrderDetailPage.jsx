import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Navbar from "../../../components/common/Navbar";
import Footer from "../../../components/common/Footer";
import OrderStatusBadge from "../../../components/order/OrderStatusBadge";
import OrderItemRow from "../../../components/order/OrderItemRow";
import CancelOrderDialog from "../../../components/order/CancelOrderDialog";
import {
  ORDER_STATUS,
  formatPrice,
  formatOrderDate,
} from "../../../utils/orderUtils";
import orderService from "../../../services/orderService";

export default function SellerOrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [cancelDialog, setCancelDialog] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      setLoading(true);
      try {
        const response = await orderService.getSellerOrderById(id);
        setOrder(response);
      } catch (error) {
        toast.error(
          error?.response?.data?.message || "Không thể tải thông tin đơn hàng",
        );
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const handleAction = async (actionFn, successMsg, newStatus) => {
    setProcessing(true);
    try {
      const response = await actionFn(id);
      toast.success(successMsg);
      // Update with server response data
      setOrder((prev) => ({ ...prev, ...response }));
    } catch (error) {
      toast.error(error?.response?.data?.message || "Thao tác thất bại");
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = async (reason) => {
    try {
      const response = await orderService.cancelSellerOrder(id, reason);
      toast.success("Đã huỷ đơn hàng");
      setOrder((prev) => ({ ...prev, ...response }));
    } catch (error) {
      toast.error(error?.response?.data?.message || "Không thể huỷ đơn hàng");
    } finally {
      setCancelDialog(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center font-body text-gray-500">
        Đang tải thông tin...
      </div>
    );
  if (!order)
    return (
      <div className="min-h-screen flex items-center justify-center font-body text-gray-800">
        Không tìm thấy đơn hàng
      </div>
    );

  const paymentLabel = order.type === "cod" ? "COD" : order.type || "COD";

  return (
    <div className="min-h-screen flex flex-col font-body text-[#3f3d2e]">
      <main className="flex-1 max-w-10xl w-full mx-auto px-4 py-4">
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/seller/orders")}
            className="text-gray-500 hover:text-gray-900 bg-white border border-gray-200 px-4 py-2 rounded-xl shadow-sm text-sm font-medium transition-colors"
          >
            ← Quay lại
          </button>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-sm font-medium text-gray-500">
              Mã đơn:{" "}
              <span className="font-bold text-gray-800 uppercase">
                {order.id}
              </span>
            </span>
            {order.ghnTrackingCode && (
              <>
                <div className="h-5 w-px bg-gray-300"></div>
                <span className="text-sm font-medium text-brand-600 bg-brand-50 px-2 py-1 rounded-md border border-brand-100 flex items-center gap-1">
                  🚚 Vận đơn GHN:{" "}
                  <span className="font-bold uppercase tracking-wider">
                    {order.ghnTrackingCode}
                  </span>
                </span>
              </>
            )}
            <div className="h-5 w-px bg-gray-300"></div>
            <OrderStatusBadge status={order.status} className="px-4 py-1.5" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          <div className="md:col-span-2 space-y-6">
            {/* Action Panel for Seller */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ede5db] shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">
                  Xử lý đơn hàng
                </h2>
                <p className="text-sm text-gray-500">
                  Cập nhật trạng thái để thông báo cho người mua.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {order.status === ORDER_STATUS.PENDING && (
                  <>
                    <button
                      onClick={() => setCancelDialog(true)}
                      className="px-5 py-2.5 bg-white border border-red-200 text-red-600 font-bold rounded-xl hover:bg-red-50 transition-colors shadow-sm"
                    >
                      Từ chối
                    </button>
                    <button
                      onClick={() =>
                        handleAction(
                          orderService.confirmOrder,
                          "Đã xác nhận đơn",
                          ORDER_STATUS.CONFIRMED,
                        )
                      }
                      disabled={processing}
                      className="px-5 py-2.5 bg-brand-500 text-white font-bold rounded-xl hover:bg-brand-600 disabled:opacity-50 transition-colors shadow-sm"
                    >
                      Xác nhận đơn
                    </button>
                  </>
                )}

                {order.status === ORDER_STATUS.CONFIRMED && (
                  <button
                    onClick={() =>
                      handleAction(
                        orderService.shipOrder,
                        "Đã giao cho ĐVVC",
                        ORDER_STATUS.SHIPPING,
                      )
                    }
                    disabled={processing}
                    className="px-5 py-2.5 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 disabled:opacity-50 transition-colors shadow-sm"
                  >
                    Giao cho ĐVVC
                  </button>
                )}

                {order.status === ORDER_STATUS.SHIPPING && (
                  <button
                    onClick={() =>
                      handleAction(
                        orderService.deliverOrder,
                        "Giao hàng thành công",
                        ORDER_STATUS.DELIVERED,
                      )
                    }
                    disabled={processing}
                    className="px-5 py-2.5 bg-green-500 text-white font-bold rounded-xl hover:bg-green-600 disabled:opacity-50 transition-colors shadow-sm"
                  >
                    Đã giao thành công
                  </button>
                )}
              </div>
            </div>

            {/* Products */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ede5db] shadow-sm">
              <h2 className="text-lg font-bold text-[#3f3d2e] mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                <span>📦</span> Sản phẩm cần giao
              </h2>
              <div>
                {order.items &&
                  order.items.map((item, idx) => (
                    <OrderItemRow key={item.id || idx} item={item} />
                  ))}
              </div>
            </div>
          </div>

          <div className="space-y-6 lg:space-y-8">
            {/* Shipping Info */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ede5db] shadow-sm sticky top-6">
              <h2 className="text-lg font-bold text-[#3f3d2e] mb-5 border-b border-gray-100 pb-3 flex items-center gap-2">
                <span>📍</span> Thông tin giao hàng
              </h2>
              <div className="text-sm space-y-3 bg-[#fcfaf8] p-4 rounded-xl border border-gray-100">
                <p className="font-bold text-gray-800 text-base">
                  {order.buyerName}
                </p>
                {order.buyerEmail && (
                  <p className="text-gray-600 flex items-center gap-2">
                    <span>📧</span> {order.buyerEmail}
                  </p>
                )}
                <p className="text-gray-600 flex items-start gap-2 leading-relaxed">
                  <span className="mt-0.5">🏠</span>
                  <span>{order.shippingAddress}</span>
                </p>
              </div>

              <div className="mt-8">
                <h2 className="text-lg font-bold text-[#3f3d2e] mb-4 pb-2 border-b border-gray-100 flex items-center gap-2">
                  <span>💰</span> Doanh thu
                </h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center text-gray-600">
                    <span>Tổng tiền hàng</span>
                    <span className="font-medium text-gray-900">
                      {formatPrice(
                        order.totalAmount - (order.shippingFee || 0),
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-gray-600">
                    <span>Phí vận chuyển</span>
                    <span className="font-medium text-gray-900">
                      {formatPrice(order.shippingFee || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100 text-base">
                    <span className="font-bold text-gray-700">
                      Khách phải trả
                    </span>
                    <span className="font-bold text-[#ac4218] text-xl">
                      {formatPrice(order.totalAmount)}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-brand-600 bg-brand-50 px-3 py-2 rounded-lg font-medium inline-block border border-brand-100">
                    Thanh toán {paymentLabel}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <CancelOrderDialog
        open={cancelDialog}
        onClose={() => setCancelDialog(false)}
        onConfirm={handleCancel}
        title="Từ chối đơn hàng"
        reasons={[
          "Hết hàng",
          "Không thể giao đến khu vực này",
          "Sai thông tin giá",
          "Lý do khác",
        ]}
      />
    </div>
  );
}
