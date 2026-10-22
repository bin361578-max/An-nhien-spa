import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatVND } from '../../utils/formatters';
import { ProductItem, ProductCategory } from '../../types';
import { Plus, Edit, Search, AlertTriangle, Package, Check, Save } from 'lucide-react';

export const AdminProductsPage: React.FC = () => {
  const { products, saveProduct, updateProductStock, showToast } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);

  // Form
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('serum');
  const [price, setPrice] = useState<number>(300000);
  const [stock, setStock] = useState<number>(20);
  const [volumeOrWeight, setVolumeOrWeight] = useState('50ml');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('/src/assets/images/product_herbal_serum_1792632798964.jpg');

  // Inline stock edit
  const [stockEditId, setStockEditId] = useState<string | null>(null);
  const [stockEditVal, setStockEditVal] = useState<number>(0);

  const categoryNameMap: Record<ProductCategory, string> = {
    serum: 'Serum & Tinh chất',
    cream: 'Kem dưỡng ẩm',
    cleanser: 'Sữa rửa mặt',
    mask: 'Mặt nạ dưỡng da',
    essential_oil: 'Tinh dầu trị liệu',
    body: 'Chăm sóc cơ thể'
  };

  const filteredProducts = products.filter((p) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.code.toLowerCase().includes(q) ||
      p.categoryName.toLowerCase().includes(q)
    );
  });

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setCode(`AN-PRD-${Math.floor(10 + Math.random() * 90)}`);
    setName('');
    setCategory('serum');
    setPrice(300000);
    setStock(20);
    setVolumeOrWeight('50ml');
    setDescription('');
    setImageUrl('/src/assets/images/product_herbal_serum_1792632798964.jpg');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: ProductItem) => {
    setEditingProduct(p);
    setCode(p.code);
    setName(p.name);
    setCategory(p.category);
    setPrice(p.price);
    setStock(p.stock);
    setVolumeOrWeight(p.volumeOrWeight);
    setDescription(p.description);
    setImageUrl(p.imageUrl);
    setIsModalOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Vui lòng nhập tên sản phẩm.', 'error');
      return;
    }
    if (price <= 0) {
      showToast('Giá sản phẩm phải lớn hơn 0.', 'error');
      return;
    }
    if (stock < 0) {
      showToast('Tồn kho không được âm.', 'error');
      return;
    }

    const prodData: ProductItem = {
      id: editingProduct ? editingProduct.id : `PRD-${Date.now().toString().slice(-4)}`,
      code: code.trim() || `AN-PRD-${Date.now().toString().slice(-3)}`,
      name: name.trim(),
      category,
      categoryName: categoryNameMap[category] || 'Mỹ phẩm An Nhiên',
      description: description.trim() || 'Sản phẩm dưỡng da chiết xuất thảo mộc hữu cơ.',
      fullDescription: editingProduct?.fullDescription || description.trim(),
      price: Number(price),
      stock: Number(stock),
      imageUrl: imageUrl.trim() || '/src/assets/images/product_herbal_serum_1792632798964.jpg',
      volumeOrWeight: volumeOrWeight.trim() || '50ml',
      status: 'active'
    };

    saveProduct(prodData);
    setIsModalOpen(false);
  };

  const handleInlineStockSave = (productId: string) => {
    if (stockEditVal < 0) {
      showToast('Tồn kho không được âm.', 'error');
      return;
    }
    updateProductStock(productId, stockEditVal);
    setStockEditId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E0DBCB]">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#1F2F23]">
            Quản Lý Sản Phẩm Mỹ Phẩm
          </h2>
          <p className="text-xs text-[#5F7463] mt-0.5">
            Quản lý kho hàng, giá niêm yết và tình trạng tồn kho trên cửa hàng
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="self-start sm:self-auto px-4 py-2 bg-[#3E5C44] hover:bg-[#304835] text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm sản phẩm mới</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#DFDAC8] shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-[#7A907E]" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm theo tên sản phẩm, mã SKU, danh mục..."
          className="w-full bg-transparent text-xs text-[#243527] focus:outline-hidden"
        />
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-2xl border border-[#DFDAC8] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9F5] border-b border-[#E0DBCB] text-[#556D5B] font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Ảnh</th>
                <th className="py-3.5 px-4">Mã SKU</th>
                <th className="py-3.5 px-4">Tên sản phẩm</th>
                <th className="py-3.5 px-4">Danh mục</th>
                <th className="py-3.5 px-4">Giá bán</th>
                <th className="py-3.5 px-4">Tồn kho</th>
                <th className="py-3.5 px-4">Cảnh báo</th>
                <th className="py-3.5 px-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2EFE6]">
              {filteredProducts.map((p) => {
                const isEditingThisStock = stockEditId === p.id;
                const isOutOfStock = p.stock <= 0;
                const isLowStock = p.stock > 0 && p.stock <= 5;

                return (
                  <tr key={p.id} className="hover:bg-[#FAF9F5]/70 transition-colors">
                    <td className="py-3 px-4">
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-12 h-12 rounded-lg object-cover bg-slate-100"
                        referrerPolicy="no-referrer"
                      />
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-[#233527]">
                      {p.code}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-serif font-bold text-sm text-[#233527]">{p.name}</div>
                      <div className="text-[11px] text-[#697D6E]">{p.volumeOrWeight}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-[#384F3D]">
                      {p.categoryName}
                    </td>
                    <td className="py-3 px-4 font-bold text-[#2A4731] tabular-nums">
                      {formatVND(p.price)}
                    </td>
                    <td className="py-3 px-4">
                      {isEditingThisStock ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="0"
                            value={stockEditVal}
                            onChange={(e) => setStockEditVal(Number(e.target.value))}
                            className="w-16 p-1 border border-[#425E47] rounded text-xs text-center"
                          />
                          <button
                            type="button"
                            onClick={() => handleInlineStockSave(p.id)}
                            className="p-1 text-emerald-700 hover:bg-emerald-50 rounded"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => {
                            setStockEditId(p.id);
                            setStockEditVal(p.stock);
                          }}
                          className="cursor-pointer font-bold text-xs tabular-nums hover:underline"
                          title="Bấm để chỉnh số lượng nhanh"
                        >
                          {p.stock} sản phẩm
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {isOutOfStock ? (
                        <span className="text-[10px] font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
                          Hết hàng
                        </span>
                      ) : isLowStock ? (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full flex items-center gap-1 w-fit">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Sắp hết (≤ 5)</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          Ổn định
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 text-[#3E5C44] hover:bg-[#F2EFE6] rounded-lg transition-colors"
                        title="Chỉnh sửa sản phẩm"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-[#DFDAC8] space-y-4 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <h3 className="font-serif text-xl font-bold text-[#233527]">
              {editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mỹ phẩm mới'}
            </h3>

            <form onSubmit={handleSaveForm} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#273B2C]">Mã SKU *</label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full p-2.5 bg-[#FAF9F5] border border-[#D5D0BF] rounded-xl text-xs text-[#273B2C] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#273B2C]">Quy cách / Dung tích</label>
                  <input
                    type="text"
                    value={volumeOrWeight}
                    onChange={(e) => setVolumeOrWeight(e.target.value)}
                    placeholder="Ví dụ: 50ml hoặc 100g"
                    className="w-full p-2.5 bg-[#FAF9F5] border border-[#D5D0BF] rounded-xl text-xs text-[#273B2C] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-[#273B2C]">Tên sản phẩm *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Tinh chất dưỡng da hoa cúc"
                  className="w-full p-2.5 bg-[#FAF9F5] border border-[#D5D0BF] rounded-xl text-xs text-[#273B2C] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#273B2C]">Danh mục</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full p-2.5 bg-[#FAF9F5] border border-[#D5D0BF] rounded-xl text-xs text-[#273B2C] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden"
                  >
                    <option value="serum">Serum & Tinh chất</option>
                    <option value="cream">Kem dưỡng ẩm</option>
                    <option value="cleanser">Sữa rửa mặt</option>
                    <option value="mask">Mặt nạ dưỡng da</option>
                    <option value="essential_oil">Tinh dầu trị liệu</option>
                    <option value="body">Chăm sóc cơ thể</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#273B2C]">Giá bán (VNĐ) *</label>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full p-2.5 bg-[#FAF9F5] border border-[#D5D0BF] rounded-xl text-xs text-[#273B2C] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-[#273B2C]">Số lượng tồn *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={stock}
                    onChange={(e) => setStock(Number(e.target.value))}
                    className="w-full p-2.5 bg-[#FAF9F5] border border-[#D5D0BF] rounded-xl text-xs text-[#273B2C] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden"
                  />
                </div>
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
                <label className="font-semibold text-[#273B2C]">Mô tả sản phẩm</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Thành phần thảo mộc và công dụng nổi bật..."
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
                  Lưu sản phẩm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
