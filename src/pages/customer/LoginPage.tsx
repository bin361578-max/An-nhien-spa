import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { LogIn, User, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login, currentUser } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // If already logged in
  if (currentUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-[#233527]">Bạn đã đăng nhập</h2>
        <p className="text-sm text-[#5C7060]">Đang đăng nhập với tên: <strong>{currentUser.name}</strong> ({currentUser.email})</p>
        <div className="flex justify-center gap-3 pt-2">
          <Link
            to="/account"
            className="px-5 py-2.5 bg-[#425E47] text-white rounded-xl text-xs font-semibold hover:bg-[#344D39]"
          >
            Quản lý tài khoản
          </Link>
          <Link
            to="/booking"
            className="px-5 py-2.5 border border-[#DFDAC8] text-[#293E2F] rounded-xl text-xs font-semibold hover:bg-[#F2EFE6]"
          >
            Đặt lịch hẹn
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!email.trim()) {
      setErrorMsg('Vui lòng nhập địa chỉ email.');
      return;
    }

    const res = login(email.trim(), 'customer');
    if (res.success) {
      navigate('/account');
    } else {
      setErrorMsg(res.message || 'Lỗi khi đăng nhập.');
    }
  };

  const handleQuickDemoLogin = (demoEmail: string) => {
    setEmail(demoEmail);
    const res = login(demoEmail, 'customer');
    if (res.success) {
      navigate('/account');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-8">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-[#EDF3EE] text-[#406847] rounded-2xl flex items-center justify-center mx-auto mb-2 border border-[#CFDFD2]">
          <User className="w-6 h-6" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-[#233527]">
          Đăng Nhập Khách Hàng
        </h1>
        <p className="text-xs text-[#5E7262]">
          Xem lịch hẹn cá nhân, lịch sử đơn hàng và tham gia vòng quay ưu đãi
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#DFDAC8] shadow-xs space-y-6">
        {/* Quick demo accounts for grading evaluation */}
        <div className="bg-[#FAF9F5] p-3.5 rounded-xl border border-[#E3DEC9] space-y-2">
          <div className="text-xs font-semibold text-[#273B2C] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#4D7453]" />
            <span>Tài khoản kiểm tra nhanh (Dành cho Giảng viên):</span>
          </div>
          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('khachhang@gmail.com')}
              className="text-left text-xs p-2 rounded-lg bg-white hover:bg-[#F0EEE2] border border-[#DDD8C7] flex items-center justify-between transition-colors"
            >
              <div>
                <strong className="block text-[#233527]">Nguyễn Thu Trang (Khách thân thiết)</strong>
                <span className="text-[11px] text-[#697D6E]">khachhang@gmail.com</span>
              </div>
              <span className="text-[10px] text-[#3E6144] font-semibold bg-[#E4EFE6] px-2 py-0.5 rounded">Chọn</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('lananh@gmail.com')}
              className="text-left text-xs p-2 rounded-lg bg-white hover:bg-[#F0EEE2] border border-[#DDD8C7] flex items-center justify-between transition-colors"
            >
              <div>
                <strong className="block text-[#233527]">Trần Lan Anh</strong>
                <span className="text-[11px] text-[#697D6E]">lananh@gmail.com</span>
              </div>
              <span className="text-[10px] text-[#3E6144] font-semibold bg-[#E4EFE6] px-2 py-0.5 rounded">Chọn</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
              {errorMsg}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#283C2D]">Địa chỉ Email *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ví dụ: khachhang@gmail.com"
              className="w-full p-2.5 bg-[#FAF9F5] border border-[#D5D0BF] rounded-xl text-xs text-[#273B2C] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden"
            />
            <p className="text-[10px] text-[#718575] mt-1">
              (Hệ thống demo: nếu email chưa tồn tại, hệ thống sẽ tự động khởi tạo tài khoản mới cho bạn)
            </p>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-[#425E47] hover:bg-[#344D39] text-white rounded-xl text-xs font-semibold transition-colors shadow-xs flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>Đăng nhập ngay</span>
          </button>
        </form>

        <div className="pt-2 text-center text-xs text-[#627765] space-y-3">
          <div>
            Chưa có tài khoản?{' '}
            <Link to="/register" className="font-semibold text-[#3A5D40] hover:underline">
              Đăng ký tài khoản mới
            </Link>
          </div>

          <div className="pt-2 border-t border-[#F0EBE0]">
            <Link
              to="/admin/login"
              className="inline-flex items-center gap-1.5 text-xs text-[#527058] hover:text-[#213526] font-medium"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Đăng nhập dành cho Quản Trị Viên (Admin) →</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
