# Tài Liệu API Giao Hàng & Đơn Hàng (Tích Hợp GHN)

Tài liệu này tổng hợp danh sách các API liên quan đến quy trình đặt hàng, tính phí giao hàng và dữ liệu địa chỉ (Master Data) của hệ thống sau khi đã tích hợp Giao Hàng Nhanh (GHN). Frontend team có thể sử dụng tài liệu này để refactor lại các luồng Checkout, Seller Order Management và Location Select Box.

---

## 1. API Địa Chỉ (Location Master Data)

Các API này lấy dữ liệu hành chính trực tiếp từ GHN thông qua Server Backend (Backend proxy). Dữ liệu trả về giữ nguyên cấu trúc chuẩn của GHN.

### 1.1. Lấy Danh Sách Tỉnh/Thành Phố
- **Endpoint**: `GET /api/ghn/locations/provinces`
- **Nhiệm vụ**: Lấy danh sách tất cả các tỉnh/thành phố hỗ trợ giao hàng.
- **Input**: Không yêu cầu.
- **Output (Thành công - 200 OK)**:
  ```json
  {
    "code": 200,
    "message": "Success",
    "data": [
      {
        "ProvinceID": 201,
        "ProvinceName": "Hà Nội",
        ...
      }
    ]
  }
  ```
- **Lỗi có thể xảy ra (400 Bad Request)**: 
  - Chưa cấu hình Token GHN trên Server.
  - GHN API đang bảo trì/timeout.

### 1.2. Lấy Danh Sách Quận/Huyện
- **Endpoint**: `GET /api/ghn/locations/districts?provinceId={id}`
- **Nhiệm vụ**: Lấy danh sách quận/huyện thuộc một tỉnh/thành phố cụ thể.
- **Input**:
  - Query parameter: `provinceId` (Integer) - ID của Tỉnh/Thành phố.
- **Output (Thành công - 200 OK)**:
  ```json
  {
    "code": 200,
    "message": "Success",
    "data": [
      {
        "DistrictID": 1442,
        "DistrictName": "Quận Ba Đình",
        ...
      }
    ]
  }
  ```

### 1.3. Lấy Danh Sách Phường/Xã
- **Endpoint**: `GET /api/ghn/locations/wards?districtId={id}`
- **Nhiệm vụ**: Lấy danh sách phường/xã thuộc một quận/huyện cụ thể.
- **Input**:
  - Query parameter: `districtId` (Integer) - ID của Quận/Huyện.
- **Output (Thành công - 200 OK)**:
  ```json
  {
    "code": 200,
    "message": "Success",
    "data": [
      {
        "WardCode": "1A0101",
        "WardName": "Phường Phúc Xá",
        ...
      }
    ]
  }
  ```

---

## 2. API Tính Phí Giao Hàng & Đặt Hàng (Checkout Flow)

### 2.1. Tính Phí Vận Chuyển Trước (Calculate Fee)
- **Endpoint**: `POST /api/orders/calculate-fee`
- **Nhiệm vụ**: Gọi khi user chọn xong địa chỉ hoặc giỏ hàng để hiển thị dự toán phí ship. Nếu giỏ hàng gồm nhiều Shop, backend sẽ tự động tính và cộng dồn phí từ tất cả các Shop.
- **Header**: `Authorization: Bearer <jwt>`
- **Input (Body JSON)**:
  ```json
  {
    "toDistrictId": 1442,
    "toWardCode": "1A0101",
    "items": [
      {
        "productId": "string (UUID)",
        "variantId": "string (UUID - tuỳ chọn)",
        "quantity": 1
      }
    ]
  }
  ```
- **Output (Thành công - 200 OK)**:
  ```json
  {
    "totalFee": 35000
  }
  ```
