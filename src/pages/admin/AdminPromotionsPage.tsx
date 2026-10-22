import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatVND, formatDateVN } from '../../utils/formatters';
import { Coupon, DiscountType, ApplicableScope } from '../../types';
import { Plus, Edit, Trash2, Power, Tag } from 'lucide-react';

export const AdminPromotionsPage: React.FC = () => {
  const { coupons, saveCoupon, deleteCoupon, showToast } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  // Form
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<DiscountType>('percent');
  const [discountValue, setDiscountValue] = useState<number>(10);
  const [minOrderValue, setMinOrderValue] = useState<number>(300000);
  const [startDate, setStartDate] = useState('2026-01-01');
  const [endDate, setEndDate] = useState('2026-12-31');
  const [usageLimit, setUsageLimit] = useState<number>(100);
  const [applicableTo, setApplicableTo] = useState<ApplicableScope>('all');

  const handleOpenAdd = () => {
    setEditingCoupon(null);
    setCode('');
    setDescription('');
    setDiscountType('percent');
    setDiscountValue(10);
    setMinOrderValue(300000);
    setStartDate(new Date().toISOString().split('T')[0]);
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    setEndDate(nextYear.toISOString().split('T')[0]);
    setUsageLimit(100);
    setApplicableTo('all');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Coupon) => {
    setEditingCoupon(c);
    setCode(c.code);
    setDescription(c.description);
    setDiscountType(c.discountType);
    setDiscountValue(c.discountValue);
    setMinOrderValue(c.minOrderValue);
    setStartDate(c.startDate);
    setEndDate(c.endDate);
    setUsageLimit(c.usageLimit);
    setApplicableTo(c.applicableTo);
    setIsModalOpen(true);
  };

  const handleToggleStatus = (c: Coupon) => {
    const updated: Coupon = {
      ...c,
      status: c.status === 'active' ? 'inactive' : 'active'
    };
    saveCoupon(updated);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      showToast('Vui lòng nhập mã voucher.', 'error');
      return;
    }
    if (discountValue <= 0) {
      showToast('Mức giảm giá phải lớn hơn 0.', 'error');
      return;
    }
    if (discountType === 'percent' && discountValue > 100) {
      showToast('Giảm theo phần trăm tối đa là 100%.', 'error');
      return;
    }

    const couponData: Coupon = {
      id: editingCoupon ? editingCoupon.id : `CP-${Date.now().toString().slice(-4)}`,
      code: code.trim().toUpperCase(),
      description: description.trim() || 'Ưu đãi dành cho khách hàng An Nhiên',
      discountType,
      discountValue: Number(discountValue),
      minOrderValue: Number(minOrderValue),
      startDate,
      endDate,
      usageLimit: Number(usageLimit),
      usedCount: editingCoupon ? editingCoupon.usedCount : 0,
      applicableTo,
      status: 'active'
    };

    saveCoupon(couponData);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E0DBCB]">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#1F2F23]">
            Quản Lý Mã Giảm Giá & Ưu Đãi
          </h2>
          <p className="text-xs text-[#5F7463] mt-0.5">
            Tạo và cấu hình các mã khuyến mãi áp dụng khi khách hàng đặt lịch hoặc mua mỹ phẩm
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="self-start sm:self-auto px-4 py-2 bg-[#3E5C44] hover:bg-[#304835] text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo mã ưu đãi mới</span>
        </button>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-2xl border border-[#DFDAC8] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9F5] border-b border-[#E0DBCB] text-[#556D5B] font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Mã Voucher</th>
                <th className="py-3.5 px-4">Mô tả</th>
                <th className="py-3.5 px-4">Mức giảm</th>
                <th className="py-3.5 px-4">Đơn tối thiểu</th>
                <th className="py-3.5 px-4">Hạn dùng</th>
                <th className="py-3.5 px-4">Lượt dùng</th>
                <th className="py-3.5 px-4">Phạm vi</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2EFE6]">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-[#FAF9F5]/70 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-[#203124]">
                    {c.code}
                  </td>
                  <td className="py-3.5 px-4 text-[#3C5140] max-w-xs">
                    {c.description}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-[#2F5237]">
                    {c.discountType === 'percent' ? `${c.discountValue}%` : formatVND(c.discountValue)}
                  </td>
                  <td className="py-3.5 px-4 tabular-nums">
                    {formatVND(c.minOrderValue)}
                  </td>
                  <td className="py-3.5 px-4 text-[#6A7E6E]">
                    {formatDateVN(c.endDate)}
                  </td>
                  <td className="py-3.5 px-4 tabular-nums">
                    {c.usedCount} / {c.usageLimit}
                  </td>
                  <td className="py-3.5 px-4 text-[11px] text-[#4F6452]">
                    {c.applicableTo === 'all' ? 'Toàn sàn' : c.applicableTo === 'products' ? 'Sản phẩm' : 'Dịch vụ'}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        c.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {c.status === 'active' ? 'Đang bật' : 'Tạm dừng'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(c)}
                        className="p-1.5 text-[#3E5C44] hover:bg-[#F2EFE6] rounded-lg transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(c)}
                        className="p-1.5 text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Bật/Tắt"
                      >
                        <Power className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteCoupon(c.id)}
                        className="p-1.5 text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Xóa mã"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-[#DFDAC8] space-y-4 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <h3 className="font-serif text-xl font-bold text-[#233527]">
              {editingCoupon ? 'Chỉnh sửa mã ưu đãi' : 'Tạo mã ưu đãi mới'}
            </h3>

            <form onSubmit={handleSaveForm} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#273B2C]">Mã Voucher *</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="Ví dụ: ANNHIEN20"
                    className="w-full p-2.5 bg-[#FAF9F5] border border-[#D5D0BF] rounded-xl text-xs uppercase font-mono tracking-wider text-[#273B2C] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#273B2C]">Phạm vi áp dụng</label>
                  <select
                    value={applicableTo}
                    onChange={(e) => setApplicableTo(e.target.value as any)}
                    className="w-full p-2.5 bg-[#FAF9F5] border border-[#D5D0BF] rounded-xl text-xs text-[#273B2C] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden"
                  >
                    <option value="all">Toàn sàn (Dịch vụ + Sản phẩm)</option>
                    <option value="products">Chỉ sản phẩm mỹ phẩm</option>
                    <option value="services">Chỉ dịch vụ spa</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#273B2C]">Mô tả chương trình</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ví dụ: Giảm 10% tổng hóa đơn cho thành viên"
                  className="w-full p-2.5 bg-[#FAF9F5] border border-[#D5D0BF] rounded-xl text-xs text-[#273B2C] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#273B2C]">Loại giảm giá</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full p-2.5 bg-[#FAF9F5] border border-[#D5D0BF] rounded-xl text-xs text-[#273B2C] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden"
                  >
                    <option value="percent">Phần trăm (%)</option>
                    <option value="fixed">Số tiền (VNĐ)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#273B2C]">Giá trị giảm *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    className="w-full p-2.5 bg-[#FAF9F5] border border-[#D5D0BF] rounded-xl text-xs text-[#273B2C] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#273B2C]">Đơn tối thiểu (VNĐ)</label>
                  <input
                    type="number"
                    min="0"
                    step="50000"
                    value={minOrderValue}
                    onChange={(e) => setMinOrderValue(Number(e.target.value))}
                    className="w-full p-2.5 bg-[#FAF9F5] border border-[#D5D0BF] rounded-xl text-xs text-[#273B2C] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#273B2C]">Ngày bắt đầu</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2.5 bg-[#FAF9F5] border border-[#D5D0BF] rounded-xl text-xs text-[#273B2C] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#273B2C]">Ngày kết thúc</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2.5 bg-[#FAF9F5] border border-[#D5D0BF] rounded-xl text-xs text-[#273B2C] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#273B2C]">Giới hạn tổng lượt sử dụng</label>
                <input
                  type="number"
                  min="1"
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(Number(e.target.value))}
                  className="w-full p-2.5 bg-[#FAF9F5] border border-[#D5D0BF] rounded-xl text-xs text-[#273B2C] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden"
                />
              </div>

              <div className="flex gap-2 pt-2 border-t border-[#EAE5D7]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 px-4 border border-[#D5D0BF] text-[#465E4B] rounded-xl font-semibold hover:bg-[#FAF9F5]"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-[#3E5C44] hover:bg-[#304835] text-white rounded-xl font-semibold"
                >
                  Lưu ưu đãi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
