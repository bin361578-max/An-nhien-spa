import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { UserPlus, User, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useApp();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim() || !email.trim() || !phone.trim() || !password) {
      setErrorMsg('Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Mật khẩu phải có độ dài ít nhất 6 ký tự.');
      return;
    }

    setLoading(true);
    try {
      const res = await register(name.trim(), email.trim(), phone.trim(), password);
      if (res.success) {
        navigate('/account');
      } else {
        setErrorMsg(res.message || 'Lỗi khi đăng ký.');
      }
    } catch {
      setErrorMsg('Không thể kết nối đến máy chủ.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-8">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-[#EDF3EE] text-[#406847] rounded-2xl flex items-center justify-center mx-auto mb-2 border border-[#CFDFD2]">
          <UserPlus className="w-6 h-6" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-[#233527]">
          Đăng Ký Tài Khoản Khách Hàng
        </h1>
        <p className="text-xs text-[#5E7262]">
          Tạo tài khoản thành viên An Nhiên để nhận ưu đãi và quản lý lịch hẹn
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#DFDAC8] shadow-xs space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
              {errorMsg}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#283C2D]">Họ và tên *</label>
            <div className="relative">
              <User className="w-4 h-4 text-[#7A907E] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nguyễn Thu Trang"
                className="w-full pl-9 pr-3 py-2.5 bg-[#FAF9F5] border border-[#D5D0BF] rounded-xl text-xs text-[#273B2C] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#283C2D]">Địa chỉ Email *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#7A907E] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="khachhang@gmail.com"
                className="w-full pl-9 pr-3 py-2.5 bg-[#FAF9F5] border border-[#D5D0BF] rounded-xl text-xs text-[#273B2C] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#283C2D]">Số điện thoại *</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-[#7A907E] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0912345678"
                className="w-full pl-9 pr-3 py-2.5 bg-[#FAF9F5] border border-[#D5D0BF] rounded-xl text-xs text-[#273B2C] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#283C2D]">Mật khẩu * (Tối thiểu 6 ký tự)</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#7A907E] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu an toàn..."
                className="w-full pl-9 pr-10 py-2.5 bg-[#FAF9F5] border border-[#D5D0BF] rounded-xl text-xs text-[#273B2C] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A907E] hover:text-[#233527] focus:outline-hidden cursor-pointer"
                title={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
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
              <UserPlus className="w-4 h-4" />
            )}
            <span>Đăng ký thành viên</span>
          </button>
        </form>

        <div className="text-center text-xs text-[#627765]">
          Đã có tài khoản?{' '}
          <Link to="/login" className="font-semibold text-[#3A5D40] hover:underline">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  );
};
