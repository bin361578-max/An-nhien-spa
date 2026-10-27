import express, { Request, Response, NextFunction } from 'express';
import {
  authenticateUser,
  authenticateAdmin,
  registerCustomer,
  verifyAuthToken,
  verifyAdminToken,
  TokenPayload,
  getStaffListAdmin,
  createStaffAccountByAdmin,
  updateStaffStatusByAdmin,
  updateStaffPasswordByAdmin,
  deleteStaffAccountByAdmin
} from './auth';
import { serverDataStore } from './dataStore';

// Extend Express Request to include verified user & admin
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
      admin?: TokenPayload;
    }
  }
}

export const app = express();

// 1. CORS headers and preflight handling (Essential for Vercel serverless deployments)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  next();
});

// 2. URL Normalization for Vercel Serverless Function routing
// On Vercel rewrites (/api/(.*) -> /api/index), req.url might be /api/index or /api.
app.use((req, res, next) => {
  const matchedPath = req.headers['x-matched-path'] as string;
  if ((req.url === '/api/index' || req.url === '/api') && matchedPath && matchedPath.startsWith('/api')) {
    req.url = matchedPath;
  }
  next();
});

app.use(express.json());

// Healthcheck endpoint for testing Vercel API deployment status
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'An Nhien Spa Backend API'
  });
});

// ==========================================
// SERVER-SIDE AUTHENTICATION MIDDLEWARES
// ==========================================

/**
 * Validates any authenticated user (Customer, Staff, or Admin)
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'Yêu cầu đăng nhập. Vui lòng đăng nhập tại /login.'
    });
    return;
  }

  const token = authHeader.substring(7).trim();
  const verified = verifyAuthToken(token);

  if (!verified) {
    res.status(401).json({
      success: false,
      error: 'Phiên làm việc đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.'
    });
    return;
  }

  req.user = verified;
  if (verified.role === 'admin') {
    req.admin = verified;
  }
  next();
}

/**
 * Validates Staff or Admin (for staff workspace operations)
 */
export function requireStaffOrAdminAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'Yêu cầu đăng nhập với tài khoản nhân viên hoặc quản trị viên.'
    });
    return;
  }

  const token = authHeader.substring(7).trim();
  const verified = verifyAuthToken(token);

  if (!verified) {
    res.status(401).json({
      success: false,
      error: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.'
    });
    return;
  }

  if (verified.role !== 'staff' && verified.role !== 'admin') {
    res.status(403).json({
      success: false,
      error: 'Truy cập bị từ chối. Bạn không có quyền truy cập vào phân hệ nhân viên.'
    });
    return;
  }

  req.user = verified;
  if (verified.role === 'admin') {
    req.admin = verified;
  }
  next();
}

/**
 * Validates Admin ONLY (for sensitive business management & settings)
 */
export function requireAdminAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'Yêu cầu quyền quản trị viên. Vui lòng đăng nhập tại /login hoặc /admin/login.'
    });
    return;
  }

  const token = authHeader.substring(7).trim();
  const verified = verifyAuthToken(token);

  if (!verified || verified.role !== 'admin') {
    res.status(403).json({
      success: false,
      error: 'Truy cập bị từ chối. Khu vực này chỉ dành riêng cho Quản trị viên An Nhiên Spa.'
    });
    return;
  }

  req.user = verified;
  req.admin = verified;
  next();
}

// ==========================================
// UNIFIED AUTHENTICATION API ENDPOINTS (/api/auth/*)
// ==========================================

/**
 * Unified login endpoint for all three roles: Customer, Staff, Admin.
 * Accepts identifier (Email or Phone number) and password.
 * Role is resolved authoritatively by the server.
 */
app.post('/api/auth/login', (req: Request, res: Response) => {
  try {
    const { identifier, email, phone, password, role } = req.body || {};
    const loginIdentifier = identifier || email || phone || '';
    const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';

    const result = authenticateUser(loginIdentifier, password, role, clientIp);
    if (!result.success) {
      const statusCode = result.error?.includes('tạm khóa')
        ? 429
        : result.error?.includes('đã bị khóa')
        ? 403
        : 401;
      res.status(statusCode).json(result);
      return;
    }

    res.json(result);
  } catch (err: any) {
    console.error('Error in /api/auth/login:', err);
    res.status(500).json({
      success: false,
      error: 'Lỗi máy chủ nội bộ. Không thể xử lý yêu cầu xác thực vào lúc này.'
    });
  }
});

/**
 * Forgot password assistance endpoint
 */
app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
  const { identifier } = req.body;
  // Always respond with a helpful, secure generic message without leaking account existence
  res.json({
    success: true,
    message: 'Yêu cầu hỗ trợ khôi phục mật khẩu đã được tiếp nhận. Bộ phận chăm sóc khách hàng An Nhiên Spa sẽ liên hệ hỗ trợ bạn qua email hoặc số điện thoại.'
  });
});

/**
 * Customer Self-Registration (Strictly customer role, server-enforced)
 */
