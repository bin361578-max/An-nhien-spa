import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  formatVND,
  formatDateVN,
  formatDateTimeVN,
  getHoursUntilBooking,
  canRescheduleBooking,
  calculateCancellationRefund
} from '../../utils/formatters';
import { Booking } from '../../types';
import {
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  CalendarDays,
  History,
  Info,
  PhoneCall
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

export const MyBookingsPage: React.FC = () => {
  const { currentUser, bookings, cancelBookingAction, rescheduleBookingAction, showToast, settings } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('upcoming');

  // Cancel Modal state
  const [cancelModalBooking, setCancelModalBooking] = useState<Booking | null>(null);

  // Reschedule Modal state
  const [rescheduleModalBooking, setRescheduleModalBooking] = useState<Booking | null>(null);
  const [newDate, setNewDate] = useState<string>('');
  const [newTime, setNewTime] = useState<string>('14:00');

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-[#233527]">Vui lòng đăng nhập</h2>
        <p className="text-sm text-[#5C7060]">Bạn cần đăng nhập để xem danh sách lịch hẹn của chính mình.</p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#425E47] text-white rounded-xl text-xs font-semibold hover:bg-[#344D39]"
        >
          Đăng nhập ngay
        </Link>
      </div>
    );
  }

  // Filter bookings for this customer
  const userBookings = bookings.filter(
    (b) => b.userId === currentUser.id || b.customerEmail.toLowerCase() === currentUser.email.toLowerCase()
  );

  const filteredBookings = userBookings.filter((b) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'upcoming') return b.status === 'pending' || b.status === 'confirmed';
    if (activeTab === 'completed') return b.status === 'completed';
    if (activeTab === 'cancelled') return b.status === 'cancelled';
    return true;
  });

  const handleOpenCancelModal = (booking: Booking) => {
    setCancelModalBooking(booking);
  };

  const handleConfirmCancel = async () => {
    if (!cancelModalBooking) return;
    const res = await cancelBookingAction(cancelModalBooking.id);
    if (res.success) {
      setCancelModalBooking(null);
    }
  };

  const handleOpenRescheduleModal = (booking: Booking) => {
    const check = canRescheduleBooking(booking);
    if (!check.allowed) {
      showToast(check.reason || 'Lịch hẹn không đủ điều kiện đổi.', 'error');
      return;
    }
    // Default tomorrow
    const tmr = new Date();
    tmr.setDate(tmr.getDate() + 1);
    setNewDate(tmr.toISOString().split('T')[0]);
    setNewTime(booking.timeSlot || '14:00');
    setRescheduleModalBooking(booking);
  };

  const handleConfirmReschedule = async () => {
    if (!rescheduleModalBooking) return;
    if (!newDate || !newTime) {
      showToast('Vui lòng chọn ngày và giờ mới.', 'error');
      return;
    }
    const res = await rescheduleBookingAction(rescheduleModalBooking.id, newDate, newTime);
    if (res.success) {
      setRescheduleModalBooking(null);
    } else {
      showToast(res.message, 'error');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E0DBCB]">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#233527]">Lịch Hẹn Của Tôi</h1>
          <p className="text-xs text-[#5D7060] mt-1">
            Theo dõi trạng thái, yêu cầu đổi lịch hoặc hủy lịch hoàn cọc trực tuyến
          </p>
        </div>
        <Link
          to="/booking"
          className="self-start sm:self-auto px-5 py-2.5 bg-[#425E47] hover:bg-[#344D39] text-white rounded-xl text-xs font-semibold transition-colors shadow-xs"
        >
          + Đặt lịch hẹn mới
        </Link>
      </div>

      {/* Policy reminder banner */}
      <div className="p-4 bg-[#F2F7F3] rounded-2xl border border-[#BCD4BF] flex items-start gap-3 text-xs text-[#28482E]">
        <Info className="w-5 h-5 text-[#4E7955] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="font-semibold block text-[#213F27]">Chính sách hủy & đổi lịch hẹn An Nhiên Spa:</strong>
          <p className="text-[11px] leading-relaxed">
            • <strong>Hủy trước $\ge$ 24 giờ:</strong> Hoàn 100% tiền cọc mô phỏng.<br />
            • <strong>Hủy dưới 24 giờ:</strong> Giữ lại 50% tiền cọc, hoàn lại 50% mô phỏng.<br />
            • <strong>Đổi lịch hẹn:</strong> Chỉ áp dụng khi còn ít nhất 24 giờ trước giờ hẹn.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-[#E0DBCB] pb-1 overflow-x-auto">
        {[
          { key: 'upcoming', label: 'Sắp tới & Chờ duyệt' },
          { key: 'completed', label: 'Đã hoàn thành' },
          { key: 'cancelled', label: 'Đã hủy' },
          { key: 'all', label: 'Tất cả lịch hẹn' }
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-[#3E5C44] text-white'
                : 'text-[#5A6F5F] hover:bg-[#F2EFE5] hover:text-[#243729]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-[#DFDAC8] space-y-3">
          <Calendar className="w-10 h-10 text-[#8DA693] mx-auto" />
          <h3 className="font-serif text-lg font-bold text-[#233527]">Không có lịch hẹn nào trong mục này</h3>
          <p className="text-xs text-[#687C6B]">Quý khách có thể chọn đặt một buổi chăm sóc thư giãn mới ngay bây giờ.</p>
          <div className="pt-2">
            <Link
              to="/booking"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#425E47] text-white rounded-xl text-xs font-semibold hover:bg-[#344D39]"
            >
              Đặt lịch ngay
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking) => {
            const hoursLeft = getHoursUntilBooking(booking.date, booking.timeSlot);
            const canReschedule = canRescheduleBooking(booking).allowed;
            const isCancelled = booking.status === 'cancelled';
            const isCompleted = booking.status === 'completed';

            return (
              <div
                key={booking.id}
                className="bg-white p-5 sm:p-6 rounded-2xl border border-[#DFDAC8] shadow-xs space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F0ECE0]">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#233527] bg-[#F2EFE6] px-2.5 py-1 rounded-md border border-[#DFD9C7]">
                      {booking.id}
                    </span>
                    <span className="text-[11px] text-[#718575]">
                      Đặt lúc: {formatDateTimeVN(booking.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Status Badge */}
                    {booking.status === 'pending' && (
                      <span className="text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full">
                        Chờ xác nhận
                      </span>
                    )}
                    {booking.status === 'confirmed' && (
                      <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                        Đã xác nhận chỗ
                      </span>
                    )}
                    {booking.status === 'completed' && (
                      <span className="text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-0.5 rounded-full">
                        Đã hoàn thành
                      </span>
                    )}
                    {booking.status === 'cancelled' && (
                      <span className="text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200 px-2.5 py-0.5 rounded-full">
                        Đã hủy
                      </span>
                    )}
                  </div>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-[#6E8272] block">Liệu trình đăng ký:</span>
                    <span className="font-serif text-sm font-bold text-[#273B2C] block mt-0.5">
                      {booking.serviceName}
                    </span>
                    <span className="text-[11px] text-[#556F5A] mt-0.5 block">
                      Tổng giá: {formatVND(booking.totalAmount)}
                    </span>
                  </div>

                  <div>
                    <span className="text-[#6E8272] block">Thời gian hẹn:</span>
                    <div className="font-semibold text-sm text-[#273B2C] flex items-center gap-1.5 mt-0.5">
                      <Clock className="w-4 h-4 text-[#5C7F62]" />
                      <span>{booking.timeSlot} — {formatDateVN(booking.date)}</span>
                    </div>
                    {!isCancelled && !isCompleted && (
                      <span className="text-[11px] text-[#788E7C] mt-0.5 block">
                        {hoursLeft >= 0 ? `(Còn ${hoursLeft.toFixed(1)} giờ)` : '(Đã qua thời gian hẹn)'}
                      </span>
                    )}
                  </div>

                  <div>
                    <span className="text-[#6E8272] block">Tình trạng thanh toán cọc:</span>
                    <div className="mt-0.5">
                      {booking.paymentStatus === 'deposit_paid' && (
                        <span className="font-semibold text-[#2D5836]">
                          Đã cọc 30%: {formatVND(booking.depositAmount)} (Còn lại: {formatVND(booking.remainingAmount)})
                        </span>
                      )}
                      {booking.paymentStatus === 'refunded_full' && (
                        <span className="font-semibold text-emerald-700">
                          Đã hoàn 100% cọc: {formatVND(booking.refundAmount || 0)}
                        </span>
                      )}
                      {booking.paymentStatus === 'refunded_partial' && (
                        <span className="font-semibold text-amber-700">
                          Hoàn 50% cọc: {formatVND(booking.refundAmount || 0)} (Phí giữ chỗ: {formatVND(booking.retainedAmount || 0)})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Reschedule history if any */}
                {booking.rescheduleHistory && booking.rescheduleHistory.length > 0 && (
                  <div className="p-3 bg-[#FAF8F2] rounded-xl border border-[#E5DFCE] text-[11px] text-[#5B6E5F] space-y-1">
                    <div className="font-semibold text-[#293E2D] flex items-center gap-1">
                      <History className="w-3.5 h-3.5 text-[#5A7B60]" />
                      <span>Lịch sử đổi lịch hẹn:</span>
                    </div>
                    {booking.rescheduleHistory.map((h, i) => (
                      <div key={i}>
                        • Đã đổi từ <strong>{h.oldTime} ngày {formatDateVN(h.oldDate)}</strong> sang{' '}
                        <strong>{h.newTime} ngày {formatDateVN(h.newDate)}</strong> (vào {formatDateTimeVN(h.changedAt)})
                      </div>
                    ))}
                  </div>
                )}

                {/* Actions */}
                {!isCancelled && !isCompleted && (
                  <div className="pt-3 border-t border-[#F0ECE0] flex flex-wrap items-center justify-between gap-3">
                    <div className="text-[11px] text-[#697D6E]">
                      {canReschedule ? (
                        <span className="text-[#365C3D]">✓ Đủ điều kiện đổi lịch trực tuyến (trước &gt; 24h)</span>
                      ) : (
                        <span className="text-amber-700">
                          * Thời gian còn dưới 24h: vui lòng liên hệ hotline để đổi lịch
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenRescheduleModal(booking)}
                        disabled={!canReschedule}
                        className="py-1.5 px-3.5 bg-[#FAF9F5] hover:bg-[#F0EEE2] disabled:opacity-40 disabled:cursor-not-allowed border border-[#D5D0BF] text-[#293D2D] rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                      >
                        <CalendarDays className="w-3.5 h-3.5 text-[#547359]" />
                        <span>Đổi lịch</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenCancelModal(booking)}
                        className="py-1.5 px-3.5 border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Hủy lịch</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* CANCEL MODAL WITH REFUND CALCULATION */}
      {cancelModalBooking && (() => {
        const refundCalc = calculateCancellationRefund(cancelModalBooking);
        return (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-[#DFDAC8] space-y-4 animate-in zoom-in-95 duration-150">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>

              <div className="text-center space-y-1">
                <h3 className="font-serif text-xl font-bold text-[#233527]">
                  Xác nhận hủy lịch hẹn {cancelModalBooking.id}?
                </h3>
                <p className="text-xs text-[#5D7060]">
                  {cancelModalBooking.serviceName} ({cancelModalBooking.timeSlot} ngày {formatDateVN(cancelModalBooking.date)})
                </p>
              </div>

              {/* Refund breakdown calculation */}
              <div className="p-4 bg-[#FAF9F5] rounded-xl border border-[#DFDAC8] text-xs space-y-2">
                <div className="flex justify-between text-[#687C6B]">
                  <span>Thời gian còn đến giờ hẹn:</span>
                  <strong className="text-[#243628]">{refundCalc.hoursLeft.toFixed(1)} giờ</strong>
                </div>
                <div className="flex justify-between text-[#687C6B]">
                  <span>Tiền cọc đã đóng:</span>
                  <span className="font-semibold">{formatVND(cancelModalBooking.depositAmount)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-[#EAE5D7] text-emerald-800 font-bold">
                  <span>Tiền hoàn lại mô phỏng ({refundCalc.isFullRefund ? '100%' : '50%'}):</span>
                  <span>{formatVND(refundCalc.refundAmount)}</span>
                </div>
                {!refundCalc.isFullRefund && (
                  <div className="flex justify-between text-rose-800 text-[11px]">
                    <span>Phí giữ chỗ bị giữ lại (50% do &lt; 24h):</span>
                    <span>{formatVND(refundCalc.retainedAmount)}</span>
                  </div>
                )}
              </div>

              <p className="text-[11px] text-[#697D6E] leading-relaxed text-center">
                Sau khi xác nhận, tiền hoàn mô phỏng sẽ được ghi nhận và trạng thái lịch sẽ chuyển sang Đã hủy.
              </p>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCancelModalBooking(null)}
                  className="flex-1 py-2 px-3 border border-[#D5D0BF] text-[#425845] rounded-xl text-xs font-semibold hover:bg-[#F2EFE6]"
                >
                  Không hủy
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancel}
                  className="flex-1 py-2 px-3 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-semibold"
                >
                  Xác nhận hủy lịch
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* RESCHEDULE MODAL */}
      {rescheduleModalBooking && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-[#DFDAC8] space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-[#EDF3EE] text-[#406847] flex items-center justify-center mx-auto">
              <CalendarDays className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="font-serif text-xl font-bold text-[#233527]">
                Đổi ngày hẹn mới
              </h3>
              <p className="text-xs text-[#5D7060]">
                Mã lịch: <strong>{rescheduleModalBooking.id}</strong> · {rescheduleModalBooking.serviceName}
              </p>
              <p className="text-[11px] text-[#718575]">
                (Lịch hiện tại: {rescheduleModalBooking.timeSlot} ngày {formatDateVN(rescheduleModalBooking.date)})
              </p>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#273B2C]">Chọn ngày hẹn mới</label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF9F5] border border-[#D5D0BF] rounded-xl text-xs text-[#273B2C] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#273B2C]">Chọn khung giờ mới</label>
                <div className="grid grid-cols-3 gap-2">
                  {TIME_SLOTS.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setNewTime(slot)}
                      className={`py-2 px-1 text-xs font-semibold rounded-lg border text-center transition-colors ${
                        newTime === slot
                          ? 'bg-[#3E5C44] text-white border-[#3E5C44]'
                          : 'bg-[#FAF9F5] border-[#D5D0BF] text-[#293D2D] hover:bg-[#F2EFE6]'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRescheduleModalBooking(null)}
                className="flex-1 py-2 px-3 border border-[#D5D0BF] text-[#425845] rounded-xl text-xs font-semibold hover:bg-[#F2EFE6]"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmReschedule}
                className="flex-1 py-2 px-3 bg-[#425E47] hover:bg-[#344D39] text-white rounded-xl text-xs font-semibold"
              >
                Xác nhận đổi lịch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
