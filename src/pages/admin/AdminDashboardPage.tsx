import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { formatVND, formatDateVN } from '../../utils/formatters';
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  Users,
  Sparkles,
  ShoppingBag,
  PackageCheck,
  CreditCard,
  AlertCircle,
  TrendingUp,
  ArrowRight
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { bookings, orders, services, products, users } = useApp();

  const todayStr = new Date().toISOString().split('T')[0];

  const stats = useMemo(() => {
    const totalBookings = bookings.length;
    const todayBookings = bookings.filter((b) => b.date === todayStr && b.status !== 'cancelled').length;
    const pendingBookings = bookings.filter((b) => b.status === 'pending').length;
    const completedBookings = bookings.filter((b) => b.status === 'completed').length;
    const cancelledBookings = bookings.filter((b) => b.status === 'cancelled').length;

    // Total deposit recorded (only for non-cancelled or partial retained)
    const totalDepositRecorded = bookings.reduce((sum, b) => {
      if (b.status === 'cancelled') {
        return sum + (b.retainedAmount || 0);
      }
      return sum + (b.depositPaid ? b.depositAmount : 0);
    }, 0);

    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => o.status === 'pending' || o.status === 'processing').length;
    const totalOrderRevenue = orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const customersCount = users.filter((u) => u.role === 'customer').length;
    const activeServicesCount = services.filter((s) => s.status === 'active').length;
    const activeProductsCount = products.filter((p) => p.status === 'active').length;

    return {
      totalBookings,
      todayBookings,
      pendingBookings,
      completedBookings,
      cancelledBookings,
      totalDepositRecorded,
      totalOrders,
      pendingOrders,
      totalOrderRevenue,
      customersCount,
      activeServicesCount,
      activeProductsCount
    };
  }, [bookings, orders, services, products, users, todayStr]);

  // Top services by bookings
  const topServices = useMemo(() => {
    const countMap: Record<string, { name: string; count: number; revenue: number }> = {};
    bookings.forEach((b) => {
      if (!countMap[b.serviceName]) {
        countMap[b.serviceName] = { name: b.serviceName, count: 0, revenue: 0 };
      }
      countMap[b.serviceName].count += 1;
      if (b.status !== 'cancelled') {
        countMap[b.serviceName].revenue += b.totalAmount;
      }
    });
    return Object.values(countMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  }, [bookings]);

  // Recent 5 bookings
  const recentBookings = useMemo(() => {
    return [...bookings].slice(0, 5);
  }, [bookings]);

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-[#DFDAC8] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#1F2F23]">
            Tổng Quan Hoạt Động An Nhiên Spa
          </h2>
          <p className="text-xs text-[#5E7262] mt-0.5">
            Dữ liệu tổng hợp từ nguồn dữ liệu lưu trữ chung · Cập nhật liên tục
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/admin/bookings"
            className="px-4 py-2 bg-[#3E5C44] hover:bg-[#304835] text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <span>Duyệt lịch hẹn</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-[#DFDAC8] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[#6A7F6E]">
            <span>Tổng số lịch hẹn</span>
            <CalendarDays className="w-4 h-4 text-[#4E7656]" />
          </div>
          <div className="font-serif text-2xl font-bold text-[#203124] tabular-nums">
            {stats.totalBookings}
          </div>
          <div className="text-[11px] text-[#718575] flex items-center gap-1">
            <span className="font-semibold text-amber-700">{stats.pendingBookings}</span> chờ xác nhận
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-[#DFDAC8] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[#6A7F6E]">
            <span>Lịch hẹn hôm nay</span>
            <Clock className="w-4 h-4 text-[#4E7656]" />
          </div>
          <div className="font-serif text-2xl font-bold text-[#203124] tabular-nums">
            {stats.todayBookings}
          </div>
          <div className="text-[11px] text-[#718575]">
            Đã hoàn thành: <strong className="text-[#365A3D]">{stats.completedBookings}</strong>
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-[#DFDAC8] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[#6A7F6E]">
            <span>Tổng tiền cọc mô phỏng</span>
            <CreditCard className="w-4 h-4 text-[#4E7656]" />
          </div>
          <div className="font-serif text-2xl font-bold text-[#2E5437] tabular-nums">
            {formatVND(stats.totalDepositRecorded)}
          </div>
          <div className="text-[11px] text-[#718575]">
            Khoản cọc 30% giữ chỗ
          </div>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-[#DFDAC8] shadow-xs space-y-2">
          <div className="flex items-center justify-between text-xs text-[#6A7F6E]">
            <span>Đơn hàng & Doanh số</span>
            <PackageCheck className="w-4 h-4 text-[#4E7656]" />
          </div>
          <div className="font-serif text-2xl font-bold text-[#203124] tabular-nums">
            {stats.totalOrders} đơn
          </div>
          <div className="text-[11px] text-[#718575] tabular-nums">
            Giá trị: <strong className="text-[#203124]">{formatVND(stats.totalOrderRevenue)}</strong>
          </div>
        </div>
      </div>

      {/* Secondary Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-[#DFDAC8] flex items-center justify-between">
          <div>
            <div className="text-xs text-[#6F8373]">Khách hàng đăng ký</div>
            <div className="text-xl font-bold font-serif text-[#213526] tabular-nums">{stats.customersCount} thành viên</div>
          </div>
          <Users className="w-7 h-7 text-[#587B5F]" />
        </div>

        <div className="p-4 bg-white rounded-xl border border-[#DFDAC8] flex items-center justify-between">
          <div>
            <div className="text-xs text-[#6F8373]">Dịch vụ đang hoạt động</div>
            <div className="text-xl font-bold font-serif text-[#213526] tabular-nums">{stats.activeServicesCount} liệu trình</div>
          </div>
          <Sparkles className="w-7 h-7 text-[#587B5F]" />
        </div>

        <div className="p-4 bg-white rounded-xl border border-[#DFDAC8] flex items-center justify-between">
          <div>
            <div className="text-xs text-[#6F8373]">Sản phẩm mỹ phẩm</div>
            <div className="text-xl font-bold font-serif text-[#213526] tabular-nums">{stats.activeProductsCount} mặt hàng</div>
          </div>
          <ShoppingBag className="w-7 h-7 text-[#587B5F]" />
        </div>
      </div>

      {/* Analytics & Top Services */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Top Services by bookings */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-[#DFDAC8] shadow-xs space-y-4">
          <h3 className="font-serif text-lg font-bold text-[#223526] flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#4E7656]" />
            <span>Liệu Trình Được Đặt Nhiều Nhất</span>
          </h3>

          <div className="space-y-3">
            {topServices.length === 0 ? (
              <p className="text-xs text-slate-400">Chưa có dữ liệu đặt lịch.</p>
            ) : (
              topServices.map((srv, idx) => (
                <div key={idx} className="p-3 bg-[#FAF9F5] rounded-xl border border-[#E5DFCE] space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#25392A] truncate max-w-[260px]">{srv.name}</span>
                    <span className="font-bold text-[#3B6144] tabular-nums">{srv.count} lượt đặt</span>
                  </div>
                  <div className="w-full bg-[#E8E4D5] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#4E7656] h-full rounded-full"
                      style={{
                        width: `${Math.min(100, (srv.count / Math.max(1, stats.totalBookings)) * 100)}%`
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Booking Status Distribution */}
        <div className="lg:col-span-6 bg-white p-6 rounded-2xl border border-[#DFDAC8] shadow-xs space-y-4">
          <h3 className="font-serif text-lg font-bold text-[#223526]">
            Phân Bố Trạng Thái Lịch Hẹn
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-xl space-y-1">
              <span className="text-amber-800 font-medium">Chờ xác nhận</span>
              <div className="font-serif text-2xl font-bold text-amber-900 tabular-nums">
                {stats.pendingBookings}
              </div>
            </div>

            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
              <span className="text-emerald-800 font-medium">Đã hoàn thành</span>
              <div className="font-serif text-2xl font-bold text-emerald-900 tabular-nums">
                {stats.completedBookings}
              </div>
            </div>

            <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-xl space-y-1">
              <span className="text-rose-800 font-medium">Đã hủy theo quy tắc</span>
              <div className="font-serif text-2xl font-bold text-rose-900 tabular-nums">
                {stats.cancelledBookings}
              </div>
            </div>

            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1">
              <span className="text-blue-800 font-medium">Đơn hàng cần gửi</span>
              <div className="font-serif text-2xl font-bold text-blue-900 tabular-nums">
                {stats.pendingOrders}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bookings Table */}
      <div className="bg-white p-6 rounded-2xl border border-[#DFDAC8] shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg font-bold text-[#223526]">
            Lịch Hẹn Vừa Ghi Nhận
          </h3>
          <Link
            to="/admin/bookings"
            className="text-xs font-semibold text-[#425E47] hover:underline"
          >
            Xem tất cả lịch hẹn →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9F5] border-b border-[#E0DBCB] text-[#556D5B] font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-3">Mã lịch</th>
                <th className="py-3 px-3">Khách hàng</th>
                <th className="py-3 px-3">Dịch vụ</th>
                <th className="py-3 px-3">Thời gian</th>
                <th className="py-3 px-3">Tiền cọc</th>
                <th className="py-3 px-3">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2EFE6]">
              {recentBookings.map((b) => (
                <tr key={b.id} className="hover:bg-[#FAF9F5]/60 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-[#233527]">{b.id}</td>
                  <td className="py-3 px-3 font-medium text-[#25392A]">
                    {b.customerName}
                    <div className="text-[10px] text-[#788E7D]">{b.customerPhone}</div>
                  </td>
                  <td className="py-3 px-3 text-[#3B4E3E] max-w-[200px] truncate">{b.serviceName}</td>
                  <td className="py-3 px-3 font-medium text-[#243628]">
                    {b.timeSlot} · {formatDateVN(b.date)}
                  </td>
                  <td className="py-3 px-3 font-bold text-[#34593C] tabular-nums">
                    {formatVND(b.depositAmount)}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        b.status === 'confirmed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : b.status === 'completed'
                          ? 'bg-blue-100 text-blue-800'
                          : b.status === 'cancelled'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {b.status === 'confirmed'
                        ? 'Đã duyệt'
                        : b.status === 'completed'
                        ? 'Hoàn thành'
                        : b.status === 'cancelled'
                        ? 'Đã hủy'
                        : 'Chờ duyệt'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
