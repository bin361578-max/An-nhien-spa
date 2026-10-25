import crypto from 'crypto';
import { UserRole } from '../types/index';

export interface TokenPayload {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  iat: number;
  exp: number; // Expiration timestamp
}

export interface StoredUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  passwordHash: string;
  salt: string;
  status: 'active' | 'blocked';
  createdAt: string;
  notes?: string;
}

// Server-side secret key for signing session tokens
const JWT_SECRET = process.env.ADMIN_JWT_SECRET || process.env.AUTH_SECRET || 'annhien_spa_secure_server_secret_key_2026_x89f2a';

// Configurable Admin Credentials (from server environment, NEVER exposed to client)
const DEFAULT_ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@annhienspa.vn').toLowerCase().trim();
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'AnNhien@Admin2026Secure!';

// Default Staff Credentials (for initial operations; admin can add more via dashboard)
const DEFAULT_STAFF_EMAIL = (process.env.STAFF_EMAIL || 'nhanvien@annhienspa.vn').toLowerCase().trim();
const DEFAULT_STAFF_PASSWORD = process.env.STAFF_PASSWORD || 'NhanVien@AnNhien2026!';

// Default Customer Password for initial seed account
const DEFAULT_CUSTOMER_PASSWORD = process.env.CUSTOMER_PASSWORD || 'KhachHang@2026!';

/**
 * Hash a password using PBKDF2 with a random cryptographic salt.
 * No plaintext passwords are ever stored.
 */
