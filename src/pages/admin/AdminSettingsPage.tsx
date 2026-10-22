import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SpaSettings } from '../../types';
import { Save, RotateCcw, ShieldAlert, Check } from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const { settings, saveSettings, resetDemoData, showToast } = useApp();

  const [spaName, setSpaName] = useState(settings.spaName);
  const [hotline, setHotline] = useState(settings.hotline);
  const [email, setEmail] = useState(settings.email);
  const [address, setAddress] = useState(settings.address);
  const [openingHours, setOpeningHours] = useState(settings.openingHours);
  const [depositRatePercent, setDepositRatePercent] = useState<number>(
    Math.round((settings.depositRate || 0.3) * 100)
  );
  const [footerBio, setFooterBio] = useState(settings.footerBio);

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!spaName.trim()) {
      showToast('Vui lòng nhập tên spa.', 'error');
      return;
    }

    const updated: SpaSettings = {
      spaName: spaName.trim(),
      hotline: hotline.trim(),
      email: email.trim(),
      address: address.trim(),
      openingHours: openingHours.trim(),
      depositRate: Number(depositRatePercent) / 100,
      footerBio: footerBio.trim()
    };

    saveSettings(updated);
  };

  const handleReset = () => {
    resetDemoData();
    setShowResetConfirm(false);
  };

  return (
    <div className="max-w-4xl space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-[#E0DBCB]">
        <h2 className="font-serif text-2xl font-bold text-[#1F2F23]">
          Cài Đặt Hệ Thống Spa An Nhiên
        </h2>
        <p className="text-xs text-[#5F7463] mt-0.5">
          Cấu hình thông tin thương hiệu, hotline, tỷ lệ cọc giữ chỗ và thiết lập dữ liệu mẫu
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-2xl border border-[#DFDAC8] shadow-xs space-y-6">
        <h3 className="font-serif text-lg font-bold text-[#233527]">
          Thông Tin Hiển Thị Website
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-[#273B2C]">Tên thương hiệu Spa</label>
            <input
              type="text"
              required
              value={spaName}
              onChange={(e) => setSpaName(e.target.value)}
              className="w-full p-2.5 bg-[#FAF9F5] border border-[#D5D0BF] rounded-xl text-xs text-[#273B2C] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-[#273B2C]">Hotline liên hệ</label>
            <input
              type="text"
              required
              value={hotline}
              onChange={(e) => setHotline(e.target.value)}
              className="w-full p-2.5 bg-[#FAF9F5] border border-[#D5D0BF] rounded-xl text-xs text-[#273B2C] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-[#273B2C]">Email chăm sóc khách hàng</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 bg-[#FAF9F5] border border-[#D5D0BF] rounded-xl text-xs text-[#273B2C] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-[#273B2C]">Tỷ lệ đặt cọc mặc định (%)</label>
            <input
              type="number"
              min="10"
              max="100"
              required
              value={depositRatePercent}
              onChange={(e) => setDepositRatePercent(Number(e.target.value))}
              className="w-full p-2.5 bg-[#FAF9F5] border border-[#D5D0BF] rounded-xl text-xs text-[#273B2C] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden"
            />
            <span className="text-[10px] text-[#788E7D]">* Mặc định 30% cho các dịch vụ trị liệu</span>
          </div>

          <div className="sm:col-span-2 space-y-1">
            <label className="font-semibold text-[#273B2C]">Địa chỉ cơ sở Spa</label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-2.5 bg-[#FAF9F5] border border-[#D5D0BF] rounded-xl text-xs text-[#273B2C] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden"
            />
          </div>

          <div className="sm:col-span-2 space-y-1">
            <label className="font-semibold text-[#273B2C]">Giờ hoạt động</label>
            <input
              type="text"
              required
              value={openingHours}
              onChange={(e) => setOpeningHours(e.target.value)}
              className="w-full p-2.5 bg-[#FAF9F5] border border-[#D5D0BF] rounded-xl text-xs text-[#273B2C] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden"
            />
          </div>

          <div className="sm:col-span-2 space-y-1">
            <label className="font-semibold text-[#273B2C]">Lời giới thiệu chân trang (Footer Bio)</label>
            <textarea
              rows={3}
              value={footerBio}
              onChange={(e) => setFooterBio(e.target.value)}
              className="w-full p-2.5 bg-[#FAF9F5] border border-[#D5D0BF] rounded-xl text-xs text-[#273B2C] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-[#EAE5D7]">
          <button
            type="submit"
            className="py-2.5 px-6 bg-[#3E5C44] hover:bg-[#304835] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Lưu thay đổi cài đặt</span>
          </button>
        </div>
      </form>

      {/* Danger Zone: Restore Demo Data */}
      <div className="bg-rose-50/50 p-6 rounded-2xl border border-rose-200 shadow-xs space-y-4">
        <div>
          <h3 className="font-serif text-lg font-bold text-rose-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            <span>Khu Vực Quản Trị Dữ Liệu Demo</span>
          </h3>
          <p className="text-xs text-rose-800 leading-relaxed mt-1">
            Khi kết thúc buổi kiểm tra đồ án hoặc cần chạy lại kịch bản đánh giá từ đầu, bạn có thể khôi phục lại toàn bộ dữ liệu mẫu (8 dịch vụ, 8 sản phẩm, lịch hẹn mẫu, đơn hàng mẫu, coupons mẫu).
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowResetConfirm(true)}
          className="py-2.5 px-4 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Khôi phục dữ liệu mẫu ban đầu</span>
        </button>
      </div>

      {/* Confirm Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-[#DFDAC8] space-y-4 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
              <RotateCcw className="w-6 h-6" />
            </div>

            <div className="text-center space-y-2">
              <h4 className="font-serif text-xl font-bold text-[#233527]">
                Xác nhận khôi phục dữ liệu?
              </h4>
              <p className="text-xs text-[#5D7060] leading-relaxed">
                Tất cả dữ liệu thử nghiệm phát sinh sẽ được làm mới về dữ liệu mẫu chuẩn của đồ án An Nhiên Spa.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2 px-3 border border-[#D5D0BF] text-[#465E4B] rounded-xl text-xs font-semibold hover:bg-[#FAF9F5]"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="flex-1 py-2 px-3 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-semibold"
              >
                Đồng ý khôi phục
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
