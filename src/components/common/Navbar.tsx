import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Menu, ShoppingBag, User as UserIcon, Calendar, ShieldCheck, Briefcase } from 'lucide-react';
import { DrawerMenu } from './DrawerMenu';

export const Navbar: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { currentUser, cartCount } = useApp();
  const location = useLocation();

  const isLinkActive = (path: string) => location.pathname === path;

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#FAF9F5]/95 backdrop-blur-md border-b border-[#E5E2D6] transition-shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4 sm:gap-8">
            {/* Zone 1: Hamburger Menu (Left) & Brand Single Line */}
            <div className="flex items-center gap-3 sm:gap-4 shrink-0">
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="p-2 -ml-2 text-[#465E4C] hover:text-[#213727] hover:bg-[#EBE8DC] rounded-lg transition-colors focus:outline-hidden focus:ring-2 focus:ring-[#6E8F74]"
                aria-label="Mở danh mục menu"
              >
                <Menu className="w-6 h-6" />
              </button>

              <Link to="/" className="flex items-center gap-2 group whitespace-nowrap">
                <span className="font-serif text-2xl sm:text-2xl font-bold tracking-tight text-[#2B3F31] group-hover:text-[#425E47] transition-colors">
                  AN NHIÊN
                </span>
                <span className="text-[11px] uppercase tracking-widest text-[#6E8773] font-medium hidden sm:inline-block border-l border-[#D5D1C2] pl-2">
                  Spa & Wellness
                </span>
              </Link>
            </div>

            {/* Zone 2: Primary Nav Links (Single line, subtle hover) */}
            <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-[#465E4C]">
              <Link
                to="/"
                className={`whitespace-nowrap transition-colors pb-0.5 border-b-2 ${
                  isLinkActive('/')
                    ? 'border-[#425E47] text-[#213727] font-semibold'
                    : 'border-transparent hover:text-[#213727] hover:border-[#ADC4B1]'
                }`}
              >
                Trang chủ
              </Link>
              <Link
                to="/services"
                className={`whitespace-nowrap transition-colors pb-0.5 border-b-2 ${
                  isLinkActive('/services')
                    ? 'border-[#425E47] text-[#213727] font-semibold'
                    : 'border-transparent hover:text-[#213727] hover:border-[#ADC4B1]'
                }`}
              >
                Dịch vụ
              </Link>
              <Link
                to="/products"
                className={`whitespace-nowrap transition-colors pb-0.5 border-b-2 ${
                  isLinkActive('/products')
                    ? 'border-[#425E47] text-[#213727] font-semibold'
                    : 'border-transparent hover:text-[#213727] hover:border-[#ADC4B1]'
                }`}
              >
                Sản phẩm
              </Link>
              <Link
                to="/promotions"
                className={`whitespace-nowrap transition-colors pb-0.5 border-b-2 ${
                  isLinkActive('/promotions')
                    ? 'border-[#425E47] text-[#213727] font-semibold'
                    : 'border-transparent hover:text-[#213727] hover:border-[#ADC4B1]'
                }`}
              >
                Ưu đãi & Minigame
              </Link>
              <Link
                to="/about"
                className={`whitespace-nowrap transition-colors pb-0.5 border-b-2 ${
                  isLinkActive('/about')
                    ? 'border-[#425E47] text-[#213727] font-semibold'
                    : 'border-transparent hover:text-[#213727] hover:border-[#ADC4B1]'
                }`}
              >
                Giới thiệu
              </Link>
              <Link
                to="/contact"
                className={`whitespace-nowrap transition-colors pb-0.5 border-b-2 ${
                  isLinkActive('/contact')
                    ? 'border-[#425E47] text-[#213727] font-semibold'
                    : 'border-transparent hover:text-[#213727] hover:border-[#ADC4B1]'
                }`}
              >
                Liên hệ
              </Link>
            </nav>

            {/* Zone 3: Actions - Cart, User, Primary Action (Đặt Lịch) */}
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              {/* Cart Button */}
              <Link
                to="/cart"
                className="relative p-2 text-[#465E4C] hover:text-[#213727] hover:bg-[#EBE8DC] rounded-lg transition-colors"
                aria-label="Giỏ hàng"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-[#C45543] text-white text-[10px] font-bold rounded-full flex items-center justify-center tabular-nums">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>

              {/* User / Profile Link */}
              {currentUser ? (
                <Link
                  to={
                    currentUser.role === 'admin'
                      ? '/admin'
                      : currentUser.role === 'staff'
                      ? '/staff'
                      : '/account'
                  }
                  className="hidden sm:flex items-center gap-1.5 py-1.5 px-2.5 text-xs font-medium text-[#38513E] hover:bg-[#EBE8DC] rounded-lg transition-colors border border-[#DDD9C8]"
                  title={currentUser.name}
                >
                  {currentUser.role === 'admin' ? (
                    <ShieldCheck className="w-4 h-4 text-[#3C6445]" />
                  ) : currentUser.role === 'staff' ? (
                    <Briefcase className="w-4 h-4 text-[#7A612A]" />
                  ) : (
                    <UserIcon className="w-4 h-4 text-[#587960]" />
                  )}
                  <span className="max-w-[100px] truncate">{currentUser.name}</span>
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="hidden sm:flex items-center gap-1 text-xs font-medium text-[#465E4C] hover:text-[#213727] py-1.5 px-2 rounded-lg transition-colors"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>Đăng nhập</span>
                </Link>
              )}

              {/* Primary Action Button: Đặt Lịch Ngay */}
              <Link
                to="/booking"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs sm:text-sm font-medium text-white bg-[#425E47] hover:bg-[#344D39] rounded-lg shadow-xs hover:shadow-sm transition-all whitespace-nowrap active:scale-[0.98]"
              >
                <Calendar className="w-4 h-4" />
                <span>Đặt lịch ngay</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Drawer */}
      <DrawerMenu isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
};