export function hashPassword(password: string, providedSalt?: string): { hash: string; salt: string } {
  const salt = providedSalt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

/**
 * Verifies a password against a stored PBKDF2 hash using timing-safe comparison.
 */
export function verifyPassword(password: string, storedHash: string, salt: string): boolean {
  try {
    const hashToVerify = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    const hashBuffer = Buffer.from(storedHash, 'hex');
    const verifyBuffer = Buffer.from(hashToVerify, 'hex');
    if (hashBuffer.length !== verifyBuffer.length) {
      return false;
    }
    return crypto.timingSafeEqual(hashBuffer, verifyBuffer);
  } catch {
    return false;
  }
}

// ============================================================================
// IN-MEMORY USER STORE (SERVER-AUTHORITATIVE)
// ============================================================================

const initialAdminCreds = hashPassword(DEFAULT_ADMIN_PASSWORD);
const initialStaffCreds = hashPassword(DEFAULT_STAFF_PASSWORD);
const initialCustCreds = hashPassword(DEFAULT_CUSTOMER_PASSWORD);

const serverUsers: StoredUser[] = [
  // Primary Administrator
  {
    id: 'USR-ADMIN-01',
    name: 'Quản Trị Viên An Nhiên',
    email: DEFAULT_ADMIN_EMAIL,
    phone: '0901234567',
    role: 'admin',
    passwordHash: initialAdminCreds.hash,
    salt: initialAdminCreds.salt,
    status: 'active',
    createdAt: '2026-01-01T08:00:00Z',
    notes: 'Tài khoản quản trị hệ thống'
  },
  // Initial Staff Member
  {
    id: 'USR-STAFF-01',
    name: 'Nguyễn Mai Lan (Kỹ thuật viên)',
    email: DEFAULT_STAFF_EMAIL,
    phone: '0933221100',
    role: 'staff',
    passwordHash: initialStaffCreds.hash,
    salt: initialStaffCreds.salt,
    status: 'active',
    createdAt: '2026-02-01T09:00:00Z',
    notes: 'Kỹ thuật viên chính - Chăm sóc da mặt và trị liệu thảo mộc'
  },
  // Initial Customer Member
  {
    id: 'USR-CUST-01',
    name: 'Nguyễn Thu Trang',
    email: 'khachhang@gmail.com',
    phone: '0912345678',
    role: 'customer',
    passwordHash: initialCustCreds.hash,
    salt: initialCustCreds.salt,
    status: 'active',
    createdAt: '2026-02-15T10:30:00Z'
  },
  {
    id: 'USR-CUST-02',
    name: 'Trần Lan Anh',
    email: 'lananh@gmail.com',
    phone: '0987654321',
    role: 'customer',
    passwordHash: initialCustCreds.hash,
    salt: initialCustCreds.salt,
    status: 'active',
    createdAt: '2026-03-01T14:20:00Z'
  }
];

// If environment specifies a custom admin email, also retain default admin@annhienspa.vn for convenience
if (DEFAULT_ADMIN_EMAIL !== 'admin@annhienspa.vn') {
  const fallbackAdminCreds = hashPassword('AnNhien@Admin2026Secure!');
  serverUsers.push({
    id: 'USR-ADMIN-02',
    name: 'Quản Trị Viên (Dự phòng)',
    email: 'admin@annhienspa.vn',
    phone: '0901234567',
    role: 'admin',
    passwordHash: fallbackAdminCreds.hash,
    salt: fallbackAdminCreds.salt,
    status: 'active',
    createdAt: '2026-01-01T08:00:00Z',
    notes: 'Tài khoản quản trị viên mặc định'
  });
}

// ============================================================================
// RATE LIMITING PROTECTION (BRUTE-FORCE MITIGATION)
// ============================================================================

interface RateLimitRecord {
  failedAttempts: number;
  lockedUntil: number;
}

const loginRateLimits = new Map<string, RateLimitRecord>();

function checkRateLimit(identifier: string): { allowed: boolean; remainingLockMinutes?: number } {
  const record = loginRateLimits.get(identifier);
  if (!record) return { allowed: true };

  const now = Date.now();
  if (record.lockedUntil > now) {
    const remainingMinutes = Math.ceil((record.lockedUntil - now) / 60000);
    return { allowed: false, remainingLockMinutes: remainingMinutes };
  }

  // Lock has expired, reset if needed
  if (record.lockedUntil > 0 && record.lockedUntil <= now) {
    loginRateLimits.delete(identifier);
  }

  return { allowed: true };
}

function recordLoginFailure(identifier: string): void {
  const now = Date.now();
  const record = loginRateLimits.get(identifier) || { failedAttempts: 0, lockedUntil: 0 };
  record.failedAttempts += 1;

  // If 5 or more failed attempts, lock out for 15 minutes
  if (record.failedAttempts >= 5) {
    record.lockedUntil = now + 15 * 60 * 1000; // 15 minutes lockout
  }

  loginRateLimits.set(identifier, record);
}

function clearLoginFailure(identifier: string): void {
  loginRateLimits.delete(identifier);
}

// ============================================================================
// TOKEN CREATION & VERIFICATION (HMAC-SHA256 SIGNED)
// ============================================================================

/**
 * Generates a signed tamper-proof session token for an authenticated user.
 * Valid for 12 hours.
 */
export function createAuthToken(user: { id: string; email: string; name: string; role: UserRole }): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const payload: TokenPayload = {
    userId: user.id,
    email: user.email.toLowerCase(),
    name: user.name,
    role: user.role,
    iat: now,
    exp: now + 12 * 3600 // 12 hours validity
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(`${header}.${encodedPayload}`)
    .digest('base64url');

  return `${header}.${encodedPayload}.${signature}`;
}

/**
 * Verifies the validity, signature, and expiration of a session token.
 */
export function verifyAuthToken(token: string): TokenPayload | null {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [header, payload, signature] = parts;
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(`${header}.${payload}`)
      .digest('base64url');

    // Constant-time comparison to prevent timing attacks
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null;
    }

    const decodedPayload: TokenPayload = JSON.parse(
      Buffer.from(payload, 'base64url').toString('utf8')
    );

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (decodedPayload.exp < now) {
      return null;
    }

    return decodedPayload;
  } catch {
    return null;
  }
}

// Backward-compatible aliases for admin
export type AdminTokenPayload = TokenPayload;
export function createAdminToken(email: string): string {
  const admin = serverUsers.find((u) => u.role === 'admin' && u.email === email.toLowerCase().trim()) || {
    id: 'USR-ADMIN-01',
    name: 'Quản Trị Viên An Nhiên',
    email,
    role: 'admin' as UserRole
  };
  return createAuthToken(admin);
}
export function verifyAdminToken(token: string): AdminTokenPayload | null {
  const payload = verifyAuthToken(token);
  if (!payload || payload.role !== 'admin') return null;
  return payload;
}

