import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  CalendarDays,
  Sparkles,
  ShoppingBag,
  PackageCheck,
  Users,
  Tags,
  MessageSquare,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { NotificationToast } from '../components/common/NotificationToast';

export const AdminLayout: React.FC = () => {
  const { currentUser, logout, resetDemoData } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  // Guard: if not admin
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#F0EDE1] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-xl border border-[#D5CFBA] text-center space-y-4">
          <div className="w-14 h-14 bg-amber-50 text-amber-700 rounded-full flex items-center justify-center mx-auto border border-amber-200">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#2A3B2E]">Yêu Cầu Quyền Quản Trị</h2>
          <p className="text-sm text-[#5D6F61] leading-relaxed">
            Khu vực này chỉ dành riêng cho Ban quản lý An Nhiên Spa đã được xác thực bảo mật ở máy chủ. Vui lòng đăng nhập bằng tài khoản quản trị viên của bạn.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => navigate('/login?tab=admin')}
              className="w-full py-2.5 px-4 bg-[#3E5C44] text-white rounded-lg text-sm font-medium hover:bg-[#304835] transition-colors cursor-pointer"
            >
              Đăng nhập Quản trị viên
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

  const menuItems = [
    { label: 'Tổng quan Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Quản lý Lịch hẹn', path: '/admin/bookings', icon: CalendarDays },
    { label: 'Quản lý Dịch vụ', path: '/admin/services', icon: Sparkles },
    { label: 'Quản lý Sản phẩm', path: '/admin/products', icon: ShoppingBag },
    { label: 'Quản lý Đơn hàng', path: '/admin/orders', icon: PackageCheck },
    { label: 'Quản lý Khách hàng', path: '/admin/customers', icon: Users },
    { label: 'Quản lý Nhân viên', path: '/admin/staff', icon: Users },
    { label: 'Quản lý Ưu đãi', path: '/admin/promotions', icon: Tags },
    { label: 'Tin nhắn Liên hệ', path: '/admin/messages', icon: MessageSquare },
    { label: 'Cài đặt Hệ thống', path: '/admin/settings', icon: Settings }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login?tab=admin');
  };

  const handleConfirmReset = () => {
    resetDemoData();
    setShowResetModal(false);
  };

  return (
    <div className="min-h-screen bg-[#F4F2EB] flex text-[#26372B]">
      {/* Mobile Sidebar Backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#1B291F] text-[#D3E0D5] flex flex-col transition-transform duration-200 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Lockup */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-[#2A3E30] bg-[#16221A]">
          <div>
            <div className="font-serif text-lg font-bold text-white tracking-wide">
              AN NHIÊN <span className="text-[10px] uppercase font-sans tracking-widest text-[#8EA893] ml-1">Admin</span>
            </div>
            <div className="text-[10px] text-[#7E9983]">Hệ thống quản lý nội bộ</div>
          </div>
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="lg:hidden text-[#8FA893] hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? 'bg-[#314837] text-white font-semibold shadow-xs'
                    : 'text-[#ABC0AE] hover:bg-[#25372A] hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-[#A0C4A7]' : 'text-[#7F9A83]'}`} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer Controls */}
        <div className="p-3 border-t border-[#2A3E30] bg-[#16221A] space-y-2">
          {/* Reset Demo Data Button */}
          <button
            onClick={() => setShowResetModal(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-[#C8DCB8] bg-[#2A3C2E] hover:bg-[#354B3A] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#A5C992]" />
            <span>Khôi phục dữ liệu mẫu</span>
          </button>

          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-[#9DB4A0] hover:text-white hover:bg-[#25372A] transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Xem Website Khách</span>
            </span>
            <span className="text-[10px] bg-[#2E4233] px-1.5 py-0.5 rounded text-[#ABC2B0]">Mở tab</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-rose-300 hover:bg-rose-950/40 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Đăng xuất Quản trị</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-20 bg-white border-b border-[#E0DBCB] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 text-[#465E4C] hover:bg-[#F0EEE4] rounded-lg"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden sm:block">
              <h1 className="text-base font-semibold text-[#1F2F23]">Trung Tâm Điều Hành An Nhiên Spa</h1>
              <p className="text-xs text-[#6A7F6E]">Dữ liệu thời gian thực được đồng bộ với giao diện khách hàng</p>
            </div>
          </div>

          {/* User profile & actions */}
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-semibold text-[#213526]">{currentUser.name}</div>
              <div className="text-[11px] text-[#6E8372]">{currentUser.email}</div>
            </div>
            <div className="w-9 h-9 rounded-full bg-[#E5ECE6] border border-[#BACDC0] text-[#36563D] font-bold text-xs flex items-center justify-center">
              AD
            </div>
          </div>
        </header>

        {/* Content View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-[#DCD6C4] space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="font-serif text-xl font-bold text-[#2A3C2E]">Khôi phục dữ liệu mẫu ban đầu?</h3>
              <p className="text-xs text-[#5E7061] leading-relaxed">
                Thao tác này sẽ đặt lại toàn bộ danh sách dịch vụ, sản phẩm, lịch hẹn, đơn hàng, ưu đãi và tin nhắn về trạng thái ban đầu của đồ án. Các dữ liệu thử nghiệm phát sinh sẽ được làm mới.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="flex-1 py-2 px-3 border border-[#D5D0BF] rounded-lg text-xs font-medium text-[#465E4C] hover:bg-[#F5F2E8] transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmReset}
                className="flex-1 py-2 px-3 bg-rose-700 text-white rounded-lg text-xs font-medium hover:bg-rose-800 transition-colors"
              >
                Xác nhận khôi phục
              </button>
            </div>
          </div>
        </div>
      )}

      <NotificationToast />
    </div>
  );
};
