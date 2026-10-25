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

const ADMIN_TOKEN_KEY = 'annhien_admin_auth_token';

export const ApiService = {
  // --- ADMIN TOKEN MANAGEMENT ---
  getAdminToken(): string | null {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem(ADMIN_TOKEN_KEY);
  },

  setAdminToken(token: string): void {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
  },

  clearAdminToken(): void {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
  },

  hasAdminToken(): boolean {
    return !!this.getAdminToken();
  },

  getAuthHeaders(): HeadersInit {
    const token = this.getAdminToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  },

  // --- ADMIN AUTH CALLS ---
  async loginAdmin(email: string, password: string): Promise<{ success: boolean; token?: string; user?: any; error?: string }> {
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (res.ok && data.success && data.token) {
        this.setAdminToken(data.token);
        return { success: true, token: data.token, user: data.user };
      }
      return { success: false, error: data.error || 'Đăng nhập không thành công.' };
    } catch (err: any) {
      return { success: false, error: 'Không thể kết nối đến máy chủ xác thực.' };
    }
  },

  async verifyAdminSession(): Promise<{ success: boolean; user?: any }> {
    const token = this.getAdminToken();
    if (!token) return { success: false };

    try {
      const res = await fetch('/api/admin/me', {
        headers: this.getAuthHeaders()
      });
      if (res.status === 401) {
        this.clearAdminToken();
        return { success: false };
      }
      const data = await res.json();
      return { success: !!data.success, user: data.user };
    } catch {
      return { success: false };
    }
  },

  async logoutAdmin(): Promise<void> {
    try {
      if (this.hasAdminToken()) {
        await fetch('/api/admin/logout', {
          method: 'POST',
          headers: this.getAuthHeaders()
        });
      }
    } catch {
      // Ignore network errors on logout
    } finally {
      this.clearAdminToken();
    }
  },

  // --- PUBLIC CALLS ---
  async fetchPublicServices(): Promise<ServiceItem[]> {
    try {
      const res = await fetch('/api/public/services');
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  },

  async fetchPublicProducts(): Promise<ProductItem[]> {
    try {
      const res = await fetch('/api/public/products');
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  },

  async fetchPublicCoupons(): Promise<Coupon[]> {
    try {
      const res = await fetch('/api/public/coupons');
      const json = await res.json();
      return json.data || [];
    } catch {
      return [];
    }
  },

  async fetchPublicSettings(): Promise<SpaSettings | null> {
    try {
      const res = await fetch('/api/public/settings');
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  },

  async submitBooking(data: {
    serviceId: string;
    serviceName: string;
    servicePrice: number;
    date: string;
    timeSlot: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    notes?: string;
  }): Promise<{ success: boolean; bookingId?: string; message?: string }> {
    try {
      const res = await fetch('/api/public/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, message: 'Lỗi mạng khi đặt lịch. Vui lòng thử lại.' };
    }
  },

  async submitOrder(data: {
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    shippingAddress: string;
    items: Array<{ productId: string; quantity: number }>;
    notes?: string;
    couponCode?: string;
    paymentMethod: 'cod' | 'card_simulation';
  }): Promise<{ success: boolean; orderId?: string; message?: string }> {
    try {
      const res = await fetch('/api/public/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, message: 'Lỗi mạng khi đặt hàng. Vui lòng thử lại.' };
    }
  },

  async submitContact(data: {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
  }): Promise<{ success: boolean; message: string }> {
    try {
      const res = await fetch('/api/public/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return await res.json();
    } catch (err: any) {
      return { success: false, message: 'Lỗi mạng khi gửi liên hệ.' };
    }
  },

  async fetchMyBookings(email: string): Promise<Booking[]> {
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

  async fetchMyOrders(email: string): Promise<Order[]> {
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
      return { success: false, message: 'Lỗi kết nối khi đổi lịch.' };
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
      return { success: false, message: 'Lỗi kết nối khi hủy lịch.' };
    }
  },

  // --- PROTECTED ADMIN CALLS ---
  async fetchAdminStats(): Promise<any> {
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
