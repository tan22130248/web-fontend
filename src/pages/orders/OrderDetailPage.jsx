import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Navbar from "../../components/common/Navbar";
import Footer from "../../components/common/Footer";
import OrderStatusBadge from "../../components/order/OrderStatusBadge";
import OrderTimeline from "../../components/order/OrderTimeline";
import OrderItemRow from "../../components/order/OrderItemRow";
import CancelOrderDialog from "../../components/order/CancelOrderDialog";
import RefundRequestDialog from "../../components/order/RefundRequestDialog";
import ReviewModal from "../../components/order/ReviewModal";
import {
  ORDER_STATUS,
  formatPrice,
  formatOrderDate,
} from "../../utils/orderUtils";
import orderService from "../../services/orderService";

/** Build timeline steps from API history[] array */
function buildTimelineFromHistory(history) {
  if (!Array.isArray(history) || history.length === 0) return [];

  return history.map((entry) => {
    const statusLabels = {
      pending: "Đơn hàng đã đặt",
      pending_payment: "Chờ thanh toán",
      confirmed: "Đã xác nhận",
      shipping: "Đang giao hàng",
      delivered: "Đã giao thành công",
      cancelled: "Đã huỷ",
      refunded: "Hoàn tiền",
    };

    return {
      label: statusLabels[entry.newStatus] || entry.newStatus,
      note: entry.note || null,
      time: entry.createdAt ? formatOrderDate(entry.createdAt) : null,
      done: true,
      active: false,
    };
  });
}

