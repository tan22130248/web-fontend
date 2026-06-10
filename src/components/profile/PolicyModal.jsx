import React from 'react';
import { X } from 'lucide-react';

export default function PolicyModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-gradient-to-r from-[#fdf8f2] to-[#f9e8d0] border-b border-[#ede5db] px-6 py-5 flex items-center justify-between">
            <h2 className="text-xl font-bold text-[#2d1f1f]">
              📋 Chính sách giao dịch và bảo mật
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-600" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 prose prose-sm max-w-none text-[#3f3d2e]">
            <div className="text-xs text-gray-500 mb-6">
              <strong>Cập nhật lần cuối: 09/06/2026</strong>
            </div>

            <p className="mb-6">
              Chào mừng bạn đến với nền tảng mua bán đồ cũ của chúng tôi. Khi sử dụng website, bạn đồng ý tuân thủ các điều khoản và chính sách dưới đây.
            </p>

            {/* Section 1 */}
            <div className="mb-6">
              <h3 className="text-base font-bold text-[#2d1f1f] mb-3 border-l-4 border-[#d4711e] pl-3">
                1. MỤC ĐÍCH HOẠT ĐỘNG
              </h3>
              <p className="mb-2 text-sm">
                Website là nền tảng trung gian kết nối người mua và người bán nhằm trao đổi, mua bán các sản phẩm đã qua sử dụng hoặc sản phẩm hợp pháp theo quy định của pháp luật.
              </p>
              <p className="text-sm text-gray-700">
                Người dùng chịu trách nhiệm đối với mọi thông tin, nội dung và giao dịch được thực hiện thông qua tài khoản của mình.
              </p>
            </div>

            {/* Section 2 */}
            <div className="mb-6">
              <h3 className="text-base font-bold text-[#2d1f1f] mb-3 border-l-4 border-[#d4711e] pl-3">
                2. ĐĂNG KÝ TÀI KHOẢN
              </h3>
              <p className="text-sm font-semibold mb-2">Người dùng cam kết:</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-2">
                <li>Cung cấp thông tin chính xác và đầy đủ.</li>
                <li>Không sử dụng thông tin giả mạo hoặc thông tin của người khác.</li>
                <li>Bảo mật tên đăng nhập và mật khẩu.</li>
                <li>Chịu trách nhiệm đối với mọi hoạt động phát sinh từ tài khoản của mình.</li>
              </ul>
              <p className="text-sm text-gray-700 mt-2">
                Website có quyền khóa hoặc đình chỉ tài khoản nếu phát hiện hành vi vi phạm.
              </p>
            </div>

            {/* Section 3 */}
            <div className="mb-6">
              <h3 className="text-base font-bold text-[#2d1f1f] mb-3 border-l-4 border-[#d4711e] pl-3">
                3. QUY ĐỊNH ĐĂNG BÁN SẢN PHẨM
              </h3>
              <p className="text-sm font-semibold mb-2">Người bán phải:</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-2 mb-3">
                <li>Cung cấp thông tin sản phẩm trung thực.</li>
                <li>Đăng tải hình ảnh đúng với sản phẩm thực tế.</li>
                <li>Mô tả rõ tình trạng sử dụng của sản phẩm.</li>
                <li>Chịu trách nhiệm về nguồn gốc và quyền sở hữu sản phẩm.</li>
              </ul>
              <p className="text-sm font-semibold mb-2">Nghiêm cấm đăng bán:</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-2 mb-3">
                <li>Hàng giả, hàng nhái.</li>
                <li>Hàng hóa bị cấm kinh doanh theo quy định pháp luật.</li>
                <li>Tài sản có nguồn gốc bất hợp pháp.</li>
                <li>Nội dung phản cảm, vi phạm thuần phong mỹ tục.</li>
                <li>Sản phẩm vi phạm quyền sở hữu trí tuệ.</li>
              </ul>
              <p className="text-sm text-gray-700">
                Website có quyền gỡ bỏ sản phẩm vi phạm mà không cần thông báo trước.
              </p>
            </div>

            {/* Section 4 */}
            <div className="mb-6">
              <h3 className="text-base font-bold text-[#2d1f1f] mb-3 border-l-4 border-[#d4711e] pl-3">
                4. QUY ĐỊNH ĐỐI VỚI NGƯỜI MUA
              </h3>
              <p className="text-sm">Người mua cần:</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-2">
                <li>Kiểm tra kỹ thông tin sản phẩm trước khi giao dịch.</li>
                <li>Trao đổi rõ ràng với người bán về tình trạng sản phẩm.</li>
                <li>Thanh toán đúng theo thỏa thuận giữa hai bên.</li>
                <li>Không thực hiện các hành vi gian lận hoặc gây ảnh hưởng đến hệ thống.</li>
              </ul>
            </div>

            {/* Section 5 */}
            <div className="mb-6">
              <h3 className="text-base font-bold text-[#2d1f1f] mb-3 border-l-4 border-[#d4711e] pl-3">
                5. PHÒNG CHỐNG LỪA ĐẢO
              </h3>
              <p className="text-sm mb-2">
                Để đảm bảo an toàn giao dịch, người dùng cần lưu ý:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-2 mb-3">
                <li>Không chuyển tiền trước khi xác minh thông tin người bán.</li>
                <li>Không cung cấp mật khẩu hoặc mã OTP cho bất kỳ ai.</li>
                <li>Kiểm tra kỹ sản phẩm trước khi thanh toán.</li>
                <li>Báo cáo ngay cho quản trị viên khi phát hiện dấu hiệu lừa đảo.</li>
              </ul>
              <p className="text-sm text-gray-700">
                Website khuyến khích người dùng thực hiện giao dịch trực tiếp hoặc thông qua các phương thức thanh toán an toàn.
              </p>
            </div>

            {/* Section 6 */}
            <div className="mb-6">
              <h3 className="text-base font-bold text-[#2d1f1f] mb-3 border-l-4 border-[#d4711e] pl-3">
                6. BẢO MẬT THÔNG TIN
              </h3>
              <p className="text-sm font-semibold mb-2">Website cam kết:</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-2 mb-3">
                <li>Bảo vệ thông tin cá nhân của người dùng.</li>
                <li>Không bán hoặc chia sẻ dữ liệu cá nhân cho bên thứ ba trái phép.</li>
                <li>Áp dụng các biện pháp kỹ thuật nhằm bảo vệ dữ liệu khỏi truy cập trái phép.</li>
                <li>Chỉ sử dụng thông tin người dùng cho mục đích vận hành hệ thống và hỗ trợ giao dịch.</li>
              </ul>
              <p className="text-sm text-gray-700">
                Thông tin có thể được cung cấp cho cơ quan có thẩm quyền khi có yêu cầu theo quy định pháp luật.
              </p>
            </div>

            {/* Section 7 */}
            <div className="mb-6">
              <h3 className="text-base font-bold text-[#2d1f1f] mb-3 border-l-4 border-[#d4711e] pl-3">
                7. XỬ LÝ VI PHẠM
              </h3>
              <p className="text-sm">Website có quyền:</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-2">
                <li>Cảnh cáo người dùng vi phạm.</li>
                <li>Tạm khóa tài khoản.</li>
                <li>Khóa vĩnh viễn tài khoản.</li>
                <li>Xóa sản phẩm vi phạm.</li>
                <li>Từ chối cung cấp dịch vụ đối với các trường hợp gian lận hoặc gây ảnh hưởng đến hệ thống.</li>
              </ul>
            </div>

            {/* Section 8 */}
            <div className="mb-6">
              <h3 className="text-base font-bold text-[#2d1f1f] mb-3 border-l-4 border-[#d4711e] pl-3">
                8. GIỚI HẠN TRÁCH NHIỆM
              </h3>
              <p className="text-sm mb-2">
                Website đóng vai trò là nền tảng kết nối giữa người mua và người bán.
              </p>
              <p className="text-sm font-semibold mb-2">Chúng tôi không chịu trách nhiệm đối với:</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-2 mb-3">
                <li>Chất lượng thực tế của sản phẩm.</li>
                <li>Tranh chấp phát sinh giữa người mua và người bán.</li>
                <li>Thiệt hại do người dùng cung cấp thông tin không chính xác.</li>
                <li>Các giao dịch được thực hiện ngoài nền tảng.</li>
              </ul>
              <p className="text-sm text-gray-700">
                Tuy nhiên, chúng tôi sẽ hỗ trợ tiếp nhận phản ánh và phối hợp xử lý trong phạm vi cho phép.
              </p>
            </div>

            {/* Section 9 */}
            <div className="mb-6">
              <h3 className="text-base font-bold text-[#2d1f1f] mb-3 border-l-4 border-[#d4711e] pl-3">
                9. CHÍNH SÁCH BÁO CÁO VI PHẠM
              </h3>
              <p className="text-sm mb-2">Người dùng có thể gửi báo cáo khi phát hiện:</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-gray-700 ml-2 mb-3">
                <li>Hàng giả, hàng nhái.</li>
                <li>Hành vi lừa đảo.</li>
                <li>Thông tin sai sự thật.</li>
                <li>Nội dung vi phạm pháp luật.</li>
              </ul>
              <p className="text-sm text-gray-700">
                Ban quản trị sẽ xem xét và xử lý trong thời gian sớm nhất.
              </p>
            </div>

            {/* Section 10 */}
            <div className="mb-6 bg-[#fdf8f2] p-4 rounded-xl border border-[#ede5db]">
              <h3 className="text-base font-bold text-[#2d1f1f] mb-3">
                10. ĐIỀU KHOẢN CHUNG
              </h3>
              <p className="text-sm text-gray-700 mb-3">
                Việc tiếp tục sử dụng website đồng nghĩa với việc người dùng đã đọc, hiểu và đồng ý với toàn bộ nội dung của Chính sách giao dịch và bảo mật này.
              </p>
              <p className="text-sm text-gray-700">
                Ban quản trị có quyền cập nhật nội dung chính sách nhằm phù hợp với quy định pháp luật và hoạt động của hệ thống. Những thay đổi sẽ được công bố trên website trước khi áp dụng.
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="border-t border-[#ede5db] px-6 py-4 bg-[#fdf8f2] rounded-b-2xl">
            <button
              onClick={onClose}
              className="w-full px-4 py-3 bg-[#d4711e] text-white font-semibold rounded-xl hover:bg-[#c25f10] transition-colors"
            >
              Đã hiểu
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