// ============================================================================
// AUTHENTICATION METHODS
// ============================================================================

/**
 * Authenticate login attempt across all three roles with rate-limiting protection.
 */
export function authenticateUser(
  email: string,
  password: string,
  expectedRole?: UserRole,
  clientIp?: string
): { success: boolean; token?: string; user?: any; error?: string } {
  const cleanEmail = (email || '').trim().toLowerCase();
  const rateLimitKey = `${clientIp || 'client'}_${cleanEmail}`;

  // 1. Check rate limit
  const rateLimitStatus = checkRateLimit(rateLimitKey);
  if (!rateLimitStatus.allowed) {
    return {
      success: false,
      error: `Tài khoản hoặc thiết bị đã bị tạm khóa do nhập sai nhiều lần. Vui lòng thử lại sau ${rateLimitStatus.remainingLockMinutes} phút.`
    };
  }

  if (!cleanEmail || !password) {
    return { success: false, error: 'Vui lòng nhập đầy đủ tài khoản/email và mật khẩu.' };
  }

  // 2. Find user in server database
  const user = serverUsers.find((u) => u.email === cleanEmail);

  if (!user) {
    recordLoginFailure(rateLimitKey);
    return { success: false, error: 'Tài khoản hoặc mật khẩu không chính xác.' };
  }

  // 3. Verify role if specified
  if (expectedRole && user.role !== expectedRole) {
    recordLoginFailure(rateLimitKey);
    if (expectedRole === 'admin' && user.role !== 'admin') {
      return { success: false, error: 'Tài khoản này không có quyền quản trị viên.' };
    }
    if (expectedRole === 'staff' && user.role !== 'staff') {
      return { success: false, error: 'Tài khoản này không phải là tài khoản nhân viên.' };
    }
    if (expectedRole === 'customer' && user.role !== 'customer') {
      return { success: false, error: 'Vui lòng chọn đúng vai trò tương ứng để đăng nhập.' };
    }
  }

  // 4. Check account status
  if (user.status === 'blocked') {
    return { success: false, error: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ ban quản lý spa.' };
  }

  // 5. Verify password via PBKDF2
  const isValid = verifyPassword(password, user.passwordHash, user.salt);
  if (!isValid) {
    recordLoginFailure(rateLimitKey);
    return { success: false, error: 'Tài khoản hoặc mật khẩu không chính xác.' };
  }

  // 6. Reset rate limit on success
  clearLoginFailure(rateLimitKey);

  // 7. Generate secure token
  const token = createAuthToken({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  });

  return {
    success: true,
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status
    }
  };
}

export function authenticateAdmin(email: string, password: string): { success: boolean; token?: string; error?: string } {
  const result = authenticateUser(email, password, 'admin');
  return {
    success: result.success,
    token: result.token,
    error: result.error
  };
}

/**
 * Customer Self-Registration: Strictly registers accounts with role 'customer'.
 * Prevents privilege escalation.
 */