- **Lỗi có thể xảy ra (400 Bad Request)**:
  - `Vui lòng nhập districtId và wardCode`
  - `Danh sách sản phẩm không được trống`
  - Lỗi GHN API trả về (do districtId/wardCode không hợp lệ).
  - Lỗi sản phẩm không tồn tại, hết hàng hoặc ngừng kinh doanh.

### 2.2. Đặt Hàng (Place Order)
- **Endpoint**: `POST /api/orders`
- **Nhiệm vụ**: Chốt đơn hàng. Tạo order trong DB và tính phí vận chuyển chính xác vào hoá đơn (tổng tiền = tiền hàng + phí ship GHN).
- **Header**: `Authorization: Bearer <jwt>`
- **Input (Body JSON)**:
  ```json
  {
    "shippingAddress": "Số 123, Đường ABC (Ghi rõ số nhà/tên đường)",
    "toDistrictId": 1442,
    "toWardCode": "1A0101",
    "note": "Giao giờ hành chính",
    "items": [
      {
        "productId": "string (UUID)",
        "variantId": "string (UUID - tuỳ chọn)",
        "quantity": 2
      }
    ]
  }
  ```
- **Output (Thành công - 200 OK)**:
  - Trả về danh sách `[OrderDto]` (vì 1 giỏ hàng có thể tạo ra nhiều Order nếu mua từ nhiều Shop).
- **Lỗi có thể xảy ra (400 Bad Request)**:
  - `Vui lòng nhập địa chỉ giao hàng`
  - `Vui lòng nhập districtId và wardCode`
  - Shop chưa cấu hình GHN Token (Lỗi 500 ném ra từ `GhnIntegrationException`).
  - Thiếu hàng, sản phẩm không tồn tại.

---

## 3. API Quản Lý Đơn Hàng (Dành cho Seller)

### 3.1. Xác nhận giao cho ĐVVC (Ship Order)
- **Endpoint**: `PATCH /api/orders/{id}/ship`
- **Nhiệm vụ**: Seller nhấn nút "Giao hàng". Backend sẽ tự động gọi API **Tạo Vận Đơn (Create Order)** của GHN, sau đó lưu mã vận đơn trả về (`ghnTrackingCode`) vào DB và cập nhật trạng thái đơn thành `shipping`.
- **Header**: `Authorization: Bearer <jwt>`
- **Input**: None (Path Variable `{id}` là Order ID).
- **Output (Thành công - 200 OK)**:
  - Trả về `OrderDto` với trạng thái `shipping` và có thêm trường `ghnTrackingCode`.
- **Lỗi có thể xảy ra (400 Bad Request / 500 Internal Error)**:
  - Trạng thái đơn hàng không hợp lệ (Không thể chuyển sang shipping).
  - API tạo đơn GHN bị lỗi (Do địa chỉ lấy hàng của Shop sai, Token hết hạn, v.v.).

---

## 4. Webhook (Hệ Thống - Dành Cho GHN Gọi)

### 4.1. Cập nhật trạng thái đơn hàng qua Webhook
- **Endpoint**: `POST /api/webhook/ghn`
- **Nhiệm vụ**: Điểm nhận tín hiệu (Webhook URL) cho GHN. Khi bưu tá GHN thao tác (giao thành công, khách từ chối, hoàn hàng...), GHN sẽ POST vào đây để báo hiệu cho hệ thống tự động đổi trạng thái đơn hàng thay vì Seller phải tự bấm.
- **Input (Theo chuẩn GHN)**:
  ```json
  {
    "OrderCode": "GHN-CODE-12345",
    "Status": "delivered",
    ...
  }
  ```
- **Output**: `200 OK` (Luôn trả về HTTP 200 để GHN không gọi lại nhiều lần).
- **Logic xử lý ngầm**:
  - Nếu `Status == "delivered"` -> Đổi trạng thái Order thành `delivered`.
  - Nếu `Status == "cancel" | "return" | "returned"` -> Đổi trạng thái Order thành `cancelled` (hoặc tuỳ thuộc vào luồng hoàn hàng).
