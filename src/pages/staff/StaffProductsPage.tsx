import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatVND } from '../../utils/formatters';
import { ShoppingBag, Search, PackageCheck, AlertCircle } from 'lucide-react';

export const StaffProductsPage: React.FC = () => {
  const { products } = useApp();
  const [search, setSearch] = useState('');

  const filteredProducts = products.filter((p) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q) || p.code.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#DFDAC8]">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#233527]">
            Tư Vấn Sản Phẩm Dưỡng Da
          </h1>
          <p className="text-xs text-[#5D7060] mt-1">
            Tra cứu tồn kho, công dụng, thành phần hoạt tính và giá niêm yết để tư vấn tại quầy
          </p>
        </div>

        <div className="relative max-w-xs w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm mã sản phẩm, tên..."
            className="w-full pl-8 pr-3 py-2 bg-white border border-[#D5D0BF] rounded-xl text-xs text-[#233527] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden"
          />
          <Search className="w-3.5 h-3.5 text-[#8A9C8D] absolute left-2.5 top-3 pointer-events-none" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((prod) => (
          <div key={prod.id} className="bg-white rounded-2xl border border-[#DFDAC8] p-4 shadow-xs space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#F0EDE1] text-[#3D5241]">
                  {prod.code}
                </span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  prod.stock > 10 ? 'bg-emerald-50 text-emerald-800' : prod.stock > 0 ? 'bg-amber-50 text-amber-800' : 'bg-rose-50 text-rose-800'
                }`}>
                  Tồn kho: {prod.stock} chai/hũ
                </span>
              </div>

              <h3 className="font-serif text-base font-bold text-[#233527] line-clamp-1">
                {prod.name}
              </h3>

              <div className="text-xs font-bold text-[#3B5B41]">
                {formatVND(prod.price)}
              </div>

              <p className="text-xs text-[#5B6F5F] line-clamp-3 leading-relaxed">
                {prod.description}
              </p>
            </div>

            <div className="pt-2 border-t border-[#F0ECE1] text-[11px] text-[#718575] flex items-center justify-between">
              <span>Danh mục: <strong className="text-[#324535]">{prod.categoryName}</strong></span>
              <span className="text-[#3E5C44] font-medium">Hàng chính hãng 100%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
