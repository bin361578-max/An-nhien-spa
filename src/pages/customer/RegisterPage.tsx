import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { UserPlus, User, Mail, Phone } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const { register } = useApp();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim() || !email.trim() || !phone.trim()) {
      setErrorMsg('Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }

    const res = register(name, email, phone);
    if (res.success) {
      navigate('/account');
    } else {
      setErrorMsg(res.message || 'Lỗi khi đăng ký.');
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-8">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-[#EDF3EE] text-[#406847] rounded-2xl flex items-center justify-center mx-auto mb-2 border border-[#CFDFD2]">
          <UserPlus className="w-6 h-6" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-[#233527]">
          Đăng Ký Tài Khoản
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
              <User className="w-4 h-4 text-[#7A907E] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full pl-9 pr-3 py-2.5 bg-[#FAF9F5] border border-[#D5D0BF] rounded-xl text-xs text-[#273B2C] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#283C2D]">Địa chỉ Email *</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#7A907E] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nguyenvana@gmail.com"
                className="w-full pl-9 pr-3 py-2.5 bg-[#FAF9F5] border border-[#D5D0BF] rounded-xl text-xs text-[#273B2C] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#283C2D]">Số điện thoại *</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-[#7A907E] absolute left-3 top-1/2 -translate-y-1/2" />
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

          <button
            type="submit"
            className="w-full py-3 px-4 bg-[#425E47] hover:bg-[#344D39] text-white rounded-xl text-xs font-semibold transition-colors shadow-xs"
          >
            Đăng ký thành viên
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
