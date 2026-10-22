import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { formatVND } from '../../utils/formatters';
import { Search, ShoppingBag, ArrowUpDown, Sparkles, Plus, Check } from 'lucide-react';
import { ProductCategory } from '../../types';

export const ProductsPage: React.FC = () => {
  const { products, addToCart } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'default' | 'price_asc' | 'price_desc'>('default');

  const categories = [
    { key: 'all', label: 'Tất cả sản phẩm' },
    { key: 'serum', label: 'Serum & Tinh chất' },
    { key: 'cream', label: 'Kem dưỡng ẩm' },
    { key: 'cleanser', label: 'Sữa rửa mặt' },
    { key: 'mask', label: 'Mặt nạ dưỡng da' },
    { key: 'essential_oil', label: 'Tinh dầu trị liệu' },
    { key: 'body', label: 'Chăm sóc cơ thể' }
  ];

  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => p.status === 'active');

    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.categoryName.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'price_asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => b.price - a.price);
    }

    return result;
  }, [products, selectedCategory, searchTerm, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#5C7E63]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Mỹ phẩm thiên nhiên An Nhiên</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#233527]">
          Cửa Hàng Dưỡng Da & Trị Liệu Thảo Mộc
        </h1>
        <p className="text-sm text-[#556958] leading-relaxed">
          Các dòng serum, kem dưỡng hữu cơ và tinh dầu trị liệu được chiết xuất tự nhiên, an toàn cho làn da nhạy cảm nhất.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#DFDAC8] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7A907E]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm sản phẩm (ví dụ: serum, hoa cúc, ngải cứu)..."
              className="w-full pl-10 pr-4 py-2.5 bg-[#FAF9F5] border border-[#DDD8C7] rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-[#5E8365] text-[#243527]"
            />
          </div>

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

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-[#DFDAC8] space-y-3">
          <div className="text-sm font-semibold text-[#273B2C]">Không tìm thấy sản phẩm phù hợp</div>
          <p className="text-xs text-[#6B7F6F]">Vui lòng thử tìm kiếm với từ khóa khác.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => {
            const isOutOfStock = product.stock <= 0;
            const isLowStock = product.stock > 0 && product.stock <= 5;

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-shadow border border-[#E0DBCB] flex flex-col group"
              >
                <Link to={`/products/${product.id}`} className="relative aspect-4/3 overflow-hidden bg-[#FAF9F5] block">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs text-[11px] font-semibold text-[#273B2B] px-2.5 py-1 rounded-md">
                    {product.categoryName}
                  </div>
                  {isOutOfStock ? (
                    <div className="absolute top-3 right-3 bg-rose-100 text-rose-800 text-[10px] font-bold px-2 py-0.5 rounded">
                      Hết hàng
                    </div>
                  ) : isLowStock ? (
                    <div className="absolute top-3 right-3 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">
                      Chỉ còn {product.stock}
                    </div>
                  ) : null}
                </Link>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <div className="text-[11px] text-[#718575] font-medium">{product.volumeOrWeight}</div>
                    <Link to={`/products/${product.id}`}>
                      <h3 className="font-serif text-sm font-bold text-[#233527] group-hover:text-[#3B5E41] transition-colors line-clamp-2">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-xs text-[#5D7060] line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#F0EBE0] flex items-center justify-between">
                    <div>
                      <div className="font-serif text-base font-bold text-[#243729] tabular-nums">
                        {formatVND(product.price)}
                      </div>
                      <div className="text-[10px] text-[#7E9382]">
                        {isOutOfStock ? 'Tạm hết' : `Kho: ${product.stock} sp`}
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={isOutOfStock}
                      onClick={() => addToCart(product.id, 1)}
                      className="p-2.5 bg-[#425E47] hover:bg-[#344D39] disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5 text-xs font-medium cursor-pointer disabled:cursor-not-allowed"
                      title={isOutOfStock ? 'Sản phẩm hết hàng' : 'Thêm vào giỏ hàng'}
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>{isOutOfStock ? 'Hết' : 'Thêm'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
