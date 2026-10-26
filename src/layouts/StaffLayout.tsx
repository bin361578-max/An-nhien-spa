import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  CalendarDays,
  Sparkles,
  ShoppingBag,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Briefcase,
  ShieldAlert,
  Clock,
  UserCheck
} from 'lucide-react';
import { NotificationToast } from '../components/common/NotificationToast';

export const StaffLayout: React.FC = () => {
  const { currentUser, isStaff, logout } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Guard: if not authenticated or not staff/admin
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#F0EDE1] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-[#D5CFBA] text-center space-y-4">
          <div className="w-14 h-14 bg-amber-50 text-amber-700 rounded-2xl flex items-center justify-center mx-auto border border-amber-200">
            <Briefcase className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#2A3B2E]">Bàn Làm Việc Nhân Viên</h2>
          <p className="text-sm text-[#5D6F61] leading-relaxed">
            Khu vực này dành riêng cho nhân viên kỹ thuật và điều phối viên An Nhiên Spa. Vui lòng đăng nhập với tài khoản nhân viên được cấp quyền.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => navigate('/login')}
              className="w-full py-2.5 px-4 bg-[#3E5C44] text-white rounded-xl text-xs font-semibold hover:bg-[#304835] transition-colors cursor-pointer"
            >
              Đăng nhập tài khoản
            </button>
            <Link
              to="/"
              className="w-full py-2 px-4 text-xs font-medium text-[#5B6F5F] hover:text-[#283C2D] transition-colors text-center"
            >
              ← Quay lại Website Khách hàng
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (currentUser.role === 'customer') {
    return (
      <div className="min-h-screen bg-[#F0EDE1] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-rose-200 text-center space-y-4">
          <div className="w-14 h-14 bg-rose-50 text-rose-700 rounded-2xl flex items-center justify-center mx-auto border border-rose-200">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#2A3B2E]">Từ Chối Truy Cập</h2>
          <p className="text-sm text-[#5D6F61] leading-relaxed">
            Tài khoản hiện tại của bạn là <strong>Khách hàng</strong>. Bạn không có quyền truy cập vào bàn làm việc nội bộ của nhân viên spa.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => navigate('/login')}
              className="w-full py-2.5 px-4 bg-[#3E5C44] text-white rounded-xl text-xs font-semibold hover:bg-[#304835] transition-colors cursor-pointer"
            >
              Đăng nhập tài khoản nhân viên
            </button>
            <Link
              to="/"
              className="w-full py-2 px-4 text-xs font-medium text-[#5B6F5F] hover:text-[#283C2D] transition-colors text-center"
            >
              ← Trở về Không gian Khách hàng
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const staffNavItems = [
    { label: 'Lịch Hẹn Phục Vụ', path: '/staff', icon: CalendarDays },
    { label: 'Cẩm Nang Dịch Vụ', path: '/staff/services', icon: Sparkles },
    { label: 'Tư Vấn Sản Phẩm', path: '/staff/products', icon: ShoppingBag }
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login?tab=staff');
  };

  return (
    <div className="min-h-screen bg-[#F4F2EB] text-[#243427] flex flex-col">
      {/* Top Staff Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#1D2B20] text-white border-b border-[#2C3F30] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
            {/* Brand & Badge */}
            <div className="flex items-center gap-3">
              <Link to="/staff" className="flex items-center gap-2">
                <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-white">
                  AN NHIÊN
                </span>
                <span className="text-[10px] uppercase tracking-widest font-sans px-2 py-0.5 rounded-md bg-[#334D39] text-[#BED5C3] font-semibold border border-[#44634B]">
                  Nhân Viên
                </span>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-2">
              {staffNavItems.map((item) => {
                const Icon = item.icon;
                const active = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                      active
                        ? 'bg-[#354E3A] text-white shadow-xs font-semibold'
                        : 'text-[#C5D5C8] hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Right Profile & Actions */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Staff Profile Badge */}
              <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 bg-[#152017] rounded-xl border border-[#2A3F2E]">
                <div className="w-7 h-7 rounded-lg bg-[#314A36] text-[#C4D9C7] flex items-center justify-center font-bold text-xs">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="text-left text-xs">
                  <div className="font-semibold text-white leading-tight truncate max-w-[130px]">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-[#8EA693] truncate max-w-[130px]">
                    {currentUser.role === 'admin' ? 'Quản trị viên' : 'Kỹ thuật viên'}
                  </div>
                </div>
              </div>

              {/* View Customer Website Link */}
              <Link
                to="/"
                className="hidden lg:flex items-center gap-1.5 text-xs text-[#BED2C1] hover:text-white py-1.5 px-2.5 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-[#354D3B]"
                title="Xem giao diện khách hàng"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Xem Website</span>
              </Link>

              {/* Logout Button */}
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs text-[#E8A598] hover:text-white hover:bg-rose-900/30 py-2 px-3 rounded-xl transition-colors cursor-pointer border border-rose-900/40"
                title="Đăng xuất khỏi phiên làm việc"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Đăng xuất</span>
              </button>

              {/* Mobile menu toggle */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-[#C5D5C8] hover:text-white rounded-lg"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#162218] border-t border-[#2C3F30] px-4 py-3 space-y-2">
            <div className="pb-2 border-b border-[#2C3F30] text-xs text-[#C5D5C8]">
              Đang làm việc: <strong className="text-white">{currentUser.name}</strong> ({currentUser.email})
            </div>
            {staffNavItems.map((item) => {
              const Icon = item.icon;
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium ${
                    active ? 'bg-[#314A36] text-white font-semibold' : 'text-[#C5D5C8] hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#A6C0AA] hover:bg-white/5"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Xem trang khách hàng</span>
            </Link>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Toast Notifications */}
      <NotificationToast />
    </div>
  );
};
