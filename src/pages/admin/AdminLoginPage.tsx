import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Lock, Mail, ArrowRight, ArrowLeft, Info, KeyRound, Server } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const { loginAdmin, currentUser } = useApp();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfigGuide, setShowConfigGuide] = useState(false);

  // If already logged in as admin
  if (currentUser && currentUser.role === 'admin') {
    navigate('/admin');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim()) {
      setErrorMsg('Vui lòng nhập email quản trị viên.');
      return;
    }
    if (!password) {
      setErrorMsg('Vui lòng nhập mật khẩu quản trị.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await loginAdmin(email.trim(), password);
      if (res.success) {
        navigate('/admin');
      } else {
        setErrorMsg(res.message || 'Email hoặc mật khẩu quản trị viên không chính xác.');
      }
    } catch {
      setErrorMsg('Không thể kết nối đến máy chủ xác thực.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1B291F] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 shadow-2xl border border-[#304835] space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-[#EDF3EE] text-[#34593C] rounded-2xl flex items-center justify-center mx-auto border border-[#C5D9C8]">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#1F2F23]">
            Đăng Nhập Quản Trị Viên
          </h1>
          <p className="text-xs text-[#5F7463]">
            Phân hệ quản lý nội bộ hệ thống An Nhiên Spa (Xác thực máy chủ)
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 leading-relaxed">
              {errorMsg}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#283C2D]">Email Quản trị *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#7A907E] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email quản trị viên"
                className="w-full pl-9 pr-3 py-2.5 bg-[#FAF9F5] border border-[#D5D0BF] rounded-xl text-xs text-[#273B2C] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#283C2D]">Mật khẩu Quản trị *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#7A907E] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu quản trị viên"
                className="w-full pl-9 pr-3 py-2.5 bg-[#FAF9F5] border border-[#D5D0BF] rounded-xl text-xs text-[#273B2C] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-[#3E5C44] hover:bg-[#304835] disabled:bg-gray-400 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span>Đang xác thực bảo mật...</span>
            ) : (
              <>
                <span>Vào Bảng Điều Khiển Quản Trị</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Collapsible Architecture & Security Documentation */}
        <div className="pt-2 border-t border-[#F0ECE1] space-y-2">
          <button
            type="button"
            onClick={() => setShowConfigGuide(!showConfigGuide)}
            className="w-full flex items-center justify-between text-left text-[11px] text-[#4A6D50] hover:text-[#233827] font-semibold py-1.5 transition-colors"
          >
            <span className="flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5" />
              <span>Cơ chế bảo mật máy chủ & Đánh giá đồ án</span>
            </span>
            <span className="text-xs">{showConfigGuide ? '▲ Thu gọn' : '▼ Chi tiết'}</span>
          </button>

          {showConfigGuide && (
            <div className="p-3.5 bg-[#FAF9F5] rounded-xl border border-[#DFDAC8] text-xs text-[#405444] space-y-2 animate-in fade-in duration-200">
              <div className="flex items-start gap-2 text-[#243527]">
                <KeyRound className="w-4 h-4 text-[#436A49] shrink-0 mt-0.5" />
                <div>
                  <strong>Xác thực bảo mật đa tầng:</strong>
                  <p className="text-[11px] text-[#556959] mt-0.5">
                    Hệ thống không lưu mật khẩu trong mã nguồn hay localStorage. Mật khẩu được mã hóa PBKDF2 với muối ngẫu nhiên (salt) ở phía máy chủ Node/Express, cấp token phiên làm việc HMAC-SHA256 (Bearer Token) thời hạn 12h.
                  </p>
                </div>
              </div>

              <div className="text-[11px] bg-[#EAE5D6] p-2.5 rounded-lg text-[#1F2F23] space-y-1 font-mono">
                <div className="font-sans font-bold text-xs text-[#283C2C]">Tài khoản khởi tạo mặc định (Môi trường Test):</div>
                <div>• Email: <strong>admin@annhienspa.vn</strong></div>
                <div>• Mật khẩu: <strong>AnNhien@Admin2026Secure!</strong></div>
              </div>

              <p className="text-[10px] text-[#6B7F70] italic">
                Khi triển khai lên Vercel, chủ sở hữu cấu hình các biến môi trường: <code className="font-mono bg-white px-1 py-0.5 rounded border border-[#D5D0BF]">ADMIN_EMAIL</code>, <code className="font-mono bg-white px-1 py-0.5 rounded border border-[#D5D0BF]">ADMIN_PASSWORD</code>, và <code className="font-mono bg-white px-1 py-0.5 rounded border border-[#D5D0BF]">ADMIN_JWT_SECRET</code> trong phần Vercel Settings để thay đổi thông tin theo ý muốn.
              </p>
            </div>
          )}
        </div>

        <div className="text-center pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs text-[#5E7362] hover:text-[#213525] font-medium"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Quay lại Website người dùng</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
