import {
  Booking,
  Order,
  ServiceItem,
  ProductItem,
  Coupon,
  ContactMessage,
  SpaSettings,
  User
} from '../types';
import {
  SEED_SERVICES,
  SEED_PRODUCTS,
  SEED_COUPONS,
  SEED_SETTINGS,
  SEED_USERS,
  SEED_BOOKINGS,
  SEED_ORDERS,
  SEED_MESSAGES
} from '../data/seedData';
import {
  calculateCancellationRefund,
  canRescheduleBooking,
  generateBookingId,
  generateOrderId
} from '../utils/formatters';

/**
 * Server-Side In-Memory Data Store.
 * In production with Vercel or Node.js, this encapsulates the private business data.
 * All sensitive records (customer PII, revenues, bookings, messages) remain strictly
 * on the server and are NEVER exposed to unauthenticated public visitors.
 */
class ServerDataStore {
  private services: ServiceItem[] = JSON.parse(JSON.stringify(SEED_SERVICES));
  private products: ProductItem[] = JSON.parse(JSON.stringify(SEED_PRODUCTS));
  private coupons: Coupon[] = JSON.parse(JSON.stringify(SEED_COUPONS));
  private settings: SpaSettings = JSON.parse(JSON.stringify(SEED_SETTINGS));
  
  // Private Data (Requires Admin Authorization)
  private bookings: Booking[] = JSON.parse(JSON.stringify(SEED_BOOKINGS));
  private orders: Order[] = JSON.parse(JSON.stringify(SEED_ORDERS));
  private messages: ContactMessage[] = JSON.parse(JSON.stringify(SEED_MESSAGES));
  private users: User[] = JSON.parse(JSON.stringify(SEED_USERS));

  // Reset to initial demo records
  reset(): void {
    this.services = JSON.parse(JSON.stringify(SEED_SERVICES));
    this.products = JSON.parse(JSON.stringify(SEED_PRODUCTS));
    this.coupons = JSON.parse(JSON.stringify(SEED_COUPONS));
    this.settings = JSON.parse(JSON.stringify(SEED_SETTINGS));
    this.bookings = JSON.parse(JSON.stringify(SEED_BOOKINGS));
    this.orders = JSON.parse(JSON.stringify(SEED_ORDERS));
    this.messages = JSON.parse(JSON.stringify(SEED_MESSAGES));
    this.users = JSON.parse(JSON.stringify(SEED_USERS));
  }

  // --- PUBLIC CATALOG ACCESS ---
  getPublicServices(): ServiceItem[] {
    return this.services.filter((s) => s.status === 'active');
  }

  getPublicProducts(): ProductItem[] {
    return this.products.filter((p) => p.status === 'active');
  }

  getPublicCoupons(): Coupon[] {
    return this.coupons.filter((c) => c.status === 'active');
  }

  getPublicSettings(): SpaSettings {
    return this.settings;
  }

