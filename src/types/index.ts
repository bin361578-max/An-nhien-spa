export type UserRole = 'customer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  createdAt: string;
  status: 'active' | 'blocked';
}

export type ServiceCategory = 'facial' | 'massage' | 'body' | 'skincare_treatment' | 'intensive';

export interface ServiceItem {
  id: string;
  name: string;
  category: ServiceCategory;
  categoryName: string;
  description: string;
  fullDescription: string;
  price: number; // VND
  durationMinutes: number;
  imageUrl: string;
  steps: string[];
  benefits: string[];
  notes: string;
  status: 'active' | 'inactive';
}

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type PaymentStatus = 'unpaid' | 'deposit_paid' | 'failed' | 'refunded_full' | 'refunded_partial';

export interface RescheduleRecord {
  oldDate: string;
  oldTime: string;
  newDate: string;
  newTime: string;
  changedAt: string;
  reason?: string;
}

export interface Booking {
  id: string; // e.g. "AN-BK-8291"
  userId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  date: string; // YYYY-MM-DD
  timeSlot: string; // HH:mm
  notes: string;
  totalAmount: number;
  depositAmount: number;
  remainingAmount: number;
  depositPaid: boolean;
  paymentStatus: PaymentStatus;
  status: BookingStatus;
  createdAt: string;
  cancelledAt?: string;
  refundAmount?: number;
  retainedAmount?: number;
  rescheduleHistory?: RescheduleRecord[];
}

export type ProductCategory = 'serum' | 'cream' | 'cleanser' | 'mask' | 'essential_oil' | 'body';

export interface ProductItem {
  id: string;
  code: string;
  name: string;
  category: ProductCategory;
  categoryName: string;
  description: string;
  fullDescription: string;
  price: number; // VND
  stock: number;
  imageUrl: string;
  volumeOrWeight: string;
  status: 'active' | 'inactive';
}

export interface CartItem {
  productId: string;
  quantity: number;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipping' | 'completed' | 'cancelled';

export interface OrderItem {
  productId: string;
  code: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface Order {
  id: string; // e.g. "AN-ORD-1092"
  userId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  shippingAddress: string;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  couponCode?: string;
  totalAmount: number;
  paymentMethod: 'cod' | 'card_simulation';
  paymentStatus: 'pending' | 'paid' | 'failed';
  status: OrderStatus;
  createdAt: string;
  notes?: string;
}

export type DiscountType = 'percent' | 'fixed';
export type ApplicableScope = 'all' | 'products' | 'services';

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discountType: DiscountType;
  discountValue: number; // % or VND
  minOrderValue: number;
  startDate: string;
  endDate: string;
  usageLimit: number;
  usedCount: number;
  applicableTo: ApplicableScope;
  status: 'active' | 'inactive';
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  createdAt: string;
  status: 'unread' | 'read' | 'replied';
}

export interface SpaSettings {
  spaName: string;
  hotline: string;
  email: string;
  address: string;
  openingHours: string;
  depositRate: number; // e.g. 0.3 for 30%
  footerBio: string;
}
