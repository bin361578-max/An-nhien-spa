import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
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
import { StorageService } from '../services/storage';
import { ApiService } from '../services/api';
import { SEED_SERVICES, SEED_PRODUCTS, SEED_COUPONS, SEED_SETTINGS } from '../data/seedData';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  currentUser: User | null;
  isAdmin: boolean;
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

  // Authentication
  login: (email: string, rolePreferred?: 'customer' | 'admin') => { success: boolean; message?: string };
  loginAdmin: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logoutAdmin: () => Promise<void>;
  register: (name: string, email: string, phone: string) => { success: boolean; message?: string };
  logout: () => void;
  updateProfile: (name: string, phone: string, email: string) => { success: boolean; message?: string };

  // Cart
  addToCart: (productId: string, quantity?: number) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;

  // Booking (Public/Customer)
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
  }) => Promise<{ success: boolean; bookingId?: string; message?: string }>;
  rescheduleBookingAction: (bookingId: string, newDate: string, newTime: string) => Promise<{ success: boolean; message: string }>;
  cancelBookingAction: (bookingId: string) => Promise<{ success: boolean; message: string; refundAmount?: number }>;

  // Orders (Public/Customer)
  createOrderAction: (orderData: {
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    shippingAddress: string;
    notes?: string;
    couponCode?: string;
    discountAmount: number;
    paymentMethod: 'cod' | 'card_simulation';
  }) => Promise<{ success: boolean; orderId?: string; message?: string }>;

  // Admin Actions (Server-Protected via Bearer Token)
  updateBookingStatus: (bookingId: string, status: Booking['status'], paymentStatus?: Booking['paymentStatus']) => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order['status'], paymentStatus?: Order['paymentStatus']) => Promise<void>;
  saveService: (service: ServiceItem) => Promise<void>;
  toggleServiceStatus: (serviceId: string) => Promise<void>;
  saveProduct: (product: ProductItem) => Promise<void>;
  updateProductStock: (productId: string, newStock: number) => Promise<void>;
  saveCoupon: (coupon: Coupon) => Promise<void>;
  deleteCoupon: (couponId: string) => Promise<void>;
  updateMessageStatus: (messageId: string, status: ContactMessage['status']) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  saveSettings: (settings: SpaSettings) => Promise<void>;
  resetDemoData: () => Promise<void>;
  refreshAdminData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => StorageService.getCurrentUser());
  const [isAdmin, setIsAdmin] = useState<boolean>(() => ApiService.hasAdminToken());

  // Public catalogs
  const [services, setServices] = useState<ServiceItem[]>(() => SEED_SERVICES);
  const [products, setProducts] = useState<ProductItem[]>(() => SEED_PRODUCTS);
  const [coupons, setCoupons] = useState<Coupon[]>(() => SEED_COUPONS);
  const [settings, setSettings] = useState<SpaSettings>(() => SEED_SETTINGS);

  // Private Data (Isolated: empty for unauthorized visitors, populated only for authorized admin or customer-scoped)
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);

  // Cart & Toasts
  const [cart, setCart] = useState<CartItem[]>(() => StorageService.getCart());
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Load admin data from server (Requires Admin Token)
  const refreshAdminData = useCallback(async () => {
    if (!ApiService.hasAdminToken()) return;
    try {
      const [adminBookings, adminOrders, adminCustomers, adminMessages, adminServices, adminProducts, adminCoupons, adminSettings] =
        await Promise.all([
          ApiService.fetchAdminBookings(),
          ApiService.fetchAdminOrders(),
          ApiService.fetchAdminCustomers(),
          ApiService.fetchAdminMessages(),
          ApiService.fetchAdminServices(),
          ApiService.fetchAdminProducts(),
          ApiService.fetchAdminCoupons(),
          ApiService.fetchPublicSettings()
        ]);

      setBookings(adminBookings);
      setOrders(adminOrders);
      setUsers(adminCustomers);
      setMessages(adminMessages);
      if (adminServices.length > 0) setServices(adminServices);
      if (adminProducts.length > 0) setProducts(adminProducts);
      if (adminCoupons.length > 0) setCoupons(adminCoupons);
      if (adminSettings) setSettings(adminSettings);
    } catch (err) {
      console.warn('Could not refresh admin data from server:', err);
    }
  }, []);

  // Load customer's personal data scoped to their email
  const refreshCustomerData = useCallback(async (email: string) => {
    if (!email) return;
    try {
      const [myBookings, myOrders] = await Promise.all([
        ApiService.fetchMyBookings(email),
        ApiService.fetchMyOrders(email)
      ]);
      setBookings(myBookings);
      setOrders(myOrders);
    } catch (err) {
      console.warn('Could not load customer personal data:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    // 1. Fetch public catalog from server
    ApiService.fetchPublicServices().then((srv) => {
      if (srv && srv.length > 0) setServices(srv);
    });
    ApiService.fetchPublicProducts().then((prd) => {
      if (prd && prd.length > 0) setProducts(prd);
    });
    ApiService.fetchPublicCoupons().then((cpn) => {
      if (cpn && cpn.length > 0) setCoupons(cpn);
    });
    ApiService.fetchPublicSettings().then((stg) => {
      if (stg) setSettings(stg);
    });

    // 2. Verify admin token if stored in sessionStorage
    if (ApiService.hasAdminToken()) {
      ApiService.verifyAdminSession().then((res) => {
        if (res.success && res.user) {
          const adminUser: User = {
            id: 'USR-ADMIN',
            name: res.user.name || 'Quản Trị Viên An Nhiên',
            email: res.user.email,
            phone: '0908123456',
            role: 'admin',
            createdAt: new Date().toISOString(),
            status: 'active'
          };
          setCurrentUser(adminUser);
          setIsAdmin(true);
          refreshAdminData();
        } else {
          ApiService.clearAdminToken();
          setIsAdmin(false);
          if (currentUser?.role === 'admin') {
            setCurrentUser(null);
          }
        }
      });
    } else if (currentUser && currentUser.role === 'customer') {
      refreshCustomerData(currentUser.email);
    }
  }, []);

  // --- ADMIN AUTHENTICATION ---
  const loginAdmin = async (email: string, password: string): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await ApiService.loginAdmin(email, password);
      if (res.success && res.token && res.user) {
        const adminUser: User = {
          id: 'USR-ADMIN',
          name: res.user.name || 'Quản Trị Viên An Nhiên',
          email: res.user.email,
          phone: '0908123456',
          role: 'admin',
          createdAt: new Date().toISOString(),
          status: 'active'
        };
        setCurrentUser(adminUser);
        setIsAdmin(true);
        StorageService.setCurrentUser(adminUser);
        await refreshAdminData();
        showToast('Đăng nhập Quản trị viên thành công. Phiên làm việc bảo mật đã kích hoạt.', 'success');
        return { success: true };
      }
      return { success: false, message: res.error || 'Email hoặc mật khẩu không chính xác.' };
    } catch (err: any) {
      return { success: false, message: 'Lỗi kết nối máy chủ xác thực.' };
    }
  };

  const logoutAdmin = async (): Promise<void> => {
    await ApiService.logoutAdmin();
    setIsAdmin(false);
    setCurrentUser(null);
    StorageService.setCurrentUser(null);
    setBookings([]);
    setOrders([]);
    setUsers([]);
    setMessages([]);
    showToast('Đã đăng xuất phiên làm việc quản trị viên an toàn.', 'info');
  };

  // --- CUSTOMER AUTHENTICATION ---
  const login = (email: string, rolePreferred?: 'customer' | 'admin') => {
    // Admin MUST login via /admin/login with server-side authentication
    if (rolePreferred === 'admin' || email.toLowerCase().includes('admin@')) {
      return {
        success: false,
        message: 'Tài khoản quản trị viên yêu cầu đăng nhập bảo mật tại /admin/login.'
      };
    }

    const cleanEmail = email.trim().toLowerCase();
    const customerUser: User = {
      id: `USR-${Date.now().toString().slice(-6)}`,
      name: cleanEmail.split('@')[0],
      email: cleanEmail,
      phone: '0912345678',
      role: 'customer',
      createdAt: new Date().toISOString(),
      status: 'active'
    };

    setCurrentUser(customerUser);
    setIsAdmin(false);
    StorageService.setCurrentUser(customerUser);
    refreshCustomerData(customerUser.email);
    showToast(`Chào mừng ${customerUser.name} quay trở lại!`, 'success');
    return { success: true };
  };

  const register = (name: string, email: string, phone: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const newUser: User = {
      id: `USR-${Date.now().toString().slice(-6)}`,
      name: name.trim(),
      email: cleanEmail,
      phone: phone.trim(),
      role: 'customer',
      createdAt: new Date().toISOString(),
      status: 'active'
    };
    setCurrentUser(newUser);
    setIsAdmin(false);
    StorageService.setCurrentUser(newUser);
    refreshCustomerData(newUser.email);
    showToast('Đăng ký tài khoản thành viên thành công!', 'success');
    return { success: true };
  };

  const logout = () => {
    if (isAdmin || currentUser?.role === 'admin') {
      logoutAdmin();
    } else {
      setCurrentUser(null);
      StorageService.setCurrentUser(null);
      setBookings([]);
      setOrders([]);
      showToast('Đã đăng xuất tài khoản thành công.', 'info');
    }
  };

  const updateProfile = (name: string, phone: string, email: string) => {
    if (!currentUser) return { success: false, message: 'Chưa đăng nhập.' };
    const updatedUser: User = {
      ...currentUser,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase()
    };
    setCurrentUser(updatedUser);
    StorageService.setCurrentUser(updatedUser);
    showToast('Cập nhật hồ sơ thành công!', 'success');
    return { success: true };
  };

  // --- CART OPERATIONS ---
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

    setCart(currentCart);
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
    setCart(currentCart);
    StorageService.saveCart(currentCart);
  };

  const removeFromCart = (productId: string) => {
    const currentCart = cart.filter((item) => item.productId !== productId);
    setCart(currentCart);
    StorageService.saveCart(currentCart);
    showToast('Đã bỏ sản phẩm khỏi giỏ hàng.', 'info');
  };

  const clearCart = () => {
    setCart([]);
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

  // --- BOOKING OPERATIONS (PUBLIC) ---
  const createBooking = async (bookingData: {
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
    const res = await ApiService.submitBooking(bookingData);
    if (res.success && res.bookingId) {
      showToast(`Đặt lịch hẹn thành công! Mã số: ${res.bookingId}`, 'success');
      if (currentUser?.email) {
        refreshCustomerData(currentUser.email);
      }
      if (isAdmin) {
        refreshAdminData();
      }
      return { success: true, bookingId: res.bookingId };
    }
    showToast(res.message || 'Lỗi khi đặt lịch hẹn.', 'error');
    return { success: false, message: res.message };
  };

  const rescheduleBookingAction = async (bookingId: string, newDate: string, newTime: string) => {
    const res = await ApiService.rescheduleBooking(bookingId, newDate, newTime, currentUser?.email);
    if (res.success) {
      showToast(res.message, 'success');
      if (currentUser?.email) refreshCustomerData(currentUser.email);
      if (isAdmin) refreshAdminData();
      return { success: true, message: res.message };
    }
    showToast(res.message, 'error');
    return { success: false, message: res.message };
  };

  const cancelBookingAction = async (bookingId: string) => {
    const res = await ApiService.cancelBooking(bookingId, currentUser?.email);
    if (res.success) {
      showToast(res.message, 'info');
      if (currentUser?.email) refreshCustomerData(currentUser.email);
      if (isAdmin) refreshAdminData();
      return { success: true, message: res.message, refundAmount: res.refundAmount };
    }
    showToast(res.message, 'error');
    return { success: false, message: res.message };
  };

  // --- ORDER OPERATIONS (PUBLIC) ---
  const createOrderAction = async (orderData: {
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
      return { success: false, message: 'Giỏ hàng đang trống.' };
    }

    const payload = {
      ...orderData,
      items: cart.map((c) => ({ productId: c.productId, quantity: c.quantity }))
    };

    const res = await ApiService.submitOrder(payload);
    if (res.success && res.orderId) {
      clearCart();
      showToast(`Đặt hàng thành công! Mã đơn hàng: ${res.orderId}`, 'success');
      if (currentUser?.email) refreshCustomerData(currentUser.email);
      if (isAdmin) refreshAdminData();
      return { success: true, orderId: res.orderId };
    }
    showToast(res.message || 'Lỗi khi đặt hàng.', 'error');
    return { success: false, message: res.message };
  };

  // --- ADMIN ACTIONS (Server-side Protected) ---
  const updateBookingStatus = async (bookingId: string, status: Booking['status'], paymentStatus?: Booking['paymentStatus']) => {
    const ok = await ApiService.updateBookingStatus(bookingId, status, paymentStatus);
    if (ok) {
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status, ...(paymentStatus ? { paymentStatus } : {}) } : b))
      );
      showToast(`Đã cập nhật trạng thái lịch hẹn ${bookingId}.`, 'success');
    } else {
      showToast('Lỗi cập nhật lịch hẹn trên máy chủ.', 'error');
    }
  };

  const updateOrderStatus = async (orderId: string, status: Order['status'], paymentStatus?: Order['paymentStatus']) => {
    const ok = await ApiService.updateOrderStatus(orderId, status, paymentStatus);
    if (ok) {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status, ...(paymentStatus ? { paymentStatus } : {}) } : o))
      );
      showToast(`Đã cập nhật trạng thái đơn hàng ${orderId}.`, 'success');
    } else {
      showToast('Lỗi cập nhật đơn hàng trên máy chủ.', 'error');
    }
  };

  const saveService = async (service: ServiceItem) => {
    const ok = await ApiService.saveService(service);
    if (ok) {
      setServices((prev) => {
        const idx = prev.findIndex((s) => s.id === service.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = service;
          return updated;
        }
        return [service, ...prev];
      });
      showToast(`Đã lưu dịch vụ "${service.name}" thành công!`, 'success');
    } else {
      showToast('Lỗi lưu dịch vụ trên máy chủ.', 'error');
    }
  };

  const toggleServiceStatus = async (serviceId: string) => {
    const ok = await ApiService.toggleServiceStatus(serviceId);
    if (ok) {
      setServices((prev) =>
        prev.map((s) =>
          s.id === serviceId ? { ...s, status: s.status === 'active' ? 'inactive' : 'active' } : s
        )
      );
      showToast('Đã thay đổi trạng thái hoạt động của dịch vụ.', 'info');
    }
  };

  const saveProduct = async (product: ProductItem) => {
    const ok = await ApiService.saveProduct(product);
    if (ok) {
      setProducts((prev) => {
        const idx = prev.findIndex((p) => p.id === product.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = product;
          return updated;
        }
        return [product, ...prev];
      });
      showToast(`Đã lưu sản phẩm "${product.name}" thành công!`, 'success');
    }
  };

  const updateProductStock = async (productId: string, newStock: number) => {
    const ok = await ApiService.updateProductStock(productId, newStock);
    if (ok) {
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, stock: Math.max(0, newStock) } : p))
      );
      showToast('Đã cập nhật tồn kho sản phẩm.', 'success');
    }
  };

  const saveCoupon = async (coupon: Coupon) => {
    const ok = await ApiService.saveCoupon(coupon);
    if (ok) {
      setCoupons((prev) => {
        const idx = prev.findIndex((c) => c.id === coupon.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = coupon;
          return updated;
        }
        return [coupon, ...prev];
      });
      showToast(`Đã lưu mã ưu đãi "${coupon.code}"!`, 'success');
    }
  };

  const deleteCoupon = async (couponId: string) => {
    const ok = await ApiService.deleteCoupon(couponId);
    if (ok) {
      setCoupons((prev) => prev.filter((c) => c.id !== couponId));
      showToast('Đã xóa mã ưu đãi thành công.', 'info');
    }
  };

  const updateMessageStatus = async (messageId: string, status: ContactMessage['status']) => {
    const ok = await ApiService.updateMessageStatus(messageId, status);
    if (ok) {
      setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, status } : m)));
      showToast('Đã cập nhật trạng thái tin nhắn.', 'success');
    }
  };

  const deleteMessage = async (messageId: string) => {
    const ok = await ApiService.deleteMessage(messageId);
    if (ok) {
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
      showToast('Đã xóa tin nhắn liên hệ.', 'info');
    }
  };

  const saveSettings = async (newSettings: SpaSettings) => {
    const ok = await ApiService.saveSettings(newSettings);
    if (ok) {
      setSettings(newSettings);
      showToast('Đã lưu cấu hình spa thành công.', 'success');
    }
  };

  const resetDemoData = async () => {
    const ok = await ApiService.resetDemoData();
    if (ok) {
      await refreshAdminData();
      showToast('Đã khôi phục toàn bộ dữ liệu máy chủ về ban đầu!', 'success');
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAdmin,
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
        loginAdmin,
        logoutAdmin,
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
        resetDemoData,
        refreshAdminData
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
