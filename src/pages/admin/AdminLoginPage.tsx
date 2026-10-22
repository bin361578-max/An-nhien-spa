import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { ShieldCheck, Lock, Mail, ArrowRight, ArrowLeft } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const { login, currentUser } = useApp();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@annhienspa.demo');
  const [password, setPassword] = useState('Admin123!');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // If already logged in as admin
  if (currentUser && currentUser.role === 'admin') {
    navigate('/admin');
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (email.trim().toLowerCase() !== 'admin@annhienspa.demo') {
      setErrorMsg('Tài khoản quản trị viên demo là: admin@annhienspa.demo');
      return;
    }

    const res = login(email.trim(), 'admin');
    if (res.success) {
      navigate('/admin');
    } else {
      setErrorMsg(res.message || 'Lỗi khi đăng nhập quản trị.');
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
            Phân hệ quản lý nội bộ hệ thống An Nhiên Spa
          </p>
        </div>

        {/* Demo Credentials Box */}
        <div className="bg-[#FAF9F5] p-3.5 rounded-xl border border-[#DFDAC8] text-xs space-y-1 text-[#3B4F3F]">
          <div className="font-semibold text-[#233527]">Thông tin đăng nhập demo dành cho Giảng viên:</div>
          <div>• Email: <code className="bg-[#EAE5D6] px-1.5 py-0.5 rounded font-mono text-[#1E2E21]">admin@annhienspa.demo</code></div>
          <div>• Mật khẩu: <code className="bg-[#EAE5D6] px-1.5 py-0.5 rounded font-mono text-[#1E2E21]">Admin123!</code></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
              {errorMsg}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#283C2D]">Email Quản trị</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#7A907E] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-[#FAF9F5] border border-[#D5D0BF] rounded-xl text-xs text-[#273B2C] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#283C2D]">Mật khẩu</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#7A907E] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-[#FAF9F5] border border-[#D5D0BF] rounded-xl text-xs text-[#273B2C] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-[#3E5C44] hover:bg-[#304835] text-white rounded-xl text-xs font-semibold transition-colors shadow-xs flex items-center justify-center gap-2"
          >
            <span>Vào Bảng Điều Khiển Quản Trị</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

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
