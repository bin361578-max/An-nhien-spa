import express, { Request, Response, NextFunction } from 'express';
import { authenticateAdmin, verifyAdminToken, AdminTokenPayload } from './auth';
import { serverDataStore } from './dataStore';

// Extend Express Request to include verified admin
declare global {
  namespace Express {
    interface Request {
      admin?: AdminTokenPayload;
    }
  }
}

export const app = express();

app.use(express.json());

// Server-side Middleware to require and verify Admin JWT / Session Bearer token
export function requireAdminAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'Yêu cầu quyền quản trị viên. Vui lòng đăng nhập tại /admin/login.'
    });
    return;
  }

  const token = authHeader.substring(7).trim();
  const verified = verifyAdminToken(token);

  if (!verified) {
    res.status(401).json({
      success: false,
      error: 'Phiên làm việc của quản trị viên đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.'
    });
    return;
  }

  req.admin = verified;
  next();
}

// ==========================================
// PUBLIC CUSTOMER API ENDPOINTS (No Auth Needed)
// ==========================================

// Public services catalog
app.get('/api/public/services', (_req: Request, res: Response) => {
  res.json({ success: true, data: serverDataStore.getPublicServices() });
});

// Public products catalog
app.get('/api/public/products', (_req: Request, res: Response) => {
  res.json({ success: true, data: serverDataStore.getPublicProducts() });
});

// Public coupons list
app.get('/api/public/coupons', (_req: Request, res: Response) => {
  res.json({ success: true, data: serverDataStore.getPublicCoupons() });
});

// Public spa settings
app.get('/api/public/settings', (_req: Request, res: Response) => {
  res.json({ success: true, data: serverDataStore.getPublicSettings() });
});

// Customer creates booking (returns ONLY booking receipt, no sensitive data)
app.post('/api/public/bookings', (req: Request, res: Response) => {
  try {
    const result = serverDataStore.createPublicBooking(req.body);
    if (!result.success) {
      res.status(400).json(result);
      return;
    }
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Lỗi xử lý đặt lịch.' });
  }
});

// Customer creates product order
app.post('/api/public/orders', (req: Request, res: Response) => {
  try {
    const result = serverDataStore.createPublicOrder(req.body);
    if (!result.success) {
      res.status(400).json(result);
      return;
    }
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Lỗi xử lý đặt hàng.' });
  }
});

// Customer submits contact form
app.post('/api/public/contact', (req: Request, res: Response) => {
  try {
    const result = serverDataStore.createPublicContactMessage(req.body);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Lỗi gửi tin nhắn liên hệ.' });
  }
});

// Customer queries own bookings (strictly scoped to their email)
app.post('/api/public/my-bookings', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email || typeof email !== 'string') {
    res.json({ success: true, data: [] });
    return;
  }
  const myBookings = serverDataStore.getCustomerBookings(email);
  res.json({ success: true, data: myBookings });
});

// Customer queries own orders (strictly scoped to their email)
app.post('/api/public/my-orders', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email || typeof email !== 'string') {
    res.json({ success: true, data: [] });
    return;
  }
  const myOrders = serverDataStore.getCustomerOrders(email);
  res.json({ success: true, data: myOrders });
});

// Customer reschedules own booking
app.post('/api/public/booking-reschedule', (req: Request, res: Response) => {
  const { bookingId, newDate, newTime, customerEmail } = req.body;
  const result = serverDataStore.rescheduleCustomerBooking(bookingId, newDate, newTime, customerEmail);
  if (!result.success) {
    res.status(400).json(result);
    return;
  }
  res.json(result);
});

// Customer cancels own booking
app.post('/api/public/booking-cancel', (req: Request, res: Response) => {
  const { bookingId, customerEmail } = req.body;
  const result = serverDataStore.cancelCustomerBooking(bookingId, customerEmail);
  if (!result.success) {
    res.status(400).json(result);
    return;
  }
  res.json(result);
});

// ==========================================
// ADMIN AUTHENTICATION API ENDPOINTS
// ==========================================

// Server-side Admin login
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ success: false, error: 'Vui lòng cung cấp email và mật khẩu quản trị.' });
    return;
  }

  const authResult = authenticateAdmin(email, password);
  if (!authResult.success || !authResult.token) {
    res.status(401).json({
      success: false,
      error: authResult.error || 'Email hoặc mật khẩu không chính xác.'
    });
    return;
  }

  res.json({
    success: true,
    token: authResult.token,
    user: {
      email: email.toLowerCase().trim(),
      role: 'admin',
      name: 'Quản Trị Viên An Nhiên'
    }
  });
});

// Check current admin session
app.get('/api/admin/me', requireAdminAuth, (req: Request, res: Response) => {
  res.json({
    success: true,
    user: {
      email: req.admin?.email,
      role: 'admin',
      name: 'Quản Trị Viên An Nhiên'
    }
  });
});

// Admin logout
app.post('/api/admin/logout', requireAdminAuth, (_req: Request, res: Response) => {
  res.json({ success: true, message: 'Đã đăng xuất phiên làm việc quản trị an toàn.' });
});

// ==========================================
// PROTECTED ADMIN DATA APIs (Require Bearer Token)
// ==========================================

// Overview stats (Aggregates revenue, deposits, orders, bookings)
app.get('/api/admin/stats', requireAdminAuth, (_req: Request, res: Response) => {
  res.json({ success: true, data: serverDataStore.getAdminDashboardStats() });
});

