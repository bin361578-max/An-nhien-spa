import {
  Booking,
  Order,
  ServiceItem,
  ProductItem,
  Coupon,
  ContactMessage,
  SpaSettings,
  User,
  UserRole
} from '../types';

const AUTH_TOKEN_KEY = 'annhien_auth_token';
const ADMIN_TOKEN_KEY = 'annhien_admin_auth_token';

export const ApiService = {
  // --- TOKEN MANAGEMENT ---
  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem(AUTH_TOKEN_KEY) || sessionStorage.getItem(ADMIN_TOKEN_KEY);
  },

  setToken(token: string): void {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(AUTH_TOKEN_KEY, token);
    sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
  },

  clearToken(): void {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
  },

  hasToken(): boolean {
    return !!this.getToken();
  },

  // Backward compatibility
  getAdminToken(): string | null {
    return this.getToken();
  },
  setAdminToken(token: string): void {
    this.setToken(token);
  },
  clearAdminToken(): void {
    this.clearToken();
  },
  hasAdminToken(): boolean {
    return this.hasToken();
  },

  getAuthHeaders(): HeadersInit {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  },

  // --- UNIFIED AUTHENTICATION API CALLS ---

  /**
   * Universal Login for Customer, Staff, and Admin
   */
  async login(
    email: string,
    password: string,
    role?: UserRole
  ): Promise<{ success: boolean; token?: string; user?: User; error?: string }> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
      });
      const data = await res.json();
      if (res.ok && data.success && data.token) {
        this.setToken(data.token);
        return { success: true, token: data.token, user: data.user };
      }
      return { success: false, error: data.error || 'Đăng nhập không thành công.' };
    } catch {
      return { success: false, error: 'Không thể kết nối đến máy chủ xác thực.' };
    }
  },

  /**
   * Customer Self-Registration
   */
  async register(
    name: string,
    email: string,
    phone: string,
    password: string
  ): Promise<{ success: boolean; token?: string; user?: User; error?: string }> {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password })
      });
      const data = await res.json();
      if (res.ok && data.success && data.token) {
        this.setToken(data.token);
        return { success: true, token: data.token, user: data.user };
      }
      return { success: false, error: data.error || 'Đăng ký không thành công.' };
    } catch {
      return { success: false, error: 'Không thể kết nối đến máy chủ xác thực.' };
    }
  },

  /**
   * Verifies current session token on the server
   */
  async verifySession(): Promise<{ success: boolean; user?: User }> {
    const token = this.getToken();
    if (!token) return { success: false };

    try {
      const res = await fetch('/api/auth/me', {
        headers: this.getAuthHeaders()
      });
      if (res.status === 401 || res.status === 403) {
        this.clearToken();
        return { success: false };
      }
      const data = await res.json();
      return { success: !!data.success, user: data.user };
    } catch {
      return { success: false };
    }
  },

  /**
   * Universal Logout
   */
  async logout(): Promise<void> {
    try {
      if (this.hasToken()) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: this.getAuthHeaders()
        });
      }
    } catch {
      // Ignore network errors
    } finally {
      this.clearToken();
    }
  },

  // Backward-compatible Admin Login Call
  async loginAdmin(email: string, password: string): Promise<{ success: boolean; token?: string; user?: any; error?: string }> {
    return this.login(email, password, 'admin');
  },

  async verifyAdminSession(): Promise<{ success: boolean; user?: any }> {
    const res = await this.verifySession();
    if (res.success && res.user?.role === 'admin') {
      return res;
    }
    return { success: false };
  },

  async logoutAdmin(): Promise<void> {
    await this.logout();
  },

  // --- PUBLIC CALLS ---
  async fetchPublicServices(): Promise<ServiceItem[]> {
    try {
      const res = await fetch('/api/public/services');
      if (!res.ok) throw new Error('Failed to fetch services');
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  },

  async fetchPublicProducts(): Promise<ProductItem[]> {
    try {
      const res = await fetch('/api/public/products');
      if (!res.ok) throw new Error('Failed to fetch products');
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  },

  async fetchPublicCoupons(): Promise<Coupon[]> {
    try {
      const res = await fetch('/api/public/coupons');
      if (!res.ok) throw new Error('Failed to fetch coupons');
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  },

  async fetchPublicSettings(): Promise<SpaSettings | null> {
    try {
      const res = await fetch('/api/public/settings');
      if (!res.ok) throw new Error('Failed to fetch settings');
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  },

  async createPublicBooking(bookingData: any): Promise<{ success: boolean; bookingId?: string; message?: string }> {
    try {
      const res = await fetch('/api/public/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, message: 'Lỗi mạng khi gửi thông tin đặt lịch.' };
    }
  },

  async createPublicOrder(orderData: any): Promise<{ success: boolean; orderId?: string; message?: string }> {
    try {
      const res = await fetch('/api/public/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      return await res.json();
    } catch {
      return { success: false, message: 'Lỗi mạng khi gửi thông tin đơn hàng.' };
    }
  },

  async submitContact(messageData: any): Promise<{ success: boolean; message?: string }> {
    try {
      const res = await fetch('/api/public/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(messageData)
      });
      return await res.json();
    } catch {
      return { success: false, message: 'Lỗi mạng khi gửi tin nhắn liên hệ.' };
    }
  },

  async fetchCustomerBookings(email: string): Promise<Booking[]> {
    try {
      const res = await fetch('/api/public/my-bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  },

  async fetchCustomerOrders(email: string): Promise<Order[]> {
    try {
      const res = await fetch('/api/public/my-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  },

  async rescheduleBooking(bookingId: string, newDate: string, newTime: string, customerEmail?: string): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch('/api/public/booking-reschedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, newDate, newTime, customerEmail })
      });
      return await res.json();
    } catch {
      return { success: false, message: 'Lỗi mạng khi gửi yêu cầu đổi lịch.' };
    }
  },

  async cancelBooking(bookingId: string, customerEmail?: string): Promise<{ success: boolean; message: string; refundAmount?: number }> {
    try {
      const res = await fetch('/api/public/booking-cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId, customerEmail })
      });
      return await res.json();
    } catch {
      return { success: false, message: 'Lỗi mạng khi gửi yêu cầu hủy lịch.' };
    }
  },

  // --- STAFF WORKSPACE API CALLS ---
  async fetchStaffBookings(): Promise<Booking[]> {
    const res = await fetch('/api/staff/bookings', { headers: this.getAuthHeaders() });
    if (!res.ok) throw new Error('Unauthorized');
    const json = await res.json();
    return json.data || [];
  },

  async updateStaffBooking(
    bookingId: string,
    status: Booking['status'],
    staffNotes?: string
  ): Promise<boolean> {
    const res = await fetch(`/api/staff/bookings/${bookingId}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status, staffNotes })
    });
    return res.ok;
  },

  async fetchStaffServices(): Promise<ServiceItem[]> {
    const res = await fetch('/api/staff/services', { headers: this.getAuthHeaders() });
    if (!res.ok) throw new Error('Unauthorized');
    const json = await res.json();
    return json.data || [];
  },

  async fetchStaffProducts(): Promise<ProductItem[]> {
    const res = await fetch('/api/staff/products', { headers: this.getAuthHeaders() });
    if (!res.ok) throw new Error('Unauthorized');
    const json = await res.json();
    return json.data || [];
  },

  // --- ADMIN STAFF MANAGEMENT CALLS ---
  async fetchStaffListAdmin(): Promise<User[]> {
    const res = await fetch('/api/admin/staff', { headers: this.getAuthHeaders() });
    if (!res.ok) throw new Error('Unauthorized');
    const json = await res.json();
    return json.data || [];
  },

  async createStaffAdmin(data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    notes?: string;
  }): Promise<{ success: boolean; staff?: User; error?: string }> {
    try {
      const res = await fetch('/api/admin/staff', {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch {
      return { success: false, error: 'Không thể kết nối đến máy chủ.' };
    }
  },

  async updateStaffStatusAdmin(staffId: string, status: 'active' | 'blocked'): Promise<boolean> {
    const res = await fetch(`/api/admin/staff/${staffId}/status`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    return res.ok;
  },

  async updateStaffPasswordAdmin(staffId: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch(`/api/admin/staff/${staffId}/password`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ password })
      });
      return await res.json();
    } catch {
      return { success: false, error: 'Lỗi kết nối máy chủ.' };
    }
  },

  async deleteStaffAdmin(staffId: string): Promise<boolean> {
    const res = await fetch(`/api/admin/staff/${staffId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return res.ok;
  },

  // --- PROTECTED ADMIN API CALLS ---
  async fetchAdminDashboardStats(): Promise<any> {
    const res = await fetch('/api/admin/stats', { headers: this.getAuthHeaders() });
    if (!res.ok) throw new Error('Unauthorized');
    const json = await res.json();
    return json.data;
  },

  async fetchAdminBookings(): Promise<Booking[]> {
    const res = await fetch('/api/admin/bookings', { headers: this.getAuthHeaders() });
    if (!res.ok) throw new Error('Unauthorized');
    const json = await res.json();
    return json.data;
  },

  async updateBookingStatus(id: string, status: Booking['status'], paymentStatus?: Booking['paymentStatus']): Promise<boolean> {
    const res = await fetch(`/api/admin/bookings/${id}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status, paymentStatus })
    });
    return res.ok;
  },

  async fetchAdminOrders(): Promise<Order[]> {
    const res = await fetch('/api/admin/orders', { headers: this.getAuthHeaders() });
    if (!res.ok) throw new Error('Unauthorized');
    const json = await res.json();
    return json.data;
  },

  async updateOrderStatus(id: string, status: Order['status'], paymentStatus?: Order['paymentStatus']): Promise<boolean> {
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status, paymentStatus })
    });
    return res.ok;
  },

  async fetchAdminCustomers(): Promise<User[]> {
    const res = await fetch('/api/admin/customers', { headers: this.getAuthHeaders() });
    if (!res.ok) throw new Error('Unauthorized');
    const json = await res.json();
    return json.data;
  },

  async fetchAdminMessages(): Promise<ContactMessage[]> {
    const res = await fetch('/api/admin/messages', { headers: this.getAuthHeaders() });
    if (!res.ok) throw new Error('Unauthorized');
    const json = await res.json();
    return json.data;
  },

  async updateMessageStatus(id: string, status: ContactMessage['status']): Promise<boolean> {
    const res = await fetch(`/api/admin/messages/${id}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    return res.ok;
  },

  async deleteMessage(id: string): Promise<boolean> {
    const res = await fetch(`/api/admin/messages/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return res.ok;
  },

  async fetchAdminServices(): Promise<ServiceItem[]> {
    const res = await fetch('/api/admin/services', { headers: this.getAuthHeaders() });
    if (!res.ok) throw new Error('Unauthorized');
    const json = await res.json();
    return json.data;
  },

  async saveService(service: ServiceItem): Promise<boolean> {
    const res = await fetch('/api/admin/services', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(service)
    });
    return res.ok;
  },

  async toggleServiceStatus(id: string): Promise<boolean> {
    const res = await fetch(`/api/admin/services/${id}/toggle`, {
      method: 'PATCH',
      headers: this.getAuthHeaders()
    });
    return res.ok;
  },

  async fetchAdminProducts(): Promise<ProductItem[]> {
    const res = await fetch('/api/admin/products', { headers: this.getAuthHeaders() });
    if (!res.ok) throw new Error('Unauthorized');
    const json = await res.json();
    return json.data;
  },

  async saveProduct(product: ProductItem): Promise<boolean> {
    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(product)
    });
    return res.ok;
  },

  async updateProductStock(id: string, stock: number): Promise<boolean> {
    const res = await fetch(`/api/admin/products/${id}/stock`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ stock })
    });
    return res.ok;
  },

  async fetchAdminCoupons(): Promise<Coupon[]> {
    const res = await fetch('/api/admin/coupons', { headers: this.getAuthHeaders() });
    if (!res.ok) throw new Error('Unauthorized');
    const json = await res.json();
    return json.data;
  },

  async saveCoupon(coupon: Coupon): Promise<boolean> {
    const res = await fetch('/api/admin/coupons', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(coupon)
    });
    return res.ok;
  },

  async deleteCoupon(id: string): Promise<boolean> {
    const res = await fetch(`/api/admin/coupons/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    return res.ok;
  },

  async saveSettings(settings: SpaSettings): Promise<boolean> {
    const res = await fetch('/api/admin/settings', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(settings)
    });
    return res.ok;
  },

  async resetDemoData(): Promise<boolean> {
    const res = await fetch('/api/admin/reset-demo', {
      method: 'POST',
      headers: this.getAuthHeaders()
    });
    return res.ok;
  }
};
