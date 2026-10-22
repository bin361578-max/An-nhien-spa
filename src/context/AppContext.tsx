import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';
import {
  User,
  ServiceItem,
  ProductItem,
  Booking,
  Order,
  Coupon,
  ContactMessage,
  SpaSettings,
  CartItem
} from '../types';
import { StorageService, STORAGE_CHANGE_EVENT } from '../services/storage';
import {
  generateBookingId,
  generateOrderId,
  calculateCancellationRefund,
  canRescheduleBooking
} from '../utils/formatters';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  currentUser: User | null;
  users: User[];
  services: ServiceItem[];
  products: ProductItem[];
  bookings: Booking[];
  orders: Order[];
  coupons: Coupon[];
  messages: ContactMessage[];
  settings: SpaSettings;
  cart: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
  
  // Auth
  login: (email: string, rolePreferred?: 'customer' | 'admin') => { success: boolean; message?: string };
  register: (name: string, email: string, phone: string) => { success: boolean; message?: string };
  logout: () => void;
  updateProfile: (name: string, phone: string, email: string) => { success: boolean; message?: string };
  
  // Cart
  addToCart: (productId: string, quantity?: number) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;

  // Booking
  createBooking: (bookingData: {
    serviceId: string;
    serviceName: string;
    servicePrice: number;
    date: string;
    timeSlot: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    notes?: string;
  }) => { success: boolean; bookingId?: string; message?: string };
  
  rescheduleBookingAction: (bookingId: string, newDate: string, newTime: string) => { success: boolean; message: string };
  cancelBookingAction: (bookingId: string) => { success: boolean; message: string; refundAmount?: number };

  // Orders
  createOrderAction: (orderData: {
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    shippingAddress: string;
    notes?: string;
    couponCode?: string;
    discountAmount: number;
    paymentMethod: 'cod' | 'card_simulation';
  }) => { success: boolean; orderId?: string; message?: string };

  // Admin Actions
  updateBookingStatus: (bookingId: string, status: Booking['status'], paymentStatus?: Booking['paymentStatus']) => void;
  updateOrderStatus: (orderId: string, status: Order['status'], paymentStatus?: Order['paymentStatus']) => void;
  saveService: (service: ServiceItem) => void;
  toggleServiceStatus: (serviceId: string) => void;
  saveProduct: (product: ProductItem) => void;
  updateProductStock: (productId: string, newStock: number) => void;
  saveCoupon: (coupon: Coupon) => void;
  deleteCoupon: (couponId: string) => void;
  updateMessageStatus: (messageId: string, status: ContactMessage['status']) => void;
  deleteMessage: (messageId: string) => void;
  saveSettings: (settings: SpaSettings) => void;
  resetDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => StorageService.getCurrentUser());
  const [users, setUsers] = useState<User[]>(() => StorageService.getUsers());
  const [services, setServices] = useState<ServiceItem[]>(() => StorageService.getServices());
  const [products, setProducts] = useState<ProductItem[]>(() => StorageService.getProducts());
  const [bookings, setBookings] = useState<Booking[]>(() => StorageService.getBookings());
  const [orders, setOrders] = useState<Order[]>(() => StorageService.getOrders());
  const [coupons, setCoupons] = useState<Coupon[]>(() => StorageService.getCoupons());
  const [messages, setMessages] = useState<ContactMessage[]>(() => StorageService.getMessages());
  const [settings, setSettings] = useState<SpaSettings>(() => StorageService.getSettings());
  const [cart, setCart] = useState<CartItem[]>(() => StorageService.getCart());
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Function to refresh state from storage
  const syncStateFromStorage = () => {
    setCurrentUser(StorageService.getCurrentUser());
    setUsers(StorageService.getUsers());
    setServices(StorageService.getServices());
    setProducts(StorageService.getProducts());
    setBookings(StorageService.getBookings());
    setOrders(StorageService.getOrders());
    setCoupons(StorageService.getCoupons());
    setMessages(StorageService.getMessages());
    setSettings(StorageService.getSettings());
    setCart(StorageService.getCart());
  };

  useEffect(() => {
    const handleStorageChange = () => {
      syncStateFromStorage();
    };

    window.addEventListener(STORAGE_CHANGE_EVENT, handleStorageChange);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener(STORAGE_CHANGE_EVENT, handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Auth operations
  const login = (email: string, rolePreferred?: 'customer' | 'admin') => {
    const normalizedEmail = email.trim().toLowerCase();
    const existing = users.find((u) => u.email.toLowerCase() === normalizedEmail);

    if (existing) {
      if (existing.status === 'blocked') {
        return { success: false, message: 'Tài khoản này đã bị tạm khóa. Vui lòng liên hệ quản trị viên.' };
      }
      StorageService.setCurrentUser(existing);
      showToast(`Chào mừng ${existing.name} quay trở lại!`, 'success');
      return { success: true };
    }

    // If logging into admin with the demo email
    if (normalizedEmail === 'admin@annhienspa.demo' || rolePreferred === 'admin') {
      const adminUser: User = {
        id: 'USR-ADMIN-01',
        name: 'Quản Trị Viên An Nhiên',
        email: normalizedEmail,
        phone: '0908123456',
        role: 'admin',
        createdAt: new Date().toISOString(),
        status: 'active'
      };
      const updatedUsers = [...users, adminUser];
      StorageService.saveUsers(updatedUsers);
      StorageService.setCurrentUser(adminUser);
      showToast('Đăng nhập thành công với vai trò Quản trị viên.', 'success');
      return { success: true };
    }

    // Automatically create a demo customer account if entering a new email
    const newCustomer: User = {
      id: `USR-${Date.now().toString().slice(-6)}`,
      name: normalizedEmail.split('@')[0],
      email: normalizedEmail,
      phone: '0912345678',
      role: 'customer',
      createdAt: new Date().toISOString(),
      status: 'active'
    };
    const updatedUsers = [...users, newCustomer];
    StorageService.saveUsers(updatedUsers);
    StorageService.setCurrentUser(newCustomer);
    showToast(`Chào mừng thành viên mới: ${newCustomer.name}`, 'success');
    return { success: true };
  };

  const register = (name: string, email: string, phone: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (users.some((u) => u.email.toLowerCase() === normalizedEmail)) {
      return { success: false, message: 'Email này đã được sử dụng. Vui lòng đăng nhập.' };
    }
    const newUser: User = {
      id: `USR-${Date.now().toString().slice(-6)}`,
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      role: 'customer',
      createdAt: new Date().toISOString(),
      status: 'active'
    };
    const updatedUsers = [...users, newUser];
    StorageService.saveUsers(updatedUsers);
    StorageService.setCurrentUser(newUser);
    showToast('Đăng ký tài khoản thành công!', 'success');
    return { success: true };
  };

  const logout = () => {
    StorageService.setCurrentUser(null);
    showToast('Đã đăng xuất an toàn.', 'info');
  };

  const updateProfile = (name: string, phone: string, email: string) => {
    if (!currentUser) return { success: false, message: 'Chưa đăng nhập.' };
    const updatedUser: User = {
      ...currentUser,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase()
    };
    const updatedUsers = users.map((u) => (u.id === currentUser.id ? updatedUser : u));
    StorageService.saveUsers(updatedUsers);
    StorageService.setCurrentUser(updatedUser);
    showToast('Cập nhật hồ sơ thành công!', 'success');
    return { success: true };
  };

  // Cart operations
  const addToCart = (productId: string, quantity: number = 1) => {
    const product = products.find((p) => p.id === productId);
    if (!product) {
      showToast('Sản phẩm không tồn tại.', 'error');
      return;
    }
    if (product.stock <= 0 || product.status === 'inactive') {
      showToast('Sản phẩm đã hết hàng hoặc tạm ngừng bán.', 'error');
      return;
    }

    const currentCart = [...cart];
    const index = currentCart.findIndex((item) => item.productId === productId);

    if (index > -1) {
      const newQty = currentCart[index].quantity + quantity;
      if (newQty > product.stock) {
        showToast(`Chỉ còn ${product.stock} sản phẩm trong kho.`, 'error');
        return;
      }
      currentCart[index].quantity = newQty;
    } else {
      if (quantity > product.stock) {
        showToast(`Chỉ còn ${product.stock} sản phẩm trong kho.`, 'error');
        return;
      }
      currentCart.push({ productId, quantity });
    }

    StorageService.saveCart(currentCart);
    showToast(`Đã thêm "${product.name}" vào giỏ hàng!`, 'success');
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    if (quantity > product.stock) {
      showToast(`Kho hàng chỉ còn ${product.stock} sản phẩm.`, 'error');
      return;
    }
    const currentCart = cart.map((item) => (item.productId === productId ? { ...item, quantity } : item));
    StorageService.saveCart(currentCart);
  };

  const removeFromCart = (productId: string) => {
    const currentCart = cart.filter((item) => item.productId !== productId);
    StorageService.saveCart(currentCart);
    showToast('Đã bỏ sản phẩm khỏi giỏ hàng.', 'info');
  };

  const clearCart = () => {
    StorageService.clearCart();
  };

  const cartCount = useMemo(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  const cartSubtotal = useMemo(() => {
    return cart.reduce((total, item) => {
      const prod = products.find((p) => p.id === item.productId);
      return total + (prod ? prod.price * item.quantity : 0);
    }, 0);
  }, [cart, products]);

  // Booking operations
  const createBooking = (bookingData: {
    serviceId: string;
    serviceName: string;
    servicePrice: number;
    date: string;
    timeSlot: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    notes?: string;
  }) => {
    const depositRate = settings.depositRate || 0.3;
    const totalAmount = bookingData.servicePrice;
    const depositAmount = Math.round(totalAmount * depositRate);
    const remainingAmount = totalAmount - depositAmount;

    // Check duplicate slot simulation: maximum 3 clients per slot
    const sameSlotBookings = bookings.filter(
      (b) => b.date === bookingData.date && b.timeSlot === bookingData.timeSlot && b.status !== 'cancelled'
    );
    if (sameSlotBookings.length >= 3) {
      return {
        success: false,
        message: 'Khung giờ này đã kín lịch hẹn. Quý khách vui lòng chọn khung giờ khác hoặc ngày khác.'
      };
    }

    const newBooking: Booking = {
      id: generateBookingId(),
      userId: currentUser?.id || 'GUEST',
      customerName: bookingData.customerName,
      customerPhone: bookingData.customerPhone,
      customerEmail: bookingData.customerEmail,
      serviceId: bookingData.serviceId,
      serviceName: bookingData.serviceName,
      servicePrice: bookingData.servicePrice,
      date: bookingData.date,
      timeSlot: bookingData.timeSlot,
      notes: bookingData.notes || '',
      totalAmount,
      depositAmount,
      remainingAmount,
      depositPaid: true,
      paymentStatus: 'deposit_paid',
      status: 'pending',
      createdAt: new Date().toISOString(),
      rescheduleHistory: []
    };

    StorageService.addBooking(newBooking);
    showToast(`Đặt lịch thành công! Mã lịch hẹn: ${newBooking.id}`, 'success');
    return { success: true, bookingId: newBooking.id };
  };

  const rescheduleBookingAction = (bookingId: string, newDate: string, newTime: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return { success: false, message: 'Không tìm thấy lịch hẹn.' };

    const check = canRescheduleBooking(booking);
    if (!check.allowed) {
      return { success: false, message: check.reason || 'Không đủ điều kiện đổi lịch.' };
    }

    // Check target date is not in past
    const now = new Date();
    const [h, m] = newTime.split(':').map(Number);
    const targetDate = new Date(`${newDate}T00:00:00`);
    targetDate.setHours(h, m, 0, 0);
    if (targetDate <= now) {
      return { success: false, message: 'Không thể dời lịch sang thời gian trong quá khứ.' };
    }

    const historyRecord = {
      oldDate: booking.date,
      oldTime: booking.timeSlot,
      newDate,
      newTime,
      changedAt: new Date().toISOString(),
      reason: 'Khách hàng dời lịch qua hệ thống trực tuyến'
    };

    const newHistory = [...(booking.rescheduleHistory || []), historyRecord];

    const success = StorageService.updateBooking(bookingId, {
      date: newDate,
      timeSlot: newTime,
      rescheduleHistory: newHistory
    });

    if (success) {
      showToast(`Đổi lịch hẹn ${bookingId} thành công sang ${newDate} lúc ${newTime}.`, 'success');
      return { success: true, message: 'Đổi lịch thành công!' };
    }
    return { success: false, message: 'Lỗi cập nhật dữ liệu.' };
  };

  const cancelBookingAction = (bookingId: string) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return { success: false, message: 'Không tìm thấy lịch hẹn.' };
    if (booking.status === 'cancelled') {
      return { success: false, message: 'Lịch hẹn này đã bị hủy trước đó.' };
    }

    const { refundAmount, retainedAmount, isFullRefund, hoursLeft } = calculateCancellationRefund(booking);

    const paymentStatus: Booking['paymentStatus'] = isFullRefund ? 'refunded_full' : 'refunded_partial';

    const success = StorageService.updateBooking(bookingId, {
      status: 'cancelled',
      paymentStatus,
      cancelledAt: new Date().toISOString(),
      refundAmount,
      retainedAmount
    });

    if (success) {
      const msg = isFullRefund
        ? `Hủy lịch hẹn thành công (trước ${hoursLeft.toFixed(1)}h). Đã mô phỏng hoàn 100% cọc: ${refundAmount.toLocaleString('vi-VN')}đ.`
        : `Hủy lịch hẹn thành công (dưới 24h). Hoàn 50% cọc: ${refundAmount.toLocaleString('vi-VN')}đ, phí giữ chỗ: ${retainedAmount.toLocaleString('vi-VN')}đ.`;
      showToast(msg, 'info');
      return { success: true, message: msg, refundAmount };
    }
    return { success: false, message: 'Lỗi khi hủy lịch hẹn.' };
  };

  // Orders
  const createOrderAction = (orderData: {
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    shippingAddress: string;
    notes?: string;
    couponCode?: string;
    discountAmount: number;
    paymentMethod: 'cod' | 'card_simulation';
  }) => {
    if (cart.length === 0) {
      return { success: false, message: 'Giỏ hàng của bạn đang trống.' };
    }

    // Verify stock availability
    for (const item of cart) {
      const product = products.find((p) => p.id === item.productId);
      if (!product || product.stock < item.quantity) {
        return {
          success: false,
          message: `Sản phẩm "${product?.name || item.productId}" không đủ số lượng tồn kho.`
        };
      }
    }

    // Build order items
    const orderItems = cart.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      return {
        productId: product.id,
        code: product.code,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        imageUrl: product.imageUrl
      };
    });

    const subtotal = cartSubtotal;
    const finalTotal = Math.max(0, subtotal - orderData.discountAmount);

    // Deduct stock
    for (const item of cart) {
      StorageService.updateStock(item.productId, item.quantity);
    }

    // Update coupon usage if used
    if (orderData.couponCode) {
      const coupon = coupons.find((c) => c.code.toUpperCase() === orderData.couponCode!.toUpperCase());
      if (coupon) {
        const updatedCoupons = coupons.map((c) =>
          c.id === coupon.id ? { ...c, usedCount: c.usedCount + 1 } : c
        );
        StorageService.saveCoupons(updatedCoupons);
      }
    }

    const orderId = generateOrderId();
    const newOrder: Order = {
      id: orderId,
      userId: currentUser?.id || 'GUEST',
      customerName: orderData.customerName,
      customerPhone: orderData.customerPhone,
      customerEmail: orderData.customerEmail,
      shippingAddress: orderData.shippingAddress,
      items: orderItems,
      subtotal,
      discountAmount: orderData.discountAmount,
      couponCode: orderData.couponCode,
      totalAmount: finalTotal,
      paymentMethod: orderData.paymentMethod,
      paymentStatus: orderData.paymentMethod === 'card_simulation' ? 'paid' : 'pending',
      status: 'pending',
      createdAt: new Date().toISOString(),
      notes: orderData.notes
    };

    StorageService.addOrder(newOrder);
    StorageService.clearCart();
    showToast(`Đặt hàng thành công! Mã đơn: ${orderId}`, 'success');
    return { success: true, orderId };
  };

  // Admin Actions
  const updateBookingStatus = (bookingId: string, status: Booking['status'], paymentStatus?: Booking['paymentStatus']) => {
    const updates: Partial<Booking> = { status };
    if (paymentStatus) {
      updates.paymentStatus = paymentStatus;
    }
    StorageService.updateBooking(bookingId, updates);
    showToast(`Đã cập nhật trạng thái lịch hẹn ${bookingId} thành: ${status}`, 'success');
  };

  const updateOrderStatus = (orderId: string, status: Order['status'], paymentStatus?: Order['paymentStatus']) => {
    const updates: Partial<Order> = { status };
    if (paymentStatus) {
      updates.paymentStatus = paymentStatus;
    }

    // If order is cancelled by admin, restock items
    if (status === 'cancelled') {
      const order = orders.find((o) => o.id === orderId);
      if (order && order.status !== 'cancelled') {
        const allProducts = StorageService.getProducts();
        for (const item of order.items) {
          const pIndex = allProducts.findIndex((p) => p.id === item.productId);
          if (pIndex > -1) {
            allProducts[pIndex].stock += item.quantity;
          }
        }
        StorageService.saveProducts(allProducts);
      }
    }

    StorageService.updateOrder(orderId, updates);
    showToast(`Đã cập nhật đơn hàng ${orderId} sang trạng thái: ${status}`, 'success');
  };

  const saveService = (service: ServiceItem) => {
    const list = [...services];
    const index = list.findIndex((s) => s.id === service.id);
    if (index > -1) {
      list[index] = service;
    } else {
      list.push(service);
    }
    StorageService.saveServices(list);
    showToast(`Đã lưu dịch vụ "${service.name}"!`, 'success');
  };

  const toggleServiceStatus = (serviceId: string) => {
    const list = services.map((s) =>
      s.id === serviceId ? { ...s, status: s.status === 'active' ? ('inactive' as const) : ('active' as const) } : s
    );
    StorageService.saveServices(list);
    showToast('Đã thay đổi trạng thái cung cấp dịch vụ.', 'info');
  };

  const saveProduct = (product: ProductItem) => {
    const list = [...products];
    const index = list.findIndex((p) => p.id === product.id);
    if (index > -1) {
      list[index] = product;
    } else {
      list.push(product);
    }
    StorageService.saveProducts(list);
    showToast(`Đã lưu sản phẩm "${product.name}"!`, 'success');
  };

  const updateProductStock = (productId: string, newStock: number) => {
    const list = products.map((p) => (p.id === productId ? { ...p, stock: Math.max(0, newStock) } : p));
    StorageService.saveProducts(list);
    showToast('Đã cập nhật số lượng tồn kho.', 'success');
  };

  const saveCoupon = (coupon: Coupon) => {
    const list = [...coupons];
    const index = list.findIndex((c) => c.id === coupon.id);
    if (index > -1) {
      list[index] = coupon;
    } else {
      list.push(coupon);
    }
    StorageService.saveCoupons(list);
    showToast(`Đã lưu mã ưu đãi "${coupon.code}"!`, 'success');
  };

  const deleteCoupon = (couponId: string) => {
    const list = coupons.filter((c) => c.id !== couponId);
    StorageService.saveCoupons(list);
    showToast('Đã xóa mã ưu đãi.', 'info');
  };

  const updateMessageStatus = (messageId: string, status: ContactMessage['status']) => {
    const list = messages.map((m) => (m.id === messageId ? { ...m, status } : m));
    StorageService.saveMessages(list);
    showToast('Đã cập nhật trạng thái tin nhắn.', 'success');
  };

  const deleteMessage = (messageId: string) => {
    const list = messages.filter((m) => m.id !== messageId);
    StorageService.saveMessages(list);
    showToast('Đã xóa tin nhắn liên hệ.', 'info');
  };

  const saveSettings = (newSettings: SpaSettings) => {
    StorageService.saveSettings(newSettings);
    showToast('Đã lưu cấu hình spa thành công.', 'success');
  };

  const resetDemoData = () => {
    StorageService.resetAll();
    showToast('Đã khôi phục toàn bộ dữ liệu mẫu ban đầu!', 'success');
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        services,
        products,
        bookings,
        orders,
        coupons,
        messages,
        settings,
        cart,
        cartCount,
        cartSubtotal,
        toasts,
        showToast,
        removeToast,
        login,
        register,
        logout,
        updateProfile,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        createBooking,
        rescheduleBookingAction,
        cancelBookingAction,
        createOrderAction,
        updateBookingStatus,
        updateOrderStatus,
        saveService,
        toggleServiceStatus,
        saveProduct,
        updateProductStock,
        saveCoupon,
        deleteCoupon,
        updateMessageStatus,
        deleteMessage,
        saveSettings,
        resetDemoData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