  // --- PUBLIC CUSTOMER ACTIONS (No Leaks) ---
  createPublicBooking(data: {
    serviceId: string;
    serviceName: string;
    servicePrice: number;
    date: string;
    timeSlot: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    notes?: string;
  }): { success: boolean; bookingId?: string; message?: string } {
    const depositAmount = Math.round(data.servicePrice * (this.settings.depositRate || 0.3));
    const remainingAmount = data.servicePrice - depositAmount;
    const newId = generateBookingId();

    const newBooking: Booking = {
      id: newId,
      userId: `USR-${Date.now().toString().slice(-5)}`,
      customerName: data.customerName.trim(),
      customerPhone: data.customerPhone.trim(),
      customerEmail: data.customerEmail.trim().toLowerCase(),
      serviceId: data.serviceId,
      serviceName: data.serviceName,
      servicePrice: data.servicePrice,
      date: data.date,
      timeSlot: data.timeSlot,
      notes: data.notes?.trim() || '',
      totalAmount: data.servicePrice,
      depositAmount,
      remainingAmount,
      depositPaid: true,
      paymentStatus: 'deposit_paid',
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    this.bookings.unshift(newBooking);

    // Record or update registered customer list
    this.ensureCustomerUser(newBooking.customerEmail, newBooking.customerName, newBooking.customerPhone);

    return { success: true, bookingId: newId, message: 'Đặt lịch thành công!' };
  }

  createPublicOrder(data: {
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    shippingAddress: string;
    items: Array<{ productId: string; quantity: number }>;
    notes?: string;
    couponCode?: string;
    paymentMethod: 'cod' | 'card_simulation';
  }): { success: boolean; orderId?: string; message?: string } {
    if (!data.items || data.items.length === 0) {
      return { success: false, message: 'Giỏ hàng đang trống.' };
    }

    // Verify stock and build items
    let subtotal = 0;
    const orderItems: Order['items'] = [];

    for (const cartItem of data.items) {
      const prod = this.products.find((p) => p.id === cartItem.productId);
      if (!prod) {
        return { success: false, message: `Sản phẩm ${cartItem.productId} không tồn tại.` };
      }
      if (prod.stock < cartItem.quantity) {
        return { success: false, message: `Sản phẩm "${prod.name}" chỉ còn ${prod.stock} trong kho.` };
      }
      subtotal += prod.price * cartItem.quantity;
      orderItems.push({
        productId: prod.id,
        code: prod.code,
        name: prod.name,
        price: prod.price,
        quantity: cartItem.quantity,
        imageUrl: prod.imageUrl
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (data.couponCode) {
      const coupon = this.coupons.find(
        (c) => c.code.toUpperCase() === data.couponCode?.toUpperCase() && c.status === 'active'
      );
      if (coupon && subtotal >= coupon.minOrderValue) {
        if (coupon.discountType === 'percent') {
          discountAmount = Math.round((subtotal * coupon.discountValue) / 100);
        } else {
          discountAmount = coupon.discountValue;
        }
        coupon.usedCount += 1;
      }
    }

    const totalAmount = Math.max(0, subtotal - discountAmount);
    const orderId = generateOrderId();

    // Decrement stock
    for (const item of orderItems) {
      const p = this.products.find((x) => x.id === item.productId);
      if (p) {
        p.stock = Math.max(0, p.stock - item.quantity);
      }
    }

    const newOrder: Order = {
      id: orderId,
      userId: `USR-${Date.now().toString().slice(-5)}`,
      customerName: data.customerName.trim(),
      customerPhone: data.customerPhone.trim(),
      customerEmail: data.customerEmail.trim().toLowerCase(),
      shippingAddress: data.shippingAddress.trim(),
      items: orderItems,
      subtotal,
      discountAmount,
      couponCode: data.couponCode?.trim(),
      totalAmount,
      paymentMethod: data.paymentMethod,
      paymentStatus: data.paymentMethod === 'card_simulation' ? 'paid' : 'pending',
      status: 'pending',
      createdAt: new Date().toISOString(),
      notes: data.notes?.trim()
    };

    this.orders.unshift(newOrder);

    this.ensureCustomerUser(newOrder.customerEmail, newOrder.customerName, newOrder.customerPhone);

    return { success: true, orderId, message: 'Đặt hàng thành công!' };
  }

  createPublicContactMessage(data: {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
  }): { success: boolean; message: string } {
    const newMsg: ContactMessage = {
      id: `MSG-${Date.now().toString().slice(-4)}`,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone.trim(),
      subject: data.subject.trim(),
      message: data.message.trim(),
      createdAt: new Date().toISOString(),
      status: 'unread'
    };
    this.messages.unshift(newMsg);
    return { success: true, message: 'Đã gửi lời nhắn thành công!' };
  }

  // Scoped Customer self-inquiry (no dumping of other customers' data)
  getCustomerBookings(email: string): Booking[] {
    const clean = (email || '').trim().toLowerCase();
    if (!clean) return [];
    return this.bookings.filter((b) => b.customerEmail.toLowerCase() === clean);
  }

  getCustomerOrders(email: string): Order[] {
    const clean = (email || '').trim().toLowerCase();
    if (!clean) return [];
    return this.orders.filter((o) => o.customerEmail.toLowerCase() === clean);
  }

  rescheduleCustomerBooking(bookingId: string, newDate: string, newTime: string, customerEmail?: string): { success: boolean; message: string } {
    const b = this.bookings.find((item) => item.id === bookingId);
    if (!b) return { success: false, message: 'Không tìm thấy lịch hẹn.' };
    if (customerEmail && b.customerEmail.toLowerCase() !== customerEmail.toLowerCase()) {
      return { success: false, message: 'Bạn không có quyền thao tác trên lịch hẹn này.' };
    }
    const check = canRescheduleBooking(b);
    if (!check.allowed) {
      return { success: false, message: check.reason || 'Không thể đổi lịch.' };
    }
    b.date = newDate;
    b.timeSlot = newTime;
    return { success: true, message: 'Đổi lịch hẹn thành công.' };
  }

  cancelCustomerBooking(bookingId: string, customerEmail?: string): { success: boolean; message: string; refundAmount?: number } {
    const b = this.bookings.find((item) => item.id === bookingId);
    if (!b) return { success: false, message: 'Không tìm thấy lịch hẹn.' };
    if (customerEmail && b.customerEmail.toLowerCase() !== customerEmail.toLowerCase()) {
      return { success: false, message: 'Bạn không có quyền thao tác trên lịch hẹn này.' };
    }
    if (b.status === 'cancelled') {
      return { success: false, message: 'Lịch hẹn này đã được hủy trước đó.' };
    }

    const calc = calculateCancellationRefund(b);
    b.status = 'cancelled';
    b.cancelledAt = new Date().toISOString();
    b.refundAmount = calc.refundAmount;
    b.retainedAmount = calc.retainedAmount;
    b.paymentStatus = calc.isFullRefund ? 'refunded_full' : 'refunded_partial';

    const msg = calc.isFullRefund
      ? `Hủy lịch hẹn thành công (trước ${calc.hoursLeft.toFixed(1)}h). Đã mô phỏng hoàn 100% cọc: ${calc.refundAmount.toLocaleString('vi-VN')}đ.`
      : `Hủy lịch hẹn thành công. Hoàn 50% cọc: ${calc.refundAmount.toLocaleString('vi-VN')}đ, phí chuẩn bị: ${calc.retainedAmount.toLocaleString('vi-VN')}đ.`;

    return {
      success: true,
      message: msg,
      refundAmount: calc.refundAmount
    };
  }

  // --- PROTECTED ADMIN OPERATIONS (Requires Admin Token) ---
  getAllBookings(): Booking[] {
    return this.bookings;
  }

  updateBookingStatusAdmin(id: string, status: Booking['status'], paymentStatus?: Booking['paymentStatus']): boolean {
    const b = this.bookings.find((item) => item.id === id);
    if (!b) return false;
    b.status = status;
    if (paymentStatus) b.paymentStatus = paymentStatus;
    return true;
  }

  getAllOrders(): Order[] {
    return this.orders;
  }

  updateOrderStatusAdmin(id: string, status: Order['status'], paymentStatus?: Order['paymentStatus']): boolean {
    const o = this.orders.find((item) => item.id === id);
    if (!o) return false;
    o.status = status;
    if (paymentStatus) o.paymentStatus = paymentStatus;
    return true;
  }

  getAllCustomers(): User[] {
    return this.users.filter((u) => u.role === 'customer');
  }

  getAllMessages(): ContactMessage[] {
    return this.messages;
  }

  updateMessageStatusAdmin(id: string, status: ContactMessage['status']): boolean {
    const m = this.messages.find((item) => item.id === id);
    if (!m) return false;
    m.status = status;
    return true;
  }

  deleteMessageAdmin(id: string): boolean {
    const idx = this.messages.findIndex((item) => item.id === id);
    if (idx === -1) return false;
    this.messages.splice(idx, 1);
    return true;
  }

  getAllServicesAdmin(): ServiceItem[] {
    return this.services;
  }

  saveServiceAdmin(service: ServiceItem): void {
    const idx = this.services.findIndex((s) => s.id === service.id);
    if (idx >= 0) {
      this.services[idx] = service;
    } else {
      this.services.unshift(service);
    }
  }

  toggleServiceStatusAdmin(id: string): boolean {
    const s = this.services.find((item) => item.id === id);
    if (!s) return false;
    s.status = s.status === 'active' ? 'inactive' : 'active';
    return true;
  }

  getAllProductsAdmin(): ProductItem[] {
    return this.products;
  }

  saveProductAdmin(product: ProductItem): void {
    const idx = this.products.findIndex((p) => p.id === product.id);
    if (idx >= 0) {
      this.products[idx] = product;
    } else {
      this.products.unshift(product);
    }
  }

  updateProductStockAdmin(productId: string, newStock: number): boolean {
    const p = this.products.find((item) => item.id === productId);
    if (!p) return false;
    p.stock = Math.max(0, newStock);
    return true;
  }

  getAllCouponsAdmin(): Coupon[] {
    return this.coupons;
  }

  saveCouponAdmin(coupon: Coupon): void {
    const idx = this.coupons.findIndex((c) => c.id === coupon.id);
    if (idx >= 0) {
      this.coupons[idx] = coupon;
    } else {
      this.coupons.unshift(coupon);
    }
  }

  deleteCouponAdmin(id: string): boolean {
    const idx = this.coupons.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    this.coupons.splice(idx, 1);
    return true;
  }

  saveSettingsAdmin(settings: SpaSettings): void {
    this.settings = settings;
  }

  getAdminDashboardStats() {
    const todayStr = new Date().toISOString().split('T')[0];
    const totalBookings = this.bookings.length;
    const todayBookings = this.bookings.filter((b) => b.date === todayStr && b.status !== 'cancelled').length;
    const pendingBookings = this.bookings.filter((b) => b.status === 'pending').length;
    const completedBookings = this.bookings.filter((b) => b.status === 'completed').length;
    const cancelledBookings = this.bookings.filter((b) => b.status === 'cancelled').length;

    const totalDepositRecorded = this.bookings.reduce((sum, b) => {
      if (b.status === 'cancelled') {
        return sum + (b.retainedAmount || 0);
      }
      return sum + (b.depositPaid ? b.depositAmount : 0);
    }, 0);

    const totalOrders = this.orders.length;
    const pendingOrders = this.orders.filter((o) => o.status === 'pending' || o.status === 'processing').length;
    const totalOrderRevenue = this.orders
      .filter((o) => o.status !== 'cancelled')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const customersCount = this.users.filter((u) => u.role === 'customer').length;
    const activeServicesCount = this.services.filter((s) => s.status === 'active').length;
    const activeProductsCount = this.products.filter((p) => p.status === 'active').length;

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
  }

  private ensureCustomerUser(email: string, name: string, phone: string) {
    const existing = this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!existing) {
      this.users.push({
        id: `USR-${Date.now().toString().slice(-6)}`,
        name,
        email,
        phone,
        role: 'customer',
        createdAt: new Date().toISOString(),
        status: 'active'
      });
    }
  }
}

export const serverDataStore = new ServerDataStore();
