import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { User } from '../../types';
import {
  Users,
  UserPlus,
  Lock,
  Unlock,
  KeyRound,
  Trash2,
  Eye,
  EyeOff,
  Mail,
  Phone,
  Briefcase,
  AlertCircle,
  Search,
  CheckCircle2,
  X
} from 'lucide-react';

export const AdminStaffPage: React.FC = () => {
  const { staffList, fetchStaffList, createStaff, updateStaffStatus, updateStaffPassword, deleteStaff, showToast } = useApp();

  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<User | null>(null);

  // New Staff Form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [notes, setNotes] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset Password Form
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  useEffect(() => {
    fetchStaffList();
  }, [fetchStaffList]);

  const filteredStaff = staffList.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || s.phone.includes(q);
  });

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim() || !email.trim() || !phone.trim() || !password) {
      setFormError('Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }

    if (password.length < 8) {
      setFormError('Mật khẩu nhân viên phải có ít nhất 8 ký tự để đảm bảo an toàn.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createStaff({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password,
        notes: notes.trim()
      });

      if (res.success) {
        setShowAddModal(false);
        setName('');
        setEmail('');
        setPhone('');
        setPassword('');
        setNotes('');
      } else {
        setFormError(res.error || 'Lỗi khi tạo tài khoản nhân viên.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenResetModal = (staff: User) => {
    setSelectedStaff(staff);
    setNewPassword('');
    setShowResetModal(true);
  };

  const handleConfirmResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStaff || !newPassword || newPassword.length < 8) {
      showToast('Mật khẩu mới phải có ít nhất 8 ký tự.', 'error');
      return;
    }

    const res = await updateStaffPassword(selectedStaff.id, newPassword);
    if (res.success) {
      setShowResetModal(false);
      setSelectedStaff(null);
      setNewPassword('');
    }
  };

  const handleToggleStatus = async (staff: User) => {
    const nextStatus = staff.status === 'active' ? 'blocked' : 'active';
    await updateStaffStatus(staff.id, nextStatus);
  };

  const handleDeleteStaff = async (staff: User) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa tài khoản nhân viên "${staff.name}"?`)) {
      await deleteStaff(staff.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DFDAC8]">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#233527]">
            Quản Lý Nhân Viên & Phân Quyền
          </h1>
          <p className="text-xs text-[#5D7060] mt-1">
            Tạo tài khoản nhân viên kỹ thuật, cấp quyền truy cập bàn làm việc và bảo vệ mật khẩu an toàn
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowAddModal(true);
            setFormError(null);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#425E47] hover:bg-[#344D39] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Thêm Nhân Viên Mới</span>
        </button>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-[#DFDAC8] shadow-xs">
          <div className="text-[11px] font-semibold text-[#697D6E] uppercase tracking-wider">Tổng nhân viên</div>
          <div className="text-2xl font-bold text-[#233527] mt-1 tabular-nums">{staffList.length}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-xs">
          <div className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">Đang hoạt động</div>
          <div className="text-2xl font-bold text-emerald-800 mt-1 tabular-nums">
            {staffList.filter((s) => s.status === 'active').length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-rose-200 shadow-xs">
          <div className="text-[11px] font-semibold text-rose-700 uppercase tracking-wider">Đang tạm khóa</div>
          <div className="text-2xl font-bold text-rose-800 mt-1 tabular-nums">
            {staffList.filter((s) => s.status === 'blocked').length}
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-sm">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo tên, email, số điện thoại..."
          className="w-full pl-8 pr-3 py-2 bg-white border border-[#D5D0BF] rounded-xl text-xs text-[#233527] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden"
        />
        <Search className="w-3.5 h-3.5 text-[#8A9C8D] absolute left-2.5 top-3 pointer-events-none" />
      </div>

      {/* Staff Accounts Table */}
      <div className="bg-white rounded-2xl border border-[#DFDAC8] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9F5] border-b border-[#EBE7D8] text-[11px] font-semibold text-[#697D6E] uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Họ và tên</th>
                <th className="px-5 py-3.5">Email & Điện thoại</th>
                <th className="px-5 py-3.5">Chuyên môn / Ghi chú</th>
                <th className="px-5 py-3.5">Trạng thái</th>
                <th className="px-5 py-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0ECE1]">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-[#697D6E]">
                    Chưa có tài khoản nhân viên nào được tạo. Nhấn "Thêm Nhân Viên Mới" để thiết lập.
                  </td>
                </tr>
              ) : (
                filteredStaff.map((staff) => (
                  <tr key={staff.id} className="hover:bg-[#FAF9F5] transition-colors">
                    <td className="px-5 py-3.5 font-semibold text-[#233527]">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#EDF3EE] text-[#34593C] flex items-center justify-center font-bold text-xs shrink-0">
                          {staff.name.charAt(0)}
                        </div>
                        <div>
                          <div>{staff.name}</div>
                          <div className="text-[10px] text-[#7A8E7E] font-normal">Mã: {staff.id}</div>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-[#556958]">
                      <div>{staff.email}</div>
                      <div className="text-[11px] text-[#7A8E7E]">{staff.phone}</div>
                    </td>

                    <td className="px-5 py-3.5 text-[#556958]">
                      {staff.notes || 'Nhân viên kỹ thuật trị liệu spa'}
                    </td>

                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${
                          staff.status === 'active'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {staff.status === 'active' ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Đang hoạt động</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3 h-3" />
                            <span>Đang tạm khóa</span>
                          </>
                        )}
                      </span>
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Reset Password Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenResetModal(staff)}
                          className="p-1.5 text-[#556958] hover:text-[#233527] hover:bg-[#EAE5D6] rounded-lg transition-colors cursor-pointer"
                          title="Đổi mật khẩu nhân viên"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>

                        {/* Lock / Unlock Status Toggle */}
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(staff)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            staff.status === 'active'
                              ? 'text-amber-700 hover:bg-amber-50'
                              : 'text-emerald-700 hover:bg-emerald-50'
                          }`}
                          title={staff.status === 'active' ? 'Khóa tài khoản' : 'Kích hoạt tài khoản'}
                        >
                          {staff.status === 'active' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                        </button>

                        {/* Delete Staff Button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteStaff(staff)}
                          className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Xóa tài khoản nhân viên"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE STAFF MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-[#DFDAC8] space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-[#ECE7D9]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#EDF3EE] text-[#34593C] flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#233527]">Thêm Tài Khoản Nhân Viên</h3>
                  <p className="text-[11px] text-[#697D6E]">Cấp quyền truy cập bàn làm việc kỹ thuật viên</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-[#697D6E] hover:text-[#233527] rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 leading-relaxed">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateStaff} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#283C2D]">Họ và tên nhân viên *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Lê Thị Hằng"
                  className="w-full p-2.5 bg-[#FAF9F5] border border-[#D5D0BF] rounded-xl text-xs text-[#273B2C] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#283C2D]">Email công việc *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hang.le@annhienspa.vn"
                  className="w-full p-2.5 bg-[#FAF9F5] border border-[#D5D0BF] rounded-xl text-xs text-[#273B2C] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#283C2D]">Số điện thoại *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0988112233"
                  className="w-full p-2.5 bg-[#FAF9F5] border border-[#D5D0BF] rounded-xl text-xs text-[#273B2C] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#283C2D]">
                  Mật khẩu ban đầu * (Tối thiểu 8 ký tự)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mật khẩu bảo mật..."
                    className="w-full pl-3 pr-10 py-2.5 bg-[#FAF9F5] border border-[#D5D0BF] rounded-xl text-xs text-[#273B2C] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-[#7A907E] hover:text-[#233527] cursor-pointer"
                    title={showPassword ? 'Ẩn mật khẩu' : 'Hiển thị mật khẩu'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#283C2D]">Chuyên môn / Ghi chú</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ví dụ: Kỹ thuật viên chăm sóc da chuyên sâu"
                  className="w-full p-2.5 bg-[#FAF9F5] border border-[#D5D0BF] rounded-xl text-xs text-[#273B2C] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-[#DFDAC8] text-[#556958] rounded-xl text-xs font-medium hover:bg-gray-50 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-[#425E47] hover:bg-[#344D39] text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Đang tạo...' : 'Tạo Tài Khoản Nhân Viên'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {showResetModal && selectedStaff && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-[#DFDAC8] space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-[#ECE7D9]">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#34593C]" />
                <h3 className="font-serif text-base font-bold text-[#233527]">Đổi Mật Khẩu Nhân Viên</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="p-1 text-[#697D6E] hover:text-[#233527]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#556958]">
              Cấp mật khẩu mới cho nhân viên: <strong>{selectedStaff.name}</strong> ({selectedStaff.email})
            </p>

            <form onSubmit={handleConfirmResetPassword} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#283C2D]">Mật khẩu mới (Tối thiểu 8 ký tự)</label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nhập mật khẩu mới..."
                    className="w-full pl-3 pr-10 py-2.5 bg-[#FAF9F5] border border-[#D5D0BF] rounded-xl text-xs text-[#273B2C] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-2.5 text-[#7A907E] hover:text-[#233527]"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="px-3.5 py-1.5 border border-[#DFDAC8] text-[#556958] rounded-xl text-xs font-medium hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#425E47] hover:bg-[#344D39] text-white rounded-xl text-xs font-semibold shadow-xs"
                >
                  Lưu mật khẩu mới
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
