import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { formatVND } from '../../utils/formatters';
import { ShoppingBag, ArrowLeft, ShieldCheck, Truck, RefreshCcw, Plus, Minus, AlertCircle } from 'lucide-react';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { products, addToCart, showToast } = useApp();
  const navigate = useNavigate();

  const [quantity, setQuantity] = useState<number>(1);

  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-[#233527]">Không tìm thấy sản phẩm</h2>
        <p className="text-sm text-[#5C7060]">Sản phẩm không tồn tại hoặc đã ngừng kinh doanh.</p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#425E47] text-white rounded-xl text-sm font-medium hover:bg-[#344D39]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về cửa hàng</span>
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stock <= 0;

  const handleAddToCart = () => {
    if (quantity > product.stock) {
      showToast(`Chỉ còn ${product.stock} sản phẩm trong kho.`, 'error');
      return;
    }
    addToCart(product.id, quantity);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div>
        <Link
          to="/products"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#4A6D51] hover:text-[#233626] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Trở về cửa hàng</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Image View */}
        <div className="lg:col-span-6">
          <div className="aspect-square rounded-3xl overflow-hidden shadow-md border border-[#E0DBCB] bg-[#FBF9F4]">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Right Product Details & Buy Section */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-[#6F8473]">
              <span className="font-semibold uppercase tracking-wider">{product.categoryName}</span>
              <span>·</span>
              <span className="font-mono">{product.code}</span>
              <span>·</span>
              <span>{product.volumeOrWeight}</span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#233527] leading-tight">
              {product.name}
            </h1>

            <div className="font-serif text-3xl font-bold text-[#273B2C] pt-2 tabular-nums">
              {formatVND(product.price)}
            </div>
          </div>

          <div className="p-4 bg-[#F5F2E8] rounded-xl border border-[#DFDAC8] text-xs space-y-1">
            <div className="flex justify-between text-[#4F6453]">
              <span>Tình trạng tồn kho:</span>
              <strong className={isOutOfStock ? 'text-rose-600' : 'text-[#365A3D]'}>
                {isOutOfStock ? 'Hết hàng' : `Còn ${product.stock} sản phẩm`}
              </strong>
            </div>
            <div className="text-[11px] text-[#718575]">
              * Hàng chính hãng được bảo quản tiêu chuẩn nhiệt độ phòng mát tại kho An Nhiên.
            </div>
          </div>

          <div className="space-y-2 text-sm text-[#4E6252] leading-relaxed">
            <h3 className="font-semibold text-xs uppercase tracking-wider text-[#2B3F31]">Mô tả sản phẩm:</h3>
            <p>{product.fullDescription || product.description}</p>
          </div>

          {/* Quantity selector & Add to cart */}
          {!isOutOfStock ? (
            <div className="space-y-4 pt-4 border-t border-[#E5DFD0]">
              <div className="flex items-center gap-4">
                <span className="text-xs font-semibold text-[#293B2D]">Số lượng:</span>
                <div className="flex items-center border border-[#D5D0BF] rounded-xl bg-white overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="p-2 text-[#465E4B] hover:bg-[#F2EFE6]"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-12 text-center text-xs font-bold text-[#263A29] tabular-nums">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="p-2 text-[#465E4B] hover:bg-[#F2EFE6]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="text-[11px] text-[#6E8372]">
                  (Tối đa {product.stock} sp)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  className="py-3 px-4 border border-[#425E47] text-[#425E47] hover:bg-[#EDF4EE] rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Thêm vào giỏ</span>
                </button>
                <button
                  type="button"
                  onClick={handleBuyNow}
                  className="py-3 px-4 bg-[#425E47] hover:bg-[#344D39] text-white rounded-xl text-sm font-semibold transition-colors shadow-xs"
                >
                  <span>Mua ngay</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Sản phẩm hiện đã hết hàng. Quý khách vui lòng chọn sản phẩm khác hoặc liên hệ hotline để nhận thông báo có hàng.</span>
            </div>
          )}

          {/* Guarantees */}
          <div className="grid grid-cols-3 gap-3 pt-6 border-t border-[#E5DFD0] text-center text-[11px] text-[#647967]">
            <div className="space-y-1">
              <ShieldCheck className="w-5 h-5 mx-auto text-[#4E7656]" />
              <div>100% Chính hãng</div>
            </div>
            <div className="space-y-1">
              <Truck className="w-5 h-5 mx-auto text-[#4E7656]" />
              <div>Giao hàng toàn quốc</div>
            </div>
            <div className="space-y-1">
              <RefreshCcw className="w-5 h-5 mx-auto text-[#4E7656]" />
              <div>Đổi trả linh hoạt</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