app.post('/api/auth/register', (req: Request, res: Response) => {
  const result = registerCustomer(req.body);
  if (!result.success) {
    res.status(400).json(result);
    return;
  }

  res.json(result);
});

/**
 * Verify and get currently authenticated user profile
 */
app.get('/api/auth/me', requireAuth, (req: Request, res: Response) => {
  res.json({
    success: true,
    user: req.user
  });
});

/**
 * Logout
 */
app.post('/api/auth/logout', (_req: Request, res: Response) => {
  res.json({ success: true, message: 'Đăng xuất thành công.' });
});

// Backward compatibility for existing admin login
app.post('/api/admin/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  const clientIp = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
  const result = authenticateUser(email, password, 'admin', clientIp);
  if (!result.success) {
    res.status(401).json(result);
    return;
  }
  res.json(result);
});

app.get('/api/admin/me', requireAdminAuth, (req: Request, res: Response) => {
  res.json({
    success: true,
    user: req.user
  });
});

app.post('/api/admin/logout', requireAdminAuth, (_req: Request, res: Response) => {
  res.json({ success: true, message: 'Đã đăng xuất phiên làm việc quản trị an toàn.' });
});

// ==========================================
// PUBLIC CUSTOMER API ENDPOINTS (No Auth Needed)
// ==========================================

// Public services catalog
app.get(['/api/public/services', '/api/services'], (_req: Request, res: Response) => {
  res.json({ success: true, data: serverDataStore.getPublicServices() });
});

// Public products catalog
app.get(['/api/public/products', '/api/products'], (_req: Request, res: Response) => {
  res.json({ success: true, data: serverDataStore.getPublicProducts() });
});

// Public coupons list
app.get(['/api/public/coupons', '/api/coupons'], (_req: Request, res: Response) => {
  res.json({ success: true, data: serverDataStore.getPublicCoupons() });
});

// Public spa settings
app.get(['/api/public/settings', '/api/settings'], (_req: Request, res: Response) => {
  res.json({ success: true, data: serverDataStore.getPublicSettings() });
});

// Customer creates booking
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
// STAFF WORKSPACE APIs (Require Staff or Admin Auth)
// ==========================================

// Staff retrieves appointments to serve
app.get('/api/staff/bookings', requireStaffOrAdminAuth, (_req: Request, res: Response) => {
  res.json({ success: true, data: serverDataStore.getStaffBookings() });
});

// Staff updates appointment status or adds clinical/service notes
app.patch('/api/staff/bookings/:id', requireStaffOrAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, staffNotes } = req.body;
  const ok = serverDataStore.updateBookingStatusStaff(id, status, staffNotes);
  if (!ok) {
    res.status(404).json({ success: false, error: 'Không tìm thấy lịch hẹn.' });
    return;
  }
  res.json({ success: true, message: 'Cập nhật tiến trình phục vụ thành công.' });
});

// Staff queries catalog for customer consultation
app.get('/api/staff/services', requireStaffOrAdminAuth, (_req: Request, res: Response) => {
  res.json({ success: true, data: serverDataStore.getAllServicesAdmin() });
});

app.get('/api/staff/products', requireStaffOrAdminAuth, (_req: Request, res: Response) => {
  res.json({ success: true, data: serverDataStore.getAllProductsAdmin() });
});

// ==========================================
// ADMIN STAFF MANAGEMENT APIs (Require Admin Auth)
// ==========================================

// List staff accounts
app.get('/api/admin/staff', requireAdminAuth, (_req: Request, res: Response) => {
  res.json({ success: true, data: getStaffListAdmin() });
});

// Admin creates a new staff account
app.post('/api/admin/staff', requireAdminAuth, (req: Request, res: Response) => {
  const result = createStaffAccountByAdmin(req.body);
  if (!result.success) {
    res.status(400).json(result);
    return;
  }
  res.json(result);
});

// Admin toggles staff status (active / blocked)
app.patch('/api/admin/staff/:id/status', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const ok = updateStaffStatusByAdmin(id, status);
  if (!ok) {
    res.status(404).json({ success: false, error: 'Không tìm thấy tài khoản nhân viên.' });
    return;
  }
  res.json({ success: true, message: 'Cập nhật trạng thái nhân viên thành công.' });
});

// Admin resets staff password
app.patch('/api/admin/staff/:id/password', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const { password } = req.body;
  const ok = updateStaffPasswordByAdmin(id, password);
  if (!ok) {
    res.status(400).json({ success: false, error: 'Không thể đổi mật khẩu. Mật khẩu phải có ít nhất 8 ký tự.' });
    return;
  }
  res.json({ success: true, message: 'Cập nhật mật khẩu nhân viên thành công.' });
});

// Admin deletes staff account
app.delete('/api/admin/staff/:id', requireAdminAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const ok = deleteStaffAccountByAdmin(id);
  if (!ok) {
    res.status(404).json({ success: false, error: 'Không tìm thấy tài khoản nhân viên.' });
    return;
  }
  res.json({ success: true, message: 'Đã xóa tài khoản nhân viên thành công.' });
});

// ==========================================
// PROTECTED ADMIN DATA APIs (Require Admin Auth)
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
