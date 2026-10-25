import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Booking, BookingStatus } from '../../types';
import { formatVND, formatDateVN } from '../../utils/formatters';
import {
  CalendarDays,
  Clock,
  User,
  Phone,
  CheckCircle2,
  AlertCircle,
  Search,
  Sparkles,
  ClipboardList,
  Save,
  Filter,
  Check,
  ChevronDown
} from 'lucide-react';

export const StaffDashboardPage: React.FC = () => {
  const { staffBookings, fetchStaffBookings, updateStaffBookingAction, showToast } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'completed' | 'all'>('today');
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [noteContent, setNoteContent] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchStaffBookings();
  }, [fetchStaffBookings]);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Filter Bookings
  const filteredBookings = useMemo(() => {
    return staffBookings.filter((b) => {
      // Tab filter
      if (activeTab === 'today') {
        if (b.date !== todayStr) return false;
      } else if (activeTab === 'upcoming') {
        if (b.date < todayStr || b.status === 'completed' || b.status === 'cancelled') return false;
      } else if (activeTab === 'completed') {
        if (b.status !== 'completed') return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchName = b.customerName?.toLowerCase().includes(query);
        const matchPhone = b.customerPhone?.includes(query);
        const matchId = b.id?.toLowerCase().includes(query);
        const matchService = b.serviceName?.toLowerCase().includes(query);
        if (!matchName && !matchPhone && !matchId && !matchService) return false;
      }

      return true;
    });
  }, [staffBookings, activeTab, todayStr, searchQuery]);

  // Statistics
  const todayCount = useMemo(() => staffBookings.filter((b) => b.date === todayStr && b.status !== 'cancelled').length, [staffBookings, todayStr]);
  const pendingCount = useMemo(() => staffBookings.filter((b) => b.status === 'pending').length, [staffBookings]);
  const completedTodayCount = useMemo(() => staffBookings.filter((b) => b.date === todayStr && b.status === 'completed').length, [staffBookings, todayStr]);

  const handleStatusChange = async (bookingId: string, newStatus: BookingStatus) => {
    setUpdatingId(bookingId);
    try {
      await updateStaffBookingAction(bookingId, newStatus);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleStartEditNote = (booking: Booking) => {
    setEditingNotesId(booking.id);
    setNoteContent(booking.staffNotes || '');
  };

  const handleSaveNote = async (bookingId: string, currentStatus: BookingStatus) => {
    await updateStaffBookingAction(bookingId, currentStatus, noteContent.trim());
    setEditingNotesId(null);
    showToast('Đã lưu ghi chú trị liệu của nhân viên.', 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header and Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#DFDAC8]">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#233527]">
            Lịch Hẹn Phục Vụ Khách Hàng
          </h1>
          <p className="text-xs text-[#5D7060] mt-1">
            Bàn làm việc của kỹ thuật viên: theo dõi tiếp đón khách, cập nhật tiến trình và ghi chú trị liệu
          </p>
        </div>

        {/* Quick metrics cards */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="bg-white px-3.5 py-2 rounded-2xl border border-[#DFDAC8] shadow-xs text-center min-w-[90px]">
            <div className="text-[10px] text-[#697D6E] font-medium uppercase tracking-wider">Hôm nay</div>
            <div className="text-lg font-bold text-[#233527] tabular-nums">{todayCount}</div>
          </div>
          <div className="bg-white px-3.5 py-2 rounded-2xl border border-amber-200 shadow-xs text-center min-w-[90px]">
            <div className="text-[10px] text-amber-700 font-medium uppercase tracking-wider">Chờ duyệt</div>
            <div className="text-lg font-bold text-amber-800 tabular-nums">{pendingCount}</div>
          </div>
          <div className="bg-white px-3.5 py-2 rounded-2xl border border-emerald-200 shadow-xs text-center min-w-[90px]">
            <div className="text-[10px] text-emerald-700 font-medium uppercase tracking-wider">Đã xong</div>
            <div className="text-lg font-bold text-emerald-800 tabular-nums">{completedTodayCount}</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#DFDAC8] shadow-xs">
        {/* Tab switcher */}
        <div className="flex items-center gap-1 bg-[#F5F2E9] p-1 rounded-xl text-xs font-semibold text-[#5B6F5F] overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('today')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'today' ? 'bg-white text-[#233527] shadow-xs font-bold' : 'hover:text-[#233527]'
            }`}
          >
            Hôm nay
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upcoming')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'upcoming' ? 'bg-white text-[#233527] shadow-xs font-bold' : 'hover:text-[#233527]'
            }`}
          >
            Sắp tới
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('completed')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'completed' ? 'bg-white text-[#233527] shadow-xs font-bold' : 'hover:text-[#233527]'
            }`}
          >
            Đã hoàn thành
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'all' ? 'bg-white text-[#233527] shadow-xs font-bold' : 'hover:text-[#233527]'
            }`}
          >
            Tất cả
          </button>
        </div>

        {/* Search input */}
        <div className="relative flex-1 max-w-xs">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên khách, SĐT, mã lịch..."
            className="w-full pl-8 pr-3 py-1.5 bg-[#FAF9F5] border border-[#D5D0BF] rounded-xl text-xs text-[#233527] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden"
          />
          <Search className="w-3.5 h-3.5 text-[#8A9C8D] absolute left-2.5 top-2.5 pointer-events-none" />
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#DFDAC8] space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#F0EDE1] text-[#697D6E] flex items-center justify-center mx-auto">
            <ClipboardList className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-lg font-bold text-[#233527]">Không có lịch hẹn nào</h3>
          <p className="text-xs text-[#697D6E] max-w-sm mx-auto">
            Hiện không có lịch hẹn nào phù hợp với bộ lọc đã chọn. Hãy thử chuyển sang tab khác hoặc xóa từ khóa tìm kiếm.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredBookings.map((b) => {
            const isEditingNote = editingNotesId === b.id;
            const isToday = b.date === todayStr;

            return (
              <div
                key={b.id}
                className={`bg-white rounded-2xl border p-5 space-y-4 shadow-xs transition-all ${
                  isToday
                    ? 'border-[#ADC4B2] ring-1 ring-[#ADC4B2]/40'
                    : 'border-[#DFDAC8]'
                }`}
              >
                {/* Top card bar: Time, ID, and Status Badge */}
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#F0ECE1]">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-[#EBE7D8] text-[#2C3F2F]">
                      {b.id}
                    </span>
                    {isToday && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Hôm nay
                      </span>
                    )}
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                      b.status === 'completed'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : b.status === 'confirmed'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : b.status === 'cancelled'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {b.status === 'completed'
                      ? '✓ Đã hoàn thành'
                      : b.status === 'confirmed'
                      ? '● Đã xác nhận'
                      : b.status === 'cancelled'
                      ? '✕ Đã hủy'
                      : '⏳ Chờ tiếp nhận'}
                  </span>
                </div>

                {/* Customer & Service Info */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <div className="text-[10px] text-[#718575] uppercase tracking-wider font-medium">Khách hàng</div>
                    <div className="font-bold text-[#233527] mt-0.5 text-sm">{b.customerName}</div>
                    <div className="text-[#5B6F5F] flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-[#7B9080]" />
                      <span>{b.customerPhone}</span>
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] text-[#718575] uppercase tracking-wider font-medium">Thời gian hẹn</div>
                    <div className="font-bold text-[#233527] mt-0.5 text-sm flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#425E47]" />
                      <span>{b.timeSlot}</span>
                    </div>
                    <div className="text-[#5B6F5F] mt-0.5">{formatDateVN(b.date)}</div>
                  </div>
                </div>

                {/* Service Details */}
                <div className="bg-[#FAF9F5] p-3 rounded-xl border border-[#EBE7D8] text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#233527]">{b.serviceName}</span>
                    <span className="font-bold text-[#35533B]">{formatVND(b.totalAmount)}</span>
                  </div>
                  <div className="text-[11px] text-[#697D6E] flex items-center justify-between">
                    <span>
                      Cọc: {b.depositPaid ? <strong className="text-emerald-700">Đã thanh toán ({formatVND(b.depositAmount)})</strong> : <span className="text-amber-700">Chưa cọc</span>}
                    </span>
                    <span>Còn lại tại quầy: <strong>{formatVND(b.remainingAmount)}</strong></span>
                  </div>
                  {b.notes && (
                    <div className="text-[11px] text-[#556959] italic pt-1 border-t border-[#ECE7D9]">
                      Yêu cầu của khách: "{b.notes}"
                    </div>
                  )}
                </div>

                {/* Staff Clinical/Service Notes Area */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#283C2D] flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-[#54795C]" />
                      <span>Ghi chú của Kỹ thuật viên / Trị liệu:</span>
                    </span>
                    {!isEditingNote && (
                      <button
                        type="button"
                        onClick={() => handleStartEditNote(b)}
                        className="text-[11px] text-[#425E47] hover:underline font-medium cursor-pointer"
                      >
                        {b.staffNotes ? 'Sửa ghi chú' : '+ Thêm ghi chú'}
                      </button>
                    )}
                  </div>

                  {isEditingNote ? (
                    <div className="space-y-2">
                      <textarea
                        rows={2}
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        placeholder="Nhập tình trạng da, sở thích lực massage, lưu ý dị ứng..."
                        className="w-full p-2.5 bg-[#FAF9F5] border border-[#CCD8CE] rounded-xl text-xs text-[#233527] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingNotesId(null)}
                          className="px-2.5 py-1 text-xs text-[#697D6E] hover:bg-gray-100 rounded-lg cursor-pointer"
                        >
                          Hủy
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveNote(b.id, b.status)}
                          className="px-3 py-1 text-xs font-semibold bg-[#425E47] text-white rounded-lg hover:bg-[#344D39] flex items-center gap-1 cursor-pointer"
                        >
                          <Save className="w-3 h-3" />
                          <span>Lưu ghi chú</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs p-2.5 rounded-xl bg-[#F4F1E6] text-[#344837] border border-[#E3DEC9] italic">
                      {b.staffNotes || 'Chưa có ghi chú lâm sàng cho lịch hẹn này.'}
                    </div>
                  )}
                </div>

                {/* Staff Quick Action Status Buttons */}
                <div className="pt-2 border-t border-[#F0ECE1] flex items-center justify-end gap-2">
                  {b.status === 'pending' && (
                    <button
                      type="button"
                      disabled={updatingId === b.id}
                      onClick={() => handleStatusChange(b.id, 'confirmed')}
                      className="px-3 py-1.5 bg-[#3B6244] hover:bg-[#2C4A33] text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Xác nhận lịch hẹn</span>
                    </button>
                  )}

                  {b.status === 'confirmed' && (
                    <button
                      type="button"
                      disabled={updatingId === b.id}
                      onClick={() => handleStatusChange(b.id, 'completed')}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Hoàn thành liệu trình</span>
                    </button>
                  )}

                  {b.status !== 'cancelled' && b.status !== 'completed' && (
                    <button
                      type="button"
                      disabled={updatingId === b.id}
                      onClick={() => handleStatusChange(b.id, 'cancelled')}
                      className="px-3 py-1.5 border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Báo hủy
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