/** Fallback: build timeline from status when no history is available */
function buildTimelineFromStatus(status) {
  const steps = [
    {
      label: "Đơn hàng đã đặt",
      note: "Chờ người bán xác nhận",
      done: true,
      active: false,
    },
    {
      label: "Đã xác nhận",
      note: "Người bán đang chuẩn bị hàng",
      done: false,
      active: false,
    },
    {
      label: "Đang giao",
      note: "Đơn hàng đã được giao cho đơn vị vận chuyển",
      done: false,
      active: false,
    },
    {
      label: "Đã giao",
      note: "Giao hàng thành công",
      done: false,
      active: false,
    },
  ];

  if (status === ORDER_STATUS.CANCELLED) {
    return [
      { label: "Đơn hàng đã đặt", done: true },
      {
        label: "Đã huỷ",
        note: "Đơn hàng đã bị huỷ",
        active: true,
        done: false,
      },
    ];
  }

  if (status === ORDER_STATUS.REFUNDED) {
    return [
      { label: "Đơn hàng đã đặt", done: true },
      { label: "Đã giao", done: true },
      {
        label: "Hoàn tiền",
        note: "Đã xử lý hoàn tiền",
        active: true,
        done: false,
      },
    ];
  }

  if (status === ORDER_STATUS.PENDING_PAYMENT) {
    return [
      {
        label: "Chờ thanh toán",
        note: "Đơn hàng đang chờ thanh toán qua VNPay",
        active: true,
        done: false,
      },
      { label: "Đã xác nhận", done: false },
      { label: "Đang giao", done: false },
      { label: "Đã giao", done: false },
    ];
  }

  const statusOrder = [
    ORDER_STATUS.PENDING,
    ORDER_STATUS.CONFIRMED,
    ORDER_STATUS.SHIPPING,
    ORDER_STATUS.DELIVERED,
  ];
  const currentIdx = statusOrder.indexOf(status);

  steps.forEach((step, i) => {
    if (i < currentIdx) {
      step.done = true;
    } else if (i === currentIdx) {
      step.done = true;
      step.active = true;
    }
  });

  return steps;
}

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const [cancelDialog, setCancelDialog] = useState(false);
  const [refundDialog, setRefundDialog] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [productToReview, setProductToReview] = useState(null);

  const fetchOrder = async () => {
    setLoading(true);
    try {
      const response = await orderService.getOrderById(id);
      setOrder(response);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Không thể tải thông tin đơn hàng",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleOpenReview = (item) => {
    setProductToReview(item);
    setReviewModalOpen(true);
  };

  const handleReviewSuccess = () => {
    fetchOrder();
  };

  const handleCancel = async (reason) => {
    try {
      const response = await orderService.cancelOrder(id, reason);
      toast.success("Đã huỷ đơn hàng");
      setOrder((prev) => ({ ...prev, ...response }));
    } catch (error) {
      toast.error(error?.response?.data?.message || "Không thể huỷ đơn hàng");
    } finally {
      setCancelDialog(false);
    }
  };

  const handleRefund = async (data) => {
    try {
      const reason = typeof data === "string" ? data : data?.reason || "";
      const response = await orderService.requestRefund(id, reason);
      toast.success("Đã gửi yêu cầu hoàn tiền");
      setOrder((prev) => ({ ...prev, ...response }));
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Không thể gửi yêu cầu hoàn tiền",
      );
    } finally {
      setRefundDialog(false);
    }
  };

  const handleRetryPayment = async () => {
    try {
      const res = await orderService.retryPayment(order.orderCode || order.id);
      if (res?.paymentUrl) {
        window.location.href = res.paymentUrl;
      } else {
        toast.error("Không tìm thấy link thanh toán, vui lòng thử lại sau.");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Không thể tạo lại thanh toán");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#f9f4ee] flex items-center justify-center text-gray-500 font-body">
        Đang tải thông tin...
      </div>
    );
  if (!order)
    return (
      <div className="min-h-screen bg-[#f9f4ee] flex items-center justify-center font-body">
        Không tìm thấy đơn hàng
      </div>
    );

  // Build timeline — prefer API history[], fallback to status-based
  const timelineSteps =
    order.history && order.history.length > 0
      ? buildTimelineFromHistory(order.history)
      : buildTimelineFromStatus(order.status);

  // Mark last step as active
  if (timelineSteps.length > 0) {
    timelineSteps[timelineSteps.length - 1].active = true;
  }

  // Payment display
  const paymentLabel = order.paymentMethod === 'vnpay' ? 'Thanh toán qua VNPAY' : (order.type === "cod" ? "Thanh toán khi nhận hàng" : order.type || "COD");

  return (
    <div className="min-h-screen flex flex-col bg-[#f9f4ee] font-body text-[#3f3d2e]">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <button
            onClick={() => navigate("/orders")}
            className="text-gray-500 hover:text-gray-900 bg-white border border-gray-200 px-4 py-2 rounded-xl shadow-sm text-sm font-medium transition-colors"
          >
            ← Trở lại danh sách
          </button>
          <div className="flex items-center gap-3 ml-auto">
            <span className="text-sm font-medium text-gray-500">
              Mã đơn:{" "}
              <span className="text-gray-800 font-bold uppercase">
                {order.orderCode || order.id}
              </span>
            </span>
            <div className="h-5 w-px bg-gray-300"></div>
            <OrderStatusBadge
              status={order.status}
              className="text-sm px-4 py-1.5"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          <div className="lg:col-span-2 space-y-6 lg:space-y-8">
            {/* Shop info */}
            {order.shopName && (
              <div className="bg-white rounded-3xl px-6 py-4 border border-[#ede5db] shadow-sm flex items-center gap-3">
                {order.shopAvatarUrl && (
                  <img
                    src={order.shopAvatarUrl}
                    alt={order.shopName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                )}
                <span className="font-bold text-[#3f3d2e]">
                  {order.shopName}
                </span>
              </div>
            )}

            {/* Products */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ede5db] shadow-sm">
              <h2 className="text-lg font-bold text-[#3f3d2e] mb-4 pb-4 border-b border-gray-100 flex items-center gap-2">
                <span>🛍</span> Chi tiết sản phẩm
              </h2>
              <div className="space-y-2">
                {order.items &&
                  order.items.map((item, idx) => (
                    <OrderItemRow 
                      key={item.id || idx} 
                      item={item}
                      orderStatus={order.status}
                      onReviewClick={() => handleOpenReview(item)}
                    />
                  ))}
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ede5db] shadow-sm">
              <h2 className="text-lg font-bold text-[#3f3d2e] mb-4 pb-4 border-b border-gray-100 flex items-center gap-2">
                <span>💳</span> Tóm tắt thanh toán
              </h2>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center text-gray-600">
                  <span>Tổng tiền hàng</span>
                  <span className="font-medium text-gray-900">
                    {formatPrice(order.totalAmount - (order.shippingFee || 0))}
                  </span>
                </div>
                <div className="flex justify-between items-center text-gray-600">
                  <span>Phí vận chuyển</span>
                  <span className="font-medium text-gray-900">
                    {formatPrice(order.shippingFee || 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-gray-100 text-base">
                  <span className="font-bold text-gray-700">Thành tiền</span>
                  <span className="font-bold text-[#ac4218] text-xl">
                    {formatPrice(order.totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 text-xs text-gray-500">
                  <span>Phương thức</span>
                  <span className="font-medium bg-gray-50 px-2 py-1 rounded border border-gray-100">
                    {paymentLabel}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions for mobile - hidden on desktop */}
            <div className="flex gap-3 lg:hidden">
              {order.status === ORDER_STATUS.PENDING_PAYMENT && (
                <button
                  onClick={handleRetryPayment}
                  className="flex-1 py-3 bg-gradient-to-r from-[#ac4218] to-[#fe7e4f] text-white font-bold rounded-xl shadow-sm hover:opacity-90 transition-opacity"
                >
                  Thanh toán lại
                </button>
              )}
              {(order.status === ORDER_STATUS.PENDING ||
                order.status === ORDER_STATUS.CONFIRMED) && (
                <button
                  onClick={() => setCancelDialog(true)}
                  className="flex-1 py-3 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                >
                  Huỷ đơn hàng
                </button>
              )}
              {order.status === ORDER_STATUS.DELIVERED && (
                <button
                  onClick={() => setRefundDialog(true)}
                  className="flex-1 py-3 bg-white border border-brand-300 text-brand-600 font-bold rounded-xl hover:bg-brand-50 transition-colors shadow-sm"
                >
                  Yêu cầu hoàn tiền
                </button>
              )}
            </div>
          </div>

          <div className="space-y-6 lg:space-y-8">
            {/* Timeline */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#ede5db] shadow-sm sticky top-6">
              <h2 className="text-lg font-bold text-[#3f3d2e] mb-6 flex items-center gap-2">
                <span>⏱</span> Trạng thái đơn hàng
              </h2>
              <div className="mb-8">
                <OrderTimeline steps={timelineSteps} />
              </div>

              {/* Shipping Info embedded in sidebar */}
              <div className="pt-6 border-t border-gray-100">
                <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wider">
                  Giao hàng đến
                </h3>
                <div className="bg-[#f9f4ee] p-4 rounded-xl border border-[#ede5db]">
                  <p className="font-bold text-gray-800 text-sm">
                    {order.buyerName}
                  </p>
                  {order.buyerEmail && (
                    <p className="text-gray-600 text-sm mt-1">
                      {order.buyerEmail}
                    </p>
                  )}
                  <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                    {order.shippingAddress}
                  </p>
                </div>
              </div>

              {/* Actions for desktop */}
              <div className="mt-8 hidden lg:block space-y-3">
                {order.status === ORDER_STATUS.PENDING_PAYMENT && (
                  <button
                    onClick={handleRetryPayment}
                    className="w-full py-3 bg-gradient-to-r from-[#ac4218] to-[#fe7e4f] text-white font-bold rounded-xl shadow-sm hover:opacity-90 transition-opacity"
                  >
                    Thanh toán lại
                  </button>
                )}
                {(order.status === ORDER_STATUS.PENDING ||
                  order.status === ORDER_STATUS.CONFIRMED) && (
                  <button
                    onClick={() => setCancelDialog(true)}
                    className="w-full py-3 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                  >
                    Huỷ đơn hàng
                  </button>
                )}
                {order.status === ORDER_STATUS.DELIVERED && (
                  <button
                    onClick={() => setRefundDialog(true)}
                    className="w-full py-3 bg-white border border-[#ac421840] text-[#ac4218] font-bold rounded-xl hover:bg-[#fff8f5] transition-colors shadow-sm"
                  >
                    Yêu cầu hoàn tiền
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      <CancelOrderDialog
        open={cancelDialog}
        onClose={() => setCancelDialog(false)}
        onConfirm={handleCancel}
        reasons={[
          "Đổi ý không muốn mua nữa",
          "Muốn thay đổi địa chỉ giao hàng",
          "Tìm được sản phẩm khác giá tốt hơn",
          "Lý do khác",
        ]}
      />

      <RefundRequestDialog
        open={refundDialog}
        onClose={() => setRefundDialog(false)}
        onSubmit={handleRefund}
        reasons={[
          "Hàng không đúng mô tả",
          "Hàng bị lỗi hoặc hư hỏng",
          "Nhận sai sản phẩm",
          "Lý do khác",
        ]}
      />

      {productToReview && (
        <ReviewModal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          productId={productToReview.productId}
          orderId={order.id}
          onSuccess={handleReviewSuccess}
        />
      )}
    </div>
  );
}
