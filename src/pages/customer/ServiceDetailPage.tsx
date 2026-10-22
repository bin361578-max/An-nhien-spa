import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { formatVND } from '../../utils/formatters';
import { Clock, Calendar, CheckCircle2, AlertTriangle, ArrowLeft, Leaf, ShieldAlert } from 'lucide-react';

export const ServiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { services, settings } = useApp();
  const navigate = useNavigate();

  const service = services.find((s) => s.id === id);

  if (!service) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-[#233527]">Không tìm thấy dịch vụ</h2>
        <p className="text-sm text-[#5C7060]">Dịch vụ bạn đang tìm kiếm không tồn tại hoặc đã bị ngừng cung cấp.</p>
        <Link
          to="/services"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#425E47] text-white rounded-xl text-sm font-medium hover:bg-[#344D39] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh sách dịch vụ</span>
        </Link>
      </div>
    );
  }

  const depositRequired = Math.round(service.price * (settings.depositRate || 0.3));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Back button */}
      <div>
        <Link
          to="/services"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4A6D51] hover:text-[#233626] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Trở về danh mục dịch vụ</span>
        </Link>
      </div>

      {/* Main Grid: Left Image & Details, Right Purchase Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Column */}
        <div className="lg:col-span-7 space-y-8">
          <div className="aspect-16/10 rounded-2xl overflow-hidden shadow-md border border-[#DFDAC8] bg-slate-100">
            <img
              src={service.imageUrl}
              alt={service.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="space-y-4">
            <div className="text-xs font-bold uppercase tracking-widest text-[#5C7E63]">
              {service.categoryName}
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#213526]">
              {service.name}
            </h1>
            <p className="text-sm sm:text-base text-[#4E6252] leading-relaxed">
              {service.fullDescription || service.description}
            </p>
          </div>

          {/* Benefits */}
          {service.benefits && service.benefits.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-[#E3DEC9]">
              <h3 className="font-serif text-xl font-bold text-[#233527] flex items-center gap-2">
                <Leaf className="w-5 h-5 text-[#4E7656]" />
                <span>Hiệu Quả Sau Liệu Trình</span>
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-[#4E6352]">
                {service.benefits.map((b, idx) => (
                  <li key={idx} className="flex items-start gap-2 bg-[#F5F2E8] p-3 rounded-xl border border-[#DFD9C7]">
                    <CheckCircle2 className="w-4 h-4 text-[#4E7656] shrink-0 mt-0.5" />
                    <span className="text-xs leading-relaxed">{b}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Steps */}
          {service.steps && service.steps.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-[#E3DEC9]">
              <h3 className="font-serif text-xl font-bold text-[#233527]">
                Các Bước Quy Trình ({service.steps.length} bước)
              </h3>
              <div className="space-y-3">
                {service.steps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3.5 bg-white rounded-xl border border-[#DFDAC8]">
                    <span className="font-serif font-bold text-sm text-[#456A4C] bg-[#EDF3EE] w-7 h-7 rounded-lg flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <span className="text-xs sm:text-sm text-[#384C3C] pt-0.5 leading-relaxed">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {service.notes && (
            <div className="p-4 bg-[#FBF6EA] rounded-xl border border-[#EADBBE] flex items-start gap-3 text-xs text-[#6F5B2D]">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block mb-0.5 text-[#59471E]">Lưu ý dành cho quý khách:</strong>
                <p className="leading-relaxed">{service.notes}</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Sticky Booking Card */}
        <div className="lg:col-span-5">
          <div className="sticky top-28 bg-white rounded-2xl p-6 sm:p-8 border border-[#DCD6C4] shadow-md space-y-6">
            <div>
              <div className="text-xs text-[#708473] uppercase tracking-wider mb-1">Mức giá liệu trình</div>
              <div className="font-serif text-3xl font-bold text-[#223526] tabular-nums">
                {formatVND(service.price)}
              </div>
              <div className="flex items-center gap-2 mt-2 text-xs text-[#5E7362]">
                <Clock className="w-4 h-4 text-[#759079]" />
                <span>Thời lượng phục vụ: <strong>{service.durationMinutes} phút</strong></span>
              </div>
            </div>

            <div className="p-4 bg-[#F6F4EB] rounded-xl border border-[#DFDAC8] space-y-2 text-xs text-[#4F6453]">
              <div className="flex justify-between font-medium">
                <span>Tiền đặt cọc trực tuyến (30%):</span>
                <span className="font-bold text-[#233527] tabular-nums">{formatVND(depositRequired)}</span>
              </div>
              <div className="flex justify-between">
                <span>Thanh toán còn lại tại quầy:</span>
                <span className="tabular-nums">{formatVND(service.price - depositRequired)}</span>
              </div>
              <div className="pt-2 border-t border-[#DFDAC8] text-[11px] text-[#6E8172] leading-relaxed">
                * Có chính sách hoàn 100% tiền cọc khi hủy lịch trước $\ge$ 24 giờ.
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => navigate(`/booking?serviceId=${service.id}`)}
                className="w-full py-3.5 px-4 bg-[#425E47] hover:bg-[#344D39] text-white rounded-xl font-medium text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Đặt lịch hẹn ngay</span>
              </button>
              <p className="text-[11px] text-center text-[#748777]">
                Nhân viên sẽ xác nhận và giữ chỗ trong vòng 15 phút.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
