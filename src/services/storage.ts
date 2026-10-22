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
import {
  SEED_USERS,
  SEED_SERVICES,
  SEED_PRODUCTS,
  SEED_BOOKINGS,
  SEED_ORDERS,
  SEED_COUPONS,
  SEED_MESSAGES,
  SEED_SETTINGS
} from '../data/seedData';
import { resolveImageUrl } from '../assets/images';

const KEYS = {
  USERS: 'annhien_users',
  SERVICES: 'annhien_services',
  PRODUCTS: 'annhien_products',
  BOOKINGS: 'annhien_bookings',
  ORDERS: 'annhien_orders',
  COUPONS: 'annhien_coupons',
  MESSAGES: 'annhien_messages',
  SETTINGS: 'annhien_settings',
  CURRENT_USER: 'annhien_current_user',
  CART: 'annhien_cart',
  SPIN_STATUS: 'annhien_spin_status'
};

export const STORAGE_CHANGE_EVENT = 'annhien_storage_change';

function emitChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STORAGE_CHANGE_EVENT));
  }
}

function getStoredItem<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(defaultValue));
      return defaultValue;
    }
    return JSON.parse(raw);
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return defaultValue;
  }
}

function setStoredItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    emitChange();
  } catch (error) {
    console.error(`Error writing ${key} to localStorage:`, error);
  }
}