export function registerCustomer(data: {
  name: string;
  email: string;
  phone: string;
  password: string;
}): { success: boolean; token?: string; user?: any; error?: string } {
  const cleanName = (data.name || '').trim();
  const cleanEmail = (data.email || '').trim().toLowerCase();
  const cleanPhone = (data.phone || '').trim();
  const password = data.password || '';

  if (!cleanName || cleanName.length < 2) {
    return { success: false, error: 'Vui lòng nhập họ tên hợp lệ (ít nhất 2 ký tự).' };
  }
  if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
    return { success: false, error: 'Địa chỉ email không đúng định dạng.' };
  }
  if (!cleanPhone || cleanPhone.length < 9) {
    return { success: false, error: 'Số điện thoại không hợp lệ (ít nhất 9 chữ số).' };
  }
  if (!password || password.length < 6) {
    return { success: false, error: 'Mật khẩu phải có độ dài tối thiểu 6 ký tự để đảm bảo an toàn.' };
  }

  // Check if email already exists
  const existing = serverUsers.find((u) => u.email === cleanEmail);
  if (existing) {
    return { success: false, error: 'Email này đã được sử dụng. Vui lòng đăng nhập hoặc dùng email khác.' };
  }

  // Hash password
  const { hash, salt } = hashPassword(password);
  const newUserId = `USR-CUST-${Date.now().toString().slice(-6)}`;

  const newCustomer: StoredUser = {
    id: newUserId,
    name: cleanName,
    email: cleanEmail,
    phone: cleanPhone,
    role: 'customer', // Strictly customer
    passwordHash: hash,
    salt,
    status: 'active',
    createdAt: new Date().toISOString()
  };

  serverUsers.push(newCustomer);

  const token = createAuthToken({
    id: newCustomer.id,
    email: newCustomer.email,
    name: newCustomer.name,
    role: 'customer'
  });

  return {
    success: true,
    token,
    user: {
      id: newCustomer.id,
      name: newCustomer.name,
      email: newCustomer.email,
      phone: newCustomer.phone,
      role: 'customer',
      status: 'active'
    }
  };
}

// ============================================================================
// STAFF MANAGEMENT BY ADMIN
// ============================================================================

export function getStaffListAdmin(): Array<Omit<StoredUser, 'passwordHash' | 'salt'>> {
  return serverUsers
    .filter((u) => u.role === 'staff')
    .map(({ passwordHash, salt, ...safeUser }) => safeUser);
}

export function createStaffAccountByAdmin(data: {
  name: string;
  email: string;
  phone: string;
  password: string;
  notes?: string;
}): { success: boolean; staff?: any; error?: string } {
  const cleanEmail = (data.email || '').trim().toLowerCase();
  const cleanName = (data.name || '').trim();
  const cleanPhone = (data.phone || '').trim();
  const password = data.password || '';

  if (!cleanName || !cleanEmail || !password) {
    return { success: false, error: 'Vui lòng cung cấp đầy đủ họ tên, email công việc và mật khẩu ban đầu.' };
  }
  if (password.length < 8) {
    return { success: false, error: 'Mật khẩu nhân viên phải có ít nhất 8 ký tự để đảm bảo an toàn.' };
  }

  const existing = serverUsers.find((u) => u.email === cleanEmail);
  if (existing) {
    return { success: false, error: 'Email này đã tồn tại trong hệ thống.' };
  }

  const { hash, salt } = hashPassword(password);
  const newStaffId = `USR-STAFF-${Date.now().toString().slice(-4)}`;

  const newStaff: StoredUser = {
    id: newStaffId,
    name: cleanName,
    email: cleanEmail,
    phone: cleanPhone,
    role: 'staff',
    passwordHash: hash,
    salt,
    status: 'active',
    createdAt: new Date().toISOString(),
    notes: data.notes || 'Nhân viên kỹ thuật spa'
  };

  serverUsers.push(newStaff);

  const { passwordHash: _, salt: __, ...safeStaff } = newStaff;
  return { success: true, staff: safeStaff };
}

export function updateStaffStatusByAdmin(staffId: string, status: 'active' | 'blocked'): boolean {
  const staff = serverUsers.find((u) => u.id === staffId && u.role === 'staff');
  if (!staff) return false;
  staff.status = status;
  return true;
}

export function updateStaffPasswordByAdmin(staffId: string, newPassword: string): boolean {
  const staff = serverUsers.find((u) => u.id === staffId && u.role === 'staff');
  if (!staff || !newPassword || newPassword.length < 8) return false;
  const { hash, salt } = hashPassword(newPassword);
  staff.passwordHash = hash;
  staff.salt = salt;
  return true;
}

export function deleteStaffAccountByAdmin(staffId: string): boolean {
  const idx = serverUsers.findIndex((u) => u.id === staffId && u.role === 'staff');
  if (idx === -1) return false;
  serverUsers.splice(idx, 1);
  return true;
}

export function findUserById(id: string): StoredUser | undefined {
  return serverUsers.find((u) => u.id === id);
}

export function findUserByEmail(email: string): StoredUser | undefined {
  return serverUsers.find((u) => u.email === email.toLowerCase().trim());
}
