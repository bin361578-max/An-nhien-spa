import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  X,
  Home,
  Sparkles,
  CalendarCheck,
  ShoppingBag,
  Gift,
  HelpCircle,
  Mail,
  User,
  Clock,
  Package,
  ShieldAlert,
  LogOut,
  LogIn,
  Info
} from 'lucide-react';

interface DrawerMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DrawerMenu: React.FC<DrawerMenuProps> = ({ isOpen, onClose }) => {
  const { currentUser, logout, settings } = useApp();
  const location = useLocation();

  if (!isOpen) return null;

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { label: 'Trang chủ', path: '/', icon: Home },
    { label: 'Giới thiệu', path: '/about', icon: Info },
    { label: 'Dịch vụ Spa', path: '/services', icon: Sparkles },
    { label: 'Đặt lịch hẹn', path: '/booking', icon: CalendarCheck, highlight: true },
    { label: 'Sản phẩm dưỡng da', path: '/products', icon: ShoppingBag },
    { label: 'Ưu đãi & Vòng quay', path: '/promotions', icon: Gift },
    { label: 'Liên hệ', path: '/contact', icon: Mail },
    { label: 'Câu hỏi thường gặp', path: '/faq', icon: HelpCircle }
  ];

  const userLinks = currentUser
    ? [
        { label: 'Tài khoản của tôi', path: '/account', icon: User },
        { label: 'Lịch hẹn của tôi', path: '/my-bookings', icon: Clock },
        { label: 'Đơn hàng của tôi', path: '/my-orders', icon: Package }
      ]
    : [];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-[#FAF9F5] shadow-2xl flex flex-col z-10 border-r border-[#E5E2D6] animate-in slide-in-from-left duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E5E2D6] bg-[#F3F0E6]">
          <div>
            <div className="font-serif text-xl font-bold tracking-tight text-[#2B3F31]">
              AN NHIÊN <span className="font-sans text-xs font-normal text-[#5B7962] tracking-wider uppercase">Spa</span>
            </div>
            <p className="text-xs text-[#6B7E6F] mt-0.5">An yên trong từng chạm</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#5A6D5E] hover:text-[#2B3F31] rounded-lg hover:bg-black/5 transition-colors"
            aria-label="Đóng menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto py-4 px-4 space-y-6">
          {/* Main Navigation */}
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#7A8F7F] px-3 mb-2">
              Khám phá Spa
            </div>
            <nav className="space-y-1">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      active
                        ? 'bg-[#E3EBE4] text-[#1E3323] font-semibold'
                        : item.highlight
                        ? 'text-[#2D5A38] bg-[#EEF4EF] hover:bg-[#E3EBE4]'
                        : 'text-[#3E5244] hover:bg-[#F0EEE4] hover:text-[#1E3323]'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-[#3B6244]' : 'text-[#6C8573]'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User Section */}
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#7A8F7F] px-3 mb-2">
              Tài khoản khách hàng
            </div>
            {currentUser ? (
              <div className="space-y-1">
                <div className="px-3 py-2 mb-2 bg-[#F0EEE4] rounded-lg border border-[#E2DFD3]">
                  <div className="text-xs font-semibold text-[#283C2D] truncate">{currentUser.name}</div>
                  <div className="text-[11px] text-[#697D6E] truncate">{currentUser.email}</div>
                  <div className="text-[10px] text-[#8C9F90] mt-0.5">Vai trò: Khách hàng thân thiết</div>
                </div>
                {userLinks.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        active
                          ? 'bg-[#E3EBE4] text-[#1E3323] font-semibold'
                          : 'text-[#3E5244] hover:bg-[#F0EEE4]'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-[#6C8573]" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
                <button
                  onClick={() => {
                    logout();
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-rose-700 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4 text-rose-600" />
                  <span>Đăng xuất</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2 px-1">
                <p className="text-xs text-[#6A7E6F] px-2 mb-2">Đăng nhập để xem lịch hẹn, mua sản phẩm và nhận khuyến mãi.</p>
                <Link
                  to="/login"
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 w-full py-2 px-3 bg-[#425E47] text-white rounded-lg text-sm font-medium hover:bg-[#344D39] transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Đăng nhập / Đăng ký</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-[#E5E2D6] bg-[#F5F2E9] text-[11px] text-[#697D6E] space-y-1">
          <div>Hotline: <span className="font-semibold text-[#293E2E]">{settings.hotline}</span></div>
          <div>Giờ mở cửa: {settings.openingHours}</div>
        </div>
      </div>
    </div>
  );
};
