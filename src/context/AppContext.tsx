import React, { createContext, useContext, useState, useEffect, ReactNode, useMemo, useCallback } from 'react';
import {
  User,
  UserRole,
  ServiceItem,
  ProductItem,
  Booking,
  BookingStatus,
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
  isStaff: boolean;
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

  // Unified Multi-Role Authentication
  login: (email: string, password: string, role?: UserRole) => Promise<{ success: boolean; message?: string; role?: UserRole }>;
  register: (name: string, email: string, phone: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  updateProfile: (name: string, phone: string, email: string) => { success: boolean; message?: string };

  // Backward compatibility
  loginAdmin: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logoutAdmin: () => Promise<void>;

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

  // Staff Workspace Actions
  staffBookings: Booking[];
  fetchStaffBookings: () => Promise<Booking[]>;
  updateStaffBookingAction: (bookingId: string, status: BookingStatus, staffNotes?: string) => Promise<boolean>;

  // Admin Staff Management Actions
  staffList: User[];
  fetchStaffList: () => Promise<User[]>;
  createStaff: (data: { name: string; email: string; phone: string; password: string; notes?: string }) => Promise<{ success: boolean; staff?: User; error?: string }>;
  updateStaffStatus: (staffId: string, status: 'active' | 'blocked') => Promise<boolean>;
  updateStaffPassword: (staffId: string, password: string) => Promise<{ success: boolean; error?: string }>;
  deleteStaff: (staffId: string) => Promise<boolean>;

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
  const [isAdmin, setIsAdmin] = useState<boolean>(() => currentUser?.role === 'admin' && ApiService.hasToken());
  const [isStaff, setIsStaff] = useState<boolean>(() => (currentUser?.role === 'staff' || currentUser?.role === 'admin') && ApiService.hasToken());

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

  // Staff and Admin specialized states
  const [staffBookings, setStaffBookings] = useState<Booking[]>([]);
  const [staffList, setStaffList] = useState<User[]>([]);

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
    if (!ApiService.hasToken()) return;
    try {
      const [adminBookings, adminOrders, adminCustomers, adminMessages, adminServices, adminProducts, adminCoupons, adminSettings, adminStaff] =
        await Promise.all([
          ApiService.fetchAdminBookings(),
          ApiService.fetchAdminOrders(),
          ApiService.fetchAdminCustomers(),
          ApiService.fetchAdminMessages(),
          ApiService.fetchAdminServices(),
          ApiService.fetchAdminProducts(),
          ApiService.fetchAdminCoupons(),
          ApiService.fetchPublicSettings(),
          ApiService.fetchStaffListAdmin()
        ]);

      setBookings(adminBookings);
      setOrders(adminOrders);
      setUsers(adminCustomers);
      setMessages(adminMessages);
      if (adminServices.length > 0) setServices(adminServices);
      if (adminProducts.length > 0) setProducts(adminProducts);
      if (adminCoupons.length > 0) setCoupons(adminCoupons);
      if (adminSettings) setSettings(adminSettings);
      if (adminStaff) setStaffList(adminStaff);
    } catch (err) {
      console.warn('Could not refresh admin data from server:', err);
    }
  }, []);

  // Fetch staff workspace bookings
  const fetchStaffBookings = useCallback(async (): Promise<Booking[]> => {
    try {
      const bks = await ApiService.fetchStaffBookings();
      setStaffBookings(bks);
      return bks;
    } catch (err) {
      console.warn('Could not fetch staff bookings:', err);
      return [];
    }
  }, []);

  // Fetch staff list for admin
  const fetchStaffList = useCallback(async (): Promise<User[]> => {
    try {
      const list = await ApiService.fetchStaffListAdmin();
      setStaffList(list);
      return list;
    } catch {
      return [];
    }
  }, []);

  // Load customer's personal data scoped to their email
  const refreshCustomerData = useCallback(async (email: string) => {
    if (!email) return;
    try {
      const [myBookings, myOrders] = await Promise.all([
        ApiService.fetchCustomerBookings(email),
        ApiService.fetchCustomerOrders(email)
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

    // 2. Verify server session token
    if (ApiService.hasToken()) {
      ApiService.verifySession().then((res) => {
        if (res.success && res.user) {
          const verifiedUser: User = {
            id: res.user.id || 'USR-AUTHENTICATED',
            name: res.user.name,
            email: res.user.email,
            phone: res.user.phone || '',
            role: res.user.role,
            createdAt: res.user.createdAt || new Date().toISOString(),
            status: res.user.status || 'active'
          };

          setCurrentUser(verifiedUser);
          StorageService.setCurrentUser(verifiedUser);

          if (verifiedUser.role === 'admin') {
            setIsAdmin(true);
            setIsStaff(true);
            refreshAdminData();
          } else if (verifiedUser.role === 'staff') {
            setIsAdmin(false);
            setIsStaff(true);
            fetchStaffBookings();
          } else {
            setIsAdmin(false);
            setIsStaff(false);
            refreshCustomerData(verifiedUser.email);
          }
        } else {
          ApiService.clearToken();
          setIsAdmin(false);
          setIsStaff(false);
          setCurrentUser(null);
          StorageService.setCurrentUser(null);
        }
      });
    } else if (currentUser && currentUser.role === 'customer') {
      refreshCustomerData(currentUser.email);
    }
  }, []);

  // --- UNIFIED MULTI-ROLE LOGIN ---
  const login = async (
    email: string,
    password: string,
    role?: UserRole
  ): Promise<{ success: boolean; message?: string; role?: UserRole }> => {
    try {
      const res = await ApiService.login(email, password, role);
      if (res.success && res.token && res.user) {
        const authedUser: User = {
          id: res.user.id,
          name: res.user.name,
          email: res.user.email,
          phone: res.user.phone,
          role: res.user.role,
          createdAt: res.user.createdAt || new Date().toISOString(),
          status: res.user.status || 'active'
        };

        setCurrentUser(authedUser);
        StorageService.setCurrentUser(authedUser);

        if (authedUser.role === 'admin') {
          setIsAdmin(true);
          setIsStaff(true);
          await refreshAdminData();
          showToast('Đăng nhập Quản trị viên thành công. Đã kích hoạt quyền quản trị.', 'success');
        } else if (authedUser.role === 'staff') {
          setIsAdmin(false);
          setIsStaff(true);
          await fetchStaffBookings();
          showToast(`Chào mừng ${authedUser.name} đến với Bàn làm việc Nhân viên!`, 'success');
        } else {
          setIsAdmin(false);
          setIsStaff(false);
          await refreshCustomerData(authedUser.email);
          showToast(`Chào mừng ${authedUser.name} quay trở lại!`, 'success');
        }

        return { success: true, role: authedUser.role };
      }
      return { success: false, message: res.error || 'Email hoặc mật khẩu không chính xác.' };
    } catch {
      return { success: false, message: 'Không thể kết nối đến máy chủ xác thực.' };
    }
  };

  // --- CUSTOMER REGISTRATION ---
  const register = async (
    name: string,
    email: string,
    phone: string,
    password: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const res = await ApiService.register(name, email, phone, password);
      if (res.success && res.token && res.user) {
        const newUser: User = {
          id: res.user.id,
          name: res.user.name,
          email: res.user.email,
          phone: res.user.phone,
          role: 'customer',
          createdAt: new Date().toISOString(),
          status: 'active'
        };
        setCurrentUser(newUser);
        setIsAdmin(false);
        setIsStaff(false);
        StorageService.setCurrentUser(newUser);
        await refreshCustomerData(newUser.email);
        showToast('Đăng ký tài khoản thành công! Chào mừng quý khách.', 'success');
        return { success: true };
      }
      return { success: false, message: res.error || 'Đăng ký không thành công.' };
    } catch {
      return { success: false, message: 'Lỗi kết nối máy chủ.' };
    }
  };

  // --- LOGOUT ---
  const logout = async (): Promise<void> => {
    await ApiService.logout();
    setIsAdmin(false);
    setIsStaff(false);
    setCurrentUser(null);
    StorageService.setCurrentUser(null);
    setBookings([]);
    setOrders([]);
    setStaffBookings([]);
    setStaffList([]);
    setUsers([]);
    setMessages([]);
    showToast('Đã đăng xuất phiên làm việc an toàn.', 'info');
  };

  // Backward compatibility
  const loginAdmin = async (email: string, password: string) => {
    const res = await login(email, password, 'admin');
    return { success: res.success, message: res.message };
  };

  const logoutAdmin = async () => {
    await logout();
  };

  const updateProfile = (name: string, phone: string, email: string) => {
    if (!currentUser) return { success: false, message: 'Chưa đăng nhập' };
    const updated: User = { ...currentUser, name, phone, email };
    setCurrentUser(updated);
    StorageService.setCurrentUser(updated);
    showToast('Cập nhật thông tin tài khoản thành công!', 'success');
    return { success: true };
  };

  // --- STAFF WORKSPACE METHODS ---
  const updateStaffBookingAction = async (
    bookingId: string,
    status: BookingStatus,
    staffNotes?: string
  ): Promise<boolean> => {
    const ok = await ApiService.updateStaffBooking(bookingId, status, staffNotes);
    if (ok) {
      await fetchStaffBookings();
      showToast('Đã cập nhật tiến trình lịch hẹn thành công.', 'success');
      return true;
    }
    showToast('Không thể cập nhật lịch hẹn.', 'error');
    return false;
  };

  // --- ADMIN STAFF MANAGEMENT METHODS ---
  const createStaff = async (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    notes?: string;
  }): Promise<{ success: boolean; staff?: User; error?: string }> => {
    const res = await ApiService.createStaffAdmin(data);
    if (res.success && res.staff) {
      await fetchStaffList();
      showToast(`Đã tạo tài khoản nhân viên ${res.staff.name} thành công.`, 'success');
      return { success: true, staff: res.staff };
    }
    return { success: false, error: res.error || 'Không thể tạo tài khoản nhân viên.' };
  };

  const updateStaffStatus = async (staffId: string, status: 'active' | 'blocked'): Promise<boolean> => {
    const ok = await ApiService.updateStaffStatusAdmin(staffId, status);
    if (ok) {
      await fetchStaffList();
      showToast(`Đã ${status === 'active' ? 'mở khóa' : 'khóa'} tài khoản nhân viên.`, 'success');
      return true;
    }
    showToast('Lỗi khi cập nhật trạng thái nhân viên.', 'error');
    return false;
  };

  const updateStaffPassword = async (staffId: string, password: string): Promise<{ success: boolean; error?: string }> => {
    const res = await ApiService.updateStaffPasswordAdmin(staffId, password);
    if (res.success) {
      showToast('Đã cập nhật mật khẩu mới cho nhân viên.', 'success');
      return { success: true };
    }
    showToast(res.error || 'Lỗi cập nhật mật khẩu.', 'error');
    return { success: false, error: res.error };
  };

  const deleteStaff = async (staffId: string): Promise<boolean> => {
    const ok = await ApiService.deleteStaffAdmin(staffId);
    if (ok) {
      await fetchStaffList();
      showToast('Đã xóa tài khoản nhân viên.', 'info');
      return true;
    }
    showToast('Lỗi khi xóa nhân viên.', 'error');
    return false;
  };

  // --- CART ---
  const addToCart = (productId: string, quantity = 1) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    setCart((prev) => {
      const existing = prev.find((item) => item.productId === productId);
      let updated: CartItem[];
      if (existing) {
        updated = prev.map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity + quantity } : item
        );
      } else {
        updated = [...prev, { productId, quantity }];
      }
      StorageService.saveCart(updated);
      return updated;
    });
    showToast(`Đã thêm "${product.name}" vào giỏ hàng`, 'success');
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    setCart((prev) => {
      let updated: CartItem[];
      if (quantity <= 0) {
        updated = prev.filter((item) => item.productId !== productId);
      } else {
        updated = prev.map((item) => (item.productId === productId ? { ...item, quantity } : item));
      }
      StorageService.saveCart(updated);
      return updated;
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => {
      const updated = prev.filter((item) => item.productId !== productId);
      StorageService.saveCart(updated);
      return updated;
    });
    showToast('Đã xóa sản phẩm khỏi giỏ hàng', 'info');
  };

  const clearCart = () => {
    setCart([]);
    StorageService.saveCart([]);
  };

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const cartSubtotal = useMemo(
    () =>
      cart.reduce((sum, item) => {
        const prod = products.find((p) => p.id === item.productId);
        return sum + (prod ? prod.price * item.quantity : 0);
      }, 0),
    [cart, products]
  );

  // --- BOOKING (CUSTOMER) ---
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
    const result = await ApiService.createPublicBooking(bookingData);
    if (result.success && result.bookingId) {
      if (currentUser?.email) {
        await refreshCustomerData(currentUser.email);
      }
      showToast(`Đặt lịch hẹn thành công! Mã lịch: ${result.bookingId}`, 'success');
    }
    return result;
  };

  const rescheduleBookingAction = async (bookingId: string, newDate: string, newTime: string) => {
    const result = await ApiService.rescheduleBooking(bookingId, newDate, newTime, currentUser?.email);
    if (result.success) {
      if (currentUser?.email) {
        await refreshCustomerData(currentUser.email);
      }
      showToast('Đổi lịch hẹn thành công!', 'success');
    }
    return result;
  };

  const cancelBookingAction = async (bookingId: string) => {
    const result = await ApiService.cancelBooking(bookingId, currentUser?.email);
    if (result.success) {
      if (currentUser?.email) {
        await refreshCustomerData(currentUser.email);
      }
      showToast(result.message || 'Đã hủy lịch hẹn thành công.', 'info');
    }
    return result;
  };

  // --- ORDER (CUSTOMER) ---
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
    const fullOrderPayload = {
      ...orderData,
      items: cart.map((c) => {
        const prod = products.find((p) => p.id === c.productId);
        return {
          productId: c.productId,
          code: prod?.code || '',
          name: prod?.name || '',
          price: prod?.price || 0,
          quantity: c.quantity,
          imageUrl: prod?.imageUrl || ''
        };
      }),
      totalAmount: Math.max(0, cartSubtotal - (orderData.discountAmount || 0))
    };

    const result = await ApiService.createPublicOrder(fullOrderPayload);
    if (result.success && result.orderId) {
      clearCart();
      if (currentUser?.email) {
        await refreshCustomerData(currentUser.email);
      }
      showToast(`Đặt hàng thành công! Mã đơn: ${result.orderId}`, 'success');
    }
    return result;
  };

  // --- ADMIN ACTIONS ---
  const updateBookingStatus = async (
    bookingId: string,
    status: Booking['status'],
    paymentStatus?: Booking['paymentStatus']
  ) => {
    const ok = await ApiService.updateBookingStatus(bookingId, status, paymentStatus);
    if (ok) {
      await refreshAdminData();
      showToast('Cập nhật trạng thái lịch hẹn thành công!', 'success');
    } else {
      showToast('Không thể cập nhật lịch hẹn trên máy chủ.', 'error');
    }
  };

  const updateOrderStatus = async (
    orderId: string,
    status: Order['status'],
    paymentStatus?: Order['paymentStatus']
  ) => {
    const ok = await ApiService.updateOrderStatus(orderId, status, paymentStatus);
    if (ok) {
      await refreshAdminData();
      showToast('Cập nhật trạng thái đơn hàng thành công!', 'success');
    } else {
      showToast('Không thể cập nhật đơn hàng trên máy chủ.', 'error');
    }
  };

  const saveService = async (service: ServiceItem) => {
    const ok = await ApiService.saveService(service);
    if (ok) {
      await refreshAdminData();
      showToast('Lưu dịch vụ thành công!', 'success');
    } else {
      showToast('Không thể lưu dịch vụ trên máy chủ.', 'error');
    }
  };

  const toggleServiceStatus = async (serviceId: string) => {
    const ok = await ApiService.toggleServiceStatus(serviceId);
    if (ok) {
      await refreshAdminData();
      showToast('Đã đổi trạng thái hiển thị của dịch vụ.', 'info');
    }
  };

  const saveProduct = async (product: ProductItem) => {
    const ok = await ApiService.saveProduct(product);
    if (ok) {
      await refreshAdminData();
      showToast('Lưu sản phẩm thành công!', 'success');
    } else {
      showToast('Không thể lưu sản phẩm trên máy chủ.', 'error');
    }
  };

  const updateProductStock = async (productId: string, newStock: number) => {
    const ok = await ApiService.updateProductStock(productId, newStock);
    if (ok) {
      await refreshAdminData();
      showToast('Cập nhật số lượng tồn kho thành công!', 'success');
    }
  };

  const saveCoupon = async (coupon: Coupon) => {
    const ok = await ApiService.saveCoupon(coupon);
    if (ok) {
      await refreshAdminData();
      showToast('Lưu mã giảm giá thành công!', 'success');
    }
  };

  const deleteCoupon = async (couponId: string) => {
    const ok = await ApiService.deleteCoupon(couponId);
    if (ok) {
      await refreshAdminData();
      showToast('Đã xóa mã ưu đãi.', 'info');
    }
  };

  const updateMessageStatus = async (messageId: string, status: ContactMessage['status']) => {
    const ok = await ApiService.updateMessageStatus(messageId, status);
    if (ok) {
      await refreshAdminData();
      showToast('Đã cập nhật trạng thái tin nhắn liên hệ.', 'info');
    }
  };

  const deleteMessage = async (messageId: string) => {
    const ok = await ApiService.deleteMessage(messageId);
    if (ok) {
      await refreshAdminData();
      showToast('Đã xóa tin nhắn liên hệ.', 'info');
    }
  };

  const saveSettings = async (newSettings: SpaSettings) => {
    const ok = await ApiService.saveSettings(newSettings);
    if (ok) {
      setSettings(newSettings);
      showToast('Cập nhật cài đặt spa thành công!', 'success');
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
        isStaff,
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
        loginAdmin,
        logoutAdmin,
        staffBookings,
        fetchStaffBookings,
        updateStaffBookingAction,
        staffList,
        fetchStaffList,
        createStaff,
        updateStaffStatus,
        updateStaffPassword,
        deleteStaff,
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
