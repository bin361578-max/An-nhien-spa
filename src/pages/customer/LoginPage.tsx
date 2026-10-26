import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import {
  Eye,
  EyeOff,
  LogIn,
  ArrowRight,
  Lock,
  Mail,
  User as UserIcon,
  ShieldCheck,
  Briefcase,
  AlertCircle,
  HelpCircle,
  X,
  PhoneCall,
  CheckCircle2
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, forgotPasswordAction, currentUser, logout, settings } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  // Login form fields
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Forgot password modal
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);

  // If already logged in, show status & navigation button
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

    const targetLabel =
      currentUser.role === 'admin'
        ? 'Bảng Điều Khiển Quản Trị'
        : currentUser.role === 'staff'
        ? 'Bàn Làm Việc Nhân Viên'
        : 'Trang Tài Khoản Của Tôi';

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
            Tài khoản: <strong className="text-[#233527]">{currentUser.name}</strong>
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
            <span>Đến {targetLabel}</span>
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
            Đăng xuất
          </button>
        </div>
      </div>
    );
  }

  // Handle Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanInput = identifier.trim();
    if (!cleanInput || !password) {
      setErrorMsg('Vui lòng nhập đầy đủ email hoặc số điện thoại và mật khẩu.');
      return;
    }

    setLoading(true);
    try {
      // Login with identifier and password; role is determined solely by server
      const res = await login(cleanInput, password);
      if (res.success) {
        // Authoritative redirect based on server-verified role
        if (res.role === 'admin') {
          navigate('/admin');
        } else if (res.role === 'staff') {
          navigate('/staff');
        } else {
          const from = (location.state as any)?.from?.pathname || '/account';
          navigate(from);
        }
      } else {
        // Generic failure message to protect privacy and prevent user enumeration
        setErrorMsg(res.message || 'Email/Số điện thoại hoặc mật khẩu không chính xác.');
      }
    } catch {
      setErrorMsg('Không thể kết nối đến máy chủ xác thực. Vui lòng kiểm tra kết nối mạng.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Forgot Password
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotIdentifier.trim()) return;

    setForgotLoading(true);
    try {
      const res = await forgotPasswordAction(forgotIdentifier.trim());
      setForgotSuccess(res.message);
    } catch {
      setForgotSuccess('Yêu cầu hỗ trợ đã được tiếp nhận. Đội ngũ An Nhiên Spa sẽ liên hệ bạn.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 sm:py-16 space-y-8">
      {/* Brand & Portal Header */}
      <div className="text-center space-y-3">
        <Link to="/" className="inline-block group">
          <div className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#233527] group-hover:text-[#425E47] transition-colors">
            AN NHIÊN
          </div>
          <div className="text-[11px] uppercase tracking-widest text-[#6E8773] font-medium mt-0.5">
            Spa & Wellness
          </div>
        </Link>
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#233527]">
            Đăng nhập
          </h1>
          <p className="text-xs sm:text-sm text-[#5E7262] mt-1">
            Chào mừng bạn đến với không gian chăm sóc sức khỏe & sắc đẹp An Nhiên
          </p>
        </div>
      </div>

      {/* Main Single Login Form Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#DFDAC8] shadow-sm space-y-6">
        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <div className="flex-1 leading-relaxed">{errorMsg}</div>
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          {/* Email or Phone Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-[#283C2D]">
              Email hoặc Số điện thoại
            </label>
            <div className="relative">
              <input
                type="text"
                required
                autoComplete="username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Nhập email hoặc số điện thoại..."
                className="w-full pl-9 pr-3 py-2.5 bg-[#FAF9F5] border border-[#D5D0BF] rounded-xl text-xs text-[#273B2C] placeholder:text-[#9BAAA0] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden transition-all"
              />
              <Mail className="w-4 h-4 text-[#8A9C8D] absolute left-3 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Password Input with Eye Toggle */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-[#283C2D]">
                Mật khẩu
              </label>
              <button
                type="button"
                onClick={() => {
                  setForgotModalOpen(true);
                  setForgotSuccess(null);
                  setForgotIdentifier(identifier);
                }}
                className="text-[11px] text-[#44664B] hover:text-[#233527] hover:underline cursor-pointer transition-colors"
              >
                Quên mật khẩu?
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu của bạn..."
                className="w-full pl-9 pr-10 py-2.5 bg-[#FAF9F5] border border-[#D5D0BF] rounded-xl text-xs text-[#273B2C] placeholder:text-[#9BAAA0] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden transition-all"
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

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-[#425E47] hover:bg-[#344D39] text-white rounded-xl text-xs font-semibold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <LogIn className="w-4 h-4" />
            )}
            <span>{loading ? 'Đang xác thực bảo mật...' : 'Đăng nhập'}</span>
          </button>
        </form>

        {/* Register Customer Link */}
        <div className="pt-4 border-t border-[#ECE7D9] text-center text-xs text-[#627765]">
          <span>Chưa có tài khoản? </span>
          <Link
            to="/register"
            className="font-semibold text-[#3A5D40] hover:text-[#233527] hover:underline transition-colors"
          >
            Đăng ký tài khoản khách hàng
          </Link>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {forgotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 border border-[#DFDAC8] shadow-2xl space-y-5 relative">
            <button
              onClick={() => setForgotModalOpen(false)}
              className="absolute top-5 right-5 text-[#889B8C] hover:text-[#2A3E2F] p-1 rounded-lg hover:bg-[#F3EFE6] transition-colors"
              aria-label="Đóng hộp thoại"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1.5">
              <div className="w-10 h-10 rounded-xl bg-[#EAF0EC] text-[#375B3D] flex items-center justify-center border border-[#CFDFD2] mb-3">
                <HelpCircle className="w-5 h-5" />
              </div>
              <h3 className="font-serif text-lg font-bold text-[#233527]">
                Hỗ Trợ Khôi Phục Mật Khẩu
              </h3>
              <p className="text-xs text-[#637968] leading-relaxed">
                Để bảo vệ quyền riêng tư và dữ liệu liệu trình của bạn, An Nhiên Spa hỗ trợ xác minh danh tính và đặt lại mật khẩu an toàn.
              </p>
            </div>

            {forgotSuccess ? (
              <div className="space-y-4 pt-2">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="font-semibold">Đã gửi yêu cầu thành công</div>
                    <p className="text-[11px] text-emerald-800 leading-relaxed">
                      {forgotSuccess}
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-[#FAF9F5] rounded-xl border border-[#E7E2D2] text-[11px] text-[#59705E] flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-[#44664B] shrink-0" />
                  <span>
                    Hotline hỗ trợ nhanh: <strong className="text-[#233527]">{settings.hotline}</strong>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setForgotModalOpen(false)}
                  className="w-full py-2.5 px-4 bg-[#425E47] text-white rounded-xl text-xs font-semibold hover:bg-[#344D39] transition-colors"
                >
                  Đóng và quay lại
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotSubmit} className="space-y-4 pt-1">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#283C2D]">
                    Email hoặc Số điện thoại đã đăng ký
                  </label>
                  <input
                    type="text"
                    required
                    value={forgotIdentifier}
                    onChange={(e) => setForgotIdentifier(e.target.value)}
                    placeholder="Ví dụ: khachhang@gmail.com hoặc 0912345678"
                    className="w-full px-3 py-2.5 bg-[#FAF9F5] border border-[#D5D0BF] rounded-xl text-xs text-[#273B2C] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden"
                  />
                </div>

                <div className="p-3 bg-[#FAF9F5] rounded-xl border border-[#E7E2D2] text-[11px] text-[#59705E] flex items-center gap-2">
                  <PhoneCall className="w-4 h-4 text-[#44664B] shrink-0" />
                  <span>
                    Hoặc liên hệ Hotline lễ tân: <strong className="text-[#233527]">{settings.hotline}</strong>
                  </span>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setForgotModalOpen(false)}
                    className="flex-1 py-2.5 px-3 border border-[#D5D0BF] text-[#59705E] rounded-xl text-xs font-semibold hover:bg-[#F3EFE6] transition-colors"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex-1 py-2.5 px-3 bg-[#425E47] text-white rounded-xl text-xs font-semibold hover:bg-[#344D39] transition-colors disabled:opacity-50"
                  >
                    {forgotLoading ? 'Đang gửi...' : 'Gửi yêu cầu hỗ trợ'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
