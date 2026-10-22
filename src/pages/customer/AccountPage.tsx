import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { formatDateVN } from '../../utils/formatters';
import { User, Calendar, Package, LogOut, CheckCircle, Edit3, ShieldAlert } from 'lucide-react';

export const AccountPage: React.FC = () => {
  const { currentUser, bookings, orders, updateProfile, logout } = useApp();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [email, setEmail] = useState(currentUser?.email || '');

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-[#233527]">Vui lòng đăng nhập</h2>
        <p className="text-sm text-[#5C7060]">Bạn cần đăng nhập để quản lý thông tin tài khoản.</p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#425E47] text-white rounded-xl text-xs font-semibold hover:bg-[#344D39]"
        >
          Đăng nhập ngay
        </Link>
      </div>
    );
  }

  const myBookings = bookings.filter((b) => b.userId === currentUser.id || b.customerEmail === currentUser.email);
  const myOrders = orders.filter((o) => o.userId === currentUser.id || o.customerEmail === currentUser.email);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(name, phone, email);
    setIsEditing(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E0DBCB]">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#233527]">Tài Khoản Khách Hàng</h1>
          <p className="text-xs text-[#5D7060] mt-1">Quản lý thông tin hồ sơ và theo dõi lịch hẹn spa</p>
        </div>
        <button
          onClick={handleLogout}
          className="self-start sm:self-auto px-4 py-2 border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Đăng xuất</span>
        </button>
      </div>

      {/* Metrics strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          to="/my-bookings"
          className="p-6 bg-white rounded-2xl border border-[#DFDAC8] shadow-xs hover:border-[#425E47] transition-all flex items-center justify-between group"
        >
          <div className="space-y-1">
            <span className="text-xs text-[#6B7F6F] font-medium">Lịch hẹn đã đặt</span>
            <div className="font-serif text-3xl font-bold text-[#243628] tabular-nums">
              {myBookings.length}
            </div>
            <span className="text-[11px] text-[#425E47] font-semibold group-hover:underline">
              Xem chi tiết lịch hẹn →
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#EDF3EE] text-[#3E6144] flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </Link>

        <Link
          to="/my-orders"
          className="p-6 bg-white rounded-2xl border border-[#DFDAC8] shadow-xs hover:border-[#425E47] transition-all flex items-center justify-between group"
        >
          <div className="space-y-1">
            <span className="text-xs text-[#6B7F6F] font-medium">Đơn hàng mỹ phẩm</span>
            <div className="font-serif text-3xl font-bold text-[#243628] tabular-nums">
              {myOrders.length}
            </div>
            <span className="text-[11px] text-[#425E47] font-semibold group-hover:underline">
              Xem lịch sử mua hàng →
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#EDF3EE] text-[#3E6144] flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
        </Link>
      </div>

      {/* Profile Information Box */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#DFDAC8] shadow-xs space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-bold text-[#233527]">
            Thông Tin Cá Nhân
          </h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs font-semibold text-[#425E47] hover:underline flex items-center gap-1"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Chỉnh sửa</span>
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSaveProfile} className="space-y-4 max-w-lg">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#283C2D]">Họ và tên</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2.5 bg-[#FAF9F5] border border-[#D5D0BF] rounded-xl text-xs text-[#273B2C] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#283C2D]">Số điện thoại</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2.5 bg-[#FAF9F5] border border-[#D5D0BF] rounded-xl text-xs text-[#273B2C] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#283C2D]">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2.5 bg-[#FAF9F5] border border-[#D5D0BF] rounded-xl text-xs text-[#273B2C] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="py-2.5 px-5 bg-[#425E47] text-white rounded-xl text-xs font-semibold hover:bg-[#344D39]"
              >
                Lưu thay đổi
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="py-2.5 px-4 border border-[#D5D0BF] text-[#4A5E4E] rounded-xl text-xs font-semibold hover:bg-[#FAF9F5]"
              >
                Hủy bỏ
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 bg-[#FAF9F5] rounded-xl border border-[#E8E4D5]">
              <span className="text-[#6C8070] block">Họ và tên:</span>
              <span className="font-semibold text-sm text-[#273B2C] mt-0.5 block">{currentUser.name}</span>
            </div>
            <div className="p-3.5 bg-[#FAF9F5] rounded-xl border border-[#E8E4D5]">
              <span className="text-[#6C8070] block">Số điện thoại:</span>
              <span className="font-semibold text-sm text-[#273B2C] mt-0.5 block">{currentUser.phone}</span>
            </div>
            <div className="p-3.5 bg-[#FAF9F5] rounded-xl border border-[#E8E4D5]">
              <span className="text-[#6C8070] block">Địa chỉ Email:</span>
              <span className="font-semibold text-sm text-[#273B2C] mt-0.5 block">{currentUser.email}</span>
            </div>
            <div className="p-3.5 bg-[#FAF9F5] rounded-xl border border-[#E8E4D5]">
              <span className="text-[#6C8070] block">Ngày tham gia hệ thống:</span>
              <span className="font-semibold text-sm text-[#273B2C] mt-0.5 block">{formatDateVN(currentUser.createdAt)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