export const StorageService = {
  // Reset all to default demo data
  resetAll(): void {
    localStorage.setItem(KEYS.USERS, JSON.stringify(SEED_USERS));
    localStorage.setItem(KEYS.SERVICES, JSON.stringify(SEED_SERVICES));
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(SEED_PRODUCTS));
    localStorage.setItem(KEYS.BOOKINGS, JSON.stringify(SEED_BOOKINGS));
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(SEED_ORDERS));
    localStorage.setItem(KEYS.COUPONS, JSON.stringify(SEED_COUPONS));
    localStorage.setItem(KEYS.MESSAGES, JSON.stringify(SEED_MESSAGES));
    localStorage.setItem(KEYS.SETTINGS, JSON.stringify(SEED_SETTINGS));
    localStorage.removeItem(KEYS.CART);
    emitChange();
  },

  // USERS
  getUsers(): User[] {
    return getStoredItem<User[]>(KEYS.USERS, SEED_USERS);
  },
  saveUsers(users: User[]): void {
    setStoredItem(KEYS.USERS, users);
  },
  getCurrentUser(): User | null {
    return getStoredItem<User | null>(KEYS.CURRENT_USER, null);
  },
  setCurrentUser(user: User | null): void {
    setStoredItem(KEYS.CURRENT_USER, user);
  },

  // SERVICES
  getServices(): ServiceItem[] {
    const list = getStoredItem<ServiceItem[]>(KEYS.SERVICES, SEED_SERVICES);
    return list.map(item => ({
      ...item,
      imageUrl: resolveImageUrl(item.imageUrl)
    }));
  },
  saveServices(services: ServiceItem[]): void {
    setStoredItem(KEYS.SERVICES, services);
  },
  getServiceById(id: string): ServiceItem | undefined {
    return this.getServices().find(s => s.id === id);
  },

  // PRODUCTS
  getProducts(): ProductItem[] {
    const list = getStoredItem<ProductItem[]>(KEYS.PRODUCTS, SEED_PRODUCTS);
    return list.map(item => ({
      ...item,
      imageUrl: resolveImageUrl(item.imageUrl)
    }));
  },
  saveProducts(products: ProductItem[]): void {
    setStoredItem(KEYS.PRODUCTS, products);
  },
  getProductById(id: string): ProductItem | undefined {
    return this.getProducts().find(p => p.id === id);
  },
  updateStock(productId: string, quantitySold: number): boolean {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === productId);
    if (index === -1) return false;
    const currentStock = products[index].stock;
    if (currentStock < quantitySold) return false;
    products[index].stock = currentStock - quantitySold;
    this.saveProducts(products);
    return true;
  },

  // BOOKINGS
  getBookings(): Booking[] {
    return getStoredItem<Booking[]>(KEYS.BOOKINGS, SEED_BOOKINGS);
  },
  saveBookings(bookings: Booking[]): void {
    setStoredItem(KEYS.BOOKINGS, bookings);
  },
  addBooking(booking: Booking): void {
    const bookings = this.getBookings();
    bookings.unshift(booking);
    this.saveBookings(bookings);
  },
  updateBooking(id: string, updates: Partial<Booking>): boolean {
    const bookings = this.getBookings();
    const index = bookings.findIndex(b => b.id === id);
    if (index === -1) return false;
    bookings[index] = { ...bookings[index], ...updates };
    this.saveBookings(bookings);
    return true;
  },

  // ORDERS
  getOrders(): Order[] {
    const list = getStoredItem<Order[]>(KEYS.ORDERS, SEED_ORDERS);
    return list.map(order => ({
      ...order,
      items: order.items.map(item => ({
        ...item,
        imageUrl: resolveImageUrl(item.imageUrl)
      }))
    }));
  },
  saveOrders(orders: Order[]): void {
    setStoredItem(KEYS.ORDERS, orders);
  },
  addOrder(order: Order): void {
    const orders = this.getOrders();
    orders.unshift(order);
    this.saveOrders(orders);
  },
  updateOrder(id: string, updates: Partial<Order>): boolean {
    const orders = this.getOrders();
    const index = orders.findIndex(o => o.id === id);
    if (index === -1) return false;
    orders[index] = { ...orders[index], ...updates };
    this.saveOrders(orders);
    return true;
  },

  // COUPONS
  getCoupons(): Coupon[] {
    return getStoredItem<Coupon[]>(KEYS.COUPONS, SEED_COUPONS);
  },
  saveCoupons(coupons: Coupon[]): void {
    setStoredItem(KEYS.COUPONS, coupons);
  },

  // MESSAGES
  getMessages(): ContactMessage[] {
    return getStoredItem<ContactMessage[]>(KEYS.MESSAGES, SEED_MESSAGES);
  },
  saveMessages(messages: ContactMessage[]): void {
    setStoredItem(KEYS.MESSAGES, messages);
  },
  addMessage(msg: ContactMessage): void {
    const messages = this.getMessages();
    messages.unshift(msg);
    this.saveMessages(messages);
  },

  // SETTINGS
  getSettings(): SpaSettings {
    return getStoredItem<SpaSettings>(KEYS.SETTINGS, SEED_SETTINGS);
  },
  saveSettings(settings: SpaSettings): void {
    setStoredItem(KEYS.SETTINGS, settings);
  },

  // CART
  getCart(): CartItem[] {
    return getStoredItem<CartItem[]>(KEYS.CART, []);
  },
  saveCart(cart: CartItem[]): void {
    setStoredItem(KEYS.CART, cart);
  },
  clearCart(): void {
    setStoredItem(KEYS.CART, []);
  },

  // LUCKY WHEEL SPIN STATUS
  getSpinRecord(userId: string): { lastSpunDate: string; count: number } {
    const records = getStoredItem<Record<string, { lastSpunDate: string; count: number }>>(KEYS.SPIN_STATUS, {});
    return records[userId] || { lastSpunDate: '', count: 0 };
  },
  recordSpin(userId: string): void {
    const records = getStoredItem<Record<string, { lastSpunDate: string; count: number }>>(KEYS.SPIN_STATUS, {});
    const today = new Date().toISOString().split('T')[0];
    records[userId] = {
      lastSpunDate: today,
      count: (records[userId]?.lastSpunDate === today ? records[userId].count + 1 : 1)
    };
    setStoredItem(KEYS.SPIN_STATUS, records);
  }
};
