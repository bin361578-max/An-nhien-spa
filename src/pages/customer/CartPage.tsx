import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { formatVND } from '../../utils/formatters';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, Tag, ArrowLeft, Check, AlertCircle } from 'lucide-react';

export const CartPage: React.FC = () => {
  const {
    cart,
    products,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartSubtotal,
    coupons,
    showToast
  } = useApp();
  const navigate = useNavigate();

  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);

  const cartItemsWithDetails = cart
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      return product ? { ...item, product } : null;
    })
    .filter(Boolean) as Array<{ productId: string; quantity: number; product: typeof products[0] }>;

  // Handle apply coupon
  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError(null);
    const code = couponInput.trim().toUpperCase();

    if (!code) {
      setCouponError('Vui lòng nhập mã giảm giá.');
      return;
    }

    const found = coupons.find((c) => c.code.toUpperCase() === code);
    if (!found) {
      setCouponError('Mã ưu đãi không tồn tại.');
      return;
    }

    if (found.status !== 'active') {
      setCouponError('Mã ưu đãi này đã hết hạn hoặc tạm dừng.');
      return;
    }

    const nowStr = new Date().toISOString().split('T')[0];
    if (found.endDate < nowStr) {
      setCouponError('Mã ưu đãi này đã hết thời gian áp dụng.');
      return;
    }

    if (found.usedCount >= found.usageLimit) {
      setCouponError('Mã ưu đãi này đã đạt giới hạn lượt sử dụng.');
      return;
    }

    if (cartSubtotal < found.minOrderValue) {
      setCouponError(
        `Đơn hàng cần đạt tối thiểu ${formatVND(found.minOrderValue)} để áp dụng mã này (hiện tại: ${formatVND(cartSubtotal)}).`
      );
      return;
    }

    let discount = 0;
    if (found.discountType === 'percent') {
      discount = Math.round((cartSubtotal * found.discountValue) / 100);
    } else {
      discount = found.discountValue;
    }

    discount = Math.min(discount, cartSubtotal);
    setAppliedCoupon({ code: found.code, discount });
    showToast(`Áp dụng mã ${found.code} thành công! Giảm ${formatVND(discount)}`, 'success');
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError(null);
    showToast('Đã hủy áp dụng mã ưu đãi.', 'info');
  };

  const discountAmount = appliedCoupon ? appliedCoupon.discount : 0;
  const finalTotal = Math.max(0, cartSubtotal - discountAmount);

  if (cartItemsWithDetails.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 bg-[#EDE8DA] text-[#556F5A] rounded-full flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-2xl font-bold text-[#233527]">Giỏ hàng của bạn đang trống</h2>
        <p className="text-sm text-[#5D7060]">
          Hãy khám phá các sản phẩm serum, kem dưỡng và tinh dầu thảo mộc thiên nhiên tại An Nhiên.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#425E47] text-white rounded-xl text-sm font-semibold hover:bg-[#344D39] transition-colors shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Khám phá sản phẩm ngay</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="flex items-center justify-between pb-4 border-b border-[#E0DBCB]">
        <h1 className="font-serif text-3xl font-bold text-[#233527]">
          Giỏ Hàng Của Bạn ({cartItemsWithDetails.length} sản phẩm)
        </h1>
        <button
          onClick={clearCart}
          className="text-xs text-[#823330] hover:text-rose-700 flex items-center gap-1 font-medium"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Xóa tất cả</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Cart items list */}
        <div className="lg:col-span-8 space-y-4">
          {cartItemsWithDetails.map(({ product, quantity }) => (
            <div
              key={product.id}
              className="bg-white p-4 sm:p-5 rounded-2xl border border-[#DFDAC8] shadow-xs flex flex-col sm:flex-row items-center gap-4"
            >
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-20 h-20 rounded-xl object-cover shrink-0 bg-[#FAF9F5]"
                referrerPolicy="no-referrer"
              />

              <div className="flex-1 min-w-0 text-center sm:text-left space-y-1">
                <div className="text-[11px] text-[#728775]">{product.categoryName} · {product.volumeOrWeight}</div>
                <Link to={`/products/${product.id}`} className="hover:text-[#425E47]">
                  <h3 className="font-serif text-sm font-bold text-[#233527] truncate">{product.name}</h3>
                </Link>
                <div className="font-semibold text-xs text-[#273B2C] tabular-nums">
                  Đơn giá: {formatVND(product.price)}
                </div>
              </div>

              {/* Quantity stepper */}
              <div className="flex items-center gap-4 shrink-0">
                <div className="flex items-center border border-[#D5D0BF] rounded-xl bg-[#FAF9F5] overflow-hidden">
                  <button
                    type="button"
                    onClick={() => updateCartQuantity(product.id, quantity - 1)}
                    className="p-1.5 text-[#465E4B] hover:bg-[#EAE6D8]"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-10 text-center text-xs font-bold text-[#263A29] tabular-nums">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateCartQuantity(product.id, quantity + 1)}
                    className="p-1.5 text-[#465E4B] hover:bg-[#EAE6D8]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="font-serif font-bold text-sm text-[#273B2C] w-24 text-right tabular-nums">
                  {formatVND(product.price * quantity)}
                </div>

                <button
                  type="button"
                  onClick={() => removeFromCart(product.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                  title="Xóa sản phẩm này"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          <div className="pt-2">
            <Link
              to="/products"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#46694C] hover:text-[#233527]"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Tiếp tục chọn thêm sản phẩm</span>
            </Link>
          </div>
        </div>

        {/* Order Summary & Coupon */}
        <div className="lg:col-span-4">
          <div className="bg-white p-6 rounded-2xl border border-[#DFDAC8] shadow-xs space-y-6 sticky top-28">
            <h2 className="font-serif text-lg font-bold text-[#233527]">
              Tóm Tắt Đơn Hàng
            </h2>

            {/* Coupon input */}
            <form onSubmit={handleApplyCoupon} className="space-y-2">
              <label className="block text-xs font-semibold text-[#273B2C]">Mã ưu đãi / Phiếu quà tặng</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="Ví dụ: ANNHIEN10"
                  className="flex-1 px-3 py-2 bg-[#FAF9F5] border border-[#D5D0BF] rounded-xl text-xs uppercase font-mono tracking-wider focus:outline-hidden focus:ring-2 focus:ring-[#4E7656]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#425E47] hover:bg-[#344D39] text-white rounded-xl text-xs font-semibold transition-colors shrink-0"
                >
                  Áp dụng
                </button>
              </div>

              {couponError && (
                <p className="text-[11px] text-rose-700 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{couponError}</span>
                </p>
              )}

              {appliedCoupon && (
                <div className="p-2.5 bg-[#EDF5EE] border border-[#BCDABC] rounded-xl text-xs text-[#28492F] flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-[#3F6B47]" />
                    <span>Mã: <strong>{appliedCoupon.code}</strong> (-{formatVND(appliedCoupon.discount)})</span>
                  </div>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-xs text-rose-700 hover:underline font-medium"
                  >
                    Bỏ mã
                  </button>
                </div>
              )}
            </form>

            {/* Calculations */}
            <div className="space-y-2.5 pt-3 border-t border-[#EAE5D7] text-xs">
              <div className="flex justify-between text-[#5C7060]">
                <span>Tạm tính hàng hóa:</span>
                <span className="tabular-nums font-semibold text-[#273B2C]">{formatVND(cartSubtotal)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-[#38623F] font-medium">
                  <span>Giảm giá voucher:</span>
                  <span className="tabular-nums">-{formatVND(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#5C7060]">
                <span>Phí vận chuyển:</span>
                <span className="text-[#36593A] font-medium">Miễn phí giao hàng</span>
              </div>
              <div className="flex justify-between pt-3 border-t border-[#DFDAC8] text-sm font-bold text-[#233527]">
                <span>Tổng thanh toán:</span>
                <span className="font-serif text-lg text-[#325238] tabular-nums">{formatVND(finalTotal)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                navigate('/checkout', {
                  state: {
                    appliedCouponCode: appliedCoupon?.code,
                    discountAmount
                  }
                });
              }}
              className="w-full py-3.5 px-4 bg-[#425E47] hover:bg-[#344D39] text-white rounded-xl text-sm font-semibold transition-all shadow-xs flex items-center justify-center gap-2"
            >
              <span>Tiến hành đặt hàng</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
