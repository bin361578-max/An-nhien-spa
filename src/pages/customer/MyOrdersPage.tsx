import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { formatVND, formatDateTimeVN } from '../../utils/formatters';
import { Package, Truck, CheckCircle2, Clock, XCircle, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Order } from '../../types';

export const MyOrdersPage: React.FC = () => {
  const { currentUser, orders } = useApp();

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-[#233527]">Vui lòng đăng nhập</h2>
        <p className="text-sm text-[#5C7060]">Bạn cần đăng nhập để xem lịch sử mua mỹ phẩm.</p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#425E47] text-white rounded-xl text-xs font-semibold hover:bg-[#344D39]"
        >
          Đăng nhập ngay
        </Link>
      </div>
    );
  }

  const myOrders = orders.filter(
    (o) => o.userId === currentUser.id || o.customerEmail.toLowerCase() === currentUser.email.toLowerCase()
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E0DBCB]">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#233527]">Đơn Hàng Của Tôi</h1>
          <p className="text-xs text-[#5D7060] mt-1">
            Theo dõi tình trạng vận chuyển mỹ phẩm và các sản phẩm chăm sóc da
          </p>
        </div>
        <Link
          to="/products"
          className="self-start sm:self-auto px-5 py-2.5 bg-[#425E47] hover:bg-[#344D39] text-white rounded-xl text-xs font-semibold transition-colors shadow-xs"
        >
          + Mua thêm sản phẩm
        </Link>
      </div>

      {myOrders.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-[#DFDAC8] space-y-3">
          <ShoppingBag className="w-10 h-10 text-[#8DA693] mx-auto" />
          <h3 className="font-serif text-lg font-bold text-[#233527]">Bạn chưa có đơn hàng nào</h3>
          <p className="text-xs text-[#687C6B]">Khám phá các sản phẩm serum, kem dưỡng hoa cúc và tinh dầu tại An Nhiên.</p>
          <div className="pt-2">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#425E47] text-white rounded-xl text-xs font-semibold hover:bg-[#344D39]"
            >
              Xem cửa hàng
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {myOrders.map((order) => {
            const statusConfig = {
              pending: { label: 'Chờ xử lý', color: 'bg-amber-50 text-amber-800 border-amber-200' },
              confirmed: { label: 'Đã xác nhận', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
              processing: { label: 'Đang chuẩn bị hàng', color: 'bg-blue-50 text-blue-800 border-blue-200' },
              shipping: { label: 'Đang giao hàng', color: 'bg-purple-50 text-purple-800 border-purple-200' },
              completed: { label: 'Đã hoàn thành', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
              cancelled: { label: 'Đã hủy', color: 'bg-rose-50 text-rose-800 border-rose-200' }
            }[order.status] || { label: order.status, color: 'bg-slate-100 text-slate-800' };

            return (
              <div
                key={order.id}
                className="bg-white p-6 rounded-2xl border border-[#DFDAC8] shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F0ECE0]">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#233527] bg-[#F2EFE6] px-2.5 py-1 rounded-md border border-[#DFD9C7]">
                      {order.id}
                    </span>
                    <span className="text-[11px] text-[#718575]">
                      Đặt lúc: {formatDateTimeVN(order.createdAt)}
                    </span>
                  </div>

                  <span className={`text-[11px] font-semibold border px-2.5 py-0.5 rounded-full ${statusConfig.color}`}>
                    {statusConfig.label}
                  </span>
                </div>

                {/* Items */}
                <div className="divide-y divide-[#F2EEE4] space-y-2">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="pt-2 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-12 h-12 rounded-lg object-cover shrink-0 bg-[#FAF9F5]"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="font-semibold text-[#273B2C]">{item.name}</div>
                          <div className="text-[11px] text-[#6A7E6F]">
                            Số lượng: {item.quantity} × {formatVND(item.price)}
                          </div>
                        </div>
                      </div>
                      <span className="font-bold text-[#243729] tabular-nums">
                        {formatVND(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Footer totals & address */}
                <div className="pt-3 border-t border-[#F0ECE0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="text-[#647967] space-y-0.5 max-w-md">
                    <div>Giao tới: <strong className="text-[#233527]">{order.customerName}</strong> ({order.customerPhone})</div>
                    <div className="text-[11px] truncate">Địa chỉ: {order.shippingAddress}</div>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] text-[#738876] block">Tổng thanh toán:</span>
                    <span className="font-serif text-base font-bold text-[#325238] tabular-nums">
                      {formatVND(order.totalAmount)}
                    </span>
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
