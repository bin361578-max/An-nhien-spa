import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatVND, formatDateVN } from '../../utils/formatters';
import { StorageService } from '../../services/storage';
import { Gift, Copy, Check, Sparkles, Tag, AlertCircle, Trophy, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

const WHEEL_PRIZES = [
  { label: 'Giảm 10% Toàn Sàn', code: 'ANNHIEN10', type: 'coupon' },
  { label: 'Chúc Bạn May Mắn', code: '', type: 'none' },
  { label: 'Giảm 20.000đ', code: 'GIAM20K', type: 'coupon' },
  { label: 'Giảm 15% Mỹ Phẩm', code: 'ANNHIEN15', type: 'coupon' },
  { label: 'Tặng Tinh Dầu 10ml', code: 'TANGTINHOAU', type: 'gift' },
  { label: 'Giảm 5% Liệu Trình', code: 'ANNHIEN5', type: 'coupon' }
];

export const PromotionsPage: React.FC = () => {
  const { coupons, currentUser, showToast } = useApp();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Wheel state
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [wonPrize, setWonPrize] = useState<(typeof WHEEL_PRIZES)[0] | null>(null);

  const activeCoupons = coupons.filter((c) => c.status === 'active');

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showToast(`Đã sao chép mã: ${code}`, 'success');
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleSpinWheel = () => {
    if (!currentUser) {
      showToast('Vui lòng đăng nhập để tham gia vòng quay may mắn!', 'info');
      return;
    }

    if (isSpinning) return;

    // Check spin allowance
    const spinRecord = StorageService.getSpinRecord(currentUser.id);
    const today = new Date().toISOString().split('T')[0];
    if (spinRecord.lastSpunDate === today && spinRecord.count >= 1) {
      showToast('Hôm nay bạn đã dùng hết lượt quay miễn phí. Vui lòng quay lại vào ngày mai!', 'info');
      return;
    }

    setIsSpinning(true);
    setWonPrize(null);

    // Pick random prize
    const prizeIndex = Math.floor(Math.random() * WHEEL_PRIZES.length);
    const prize = WHEEL_PRIZES[prizeIndex];

    // Compute angle: each slice is 60deg (360/6).
    // Center of slice i is i * 60 + 30.
    // Extra full spins (5 spins = 1800deg)
    const sliceAngle = 360 / WHEEL_PRIZES.length;
    const targetAngle = 360 * 5 + (360 - (prizeIndex * sliceAngle + sliceAngle / 2));

    setRotationAngle((prev) => prev + targetAngle);

    setTimeout(() => {
      setIsSpinning(false);
      setWonPrize(prize);
      StorageService.recordSpin(currentUser.id);

      if (prize.type !== 'none') {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
        showToast(`Chúc mừng! Bạn đã trúng phần quà: ${prize.label}`, 'success');
      } else {
        showToast('Chúc bạn may mắn lần sau!', 'info');
      }
    }, 3800);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#5C7E63]">
          <Gift className="w-3.5 h-3.5" />
          <span>Chương trình ưu đãi An Nhiên</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#233527]">
          Ưu Đãi & Vòng Quay May Mắn
        </h1>
        <p className="text-sm text-[#556958] leading-relaxed">
          Săn các phiếu giảm giá dịch vụ spa và sản phẩm dưỡng da thiên nhiên mỗi ngày.
        </p>
      </div>

      {/* LUCKY WHEEL MINI-GAME */}
      <section className="bg-gradient-to-b from-[#2E4534] to-[#1E2E22] rounded-3xl p-6 sm:p-12 text-white shadow-xl border border-[#435F4A] space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#BCE0C3] bg-white/10 px-3 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Mini-Game Nhận Quà</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold">
            Vòng Quay May Mắn An Nhiên
          </h2>
          <p className="text-xs sm:text-sm text-[#C8D9CB]">
            {currentUser
              ? `Chào ${currentUser.name}! Mỗi ngày bạn nhận được 1 lượt quay miễn phí.`
              : 'Đăng nhập ngay để nhận 1 lượt quay may mắn mỗi ngày!'}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-center gap-10">
          {/* Wheel Graphic */}
          <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center">
            {/* Top pointer marker */}
            <div className="absolute -top-3 z-20 w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-t-[24px] border-t-amber-400 drop-shadow-md" />

            {/* Rotating Wheel Container */}
            <div
              style={{
                transform: `rotate(${rotationAngle}deg)`,
                transition: isSpinning ? 'transform 3.8s cubic-bezier(0.15, 0.95, 0.35, 1)' : 'none'
              }}
              className="w-full h-full rounded-full border-4 border-amber-300/40 shadow-2xl relative overflow-hidden flex items-center justify-center bg-[#25392A]"
            >
              {/* Slices rendered with conical background or SVG */}
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {WHEEL_PRIZES.map((_, i) => {
                  const startAngle = i * 60;
                  const endAngle = (i + 1) * 60;
                  const x1 = 50 + 50 * Math.cos((Math.PI * startAngle) / 180);
                  const y1 = 50 + 50 * Math.sin((Math.PI * startAngle) / 180);
                  const x2 = 50 + 50 * Math.cos((Math.PI * endAngle) / 180);
                  const y2 = 50 + 50 * Math.sin((Math.PI * endAngle) / 180);
                  const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;
                  const colors = ['#38543E', '#2B4231', '#45674D', '#233829', '#3D5C44', '#1E3123'];

                  return <path key={i} d={pathData} fill={colors[i]} stroke="#4A6E50" strokeWidth="0.5" />;
                })}
              </svg>

              {/* Labels on each slice */}
              {WHEEL_PRIZES.map((prize, idx) => {
                const angle = idx * 60 + 30;
                return (
                  <div
                    key={idx}
                    style={{
                      transform: `rotate(${angle}deg) translateY(-85px)`,
                      transformOrigin: 'center center'
                    }}
                    className="absolute text-[10px] sm:text-[11px] font-bold text-[#E5F2E6] text-center w-20 pointer-events-none drop-shadow-xs"
                  >
                    {prize.label}
                  </div>
                );
              })}

              {/* Center Hub */}
              <div className="absolute w-14 h-14 rounded-full bg-[#16241A] border-2 border-amber-300 text-amber-300 flex items-center justify-center font-bold text-xs shadow-inner">
                AN
              </div>
            </div>
          </div>

          {/* Controls & Result Card */}
          <div className="max-w-sm w-full space-y-4">
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 space-y-4">
              <div className="text-center space-y-1">
                <div className="text-xs uppercase tracking-wider text-[#BCE0C3] font-semibold">
                  Kết quả lượt quay
                </div>
                {wonPrize ? (
                  <div className="space-y-2 pt-2">
                    <div className="w-10 h-10 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center mx-auto">
                      <Trophy className="w-5 h-5" />
                    </div>
                    <div className="text-lg font-serif font-bold text-white">{wonPrize.label}</div>
                    {wonPrize.code ? (
                      <div className="p-3 bg-[#1B291F] rounded-xl border border-white/15 flex items-center justify-between">
                        <div>
                          <div className="text-[10px] text-[#A6C4AC]">Mã voucher:</div>
                          <div className="font-mono text-sm font-bold text-amber-300">{wonPrize.code}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(wonPrize.code)}
                          className="px-3 py-1.5 bg-[#425E47] hover:bg-[#344D39] text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                        >
                          {copiedCode === wonPrize.code ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          <span>Sao chép</span>
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-[#CBD8CD]">Cảm ơn bạn đã tham gia! Hẹn gặp lại vào ngày mai nhé.</p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-[#CBD8CD] py-4">
                    Nhấn nút bên dưới để bắt đầu quay vòng quay may mắn!
                  </p>
                )}
              </div>

              <button
                type="button"
                disabled={isSpinning}
                onClick={handleSpinWheel}
                className="w-full py-3.5 px-4 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-[#1C2C20] rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
                <span>{isSpinning ? 'Đang quay...' : 'Bắt đầu quay may mắn'}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ACTIVE COUPONS LIST */}
      <section className="space-y-6">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#233527]">
            Danh Sách Mã Giảm Giá Đang Có Hiệu Lực
          </h2>
          <p className="text-xs text-[#637766] mt-0.5">
            Sao chép mã và nhập tại bước xem giỏ hàng để được trừ tiền tự động
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeCoupons.map((coupon) => (
            <div
              key={coupon.id}
              className="bg-white p-5 rounded-2xl border border-[#DFDAC8] shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow relative overflow-hidden"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-base font-bold text-[#273B2C] bg-[#F1EFE6] px-2.5 py-1 rounded-lg border border-[#E0DBCB]">
                    {coupon.code}
                  </span>
                  <span className="text-[11px] font-semibold text-[#3D6444] bg-[#EDF4EE] px-2 py-0.5 rounded">
                    {coupon.discountType === 'percent'
                      ? `Giảm ${coupon.discountValue}%`
                      : `Giảm ${formatVND(coupon.discountValue)}`}
                  </span>
                </div>

                <p className="text-xs text-[#4F6453] leading-relaxed pt-1">
                  {coupon.description}
                </p>

                <div className="text-[11px] text-[#718575] space-y-0.5 pt-2 border-t border-[#F0EBE0]">
                  <div>• Đơn tối thiểu: <strong>{formatVND(coupon.minOrderValue)}</strong></div>
                  <div>• Hạn dùng: Đến hết {formatDateVN(coupon.endDate)}</div>
                  <div>• Áp dụng: {coupon.applicableTo === 'all' ? 'Toàn bộ dịch vụ & sản phẩm' : coupon.applicableTo === 'products' ? 'Sản phẩm mỹ phẩm' : 'Dịch vụ spa'}</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleCopyCode(coupon.code)}
                className="w-full py-2 px-3 bg-[#FAF9F5] hover:bg-[#F2EFE6] border border-[#DDD8C7] rounded-xl text-xs font-semibold text-[#293E2F] flex items-center justify-center gap-1.5 transition-colors"
              >
                {copiedCode === coupon.code ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Đã sao chép!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#5F7865]" />
                    <span>Sao chép mã</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
