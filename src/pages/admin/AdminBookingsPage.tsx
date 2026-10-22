import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  formatVND,
  formatDateVN,
  formatDateTimeVN,
  calculateCancellationRefund,
  getHoursUntilBooking
} from '../../utils/formatters';
import { Booking } from '../../types';
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Calendar,
  Phone,
  User,
  AlertCircle,
  History
} from 'lucide-react';

export const AdminBookingsPage: React.FC = () => {
  const { bookings, services, updateBookingStatus, cancelBookingAction, showToast } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterService, setFilterService] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('');

  // Selected Booking for Modal details
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      // Search
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const match =
          b.id.toLowerCase().includes(q) ||
          b.customerName.toLowerCase().includes(q) ||
          b.customerPhone.includes(q) ||
          b.serviceName.toLowerCase().includes(q);
        if (!match) return false;
      }

      // Status
      if (filterStatus !== 'all' && b.status !== filterStatus) return false;

      // Service
      if (filterService !== 'all' && b.serviceId !== filterService) return false;

      // Date
      if (filterDate && b.date !== filterDate) return false;

      return true;
    });
  }, [bookings, searchTerm, filterStatus, filterService, filterDate]);

  const handleConfirmBooking = (bookingId: string) => {
    updateBookingStatus(bookingId, 'confirmed');
  };

  const handleCompleteBooking = (bookingId: string) => {
    updateBookingStatus(bookingId, 'completed');
  };

  const handleCancelBooking = (booking: Booking) => {
    const res = cancelBookingAction(booking.id);
    if (selectedBooking && selectedBooking.id === booking.id) {
      setSelectedBooking(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E0DBCB]">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#1F2F23]">
            Quản Lý Lịch Hẹn Spa
          </h2>
          <p className="text-xs text-[#5F7463] mt-0.5">
            Tổng cộng: <strong>{filteredBookings.length}</strong> / {bookings.length} lịch hẹn
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#DFDAC8] shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#7A907E] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm mã lịch, tên khách, SĐT..."
              className="w-full pl-9 pr-3 py-2 bg-[#FAF9F5] border border-[#D5D0BF] rounded-xl text-xs text-[#273B2C] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden"
            />
          </div>

          {/* Status Dropdown */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full py-2 px-3 bg-[#FAF9F5] border border-[#D5D0BF] rounded-xl text-xs text-[#273B2C] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ xác nhận</option>
              <option value="confirmed">Đã xác nhận</option>
              <option value="completed">Đã hoàn thành</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>

          {/* Service Dropdown */}
          <div>
            <select
              value={filterService}
              onChange={(e) => setFilterService(e.target.value)}
              className="w-full py-2 px-3 bg-[#FAF9F5] border border-[#D5D0BF] rounded-xl text-xs text-[#273B2C] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden"
            >
              <option value="all">Tất cả dịch vụ</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Picker */}
          <div>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="w-full py-2 px-3 bg-[#FAF9F5] border border-[#D5D0BF] rounded-xl text-xs text-[#273B2C] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden"
            />
          </div>
        </div>

        {(searchTerm || filterStatus !== 'all' || filterService !== 'all' || filterDate) && (
          <div className="flex justify-end pt-1">
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterStatus('all');
                setFilterService('all');
                setFilterDate('');
              }}
              className="text-[11px] text-[#425E47] font-semibold hover:underline"
            >
              Đặt lại tất cả bộ lọc
            </button>
          </div>
        )}
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-2xl border border-[#DFDAC8] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9F5] border-b border-[#E0DBCB] text-[#556D5B] font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Mã lịch</th>
                <th className="py-3.5 px-4">Khách hàng</th>
                <th className="py-3.5 px-4">Dịch vụ</th>
                <th className="py-3.5 px-4">Ngày & Giờ hẹn</th>
                <th className="py-3.5 px-4">Tiền cọc (30%)</th>
                <th className="py-3.5 px-4">Thanh toán</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2EFE6]">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Không tìm thấy lịch hẹn nào theo tiêu chí lọc.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-[#FAF9F5]/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#203124]">
                      {booking.id}
                    </td>

                    <td className="py-3.5 px-4 font-medium text-[#25392A]">
                      {booking.customerName}
                      <div className="text-[11px] text-[#718575] font-normal">{booking.customerPhone}</div>
                    </td>

                    <td className="py-3.5 px-4 text-[#354839] max-w-[180px] truncate">
                      {booking.serviceName}
                      <div className="text-[10px] text-[#788E7D]">{formatVND(booking.totalAmount)}</div>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-[#25392A]">
                      {booking.timeSlot}
                      <div className="text-[10px] text-[#718575] font-normal">{formatDateVN(booking.date)}</div>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-[#34593C] tabular-nums">
                      {formatVND(booking.depositAmount)}
                    </td>

                    <td className="py-3.5 px-4 text-[11px]">
                      {booking.paymentStatus === 'deposit_paid' && (
                        <span className="text-[#36593B] font-semibold">Đã nộp cọc</span>
                      )}
                      {booking.paymentStatus === 'refunded_full' && (
                        <span className="text-emerald-700 font-semibold">Hoàn 100% cọc</span>
                      )}
                      {booking.paymentStatus === 'refunded_partial' && (
                        <span className="text-amber-800 font-semibold">Hoàn 50% cọc</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          booking.status === 'confirmed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : booking.status === 'completed'
                            ? 'bg-blue-100 text-blue-800'
                            : booking.status === 'cancelled'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {booking.status === 'confirmed'
                          ? 'Đã duyệt'
                          : booking.status === 'completed'
                          ? 'Hoàn thành'
                          : booking.status === 'cancelled'
                          ? 'Đã hủy'
                          : 'Chờ duyệt'}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedBooking(booking)}
                          className="p-1.5 text-[#4A6451] hover:bg-[#F2EFE6] rounded-lg transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {booking.status === 'pending' && (
                          <button
                            type="button"
                            onClick={() => handleConfirmBooking(booking.id)}
                            className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Xác nhận duyệt lịch"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}

                        {booking.status === 'confirmed' && (
                          <button
                            type="button"
                            onClick={() => handleCompleteBooking(booking.id)}
                            className="p-1.5 text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Đánh dấu hoàn thành phục vụ"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}

                        {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                          <button
                            type="button"
                            onClick={() => handleCancelBooking(booking)}
                            className="p-1.5 text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Hủy lịch theo quy tắc"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-[#DFDAC8] space-y-5 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE5D7]">
              <div>
                <span className="text-[10px] uppercase font-semibold text-[#667A6B]">Chi tiết lịch hẹn</span>
                <h3 className="font-mono text-lg font-bold text-[#203124]">{selectedBooking.id}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-[#FAF9F5] p-3.5 rounded-xl border border-[#DFDAC8]">
                <div>
                  <span className="text-[#6D8070] block">Khách hàng:</span>
                  <strong className="text-sm text-[#273B2C]">{selectedBooking.customerName}</strong>
                </div>
                <div>
                  <span className="text-[#6D8070] block">Số điện thoại:</span>
                  <strong className="text-sm text-[#273B2C]">{selectedBooking.customerPhone}</strong>
                </div>
                <div className="col-span-2">
                  <span className="text-[#6D8070] block">Email:</span>
                  <span>{selectedBooking.customerEmail}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[#6D8070] block">Dịch vụ:</span>
                <div className="font-serif text-sm font-bold text-[#243628]">{selectedBooking.serviceName}</div>
                <div className="text-[#566D5B]">
                  Tổng giá trị: <strong>{formatVND(selectedBooking.totalAmount)}</strong> · Tiền cọc đã đóng: <strong>{formatVND(selectedBooking.depositAmount)}</strong>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[#6D8070] block">Thời gian hẹn:</span>
                <div className="font-semibold text-[#273B2C]">
                  {selectedBooking.timeSlot} — Ngày {formatDateVN(selectedBooking.date)}
                </div>
              </div>

              {selectedBooking.notes && (
                <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200">
                  <strong className="block text-amber-900 font-semibold mb-0.5">Ghi chú của khách:</strong>
                  <p className="text-amber-800">{selectedBooking.notes}</p>
                </div>
              )}

              {selectedBooking.rescheduleHistory && selectedBooking.rescheduleHistory.length > 0 && (
                <div className="p-3 bg-[#F2F7F3] rounded-xl border border-[#BCD4BF] space-y-1">
                  <div className="font-semibold text-[#2B4B30] flex items-center gap-1">
                    <History className="w-3.5 h-3.5" />
                    <span>Lịch sử thay đổi ngày hẹn:</span>
                  </div>
                  {selectedBooking.rescheduleHistory.map((h, i) => (
                    <div key={i} className="text-[11px] text-[#416248]">
                      • {h.oldTime} ngày {formatDateVN(h.oldDate)} ➔ {h.newTime} ngày {formatDateVN(h.newDate)} ({formatDateTimeVN(h.changedAt)})
                    </div>
                  ))}
                </div>
              )}

              {selectedBooking.status === 'cancelled' && (
                <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-800 space-y-1">
                  <strong className="block font-semibold">Thông tin hoàn tiền mô phỏng:</strong>
                  <div>Đã hủy lúc: {formatDateTimeVN(selectedBooking.cancelledAt || '')}</div>
                  <div>Số tiền hoàn khách: <strong>{formatVND(selectedBooking.refundAmount || 0)}</strong></div>
                  <div>Phí bồi hoàn giữ lại: <strong>{formatVND(selectedBooking.retainedAmount || 0)}</strong></div>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2 border-t border-[#EAE5D7]">
              {selectedBooking.status === 'pending' && (
                <button
                  type="button"
                  onClick={() => {
                    handleConfirmBooking(selectedBooking.id);
                    setSelectedBooking(null);
                  }}
                  className="flex-1 py-2 px-3 bg-[#425E47] text-white rounded-xl text-xs font-semibold hover:bg-[#344D39]"
                >
                  Xác nhận duyệt lịch
                </button>
              )}
              {selectedBooking.status === 'confirmed' && (
                <button
                  type="button"
                  onClick={() => {
                    handleCompleteBooking(selectedBooking.id);
                    setSelectedBooking(null);
                  }}
                  className="flex-1 py-2 px-3 bg-blue-700 text-white rounded-xl text-xs font-semibold hover:bg-blue-800"
                >
                  Đánh dấu hoàn thành
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedBooking(null)}
                className="py-2 px-4 border border-[#D5D0BF] text-[#465E4B] rounded-xl text-xs font-semibold hover:bg-[#FAF9F5]"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
