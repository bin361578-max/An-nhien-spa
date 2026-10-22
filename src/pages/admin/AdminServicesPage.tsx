import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatVND } from '../../utils/formatters';
import { ServiceItem, ServiceCategory } from '../../types';
import { Plus, Edit, Power, Search, Clock, Sparkles } from 'lucide-react';

export const AdminServicesPage: React.FC = () => {
  const { services, saveService, toggleServiceStatus, showToast } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  // Modal form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);

  // Form inputs
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ServiceCategory>('facial');
  const [price, setPrice] = useState<number>(450000);
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('/src/assets/images/service_facial_treatment_1792632797197.jpg');

  const filteredServices = services.filter((s) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return s.name.toLowerCase().includes(q) || s.categoryName.toLowerCase().includes(q);
  });

  const categoryNameMap: Record<ServiceCategory, string> = {
    facial: 'Chăm sóc da mặt',
    massage: 'Massage thư giãn',
    body: 'Chăm sóc cơ thể',
    skincare_treatment: 'Liệu trình dưỡng da',
    intensive: 'Chăm sóc chuyên sâu'
  };

  const handleOpenAdd = () => {
    setEditingService(null);
    setName('');
    setCategory('facial');
    setPrice(450000);
    setDurationMinutes(60);
    setDescription('');
    setImageUrl('/src/assets/images/service_facial_treatment_1792632797197.jpg');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (srv: ServiceItem) => {
    setEditingService(srv);
    setName(srv.name);
    setCategory(srv.category);
    setPrice(srv.price);
    setDurationMinutes(srv.durationMinutes);
    setDescription(srv.description);
    setImageUrl(srv.imageUrl);
    setIsModalOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Vui lòng nhập tên dịch vụ.', 'error');
      return;
    }
    if (price <= 0) {
      showToast('Giá dịch vụ phải lớn hơn 0.', 'error');
      return;
    }
    if (durationMinutes <= 0) {
      showToast('Thời lượng phải lớn hơn 0 phút.', 'error');
      return;
    }

    const serviceData: ServiceItem = {
      id: editingService ? editingService.id : `SRV-${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      category,
      categoryName: categoryNameMap[category] || 'Dịch vụ spa',
      description: description.trim() || 'Liệu trình chăm sóc thư giãn thiên nhiên chuẩn mực.',
      fullDescription: editingService?.fullDescription || description.trim(),
      price: Number(price),
      durationMinutes: Number(durationMinutes),
      imageUrl: imageUrl.trim() || '/src/assets/images/service_facial_treatment_1792632797197.jpg',
      steps: editingService?.steps || [
        'Đón tiếp & ngâm chân thảo mộc',
        'Thực hiện liệu trình chuyên sâu',
        'Thư giãn dưỡng nhan'
      ],
      benefits: editingService?.benefits || [
        'Cung cấp độ ẩm mịn màng cho làn da',
        'Giải tỏa đau nhức căng thẳng'
      ],
      notes: editingService?.notes || 'Vui lòng báo trước với nhân viên nếu có tiền sử dị ứng.',
      status: editingService ? editingService.status : 'active'
    };

    saveService(serviceData);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E0DBCB]">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#1F2F23]">
            Quản Lý Menu Dịch Vụ Spa
          </h2>
          <p className="text-xs text-[#5F7463] mt-0.5">
            Quản lý bảng giá, thời lượng và trạng thái cung cấp dịch vụ trên website
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="self-start sm:self-auto px-4 py-2 bg-[#3E5C44] hover:bg-[#304835] text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm dịch vụ mới</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-[#DFDAC8] shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-[#7A907E]" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm tên dịch vụ, danh mục..."
          className="w-full bg-transparent text-xs text-[#243527] focus:outline-hidden"
        />
      </div>

      {/* Services Table */}
      <div className="bg-white rounded-2xl border border-[#DFDAC8] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9F5] border-b border-[#E0DBCB] text-[#556D5B] font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Ảnh</th>
                <th className="py-3.5 px-4">Tên dịch vụ</th>
                <th className="py-3.5 px-4">Nhóm danh mục</th>
                <th className="py-3.5 px-4">Giá dịch vụ</th>
                <th className="py-3.5 px-4">Thời lượng</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2EFE6]">
              {filteredServices.map((service) => (
                <tr key={service.id} className="hover:bg-[#FAF9F5]/70 transition-colors">
                  <td className="py-3 px-4">
                    <img
                      src={service.imageUrl}
                      alt={service.name}
                      className="w-12 h-12 rounded-lg object-cover bg-slate-100"
                      referrerPolicy="no-referrer"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-serif font-bold text-sm text-[#233527]">{service.name}</div>
                    <div className="text-[11px] text-[#697D6E] line-clamp-1 max-w-xs">{service.description}</div>
                  </td>
                  <td className="py-3 px-4 font-medium text-[#384F3D]">
                    {service.categoryName}
                  </td>
                  <td className="py-3 px-4 font-bold text-[#2A4731] tabular-nums">
                    {formatVND(service.price)}
                  </td>
                  <td className="py-3 px-4 text-[#526857] tabular-nums">
                    {service.durationMinutes} phút
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        service.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {service.status === 'active' ? 'Đang cung cấp' : 'Tạm ngừng'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(service)}
                        className="p-1.5 text-[#3E5C44] hover:bg-[#F2EFE6] rounded-lg transition-colors"
                        title="Chỉnh sửa dịch vụ"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleServiceStatus(service.id)}
                        className={`p-1.5 rounded-lg transition-colors ${
                          service.status === 'active'
                            ? 'text-amber-700 hover:bg-amber-50'
                            : 'text-emerald-700 hover:bg-emerald-50'
                        }`}
                        title={service.status === 'active' ? 'Tạm ngừng cung cấp' : 'Kích hoạt lại'}
                      >
                        <Power className="w-4 h-4" />
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
              {editingService ? 'Chỉnh sửa dịch vụ' : 'Thêm dịch vụ spa mới'}
            </h3>

            <form onSubmit={handleSaveForm} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#273B2C]">Tên dịch vụ *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Massage bấm huyệt đá nóng"
                  className="w-full p-2.5 bg-[#FAF9F5] border border-[#D5D0BF] rounded-xl text-xs text-[#273B2C] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#273B2C]">Danh mục</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full p-2.5 bg-[#FAF9F5] border border-[#D5D0BF] rounded-xl text-xs text-[#273B2C] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden"
                  >
                    <option value="facial">Chăm sóc da mặt</option>
                    <option value="massage">Massage thư giãn</option>
                    <option value="body">Chăm sóc cơ thể</option>
                    <option value="skincare_treatment">Liệu trình dưỡng da</option>
                    <option value="intensive">Chăm sóc chuyên sâu</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#273B2C]">Thời lượng (phút) *</label>
                  <input
                    type="number"
                    min="15"
                    required
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full p-2.5 bg-[#FAF9F5] border border-[#D5D0BF] rounded-xl text-xs text-[#273B2C] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#273B2C]">Giá dịch vụ (VNĐ) *</label>
                <input
                  type="number"
                  min="10000"
                  step="10000"
                  required
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full p-2.5 bg-[#FAF9F5] border border-[#D5D0BF] rounded-xl text-xs text-[#273B2C] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#273B2C]">Đường dẫn ảnh minh họa</label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF9F5] border border-[#D5D0BF] rounded-xl text-xs text-[#273B2C] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#273B2C]">Mô tả ngắn gọn</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả công dụng và các bước nổi bật của liệu trình..."
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
                  Lưu dịch vụ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
