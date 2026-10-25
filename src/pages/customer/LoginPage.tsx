import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  User as UserIcon,
  Briefcase,
  ShieldCheck,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  ArrowRight,
  Lock,
  Mail,
  Phone,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, register, currentUser, logout } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Role Tab Selection
  const initialRole = (searchParams.get('tab') || searchParams.get('role') || 'customer') as UserRole;
  const [activeRole, setActiveRole] = useState<UserRole>(
    initialRole === 'staff' || initialRole === 'admin' ? initialRole : 'customer'
  );

  // Customer Mode: 'login' | 'register'
  const [customerMode, setCustomerMode] = useState<'login' | 'register'>('login');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Register Fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // State
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync role from URL param if query changes
  useEffect(() => {
    const tab = searchParams.get('tab') || searchParams.get('role');
    if (tab === 'admin') setActiveRole('admin');
    else if (tab === 'staff') setActiveRole('staff');
    else if (tab === 'customer') setActiveRole('customer');
  }, [searchParams]);

  // If already logged in, show status & redirect buttons
  if (currentUser) {
    const roleLabel =
      currentUser.role === 'admin'
        ? 'Quản trị viên Hệ thống'
        : currentUser.role === 'staff'
        ? 'Nhân viên Kỹ thuật Spa'
        : 'Khách hàng Thân thiết';

    const targetUrl =
      currentUser.role === 'admin'
        ? '/admin'
        : currentUser.role === 'staff'
        ? '/staff'
        : '/account';

    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-[#E8F0EA] text-[#34533B] flex items-center justify-center mx-auto border border-[#C5D8C9] shadow-xs">
          {currentUser.role === 'admin' ? (
            <ShieldCheck className="w-8 h-8 text-[#305338]" />
          ) : currentUser.role === 'staff' ? (
            <Briefcase className="w-8 h-8 text-[#614D26]" />
          ) : (
            <UserIcon className="w-8 h-8 text-[#34533B]" />
          )}
        </div>

        <div className="space-y-2">
          <h2 className="font-serif text-2xl font-bold text-[#233527]">Bạn đang đăng nhập</h2>
          <p className="text-sm text-[#5C7060]">
            Tài khoản: <strong className="text-[#233527]">{currentUser.name}</strong> ({currentUser.email})
          </p>
          <span className="inline-block mt-1 text-xs font-semibold px-3 py-1 rounded-full bg-[#E5ECE7] text-[#2F4E36]">
            {roleLabel}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate(targetUrl)}
            className="px-6 py-2.5 bg-[#425E47] text-white rounded-xl text-xs font-semibold hover:bg-[#344D39] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <span>Đến {currentUser.role === 'admin' ? 'Trang Quản trị' : currentUser.role === 'staff' ? 'Bàn làm việc' : 'Tài khoản của tôi'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={async () => {
              await logout();
              setErrorMsg(null);
            }}
            className="px-5 py-2.5 border border-[#DFDAC8] text-[#556958] rounded-xl text-xs font-semibold hover:bg-[#F2EFE6] transition-colors cursor-pointer"
          >
            Đăng xuất tài khoản
          </button>
        </div>
      </div>
    );
  }

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !password) {
      setErrorMsg('Vui lòng nhập đầy đủ tài khoản/email và mật khẩu.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(email.trim(), password, activeRole);
      if (res.success) {
        if (activeRole === 'admin' || res.role === 'admin') {
          navigate('/admin');
        } else if (activeRole === 'staff' || res.role === 'staff') {
          navigate('/staff');
        } else {
          // Check if there was a returnUrl
          const from = (location.state as any)?.from?.pathname || '/account';
          navigate(from);
        }
      } else {
        setErrorMsg(res.message || 'Tài khoản hoặc mật khẩu không chính xác.');
      }
    } catch {
      setErrorMsg('Không thể kết nối đến máy chủ xác thực.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Customer Registration Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!regName.trim() || !regEmail.trim() || !regPhone.trim() || !regPassword) {
      setErrorMsg('Vui lòng điền đầy đủ các thông tin đăng ký.');
      return;
    }

    if (regPassword.length < 6) {
      setErrorMsg('Mật khẩu phải có độ dài ít nhất 6 ký tự.');
      return;
    }

    setLoading(true);
    try {
      const res = await register(regName.trim(), regEmail.trim(), regPhone.trim(), regPassword);
      if (res.success) {
        navigate('/account');
      } else {
        setErrorMsg(res.message || 'Đăng ký không thành công.');
      }
    } catch {
      setErrorMsg('Không thể kết nối đến máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-12 sm:py-16 space-y-8">
      {/* Brand & Portal Header */}
      <div className="text-center space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAF0EC] text-[#34593C] text-[11px] font-semibold tracking-wide uppercase border border-[#CBDBCF]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Cổng Xác Thực An Nhiên Spa</span>
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#233527]">
          Đăng Nhập Hệ Thống
        </h1>
        <p className="text-xs sm:text-sm text-[#5E7262] max-w-sm mx-auto">
          Chọn loại tài khoản phù hợp để đăng nhập vào phân hệ dịch vụ, làm việc hoặc quản trị
        </p>
      </div>

      {/* Role Switcher Tabs */}
      <div className="bg-[#EBE7D8] p-1.5 rounded-2xl grid grid-cols-3 gap-1 shadow-inner border border-[#D8D2C0]">
        {/* Customer Tab */}
        <button
          type="button"
          onClick={() => {
            setActiveRole('customer');
            setErrorMsg(null);
          }}
          className={`py-2.5 px-2 rounded-xl text-xs font-semibold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeRole === 'customer'
              ? 'bg-white text-[#233527] shadow-sm'
              : 'text-[#647967] hover:text-[#233527] hover:bg-white/40'
          }`}
        >
          <UserIcon className="w-4 h-4 shrink-0" />
          <span className="truncate">Khách hàng</span>
        </button>

        {/* Staff Tab */}
        <button
          type="button"
          onClick={() => {
            setActiveRole('staff');
            setErrorMsg(null);
          }}
          className={`py-2.5 px-2 rounded-xl text-xs font-semibold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeRole === 'staff'
              ? 'bg-white text-[#233527] shadow-sm'
              : 'text-[#647967] hover:text-[#233527] hover:bg-white/40'
          }`}
        >
          <Briefcase className="w-4 h-4 shrink-0" />
          <span className="truncate">Nhân viên</span>
        </button>

        {/* Admin Tab */}
        <button
          type="button"
          onClick={() => {
            setActiveRole('admin');
            setErrorMsg(null);
          }}
          className={`py-2.5 px-2 rounded-xl text-xs font-semibold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeRole === 'admin'
              ? 'bg-white text-[#233527] shadow-sm'
              : 'text-[#647967] hover:text-[#233527] hover:bg-white/40'
          }`}
        >
          <ShieldCheck className="w-4 h-4 shrink-0" />
          <span className="truncate">Quản trị viên</span>
        </button>
      </div>

      {/* Main Form Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#DFDAC8] shadow-sm space-y-6">
        {/* Role Header Banner */}
        <div className="flex items-center gap-3 pb-4 border-b border-[#ECE7D9]">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              activeRole === 'admin'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : activeRole === 'staff'
                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                : 'bg-[#EDF3EE] text-[#375B3D] border border-[#CFDFD2]'
            }`}
          >
            {activeRole === 'admin' ? (
              <ShieldCheck className="w-5 h-5" />
            ) : activeRole === 'staff' ? (
              <Briefcase className="w-5 h-5" />
            ) : (
              <UserIcon className="w-5 h-5" />
            )}
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#233527]">
              {activeRole === 'admin'
                ? 'Đăng nhập Quản Trị Viên'
                : activeRole === 'staff'
                ? 'Đăng nhập Bàn Làm Việc Nhân Viên'
                : customerMode === 'login'
                ? 'Đăng nhập Khách Hàng'
                : 'Đăng ký Tài Khoản Khách Hàng Mới'}
            </h2>
            <p className="text-[11px] text-[#697D6E]">
              {activeRole === 'admin'
                ? 'Quản lý dịch vụ, đơn hàng, khách hàng, nhân viên và cấu hình'
                : activeRole === 'staff'
                ? 'Tiếp nhận lịch hẹn, phục vụ khách hàng và ghi chú dịch vụ'
                : customerMode === 'login'
                ? 'Xem lịch hẹn của bạn, theo dõi đơn hàng và ưu đãi'
                : 'Tạo tài khoản để đặt lịch nhanh và lưu lịch sử trị liệu'}
            </p>
          </div>
        </div>

        {/* For Customer: Toggle Login vs Register */}
        {activeRole === 'customer' && (
          <div className="flex border-b border-[#ECE7D9] text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setCustomerMode('login');
                setErrorMsg(null);
              }}
              className={`flex-1 pb-3 text-center transition-colors cursor-pointer border-b-2 ${
                customerMode === 'login'
                  ? 'border-[#425E47] text-[#233527]'
                  : 'border-transparent text-[#7B8E7F] hover:text-[#233527]'
              }`}
            >
              Đăng nhập
            </button>
            <button
              type="button"
              onClick={() => {
                setCustomerMode('register');
                setErrorMsg(null);
              }}
              className={`flex-1 pb-3 text-center transition-colors cursor-pointer border-b-2 ${
                customerMode === 'register'
                  ? 'border-[#425E47] text-[#233527]'
                  : 'border-transparent text-[#7B8E7F] hover:text-[#233527]'
              }`}
            >
              Đăng ký tài khoản
            </button>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <div className="flex-1 leading-relaxed">{errorMsg}</div>
          </div>
        )}

        {/* LOGIN FORM (Customer Login / Staff Login / Admin Login) */}
        {(activeRole !== 'customer' || customerMode === 'login') && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#283C2D] flex items-center justify-between">
                <span>
                  {activeRole === 'admin'
                    ? 'Email Quản trị viên *'
                    : activeRole === 'staff'
                    ? 'Email / Tài khoản Nhân viên *'
                    : 'Địa chỉ Email / Số điện thoại *'}
                </span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    activeRole === 'admin'
                      ? 'admin@annhienspa.vn'
                      : activeRole === 'staff'
                      ? 'nhanvien@annhienspa.vn'
                      : 'khachhang@gmail.com'
                  }
                  className="w-full pl-9 pr-3 py-2.5 bg-[#FAF9F5] border border-[#D5D0BF] rounded-xl text-xs text-[#273B2C] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden transition-all"
                />
                <Mail className="w-4 h-4 text-[#8A9C8D] absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#283C2D] flex items-center justify-between">
                <span>Mật khẩu *</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu an toàn..."
                  className="w-full pl-9 pr-10 py-2.5 bg-[#FAF9F5] border border-[#D5D0BF] rounded-xl text-xs text-[#273B2C] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden transition-all"
                />
                <Lock className="w-4 h-4 text-[#8A9C8D] absolute left-3 top-3 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-[#738876] hover:text-[#233527] focus:outline-hidden cursor-pointer"
                  title={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[#425E47] hover:bg-[#344D39] text-white rounded-xl text-xs font-semibold transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              <span>
                {loading
                  ? 'Đang xác thực bảo mật...'
                  : activeRole === 'admin'
                  ? 'Đăng nhập Quản trị viên'
                  : activeRole === 'staff'
                  ? 'Vào Bàn làm việc Nhân viên'
                  : 'Đăng nhập Khách hàng'}
              </span>
            </button>
          </form>
        )}

        {/* CUSTOMER REGISTER FORM */}
        {activeRole === 'customer' && customerMode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#283C2D]">Họ và tên *</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Thu Trang"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#FAF9F5] border border-[#D5D0BF] rounded-xl text-xs text-[#273B2C] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden"
                />
                <UserIcon className="w-4 h-4 text-[#8A9C8D] absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#283C2D]">Địa chỉ Email *</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="khachhang@gmail.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#FAF9F5] border border-[#D5D0BF] rounded-xl text-xs text-[#273B2C] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden"
                />
                <Mail className="w-4 h-4 text-[#8A9C8D] absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#283C2D]">Số điện thoại *</label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="0912345678"
                  className="w-full pl-9 pr-3 py-2.5 bg-[#FAF9F5] border border-[#D5D0BF] rounded-xl text-xs text-[#273B2C] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden"
                />
                <Phone className="w-4 h-4 text-[#8A9C8D] absolute left-3 top-3 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#283C2D]">Tạo mật khẩu * (Ít nhất 6 ký tự)</label>
              <div className="relative">
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Nhập mật khẩu an toàn..."
                  className="w-full pl-9 pr-10 py-2.5 bg-[#FAF9F5] border border-[#D5D0BF] rounded-xl text-xs text-[#273B2C] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden"
                />
                <Lock className="w-4 h-4 text-[#8A9C8D] absolute left-3 top-3 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  className="absolute right-3 top-2.5 text-[#738876] hover:text-[#233527] focus:outline-hidden cursor-pointer"
                  title={showRegPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                >
                  {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[#425E47] hover:bg-[#344D39] text-white rounded-xl text-xs font-semibold transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4" />
              )}
              <span>Hoàn tất Đăng ký Khách Hàng</span>
            </button>
          </form>
        )}

        {/* Security & Role Policy Notice */}
        <div className="pt-2 border-t border-[#ECE7D9] text-[11px] text-[#6D8071] space-y-1.5 leading-relaxed">
          {activeRole === 'admin' ? (
            <p>
              • Tài khoản Quản trị viên được cấp phát và bảo vệ độc quyền phía máy chủ. Mọi yêu cầu quản trị đều được xác thực với chữ ký số HMAC-SHA256.
            </p>
          ) : activeRole === 'staff' ? (
            <p>
              • Tài khoản Nhân viên do Quản trị viên An Nhiên Spa tạo và phân quyền trong hệ thống nội bộ.
            </p>
          ) : (
            <p>
              • Khách hàng có thể đăng ký tài khoản miễn phí để tra cứu lịch hẹn, lưu thông tin liệu trình và nhận mã ưu đãi spa.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
