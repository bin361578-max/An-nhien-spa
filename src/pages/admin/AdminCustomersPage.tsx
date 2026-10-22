import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatVND, formatDateVN } from '../../utils/formatters';
import { User, Booking, Order } from '../../types';
import { Search, Eye, Calendar, Package, Users } from 'lucide-react';

export const AdminCustomersPage: React.FC = () => {
  const { users, bookings, orders } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<User | null>(null);

  const customerList = useMemo(() => {
    return users.filter((u) => u.role === 'customer');
  }, [users]);

  const filteredCustomers = useMemo(() => {
    if (!searchTerm.trim()) return customerList;
    const q = searchTerm.toLowerCase();
    return customerList.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q)
    );
  }, [customerList, searchTerm]);

  // Statistics for selected customer
  const customerBookings = useMemo(() => {
    if (!selectedCustomer) return [];
    return bookings.filter(
      (b) => b.userId === selectedCustomer.id || b.customerEmail.toLowerCase() === selectedCustomer.email.toLowerCase()
    );
  }, [bookings, selectedCustomer]);

  const customerOrders = useMemo(() => {
    if (!selectedCustomer) return [];
    return orders.filter(
      (o) => o.userId === selectedCustomer.id || o.customerEmail.toLowerCase() === selectedCustomer.email.toLowerCase()
    );
  }, [orders, selectedCustomer]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E0DBCB]">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#1F2F23]">
            Quản Lý Khách Hàng
          </h2>
          <p className="text-xs text-[#5F7463] mt-0.5">
            Tổng số: <strong>{customerList.length}</strong> khách hàng đã đăng ký tài khoản demo
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-[#DFDAC8] shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-[#7A907E]" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm theo tên, email, số điện thoại khách hàng..."
          className="w-full bg-transparent text-xs text-[#243527] focus:outline-hidden"
        />
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-2xl border border-[#DFDAC8] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9F5] border-b border-[#E0DBCB] text-[#556D5B] font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Mã KH</th>
                <th className="py-3.5 px-4">Họ và tên</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Số điện thoại</th>
                <th className="py-3.5 px-4">Ngày đăng ký</th>
                <th className="py-3.5 px-4 text-center">Lịch hẹn</th>
                <th className="py-3.5 px-4 text-center">Đơn hàng</th>
                <th className="py-3.5 px-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2EFE6]">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Không tìm thấy khách hàng nào.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => {
                  const bCount = bookings.filter(
                    (b) => b.userId === customer.id || b.customerEmail.toLowerCase() === customer.email.toLowerCase()
                  ).length;
                  const oCount = orders.filter(
                    (o) => o.userId === customer.id || o.customerEmail.toLowerCase() === customer.email.toLowerCase()
                  ).length;

                  return (
                    <tr key={customer.id} className="hover:bg-[#FAF9F5]/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#203124]">
                        {customer.id}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#233527]">
                        {customer.name}
                      </td>
                      <td className="py-3.5 px-4 text-[#4E6252]">
                        {customer.email}
                      </td>
                      <td className="py-3.5 px-4 text-[#4E6252]">
                        {customer.phone}
                      </td>
                      <td className="py-3.5 px-4 text-[#718575]">
                        {formatDateVN(customer.createdAt)}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-[#3E6144] tabular-nums">
                        {bCount}
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-[#3E6144] tabular-nums">
                        {oCount}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedCustomer(customer)}
                          className="p-1.5 text-[#3E5C44] hover:bg-[#F2EFE6] rounded-lg transition-colors"
                          title="Xem hồ sơ & lịch sử"
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

      {/* CUSTOMER DETAIL MODAL */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-xl w-full shadow-2xl border border-[#DFDAC8] space-y-5 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAE5D7]">
              <div>
                <span className="text-[10px] uppercase font-semibold text-[#667A6B]">Hồ sơ khách hàng</span>
                <h3 className="font-serif text-xl font-bold text-[#203124]">{selectedCustomer.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-[#FAF9F5] p-3.5 rounded-xl border border-[#DFDAC8] text-xs">
              <div>Email: <strong>{selectedCustomer.email}</strong></div>
              <div>Số điện thoại: <strong>{selectedCustomer.phone}</strong></div>
              <div>Mã khách hàng: <code>{selectedCustomer.id}</code></div>
              <div>Ngày đăng ký: {formatDateVN(selectedCustomer.createdAt)}</div>
            </div>

            {/* History of Bookings */}
            <div className="space-y-2">
              <h4 className="font-semibold text-xs text-[#283C2E] flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#4E7656]" />
                <span>Lịch hẹn đã đặt ({customerBookings.length}):</span>
              </h4>
              {customerBookings.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Khách hàng chưa đặt lịch nào.</p>
              ) : (
                <div className="divide-y divide-[#F0ECE0] text-xs max-h-36 overflow-y-auto border border-[#E5DFCE] rounded-xl p-2 bg-[#FAF9F5]">
                  {customerBookings.map((b) => (
                    <div key={b.id} className="py-1.5 flex justify-between items-center">
                      <div>
                        <span className="font-bold">{b.serviceName}</span>
                        <div className="text-[10px] text-[#718575]">{b.timeSlot} · {formatDateVN(b.date)}</div>
                      </div>
                      <span className="font-semibold text-[#3E6144]">{formatVND(b.totalAmount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* History of Orders */}
            <div className="space-y-2">
              <h4 className="font-semibold text-xs text-[#283C2E] flex items-center gap-1.5">
                <Package className="w-4 h-4 text-[#4E7656]" />
                <span>Đơn hàng mỹ phẩm ({customerOrders.length}):</span>
              </h4>
              {customerOrders.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Khách hàng chưa mua đơn hàng nào.</p>
              ) : (
                <div className="divide-y divide-[#F0ECE0] text-xs max-h-36 overflow-y-auto border border-[#E5DFCE] rounded-xl p-2 bg-[#FAF9F5]">
                  {customerOrders.map((o) => (
                    <div key={o.id} className="py-1.5 flex justify-between items-center">
                      <div>
                        <span className="font-bold">{o.id}</span> ({o.items.length} sp)
                        <div className="text-[10px] text-[#718575]">{formatDateVN(o.createdAt)}</div>
                      </div>
                      <span className="font-semibold text-[#3E6144]">{formatVND(o.totalAmount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
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