// Manage bookings
app.get('/api/admin/bookings', requireAdminAuth, (_req: Request, res: Response) => {
  res.json({ success: true, data: serverDataStore.getAllBookings() });
});

app.patch('/api/admin/bookings/:id', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, paymentStatus } = req.body;
  const ok = serverDataStore.updateBookingStatusAdmin(id, status, paymentStatus);
  if (!ok) {
    res.status(404).json({ success: false, error: 'Không tìm thấy lịch hẹn.' });
    return;
  }
  res.json({ success: true, message: 'Cập nhật trạng thái lịch hẹn thành công.' });
});

// Manage orders
app.get('/api/admin/orders', requireAdminAuth, (_req: Request, res: Response) => {
  res.json({ success: true, data: serverDataStore.getAllOrders() });
});

app.patch('/api/admin/orders/:id', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, paymentStatus } = req.body;
  const ok = serverDataStore.updateOrderStatusAdmin(id, status, paymentStatus);
  if (!ok) {
    res.status(404).json({ success: false, error: 'Không tìm thấy đơn hàng.' });
    return;
  }
  res.json({ success: true, message: 'Cập nhật trạng thái đơn hàng thành công.' });
});

// Manage customers
app.get('/api/admin/customers', requireAdminAuth, (_req: Request, res: Response) => {
  res.json({ success: true, data: serverDataStore.getAllCustomers() });
});

// Manage contact messages
app.get('/api/admin/messages', requireAdminAuth, (_req: Request, res: Response) => {
  res.json({ success: true, data: serverDataStore.getAllMessages() });
});

app.patch('/api/admin/messages/:id', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const ok = serverDataStore.updateMessageStatusAdmin(id, status);
  if (!ok) {
    res.status(404).json({ success: false, error: 'Không tìm thấy tin nhắn.' });
    return;
  }
  res.json({ success: true, message: 'Cập nhật tin nhắn thành công.' });
});

app.delete('/api/admin/messages/:id', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const ok = serverDataStore.deleteMessageAdmin(id);
  if (!ok) {
    res.status(404).json({ success: false, error: 'Không tìm thấy tin nhắn.' });
    return;
  }
  res.json({ success: true, message: 'Xóa tin nhắn thành công.' });
});

// Manage services
app.get('/api/admin/services', requireAdminAuth, (_req: Request, res: Response) => {
  res.json({ success: true, data: serverDataStore.getAllServicesAdmin() });
});

app.post('/api/admin/services', requireAdminAuth, (req: Request, res: Response) => {
  serverDataStore.saveServiceAdmin(req.body);
  res.json({ success: true, message: 'Lưu dịch vụ thành công.' });
});

app.patch('/api/admin/services/:id/toggle', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const ok = serverDataStore.toggleServiceStatusAdmin(id);
  if (!ok) {
    res.status(404).json({ success: false, error: 'Không tìm thấy dịch vụ.' });
    return;
  }
  res.json({ success: true, message: 'Đổi trạng thái dịch vụ thành công.' });
});

// Manage products
app.get('/api/admin/products', requireAdminAuth, (_req: Request, res: Response) => {
  res.json({ success: true, data: serverDataStore.getAllProductsAdmin() });
});

app.post('/api/admin/products', requireAdminAuth, (req: Request, res: Response) => {
  serverDataStore.saveProductAdmin(req.body);
  res.json({ success: true, message: 'Lưu sản phẩm thành công.' });
});

app.patch('/api/admin/products/:id/stock', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const { stock } = req.body;
  const ok = serverDataStore.updateProductStockAdmin(id, Number(stock));
  if (!ok) {
    res.status(404).json({ success: false, error: 'Không tìm thấy sản phẩm.' });
    return;
  }
  res.json({ success: true, message: 'Cập nhật số lượng tồn kho thành công.' });
});

// Manage coupons
app.get('/api/admin/coupons', requireAdminAuth, (_req: Request, res: Response) => {
  res.json({ success: true, data: serverDataStore.getAllCouponsAdmin() });
});

app.post('/api/admin/coupons', requireAdminAuth, (req: Request, res: Response) => {
  serverDataStore.saveCouponAdmin(req.body);
  res.json({ success: true, message: 'Lưu mã giảm giá thành công.' });
});

app.delete('/api/admin/coupons/:id', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const ok = serverDataStore.deleteCouponAdmin(id);
  if (!ok) {
    res.status(404).json({ success: false, error: 'Không tìm thấy mã giảm giá.' });
    return;
  }
  res.json({ success: true, message: 'Xóa mã giảm giá thành công.' });
});

// Manage settings
app.get('/api/admin/settings', requireAdminAuth, (_req: Request, res: Response) => {
  res.json({ success: true, data: serverDataStore.getPublicSettings() });
});

app.post('/api/admin/settings', requireAdminAuth, (req: Request, res: Response) => {
  serverDataStore.saveSettingsAdmin(req.body);
  res.json({ success: true, message: 'Cập nhật cài đặt spa thành công.' });
});

// Reset demo data (Admin only)
app.post('/api/admin/reset-demo', requireAdminAuth, (_req: Request, res: Response) => {
  serverDataStore.reset();
  res.json({ success: true, message: 'Đã khôi phục dữ liệu mô phỏng thành công.' });
});

export default app;
