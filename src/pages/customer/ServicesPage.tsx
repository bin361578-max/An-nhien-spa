import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { formatVND } from '../../utils/formatters';
import { Search, Clock, Calendar, ArrowUpDown, Sparkles, Filter } from 'lucide-react';
import { ServiceCategory } from '../../types';

export const ServicesPage: React.FC = () => {
  const { services } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'default' | 'price_asc' | 'price_desc' | 'duration'>('default');

  const categories = [
    { key: 'all', label: 'Tất cả dịch vụ' },
    { key: 'facial', label: 'Chăm sóc da mặt' },
    { key: 'massage', label: 'Massage thư giãn' },
    { key: 'body', label: 'Chăm sóc cơ thể' },
    { key: 'skincare_treatment', label: 'Liệu trình dưỡng da' },
    { key: 'intensive', label: 'Chăm sóc chuyên sâu' }
  ];

  const filteredServices = useMemo(() => {
    let result = services.filter((s) => s.status === 'active');

    if (selectedCategory !== 'all') {
      result = result.filter((s) => s.category === selectedCategory);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.categoryName.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'price_asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'duration') {
      result.sort((a, b) => a.durationMinutes - b.durationMinutes);
    }

    return result;
  }, [services, selectedCategory, searchTerm, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Page Title Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#5C7E63]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Danh mục trị liệu & thư giãn</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#233527]">
          Dịch Vụ Spa Thảo Mộc An Nhiên
        </h1>
        <p className="text-sm text-[#556958] leading-relaxed">
          Tận hưởng những giây phút chăm sóc dịu êm với các liệu pháp dưỡng da, massage đá nóng và đả thông kinh lạc chuẩn phương Đông.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#DFDAC8] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A907E]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm liệu trình (ví dụ: đá nóng, da mặt, vai gáy)..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#FAF9F5] border border-[#DDD8C7] rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#5E8365] text-[#243527]"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                Xóa
              </button>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <ArrowUpDown className="w-4 h-4 text-[#7A907E]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-[#FAF9F5] border border-[#DDD8C7] text-[#273B2C] text-sm rounded-xl px-3 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-[#5E8365]"
            >
              <option value="default">Sắp xếp: Mặc định</option>
              <option value="price_asc">Giá: Thấp đến cao</option>
              <option value="price_desc">Giá: Cao đến thấp</option>
              <option value="duration">Thời lượng: Ngắn đến dài</option>
            </select>
          </div>
        </div>

        {/* Category Filter Pills (Button controls as per design skill) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((c) => {
            const active = selectedCategory === c.key;
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => setSelectedCategory(c.key)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-lg whitespace-nowrap transition-colors ${
                  active
                    ? 'bg-[#3C5D43] text-white shadow-xs'
                    : 'bg-[#F2EFE5] text-[#4E6353] hover:bg-[#E7E2D3] hover:text-[#213525]'
                }`}
              >
                {c.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Services Grid */}
      {filteredServices.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-[#DFDAC8] space-y-3">
          <div className="text-sm font-semibold text-[#273B2C]">Không tìm thấy dịch vụ phù hợp</div>
          <p className="text-xs text-[#6B7F6F]">
            Vui lòng thử tìm kiếm với từ khóa khác hoặc bỏ chọn bộ lọc hiện tại.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
              setSortBy('default');
            }}
            className="text-xs font-medium text-[#3C5D43] underline hover:text-[#223525]"
          >
            Đặt lại bộ lọc
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow border border-[#E0DBCB] flex flex-col group"
            >
              <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
                <img
                  src={service.imageUrl}
                  alt={service.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-[11px] font-semibold text-[#293E2E] px-2.5 py-1 rounded-md">
                  {service.categoryName}
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="font-serif text-lg font-bold text-[#233527] group-hover:text-[#3B5E41] transition-colors leading-snug">
                    {service.name}
                  </h3>
                  <p className="text-xs text-[#5C7060] leading-relaxed line-clamp-3">
                    {service.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#F0EBE0] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-[#5D7361]">
                      <Clock className="w-4 h-4 text-[#759079]" />
                      <span>{service.durationMinutes} phút</span>
                    </div>
                    <div className="font-serif text-lg font-bold text-[#25392A] tabular-nums">
                      {formatVND(service.price)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Link
                      to={`/services/${service.id}`}
                      className="text-center py-2 px-3 text-xs font-medium text-[#465E4B] bg-[#F3F0E6] hover:bg-[#E8E3D4] rounded-xl transition-colors"
                    >
                      Xem chi tiết
                    </Link>
                    <Link
                      to={`/booking?serviceId=${service.id}`}
                      className="text-center py-2 px-3 text-xs font-medium text-white bg-[#425E47] hover:bg-[#344D39] rounded-xl transition-colors flex items-center justify-center gap-1"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Đặt lịch</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
