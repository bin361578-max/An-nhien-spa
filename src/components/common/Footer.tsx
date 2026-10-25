import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { MapPin, Phone, Mail, Clock, ShieldCheck, HeartHandshake } from 'lucide-react';

export const Footer: React.FC = () => {
  const { settings } = useApp();

  return (
    <footer className="bg-[#1C281F] text-[#D8E2D9] pt-14 pb-8 border-t border-[#2D3E31]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Col 1: Brand & Philosophy */}
          <div className="space-y-4">
            <div className="font-serif text-2xl font-bold tracking-tight text-white">
              AN NHIÊN <span className="font-sans text-xs font-light text-[#8FA893] tracking-widest uppercase">Spa</span>
            </div>
            <p className="text-sm text-[#A8BFA9] leading-relaxed">
              {settings.footerBio}
            </p>
            <div className="flex items-center gap-2 pt-2 text-xs text-[#8FA893]">
              <HeartHandshake className="w-4 h-4 text-[#ADC4B1]" />
              <span>Chăm sóc tận tâm · Tự nhiên thuần khiết</span>
            </div>
          </div>

          {/* Col 2: Liên hệ & Giờ hoạt động */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold tracking-wider uppercase text-white">Thông tin liên hệ</h4>
            <ul className="space-y-2.5 text-sm text-[#BACFBC]">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#8FA893] shrink-0 mt-0.5" />
                <span>{settings.address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#8FA893] shrink-0" />
                <span>Hotline: <strong className="text-white">{settings.hotline}</strong></span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#8FA893] shrink-0" />
                <span>{settings.email}</span>
              </li>
              <li className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#8FA893] shrink-0 mt-0.5" />
                <span>{settings.openingHours}</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Điều hướng nhanh */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold tracking-wider uppercase text-white">Liên kết nhanh</h4>
            <ul className="space-y-2 text-sm text-[#BACFBC]">
              <li>
                <Link to="/services" className="hover:text-white transition-colors">Dịch vụ chăm sóc da & trị liệu</Link>
              </li>
              <li>
                <Link to="/booking" className="hover:text-white transition-colors">Đặt lịch hẹn trực tuyến</Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-white transition-colors">Cửa hàng mỹ phẩm hữu cơ</Link>
              </li>
              <li>
                <Link to="/promotions" className="hover:text-white transition-colors">Ưu đãi & Vòng quay may mắn</Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-white transition-colors">Câu hỏi thường gặp & Hướng dẫn</Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Chính sách đặt cọc & Đổi hủy lịch */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold tracking-wider uppercase text-white">Chính sách đặt cọc</h4>
            <div className="p-3.5 bg-[#25352A] rounded-xl text-xs space-y-2 text-[#C6D8C8] border border-[#35483B]">
              <div className="font-semibold text-white">Mức đặt cọc: 30% giá trị dịch vụ</div>
              <p className="leading-relaxed">
                • <strong>Hủy trước $\ge$ 24 giờ:</strong> Hoàn 100% tiền cọc mô phỏng.<br/>
                • <strong>Hủy dưới 24 giờ:</strong> Hoàn 50% tiền cọc, giữ lại 50% phí chuẩn bị.<br/>
                • <strong>Đổi lịch:</strong> Áp dụng khi còn trước giờ hẹn ít nhất 24 giờ.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-[#2D3E31] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8FA893]">
          <div>
            © 2026 An Nhiên Spa. Toàn bộ quyền được bảo lưu. Đồ án học tập hoàn chỉnh.
          </div>
          <div className="text-[11px] text-[#A6BAAA] bg-[#243328] px-3 py-1 rounded-md border border-[#314435]">
            Môi trường thử nghiệm mô phỏng: Không sử dụng tiền thật hay thông tin thẻ tín dụng thật.
          </div>
        </div>
      </div>
    </footer>
  );
};
