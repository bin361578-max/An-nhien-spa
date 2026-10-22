import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StorageService } from '../../services/storage';
import { generateMessageId } from '../../utils/formatters';
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2, MessageSquare } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { settings, showToast } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !message.trim()) {
      showToast('Vui lòng điền đầy đủ họ tên, số điện thoại và nội dung tin nhắn.', 'error');
      return;
    }

    const newMessage = {
      id: generateMessageId(),
      name: name.trim(),
      email: email.trim() || 'khongco@annhienspa.demo',
      phone: phone.trim(),
      subject: subject.trim() || 'Tư vấn dịch vụ spa',
      message: message.trim(),
      createdAt: new Date().toISOString(),
      status: 'unread' as const
    };

    StorageService.addMessage(newMessage);
    setIsSubmitted(true);
    showToast('Gửi tin nhắn liên hệ thành công! An Nhiên sẽ phản hồi sớm nhất.', 'success');

    // Reset form
    setName('');
    setEmail('');
    setPhone('');
    setSubject('');
    setMessage('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#5C7E63]">
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Kết nối cùng An Nhiên</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#233527]">
          Liên Hệ & Tư Vấn Liệu Trình
        </h1>
        <p className="text-sm text-[#556958] leading-relaxed">
          Đội ngũ tư vấn viên luôn sẵn lòng giải đáp mọi thắc mắc về các gói chăm sóc da và trị liệu cơ thể.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Info card */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#FAF9F5] p-6 sm:p-8 rounded-2xl border border-[#DFDAC8] shadow-xs space-y-6">
            <h2 className="font-serif text-xl font-bold text-[#233527]">
              Thông Tin Spa
            </h2>

            <ul className="space-y-4 text-xs sm:text-sm text-[#4E6252]">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#5C8263] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-[#273B2C] font-semibold">Địa chỉ:</strong>
                  <span>{settings.address}</span>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#5C8263] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-[#273B2C] font-semibold">Hotline hỗ trợ:</strong>
                  <span>{settings.hotline}</span>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#5C8263] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-[#273B2C] font-semibold">Hòm thư điện tử:</strong>
                  <span>{settings.email}</span>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-[#5C8263] shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-[#273B2C] font-semibold">Giờ mở cửa đón khách:</strong>
                  <span>{settings.openingHours}</span>
                </div>
              </li>
            </ul>

            <div className="p-4 bg-white rounded-xl border border-[#DFDAC8] text-xs text-[#5D7160] space-y-1">
              <strong className="text-[#273B2C] block">Chỉ dẫn đỗ xe:</strong>
              <p>Spa có bãi đỗ xe máy và ô tô miễn phí ngay trước sảnh đón khách.</p>
            </div>
          </div>
        </div>

        {/* Form message */}
        <div className="lg:col-span-7">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#DFDAC8] shadow-xs space-y-6">
            <h2 className="font-serif text-xl font-bold text-[#233527]">
              Gửi Tin Nhắn Cho Chúng Tôi
            </h2>

            {isSubmitted ? (
              <div className="p-6 bg-[#F3F8F4] border border-[#BBD7BF] rounded-2xl text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-[#3C6445] mx-auto" />
                <h3 className="font-serif text-lg font-bold text-[#233527]">Đã gửi tin nhắn thành công!</h3>
                <p className="text-xs text-[#526955]">
                  Cảm ơn bạn đã để lại lời nhắn. Quản trị viên An Nhiên Spa đã tiếp nhận và sẽ liên hệ lại với bạn qua số điện thoại sớm nhất.
                </p>
                <button
                  type="button"
                  onClick={() => setIsSubmitted(false)}
                  className="text-xs font-semibold text-[#425E47] hover:underline"
                >
                  Gửi thêm một tin nhắn khác
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#273B2C]">Họ và tên *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Nguyễn Thu Trang"
                      className="w-full p-2.5 bg-[#FAF9F5] border border-[#D5D0BF] rounded-xl text-xs text-[#273B2C] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#273B2C]">Số điện thoại *</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0912345678"
                      className="w-full p-2.5 bg-[#FAF9F5] border border-[#D5D0BF] rounded-xl text-xs text-[#273B2C] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-semibold text-[#273B2C]">Email liên hệ</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="thutrang@gmail.com"
                      className="w-full p-2.5 bg-[#FAF9F5] border border-[#D5D0BF] rounded-xl text-xs text-[#273B2C] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-semibold text-[#273B2C]">Chủ đề cần tư vấn</label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Ví dụ: Tư vấn gói chăm sóc da mặt cho da mụn"
                      className="w-full p-2.5 bg-[#FAF9F5] border border-[#D5D0BF] rounded-xl text-xs text-[#273B2C] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden"
                    />
                  </div>

                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-semibold text-[#273B2C]">Nội dung tin nhắn *</label>
                    <textarea
                      rows={4}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Quý khách vui lòng chia sẻ nhu cầu hoặc câu hỏi chi tiết..."
                      className="w-full p-2.5 bg-[#FAF9F5] border border-[#D5D0BF] rounded-xl text-xs text-[#273B2C] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="py-3 px-6 bg-[#425E47] hover:bg-[#344D39] text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 shadow-xs"
                >
                  <Send className="w-4 h-4" />
                  <span>Gửi tin nhắn ngay</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
