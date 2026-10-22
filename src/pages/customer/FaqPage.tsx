import React, { useState } from 'react';
import { HelpCircle, ChevronDown, Sparkles } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
  category: string;
}

const FAQ_DATA: FaqItem[] = [
  {
    category: 'Đặt lịch & Tiền cọc',
    question: '1. Làm thế nào để đặt lịch hẹn trải nghiệm tại An Nhiên Spa?',
    answer:
      'Quý khách chỉ cần truy cập mục "Đặt lịch", chọn liệu trình mong muốn, chọn ngày hẹn và khung giờ còn trống. Sau đó điền thông tin liên hệ và hoàn tất bước xác nhận đặt cọc mô phỏng. Hệ thống sẽ cấp ngay mã lịch hẹn duy nhất và gửi xác nhận đến email/tài khoản của quý khách.'
  },
  {
    category: 'Đặt lịch & Tiền cọc',
    question: '2. Tại sao spa áp dụng chính sách đặt cọc 30% trước?',
    answer:
      'Để đảm bảo chất lượng phục vụ và chuẩn bị phòng ốc, xông hơi, sấy ấm khăn thảo dược chuyên biệt cho từng khách hàng, An Nhiên thu khoản cọc trước 30%. Điều này giúp tránh tình trạng giữ chỗ ảo và đảm bảo kỹ thuật viên lành nghề luôn sẵn sàng đón tiếp quý khách đúng giờ.'
  },
  {
    category: 'Chính sách Hoàn & Hủy cọc',
    question: '3. Chính sách hủy lịch và hoàn tiền cọc được tính như thế nào?',
    answer:
      'Hệ thống áp dụng mốc chuẩn xác 24 giờ trước giờ hẹn:\n• Hủy trước ít nhất 24 giờ: Quý khách được hoàn 100% số tiền cọc (trong phạm vi mô phỏng hệ thống).\n• Hủy khi còn dưới 24 giờ: Quý khách được hoàn lại 50% tiền cọc, 50% còn lại được giữ lại làm phí bồi hoàn chuẩn bị nguyên liệu và kỹ thuật viên.'
  },
  {
    category: 'Chính sách Hoàn & Hủy cọc',
    question: '4. Tôi có thể đổi lịch hẹn sang ngày hoặc giờ khác không?',
    answer:
      'Có. Quý khách có thể tự thao tác đổi lịch tại mục "Lịch hẹn của tôi" nếu thời điểm yêu cầu đổi còn trước giờ hẹn ban đầu ít nhất 24 giờ. Khi còn dưới 24 giờ, hệ thống sẽ tạm khóa tính năng tự đổi lịch và hướng dẫn quý khách gọi trực tiếp hotline spa để được hỗ trợ sắp xếp theo tình hình phòng thực tế.'
  },
  {
    category: 'Mua sắm & Giao hàng',
    question: '5. Làm thế nào để mua mỹ phẩm thảo dược tại An Nhiên?',
    answer:
      'Quý khách vào mục "Sản phẩm", lựa chọn loại serum, kem dưỡng hoặc tinh dầu phù hợp, nhấn "Thêm vào giỏ". Tại giỏ hàng, quý khách có thể áp dụng mã ưu đãi rồi điền địa chỉ giao hàng và xác nhận đơn hàng COD hoặc chuyển khoản mô phỏng.'
  },
  {
    category: 'Ưu đãi & Minigame',
    question: '6. Mã giảm giá từ Vòng quay may mắn sử dụng như thế nào?',
    answer:
      'Mỗi ngày khi đăng nhập tài khoản, bạn nhận được 1 lượt quay miễn phí. Nếu trúng các mã như ANNHIEN10, ANNHIEN15 hay GIAM20K, bạn nhấn nút "Sao chép mã" và dán vào ô "Mã ưu đãi" tại trang Giỏ hàng để được khấu trừ tiền ngay trên hóa đơn.'
  },
  {
    category: 'Chung',
    question: '7. Giờ mở cửa và spa có phục vụ vào cuối tuần không?',
    answer:
      'An Nhiên Spa mở cửa từ 09:00 đến 20:30 tất cả các ngày trong tuần (kể cả thứ Bảy và Chủ Nhật). Khung giờ cao điểm thường là từ 15:00 - 19:30, do đó quý khách nên đặt lịch trước ít nhất 1-2 ngày để chọn được giờ đẹp.'
  }
];

export const FaqPage: React.FC = () => {
  const [openIndexes, setOpenIndexes] = useState<number[]>([0, 2]); // Open first & cancellation FAQ by default

  const toggleIndex = (idx: number) => {
    setOpenIndexes((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#5C7E63]">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Giải đáp thắc mắc</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#233527]">
          Câu Hỏi Thường Gặp (FAQ)
        </h1>
        <p className="text-sm text-[#556958] leading-relaxed">
          Tất cả thông tin chi tiết về chính sách đặt lịch, hoàn hủy tiền cọc và trải nghiệm dịch vụ tại An Nhiên.
        </p>
      </div>

      <div className="space-y-4">
        {FAQ_DATA.map((item, idx) => {
          const isOpen = openIndexes.includes(idx);
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-[#DFDAC8] shadow-xs overflow-hidden transition-all"
            >
              <button
                type="button"
                onClick={() => toggleIndex(idx)}
                className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-[#FAF9F5] transition-colors"
              >
                <div>
                  <span className="text-[10px] font-bold text-[#55785C] uppercase tracking-wider block mb-1">
                    {item.category}
                  </span>
                  <span className="font-serif text-base font-bold text-[#243729]">
                    {item.question}
                  </span>
                </div>
                <div
                  className={`w-7 h-7 rounded-full bg-[#F3F0E6] flex items-center justify-center shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 bg-[#E0EBE2] text-[#34593B]' : 'text-[#647967]'
                  }`}
                >
                  <ChevronDown className="w-4 h-4" />
                </div>
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-[#4E6252] leading-relaxed border-t border-[#F2EEE4] whitespace-pre-line bg-[#FAF9F5]/40">
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
