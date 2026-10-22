import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { formatVND } from '../../utils/formatters';
import {
  ShoppingBag,
  CreditCard,
  Truck,
  CheckCircle2,
  ShieldCheck,
  AlertCircle,
  ArrowLeft,
  ChevronRight
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    cart,
    products,
    currentUser,
    cartSubtotal,
    createOrderAction,
    showToast
  } = useApp();

  const stateData = (location.state as { appliedCouponCode?: string; discountAmount?: number }) || {};
  const couponCode = stateData.appliedCouponCode;
  const discountAmount = stateData.discountAmount || 0;

  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '');
  const [customerEmail, setCustomerEmail] = useState(currentUser?.email || '');
  const [shippingAddress, setShippingAddress] = useState(
    '124/8 Đường Thảo Điền, P. Thảo Điền, TP. Thủ Đức, TP. Hồ Chí Minh'
  );
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card_simulation'>('cod');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrderId, setConfirmedOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (currentUser) {
      if (!customerName) setCustomerName(currentUser.name);
      if (!customerPhone) setCustomerPhone(currentUser.phone);
      if (!customerEmail) setCustomerEmail(currentUser.email);
    }
  }, [currentUser]);

  const finalTotal = Math.max(0, cartSubtotal - discountAmount);

  const cartItemsWithDetails = cart
    .map((item) => {
      const prod = products.find((p) => p.id === item.productId);
      return prod ? { ...item, product: prod } : null;
    })
    .filter(Boolean) as Array<{ productId: string; quantity: number; product: typeof products[0] }>;

  if (cartItemsWithDetails.length === 0 && !confirmedOrderId) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-[#233527]">Giỏ hàng của bạn đang trống</h2>
        <p className="text-sm text-[#5D7060]">Vui lòng thêm sản phẩm vào giỏ trước khi thanh toán.</p>
        <Link
          to="/products"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#425E47] text-white rounded-xl text-sm font-semibold hover:bg-[#344D39]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Về cửa hàng</span>
        </Link>
      </div>
    );
  }

  const handleConfirmOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      showToast('Vui lòng nhập họ tên người nhận hàng.', 'error');
      return;
    }
    if (!customerPhone.trim() || customerPhone.trim().length < 9) {
      showToast('Vui lòng nhập số điện thoại người nhận hợp lệ.', 'error');
      return;
    }
    if (!shippingAddress.trim()) {
      showToast('Vui lòng nhập địa chỉ giao hàng.', 'error');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const res = createOrderAction({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || 'khach@annhienspa.demo',
        shippingAddress: shippingAddress.trim(),
        notes: notes.trim(),
        couponCode,
        discountAmount,
        paymentMethod
      });

      setIsSubmitting(false);

      if (res.success && res.orderId) {
        setConfirmedOrderId(res.orderId);
      } else {
        showToast(res.message || 'Lỗi khi tạo đơn hàng.', 'error');
      }
    }, 600);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {confirmedOrderId ? (
        /* Order Confirmed View */
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl border border-[#C6DCB8] shadow-md text-center space-y-6 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 bg-[#E8F3EA] text-[#3E6746] rounded-full flex items-center justify-center mx-auto border border-[#BBD7BF]">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h1 className="font-serif text-3xl font-bold text-[#233527]">
              Đặt Hàng Thành Công!
            </h1>
            <p className="text-xs sm:text-sm text-[#526655] leading-relaxed">
              Cảm ơn bạn đã mua sắm mỹ phẩm thảo dược tại An Nhiên Spa. Đơn hàng đã được lưu trữ trên hệ thống chung và chuyển sang bộ phận kho chuẩn bị.
            </p>
          </div>

          <div className="bg-[#FAF9F5] p-5 rounded-2xl border border-[#DFDAC8] text-left text-xs space-y-2.5">
            <div className="flex justify-between pb-2 border-b border-[#EAE5D7]">
              <span className="text-[#6D8070]">Mã đơn hàng:</span>
              <span className="font-mono text-sm font-bold text-[#273B2C]">{confirmedOrderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6D8070]">Người nhận:</span>
              <span className="font-semibold text-[#273B2C]">{customerName} ({customerPhone})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6D8070]">Địa chỉ giao:</span>
              <span className="text-[#273B2C] text-right max-w-xs">{shippingAddress}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#6D8070]">Hình thức thanh toán:</span>
              <span className="font-medium text-[#273B2C]">
                {paymentMethod === 'cod' ? 'Thanh toán tiền mặt khi nhận hàng (COD)' : 'Thẻ / Chuyển khoản (Mô phỏng)'}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-[#EAE5D7] text-sm font-bold">
              <span className="text-[#6D8070]">Tổng thanh toán:</span>
              <span className="text-[#325238] tabular-nums">{formatVND(finalTotal)}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Link
              to="/my-orders"
              className="w-full sm:w-auto px-6 py-3 bg-[#425E47] hover:bg-[#344D39] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
            >
              Xem đơn hàng của tôi
            </Link>
            <Link
              to="/products"
              className="w-full sm:w-auto px-6 py-3 border border-[#D5D0BF] text-[#3D5243] hover:bg-[#F5F2E8] rounded-xl text-xs font-semibold transition-colors"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>
      ) : (
        /* Checkout Form View */
        <div className="space-y-6">
          <div>
            <h1 className="font-serif text-3xl font-bold text-[#233527]">
              Xác Nhận Đơn Hàng & Giao Hàng
            </h1>
            <p className="text-xs text-[#5D7060] mt-1">
              Vui lòng kiểm tra địa chỉ và chọn phương thức thanh toán thử nghiệm
            </p>
          </div>

          <form onSubmit={handleConfirmOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left form details */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-[#DFDAC8] shadow-xs space-y-4">
                <h2 className="font-serif text-lg font-bold text-[#233527]">
                  1. Thông tin người nhận hàng
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#273B2C]">Họ và tên *</label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Nguyễn Thu Trang"
                      className="w-full p-2.5 bg-[#FAF9F5] border border-[#D5D0BF] rounded-xl text-xs text-[#273B2C] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#273B2C]">Số điện thoại *</label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="0912345678"
                      className="w-full p-2.5 bg-[#FAF9F5] border border-[#D5D0BF] rounded-xl text-xs text-[#273B2C] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden"
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-semibold text-[#273B2C]">Email</label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="khachhang@gmail.com"
                      className="w-full p-2.5 bg-[#FAF9F5] border border-[#D5D0BF] rounded-xl text-xs text-[#273B2C] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden"
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-semibold text-[#273B2C]">Địa chỉ nhận hàng chi tiết *</label>
                    <textarea
                      rows={2}
                      required
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành..."
                      className="w-full p-2.5 bg-[#FAF9F5] border border-[#D5D0BF] rounded-xl text-xs text-[#273B2C] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden"
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-xs font-semibold text-[#273B2C]">Ghi chú giao hàng</label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi đến..."
                      className="w-full p-2.5 bg-[#FAF9F5] border border-[#D5D0BF] rounded-xl text-xs text-[#273B2C] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white p-6 rounded-2xl border border-[#DFDAC8] shadow-xs space-y-4">
                <h2 className="font-serif text-lg font-bold text-[#233527]">
                  2. Phương thức thanh toán (Mô phỏng)
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-4 rounded-xl border cursor-pointer flex items-start gap-3 transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-[#3C5E43] bg-[#F2F7F3] ring-1 ring-[#3C5E43]'
                        : 'border-[#DFDAC8] bg-[#FAF9F5]'
                    }`}
                  >
                    <Truck className="w-5 h-5 text-[#4E7656] shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-[#25392A]">Thanh toán khi nhận hàng (COD)</div>
                      <div className="text-[11px] text-[#697E6E] mt-0.5">Thanh toán tiền mặt cho shipper khi giao tới</div>
                    </div>
                  </label>

                  <label
                    onClick={() => setPaymentMethod('card_simulation')}
                    className={`p-4 rounded-xl border cursor-pointer flex items-start gap-3 transition-all ${
                      paymentMethod === 'card_simulation'
                        ? 'border-[#3C5E43] bg-[#F2F7F3] ring-1 ring-[#3C5E43]'
                        : 'border-[#DFDAC8] bg-[#FAF9F5]'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-[#4E7656] shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-bold text-[#25392A]">Mô phỏng thẻ / Chuyển khoản</div>
                      <div className="text-[11px] text-[#697E6E] mt-0.5">Xác nhận thanh toán ngay (thử nghiệm đồ án)</div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Right Summary */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white p-6 rounded-2xl border border-[#DFDAC8] shadow-xs space-y-4 sticky top-28">
                <h2 className="font-serif text-lg font-bold text-[#233527]">
                  Đơn Hàng ({cartItemsWithDetails.length} mặt hàng)
                </h2>

                <div className="divide-y divide-[#F0EBE0] max-h-60 overflow-y-auto pr-1 space-y-2">
                  {cartItemsWithDetails.map(({ product, quantity }) => (
                    <div key={product.id} className="pt-2 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-10 h-10 rounded-md object-cover shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="max-w-[170px] truncate">
                          <div className="font-semibold text-[#283C2D] truncate">{product.name}</div>
                          <div className="text-[10px] text-[#718575]">{quantity} × {formatVND(product.price)}</div>
                        </div>
                      </div>
                      <span className="font-bold text-[#243729] tabular-nums">
                        {formatVND(product.price * quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-[#DFDAC8] space-y-2 text-xs">
                  <div className="flex justify-between text-[#687D6E]">
                    <span>Tạm tính:</span>
                    <span className="tabular-nums font-semibold text-[#273B2C]">{formatVND(cartSubtotal)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-[#38623F] font-semibold">
                      <span>Giảm giá ({couponCode}):</span>
                      <span className="tabular-nums">-{formatVND(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-[#687D6E]">
                    <span>Vận chuyển:</span>
                    <span className="text-[#36593A] font-medium">Miễn phí</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-[#EAE5D7] text-sm font-bold text-[#233527]">
                    <span>Tổng số tiền:</span>
                    <span className="font-serif text-lg text-[#325238] tabular-nums">{formatVND(finalTotal)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 px-4 bg-[#425E47] hover:bg-[#344D39] disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-all shadow-xs flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span>Đang xử lý đơn hàng...</span>
                  ) : (
                    <>
                      <span>Xác nhận đặt hàng</span>
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
