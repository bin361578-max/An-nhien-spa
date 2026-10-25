import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { formatVND, formatDateVN } from '../../utils/formatters';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Info
} from 'lucide-react';

const TIME_SLOTS = [
  '09:00',
  '10:30',
  '13:30',
  '15:00',
  '16:30',
  '18:00',
  '19:30'
];

export const BookingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { services, bookings, currentUser, createBooking, settings, showToast } = useApp();

  const preselectedServiceId = searchParams.get('serviceId');

  // Step state: 1 -> 2 -> 3 -> 4 -> 5 -> 6 (Success)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form state
  const [selectedServiceId, setSelectedServiceId] = useState<string>(preselectedServiceId || '');
  const [bookingDate, setBookingDate] = useState<string>(() => {
    // Tomorrow as default recommended date
    const tmr = new Date();
    tmr.setDate(tmr.getDate() + 1);
    return tmr.toISOString().split('T')[0];
  });
  const [timeSlot, setTimeSlot] = useState<string>('14:00');
  const [customerName, setCustomerName] = useState<string>(currentUser?.name || '');
  const [customerPhone, setCustomerPhone] = useState<string>(currentUser?.phone || '');
  const [customerEmail, setCustomerEmail] = useState<string>(currentUser?.email || '');
  const [notes, setNotes] = useState<string>('');

  // Payment simulation state
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [confirmedBookingId, setConfirmedBookingId] = useState<string | null>(null);

  // Sync if currentUser loads
  useEffect(() => {
    if (currentUser) {
      if (!customerName) setCustomerName(currentUser.name);
      if (!customerPhone) setCustomerPhone(currentUser.phone);
      if (!customerEmail) setCustomerEmail(currentUser.email);
    }
  }, [currentUser]);

  // Sync service from query param
  useEffect(() => {
    if (preselectedServiceId && services.some((s) => s.id === preselectedServiceId)) {
      setSelectedServiceId(preselectedServiceId);
    } else if (!selectedServiceId && services.length > 0) {
      setSelectedServiceId(services[0].id);
    }
  }, [preselectedServiceId, services]);

  const activeServices = useMemo(() => services.filter((s) => s.status === 'active'), [services]);
  const selectedService = useMemo(
    () => services.find((s) => s.id === selectedServiceId) || activeServices[0],
    [services, selectedServiceId, activeServices]
  );

  // Calculate pricing
  const depositRate = settings.depositRate || 0.3;
  const totalPrice = selectedService ? selectedService.price : 0;
  const depositPrice = Math.round(totalPrice * depositRate);
  const remainingPrice = totalPrice - depositPrice;

  // Minimum date: today
  const minDate = new Date().toISOString().split('T')[0];

  // Check booked slots for selected date
  const slotAvailability = useMemo(() => {
    const counts: Record<string, number> = {};
    bookings
      .filter((b) => b.date === bookingDate && b.status !== 'cancelled')
      .forEach((b) => {
        counts[b.timeSlot] = (counts[b.timeSlot] || 0) + 1;
      });
    return counts;
  }, [bookings, bookingDate]);

  // Validation
  const validateStep2 = () => {
    if (!bookingDate) {
      showToast('Vui lòng chọn ngày hẹn.', 'error');
      return false;
    }
    if (bookingDate < minDate) {
      showToast('Không thể chọn ngày trong quá khứ.', 'error');
      return false;
    }
    if (!timeSlot) {
      showToast('Vui lòng chọn khung giờ hẹn.', 'error');
      return false;
    }
    if ((slotAvailability[timeSlot] || 0) >= 3) {
      showToast('Khung giờ này đã đầy, vui lòng chọn giờ khác.', 'error');
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (!customerName.trim()) {
      showToast('Vui lòng nhập họ tên của bạn.', 'error');
      return false;
    }
    if (!customerPhone.trim() || customerPhone.trim().length < 9) {
      showToast('Vui lòng nhập số điện thoại hợp lệ.', 'error');
      return false;
    }
    return true;
  };

  // Payment simulations
  const handleSimulatePaymentSuccess = () => {
    setIsProcessing(true);
    setPaymentError(null);

    setTimeout(async () => {
      try {
        const res = await createBooking({
          serviceId: selectedService.id,
          serviceName: selectedService.name,
          servicePrice: selectedService.price,
          date: bookingDate,
          timeSlot,
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          customerEmail: customerEmail.trim() || 'khach@annhienspa.vn',
          notes: notes.trim()
        });

        if (res.success && res.bookingId) {
          setConfirmedBookingId(res.bookingId);
          setCurrentStep(6); // Success view
        } else {
          setPaymentError(res.message || 'Lỗi khi ghi nhận lịch hẹn.');
        }
      } catch (err: any) {
        setPaymentError(err?.message || 'Lỗi khi ghi nhận lịch hẹn.');
      } finally {
        setIsProcessing(false);
      }
    }, 700);
  };

  const handleSimulatePaymentFailure = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentError(
        'Mô phỏng giao dịch thất bại (thẻ bị từ chối hoặc số dư không đủ). Khoản cọc chưa được ghi nhận. Bạn có thể thử lại.'
      );
    }, 600);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title */}
      <div className="text-center space-y-2">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#233527]">
          Đặt Lịch Hẹn Trực Tuyến
        </h1>
        <p className="text-xs sm:text-sm text-[#5C7060]">
          Hệ thống đặt lịch thông minh An Nhiên Spa — Giữ chỗ tức thì & Chính sách cọc minh bạch
        </p>
      </div>

      {/* Step Indicator */}
      {currentStep < 6 && (
        <div className="flex items-center justify-between border-b border-[#E0DBCB] pb-4 overflow-x-auto gap-2">
          {[
            { num: 1, title: 'Chọn dịch vụ' },
            { num: 2, title: 'Ngày & Giờ' },
            { num: 3, title: 'Thông tin' },
            { num: 4, title: 'Xác nhận' },
            { num: 5, title: 'Thanh toán cọc' }
          ].map((s) => (
            <div
              key={s.num}
              className={`flex items-center gap-2 shrink-0 ${
                currentStep === s.num
                  ? 'text-[#293E2E] font-bold'
                  : currentStep > s.num
                  ? 'text-[#4A6F51]'
                  : 'text-[#8EA393]'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                  currentStep === s.num
                    ? 'bg-[#3E5C44] text-white'
                    : currentStep > s.num
                    ? 'bg-[#E1EBE2] text-[#345139]'
                    : 'bg-[#EDE9DC] text-[#7B8F80]'
                }`}
              >
                {currentStep > s.num ? '✓' : s.num}
              </span>
              <span className="text-xs whitespace-nowrap hidden sm:inline">{s.title}</span>
            </div>
          ))}
        </div>
      )}

      {/* STEP 1: CHỌN DỊCH VỤ */}
      {currentStep === 1 && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#DFDAC8] shadow-xs space-y-6">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#233527]">Bước 1: Lựa chọn liệu trình</h2>
            <p className="text-xs text-[#5E7262] mt-0.5">Vui lòng chọn dịch vụ bạn muốn trải nghiệm hôm nay</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeServices.map((service) => {
              const isSelected = selectedServiceId === service.id;
              return (
                <div
                  key={service.id}
                  onClick={() => setSelectedServiceId(service.id)}
                  className={`cursor-pointer p-4 rounded-xl border transition-all flex gap-3.5 items-start ${
                    isSelected
                      ? 'border-[#46694C] bg-[#F3F7F4] ring-2 ring-[#46694C]/20 shadow-xs'
                      : 'border-[#DFDAC8] bg-[#FAF9F5] hover:bg-white'
                  }`}
                >
                  <img
                    src={service.imageUrl}
                    alt={service.name}
                    className="w-16 h-16 rounded-lg object-cover shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h3 className="font-serif text-sm font-bold text-[#243628] truncate">{service.name}</h3>
                      <span className="text-xs font-bold text-[#25392A] shrink-0 tabular-nums">
                        {formatVND(service.price)}
                      </span>
                    </div>
                    <p className="text-xs text-[#5D7060] line-clamp-2 mt-1 leading-relaxed">
                      {service.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-[11px] text-[#738C77]">
                      <Clock className="w-3 h-3" />
                      <span>{service.durationMinutes} phút</span>
                      <span>·</span>
                      <span>{service.categoryName}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#EAE5D7]">
            <div className="text-xs text-[#5D7060]">
              Đã chọn: <strong className="text-[#25392A]">{selectedService?.name}</strong> (
              <span className="tabular-nums font-semibold">{formatVND(selectedService?.price || 0)}</span>)
            </div>
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="inline-flex items-center gap-1.5 py-2.5 px-6 bg-[#425E47] hover:bg-[#344D39] text-white rounded-xl text-sm font-medium transition-colors shadow-xs"
            >
              <span>Tiếp tục</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: CHỌN NGÀY VÀ GIỜ */}
      {currentStep === 2 && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#DFDAC8] shadow-xs space-y-6">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#233527]">Bước 2: Chọn ngày và giờ hẹn</h2>
            <p className="text-xs text-[#5E7262] mt-0.5">Khung giờ hoạt động từ 09:00 đến 20:30 mỗi ngày</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Date picker */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-[#273B2C] uppercase tracking-wider">
                Chọn ngày hẹn (từ hôm nay trở đi)
              </label>
              <input
                type="date"
                min={minDate}
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="w-full px-4 py-3 bg-[#FAF9F5] border border-[#D5D0BF] rounded-xl text-sm text-[#273B2C] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden"
              />
              <div className="text-[11px] text-[#697D6E]">
                * Ngày đã chọn: <strong>{formatDateVN(bookingDate)}</strong>
              </div>
            </div>

            {/* Time Slot Picker */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-[#273B2C] uppercase tracking-wider">
                Chọn khung giờ trống
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {TIME_SLOTS.map((slot) => {
                  const booked = slotAvailability[slot] || 0;
                  const isFull = booked >= 3;
                  const isSelected = timeSlot === slot;

                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={isFull}
                      onClick={() => setTimeSlot(slot)}
                      className={`py-2.5 px-2 rounded-xl text-xs font-medium border text-center transition-all ${
                        isFull
                          ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                          : isSelected
                          ? 'bg-[#3E5C44] text-white border-[#3E5C44] shadow-xs'
                          : 'bg-[#FAF9F5] border-[#D5D0BF] text-[#283C2D] hover:bg-[#EFF3EF]'
                      }`}
                    >
                      <div className="font-semibold">{slot}</div>
                      <div className="text-[10px] opacity-80">
                        {isFull ? 'Hết chỗ' : `Còn ${3 - booked} chỗ`}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#EAE5D7]">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="py-2.5 px-4 text-xs font-medium text-[#465E4B] hover:bg-[#F2EFE6] rounded-xl transition-colors"
            >
              Quay lại
            </button>
            <button
              type="button"
              onClick={() => {
                if (validateStep2()) setCurrentStep(3);
              }}
              className="inline-flex items-center gap-1.5 py-2.5 px-6 bg-[#425E47] hover:bg-[#344D39] text-white rounded-xl text-sm font-medium transition-colors shadow-xs"
            >
              <span>Tiếp tục</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: NHẬP THÔNG TIN */}
      {currentStep === 3 && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#DFDAC8] shadow-xs space-y-6">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#233527]">Bước 3: Thông tin liên hệ của khách hàng</h2>
            <p className="text-xs text-[#5E7262] mt-0.5">Thông tin này được dùng để gửi mã lịch hẹn và xác nhận chỗ</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#293B2D]">Họ và tên khách hàng *</label>
              <div className="relative">
                <User className="w-4 h-4 text-[#7A907E] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Thu Trang"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#FAF9F5] border border-[#D5D0BF] rounded-xl text-sm text-[#273B2C] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-[#293B2D]">Số điện thoại liên hệ *</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#7A907E] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Ví dụ: 0912345678"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#FAF9F5] border border-[#D5D0BF] rounded-xl text-sm text-[#273B2C] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden"
                />
              </div>
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-medium text-[#293B2D]">Địa chỉ Email (Nhận mã xác nhận)</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#7A907E] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="Ví dụ: thutrang@gmail.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#FAF9F5] border border-[#D5D0BF] rounded-xl text-sm text-[#273B2C] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden"
                />
              </div>
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-medium text-[#293B2D]">Ghi chú hoặc yêu cầu đặc biệt</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ví dụ: Tôi có tiền sử đau cổ vai gáy, vui lòng tập trung xoa bóp vùng lưng trên..."
                className="w-full p-3 bg-[#FAF9F5] border border-[#D5D0BF] rounded-xl text-sm text-[#273B2C] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#EAE5D7]">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="py-2.5 px-4 text-xs font-medium text-[#465E4B] hover:bg-[#F2EFE6] rounded-xl transition-colors"
            >
              Quay lại
            </button>
            <button
              type="button"
              onClick={() => {
                if (validateStep3()) setCurrentStep(4);
              }}
              className="inline-flex items-center gap-1.5 py-2.5 px-6 bg-[#425E47] hover:bg-[#344D39] text-white rounded-xl text-sm font-medium transition-colors shadow-xs"
            >
              <span>Tiếp tục</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: XÁC NHẬN THÔNG TIN & ĐIỀU KHOẢN HỦY CỌC */}
      {currentStep === 4 && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#DFDAC8] shadow-xs space-y-6">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#233527]">Bước 4: Kiểm tra thông tin & Chính sách đặt cọc</h2>
            <p className="text-xs text-[#5E7262] mt-0.5">Vui lòng rà soát chi tiết buổi hẹn trước khi tiến hành thanh toán cọc</p>
          </div>

          {/* Details summary card */}
          <div className="bg-[#FAF9F5] p-5 rounded-2xl border border-[#E0DBCB] space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-[#728575] block">Dịch vụ trị liệu:</span>
                <span className="font-semibold text-sm text-[#273B2C]">{selectedService.name}</span>
                <div className="text-[11px] text-[#556F5A] mt-0.5">{selectedService.durationMinutes} phút · {selectedService.categoryName}</div>
              </div>
              <div>
                <span className="text-[#728575] block">Thời gian hẹn:</span>
                <span className="font-semibold text-sm text-[#273B2C]">{timeSlot} — Ngày {formatDateVN(bookingDate)}</span>
              </div>
              <div>
                <span className="text-[#728575] block">Khách hàng:</span>
                <span className="font-semibold text-[#273B2C]">{customerName} ({customerPhone})</span>
              </div>
              <div>
                <span className="text-[#728575] block">Email:</span>
                <span className="text-[#273B2C]">{customerEmail || 'Không có'}</span>
              </div>
            </div>

            {notes && (
              <div className="pt-2 border-t border-[#EAE5D7] text-xs">
                <span className="text-[#728575] block">Ghi chú:</span>
                <span className="text-[#3A4E3E] italic">"{notes}"</span>
              </div>
            )}
          </div>

          {/* Deposit breakdown */}
          <div className="p-4 bg-[#F2EFE4] rounded-xl border border-[#DFDAC8] space-y-2 text-xs">
            <div className="flex justify-between text-[#4F6452]">
              <span>Tổng giá trị dịch vụ:</span>
              <span className="tabular-nums font-semibold text-[#273B2C]">{formatVND(totalPrice)}</span>
            </div>
            <div className="flex justify-between text-[#243B2A] font-bold text-sm">
              <span>Số tiền đặt cọc cần thanh toán (30%):</span>
              <span className="tabular-nums text-[#3E5E44]">{formatVND(depositPrice)}</span>
            </div>
            <div className="flex justify-between text-[#677A6A] pt-1 border-t border-[#DFDAC8]">
              <span>Số tiền còn lại thanh toán tại spa:</span>
              <span className="tabular-nums">{formatVND(remainingPrice)}</span>
            </div>
          </div>

          {/* Cancellation policy banner */}
          <div className="p-4 bg-[#F5F8F5] rounded-xl border border-[#B8D5BC] space-y-1.5 text-xs text-[#28442E]">
            <div className="font-semibold flex items-center gap-1.5 text-[#24422B]">
              <Info className="w-4 h-4 text-[#46734E]" />
              <span>Chính sách đổi lịch & hoàn tiền cọc rõ ràng:</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-[#3F5E46] leading-relaxed pl-1 text-[11px]">
              <li><strong>Hủy trước ít nhất 24 giờ:</strong> Quý khách được hoàn 100% tiền cọc ({formatVND(depositPrice)}) trong phạm vi mô phỏng.</li>
              <li><strong>Hủy khi còn dưới 24 giờ:</strong> Giữ lại 50% tiền cọc ({formatVND(Math.round(depositPrice / 2))}) làm phí chuẩn bị phòng, hoàn lại 50%.</li>
              <li><strong>Đổi lịch hẹn:</strong> Chỉ hỗ trợ khi thời điểm yêu cầu đổi còn trước giờ hẹn ít nhất 24 giờ.</li>
            </ul>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#EAE5D7]">
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="py-2.5 px-4 text-xs font-medium text-[#465E4B] hover:bg-[#F2EFE6] rounded-xl transition-colors"
            >
              Quay lại
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(5)}
              className="inline-flex items-center gap-1.5 py-2.5 px-6 bg-[#425E47] hover:bg-[#344D39] text-white rounded-xl text-sm font-medium transition-colors shadow-xs"
            >
              <span>Xác nhận & Chuyển sang thanh toán cọc</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: THANH TOÁN CỌC MÔ PHỎNG */}
      {currentStep === 5 && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#DFDAC8] shadow-xs space-y-6">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#233527]">Bước 5: Thanh toán tiền cọc mô phỏng</h2>
            <p className="text-xs text-[#5E7262] mt-0.5">Số tiền cọc cần thanh toán: <strong className="text-[#263D2B]">{formatVND(depositPrice)}</strong></p>
          </div>

          {/* Test disclaimer alert */}
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
            <div className="font-semibold flex items-center gap-1.5 text-amber-800">
              <ShieldCheck className="w-4 h-4 text-amber-700" />
              <span>MÔ HÌNH THỬ NGHIỆM ĐỒ ÁN — KHÔNG THỰC HIỆN GIAO DỊCH THẬT</span>
            </div>
            <p className="leading-relaxed text-[11px] text-amber-800">
              Đây là hệ thống mô phỏng phục vụ đánh giá đồ án học tập. Hệ thống không kết nối cổng thanh toán ngân hàng thật và không yêu cầu thẻ tín dụng thật. Quý thầy cô và người dùng vui lòng chọn một trong hai hành vi bên dưới để kiểm tra luồng nghiệp vụ.
            </p>
          </div>

          {/* Error display if failed */}
          {paymentError && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-semibold">Giao dịch thanh toán cọc không thành công:</strong>
                <p className="text-[11px] mt-0.5">{paymentError}</p>
              </div>
            </div>
          )}

          {/* Simulation action buttons */}
          <div className="space-y-4 pt-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-[#687C6B]">
              Lựa chọn hành vi mô phỏng:
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleSimulatePaymentSuccess}
                className="p-5 rounded-2xl bg-[#3E5F44] hover:bg-[#314B36] text-white text-left transition-all shadow-sm hover:shadow-md disabled:opacity-50 space-y-2 group"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">Mô phỏng thanh toán THÀNH CÔNG</span>
                  <CheckCircle2 className="w-5 h-5 text-[#B6DCB9] group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-[11px] text-[#C4DDC7] leading-relaxed">
                  Ghi nhận cọc {formatVND(depositPrice)}, tạo mã đặt lịch duy nhất và lưu vào hệ thống chung cho Quản trị viên.
                </p>
              </button>

              <button
                type="button"
                disabled={isProcessing}
                onClick={handleSimulatePaymentFailure}
                className="p-5 rounded-2xl bg-[#FAF9F5] hover:bg-rose-50 text-[#4D2423] border border-[#DFDAC8] hover:border-rose-300 text-left transition-all disabled:opacity-50 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-rose-800">Mô phỏng thanh toán THẤT BẠI</span>
                  <AlertCircle className="w-5 h-5 text-rose-600" />
                </div>
                <p className="text-[11px] text-[#735A59] leading-relaxed">
                  Mô phỏng trường hợp thẻ bị từ chối hoặc lỗi mạng. Lịch hẹn không được xác nhận và cho phép thử lại.
                </p>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#EAE5D7]">
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => setCurrentStep(4)}
              className="py-2.5 px-4 text-xs font-medium text-[#465E4B] hover:bg-[#F2EFE6] rounded-xl transition-colors"
            >
              Quay lại bước trước
            </button>
            {isProcessing && (
              <span className="text-xs text-[#4A6E50] animate-pulse">
                Đang xử lý mô phỏng giao dịch...
              </span>
            )}
          </div>
        </div>
      )}

      {/* STEP 6: MÀN HÌNH XÁC NHẬN ĐẶT LỊCH THÀNH CÔNG */}
      {currentStep === 6 && confirmedBookingId && (
        <div className="bg-white p-8 rounded-3xl border border-[#C6DCB8] shadow-md text-center space-y-6 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 bg-[#E8F3EA] text-[#3E6746] rounded-full flex items-center justify-center mx-auto border border-[#BBD7BF]">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2 max-w-md mx-auto">
            <h2 className="font-serif text-3xl font-bold text-[#233527]">
              Đặt Lịch Hẹn Thành Công!
            </h2>
            <p className="text-xs sm:text-sm text-[#526655] leading-relaxed">
              Cảm ơn quý khách đã tin tưởng lựa chọn An Nhiên Spa. Khoản cọc thử nghiệm đã được ghi nhận trên hệ thống.
            </p>
          </div>

          {/* Confirmation ticket */}
          <div className="max-w-md mx-auto bg-[#FAF9F5] p-5 rounded-2xl border border-[#DFDAC8] text-left text-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#EAE5D7]">
              <span className="text-[#6D8070]">Mã đặt lịch:</span>
              <span className="font-mono text-sm font-bold text-[#273B2C]">{confirmedBookingId}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#6D8070]">Dịch vụ:</span>
              <span className="font-semibold text-[#273B2C] text-right">{selectedService.name}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#6D8070]">Thời gian hẹn:</span>
              <span className="font-semibold text-[#273B2C]">{timeSlot} · {formatDateVN(bookingDate)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#6D8070]">Đã thanh toán cọc:</span>
              <span className="font-bold text-[#3B6144] tabular-nums">{formatVND(depositPrice)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#6D8070]">Còn lại tại spa:</span>
              <span className="tabular-nums font-medium text-[#273B2C]">{formatVND(remainingPrice)}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-[#EAE5D7]">
              <span className="text-[#6D8070]">Trạng thái:</span>
              <span className="bg-[#E2EDE3] text-[#2F5236] text-[10px] font-bold px-2 py-0.5 rounded">
                Chờ xác nhận (Đã cọc)
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              to="/my-bookings"
              className="w-full sm:w-auto px-6 py-3 bg-[#425E47] hover:bg-[#344D39] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              Xem lịch hẹn của tôi
            </Link>
            <Link
              to="/"
              className="w-full sm:w-auto px-6 py-3 border border-[#D5D0BF] text-[#3D5243] hover:bg-[#F5F2E8] rounded-xl text-xs font-semibold transition-colors"
            >
              Về trang chủ
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
