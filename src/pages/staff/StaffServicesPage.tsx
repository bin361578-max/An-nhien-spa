import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatVND } from '../../utils/formatters';
import { Sparkles, Clock, CheckCircle2, AlertTriangle, Search } from 'lucide-react';

export const StaffServicesPage: React.FC = () => {
  const { services } = useApp();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredServices = services.filter((s) => {
    if (selectedCategory !== 'all' && s.category !== selectedCategory) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DFDAC8]">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#233527]">
            Cẩm Nang Dịch Vụ Spa
          </h1>
          <p className="text-xs text-[#5D7060] mt-1">
            Tra cứu quy trình chuẩn, thời gian thực hiện, lợi ích và lưu ý y tế để tư vấn khách hàng
          </p>
        </div>

        <div className="relative max-w-xs w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm liệu trình..."
            className="w-full pl-8 pr-3 py-2 bg-white border border-[#D5D0BF] rounded-xl text-xs text-[#233527] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden"
          />
          <Search className="w-3.5 h-3.5 text-[#8A9C8D] absolute left-2.5 top-3 pointer-events-none" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredServices.map((service) => (
          <div key={service.id} className="bg-white rounded-2xl border border-[#DFDAC8] p-5 shadow-xs space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-[10px] font-semibold text-[#5B7962] uppercase tracking-wider bg-[#EDF3EE] px-2 py-0.5 rounded-md">
                  {service.categoryName}
                </span>
                <h3 className="font-serif text-lg font-bold text-[#233527] mt-1">
                  {service.name}
                </h3>
              </div>
              <div className="text-right shrink-0">
                <div className="font-bold text-sm text-[#3E5C44]">{formatVND(service.price)}</div>
                <div className="text-[11px] text-[#697D6E] flex items-center justify-end gap-1 mt-0.5">
                  <Clock className="w-3 h-3 text-[#7B9080]" />
                  <span>{service.durationMinutes} phút</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-[#526655] leading-relaxed">
              {service.fullDescription || service.description}
            </p>

            {/* Steps Guide */}
            {service.steps && service.steps.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-[#F0ECE1]">
                <div className="text-xs font-semibold text-[#283C2D]">Các bước thực hiện chuẩn:</div>
                <ol className="list-decimal list-inside text-[11px] text-[#556958] space-y-1 pl-1">
                  {service.steps.map((st, i) => (
                    <li key={i}>{st}</li>
                  ))}
                </ol>
              </div>
            )}

            {/* Clinical Note / Advice */}
            {service.notes && (
              <div className="p-3 bg-[#FAF8F2] rounded-xl border border-[#E5E0D0] text-[11px] text-[#64502E] flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong>Lưu ý tư vấn:</strong> {service.notes}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
