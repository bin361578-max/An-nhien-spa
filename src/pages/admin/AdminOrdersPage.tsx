import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatVND, formatDateTimeVN } from '../../utils/formatters';
import { Order, OrderStatus } from '../../types';
import { Search, Eye, Package, Truck, CheckCircle, XCircle } from 'lucide-react';

export const AdminOrdersPage: React.FC = () => {
  const { orders, updateOrderStatus } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const match =
          o.id.toLowerCase().includes(q) ||
          o.customerName.toLowerCase().includes(q) ||
          o.customerPhone.includes(q);
        if (!match) return false;
      }
      if (filterStatus !== 'all' && o.status !== filterStatus) return false;
      return true;
    });
  }, [orders, searchTerm, filterStatus]);

  const handleUpdateStatus = (orderId: string, status: OrderStatus) => {
    updateOrderStatus(orderId, status);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E0DBCB]">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#1F2F23]">
            Quản Lý Đơn Hàng Mỹ Phẩm
          </h2>
          <p className="text-xs text-[#5F7463] mt-0.5">
            Tổng cộng: <strong>{filteredOrders.length}</strong> / {orders.length} đơn hàng
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#DFDAC8] shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#7A907E] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo mã đơn, tên khách, số điện thoại..."
            className="w-full pl-9 pr-3 py-2 bg-[#FAF9F5] border border-[#D5D0BF] rounded-xl text-xs text-[#273B2C] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden"
          />
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="py-2 px-3 bg-[#FAF9F5] border border-[#D5D0BF] rounded-xl text-xs text-[#273B2C] focus:ring-2 focus:ring-[#4E7656] focus:outline-hidden"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="pending">Chờ xử lý</option>
          <option value="confirmed">Đã xác nhận</option>
          <option value="processing">Đang chuẩn bị hàng</option>
          <option value="shipping">Đang giao hàng</option>
          <option value="completed">Đã hoàn thành</option>
          <option value="cancelled">Đã hủy</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-[#DFDAC8] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9F5] border-b border-[#E0DBCB] text-[#556D5B] font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Mã đơn</th>
                <th className="py-3.5 px-4">Khách hàng</th>
                <th className="py-3.5 px-4">Mặt hàng</th>
                <th className="py-3.5 px-4">Tổng tiền</th>
                <th className="py-3.5 px-4">Thanh toán</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2EFE6]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Không tìm thấy đơn hàng nào.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const statusColors: Record<OrderStatus, string> = {
                    pending: 'bg-amber-100 text-amber-800',
                    confirmed: 'bg-emerald-100 text-emerald-800',
                    processing: 'bg-blue-100 text-blue-800',
                    shipping: 'bg-purple-100 text-purple-800',
                    completed: 'bg-emerald-200 text-emerald-900',
                    cancelled: 'bg-rose-100 text-rose-800'
                  };

                  return (
                    <tr key={order.id} className="hover:bg-[#FAF9F5]/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#203124]">
                        {order.id}
                        <div className="text-[10px] text-[#718575] font-normal">{formatDateTimeVN(order.createdAt)}</div>
                      </td>

                      <td className="py-3.5 px-4 font-medium text-[#25392A]">
                        {order.customerName}
                        <div className="text-[11px] text-[#718575] font-normal">{order.customerPhone}</div>
                      </td>

                      <td className="py-3.5 px-4 text-[#354839] max-w-[200px] truncate">
                        {order.items.map((i) => `${i.name} (x${i.quantity})`).join(', ')}
                      </td>

                      <td className="py-3.5 px-4 font-bold text-[#2A4731] tabular-nums">
                        {formatVND(order.totalAmount)}
                      </td>

                      <td className="py-3.5 px-4 text-[11px]">
                        <div>{order.paymentMethod === 'cod' ? 'COD' : 'Thẻ (Mô phỏng)'}</div>
                        <span className={order.paymentStatus === 'paid' ? 'text-emerald-700 font-semibold' : 'text-amber-700'}>
                          {order.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thu tiền'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${statusColors[order.status]}`}>
                          {{
                            pending: 'Chờ xử lý',
                            confirmed: 'Đã xác nhận',
                            processing: 'Đang chuẩn bị',
                            shipping: 'Đang giao',
                            completed: 'Hoàn thành',
                            cancelled: 'Đã hủy'
                          }[order.status]}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          className="p-1.5 text-[#3E5C44] hover:bg-[#F2EFE6] rounded-lg transition-colors"
                          title="Xem chi tiết & đổi trạng thái"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-[#DFDAC8] space-y-5 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE5D7]">
              <div>
                <span className="text-[10px] uppercase font-semibold text-[#667A6B]">Chi tiết đơn hàng</span>
                <h3 className="font-mono text-lg font-bold text-[#203124]">{selectedOrder.id}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-[#FAF9F5] rounded-xl border border-[#DFDAC8] space-y-1">
                <div>Người nhận: <strong>{selectedOrder.customerName}</strong> ({selectedOrder.customerPhone})</div>
                <div>Email: {selectedOrder.customerEmail}</div>
                <div>Địa chỉ: {selectedOrder.shippingAddress}</div>
                {selectedOrder.notes && <div>Ghi chú: <em>"{selectedOrder.notes}"</em></div>}
              </div>

              <div className="space-y-2">
                <span className="font-semibold text-[#273B2C] block">Danh sách sản phẩm:</span>
                <div className="divide-y divide-[#F0ECE0]">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="py-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-10 h-10 rounded-lg object-cover bg-slate-100"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <div className="font-medium text-[#25392A]">{item.name}</div>
                          <div className="text-[10px] text-[#718575]">{item.quantity} × {formatVND(item.price)}</div>
                        </div>
                      </div>
                      <span className="font-bold tabular-nums">{formatVND(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-[#FAF9F5] rounded-xl border border-[#DFDAC8] space-y-1">
                <div className="flex justify-between text-[#687D6E]">
                  <span>Tạm tính:</span>
                  <span>{formatVND(selectedOrder.subtotal)}</span>
                </div>
                {selectedOrder.discountAmount > 0 && (
                  <div className="flex justify-between text-[#38623F] font-semibold">
                    <span>Giảm giá voucher:</span>
                    <span>-{formatVND(selectedOrder.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#243729] font-bold text-sm pt-1 border-t border-[#DFDAC8]">
                  <span>Tổng thanh toán:</span>
                  <span>{formatVND(selectedOrder.totalAmount)}</span>
                </div>
              </div>

              {/* Status Update Controls */}
              <div className="pt-2 border-t border-[#EAE5D7] space-y-2">
                <span className="font-semibold text-[#273B2C] block">Cập nhật trạng thái đơn:</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'confirmed')}
                    className="py-1.5 px-2 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg font-semibold hover:bg-emerald-100 text-[11px]"
                  >
                    Xác nhận
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'processing')}
                    className="py-1.5 px-2 bg-blue-50 text-blue-800 border border-blue-200 rounded-lg font-semibold hover:bg-blue-100 text-[11px]"
                  >
                    Đang chuẩn bị
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'shipping')}
                    className="py-1.5 px-2 bg-purple-50 text-purple-800 border border-purple-200 rounded-lg font-semibold hover:bg-purple-100 text-[11px]"
                  >
                    Đang giao
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'completed')}
                    className="py-1.5 px-2 bg-emerald-700 text-white rounded-lg font-semibold hover:bg-emerald-800 text-[11px]"
                  >
                    Đã hoàn thành
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'cancelled')}
                    className="py-1.5 px-2 bg-rose-50 text-rose-800 border border-rose-200 rounded-lg font-semibold hover:bg-rose-100 text-[11px]"
                  >
                    Hủy (Hoàn kho)
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="w-full py-2.5 px-4 border border-[#D5D0BF] text-[#465E4B] rounded-xl text-xs font-semibold hover:bg-[#FAF9F5]"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
