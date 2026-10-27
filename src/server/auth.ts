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

// Built-in Administrator accounts (guaranteed to work across AI Studio and Vercel)
const adminCreds1 = hashPassword('amin_2454');
const adminCreds2 = hashPassword('AnNhien@Admin2026Secure!');

// Built-in Staff accounts
const staffCreds1 = hashPassword('nhanvien123');
const staffCreds2 = hashPassword('NhanVien@AnNhien2026!');

// Built-in Customer accounts
const custCreds = hashPassword('KhachHang@2026!');

const serverUsers: StoredUser[] = [
  // 1. Primary Administrator
  {
    id: 'USR-ADMIN-01',
    name: 'Quản Trị Viên An Nhiên',
    email: 'nguyenmin666@gmail.com',
    phone: '0901234567',
    role: 'admin',
    passwordHash: adminCreds1.hash,
    salt: adminCreds1.salt,
    status: 'active',
    createdAt: '2026-01-01T08:00:00Z',
    notes: 'Tài khoản quản trị viên chính'
  },
  // 2. Secondary/System Administrator
  {
    id: 'USR-ADMIN-02',
    name: 'Quản Trị Viên Hệ Thống',
    email: 'admin@annhienspa.vn',
    phone: '0901234568',
    role: 'admin',
    passwordHash: adminCreds2.hash,
    salt: adminCreds2.salt,
    status: 'active',
    createdAt: '2026-01-01T08:00:00Z',
    notes: 'Tài khoản quản trị viên mặc định hệ thống'
  },
  // 3. Primary Staff Member
  {
    id: 'USR-STAFF-01',
    name: 'Nhân Viên Điều Phối',
    email: 'nhanvien12@gmail.com',
    phone: '0933221100',
    role: 'staff',
    passwordHash: staffCreds1.hash,
    salt: staffCreds1.salt,
    status: 'active',
    createdAt: '2026-02-01T09:00:00Z',
    notes: 'Kỹ thuật viên & điều phối viên spa'
  },
  // 4. Secondary Staff Member
  {
    id: 'USR-STAFF-02',
    name: 'Nguyễn Mai Lan (Kỹ thuật viên)',
    email: 'nhanvien@annhienspa.vn',
    phone: '0933221199',
    role: 'staff',
    passwordHash: staffCreds2.hash,
    salt: staffCreds2.salt,
    status: 'active',
    createdAt: '2026-02-01T09:00:00Z',
    notes: 'Kỹ thuật viên chính - Chăm sóc da mặt và trị liệu thảo mộc'
  },
  // 5. Customer Seed 1
  {
    id: 'USR-CUST-01',
    name: 'Nguyễn Thu Trang',
    email: 'khachhang@gmail.com',
    phone: '0912345678',
    role: 'customer',
    passwordHash: custCreds.hash,
    salt: custCreds.salt,
    status: 'active',
    createdAt: '2026-02-15T10:30:00Z'
  },
  // 6. Customer Seed 2
  {
    id: 'USR-CUST-02',
    name: 'Trần Lan Anh',
    email: 'lananh@gmail.com',
    phone: '0987654321',
    role: 'customer',
    passwordHash: custCreds.hash,
    salt: custCreds.salt,
    status: 'active',
    createdAt: '2026-03-01T14:20:00Z'
  },
  // 7. Customer Seed 3 (Owner personal account)
  {
    id: 'USR-CUST-03',
    name: 'Khách Hàng An Nhiên',
    email: 'bin361578@gmail.com',
    phone: '0912345679',
    role: 'customer',
    passwordHash: custCreds.hash,
    salt: custCreds.salt,
    status: 'active',
    createdAt: '2026-03-10T12:00:00Z'
  }
];

// If custom ADMIN_EMAIL is set via environment variable, also ensure it's registered
if (process.env.ADMIN_EMAIL) {
  const customAdminEmail = process.env.ADMIN_EMAIL.toLowerCase().trim();
  const existing = serverUsers.find((u) => u.email === customAdminEmail);
  if (existing) {
    if (process.env.ADMIN_PASSWORD) {
      const { hash, salt } = hashPassword(process.env.ADMIN_PASSWORD);
      existing.passwordHash = hash;
      existing.salt = salt;
    }
  } else {
    const { hash, salt } = hashPassword(process.env.ADMIN_PASSWORD || 'AnNhien@Admin2026Secure!');
    serverUsers.push({
      id: 'USR-ADMIN-ENV',
      name: 'Quản Trị Viên (Cấu hình Vercel)',
      email: customAdminEmail,
      phone: '0909998888',
      role: 'admin',
      passwordHash: hash,
      salt,
      status: 'active',
      createdAt: new Date().toISOString()
    });
  }
}

// If custom STAFF_EMAIL is set via environment variable, also ensure it's registered
if (process.env.STAFF_EMAIL) {
  const customStaffEmail = process.env.STAFF_EMAIL.toLowerCase().trim();
  const existing = serverUsers.find((u) => u.email === customStaffEmail);
  if (existing) {
    if (process.env.STAFF_PASSWORD) {
      const { hash, salt } = hashPassword(process.env.STAFF_PASSWORD);
      existing.passwordHash = hash;
      existing.salt = salt;
    }
  } else {
    const { hash, salt } = hashPassword(process.env.STAFF_PASSWORD || 'NhanVien@AnNhien2026!');
    serverUsers.push({
      id: 'USR-STAFF-ENV',
      name: 'Nhân Viên (Cấu hình Vercel)',
      email: customStaffEmail,
      phone: '0933998877',
      role: 'staff',
      passwordHash: hash,
      salt,
      status: 'active',
      createdAt: new Date().toISOString()
    });
  }
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
 * Supports login via either Email or Phone number.
 * Server determines role authoritatively.
 */
export function authenticateUser(
  identifier: string,
  password: string,
  expectedRole?: UserRole,
  clientIp?: string
): { success: boolean; token?: string; user?: any; error?: string } {
  const cleanInput = (identifier || '').trim();
  const cleanLower = cleanInput.toLowerCase();
  const rawDigits = cleanInput.replace(/\D/g, '');
  const cleanPhone = rawDigits.startsWith('84') && rawDigits.length >= 10
    ? '0' + rawDigits.slice(2)
    : rawDigits;
  const rateLimitKey = `${clientIp || 'client'}_${cleanLower || cleanPhone || 'anonymous'}`;

  // 1. Check rate limit
  const rateLimitStatus = checkRateLimit(rateLimitKey);
  if (!rateLimitStatus.allowed) {
    return {
      success: false,
      error: `Tài khoản hoặc thiết bị đã bị tạm khóa do nhập sai nhiều lần. Vui lòng thử lại sau ${rateLimitStatus.remainingLockMinutes} phút.`
    };
  }

  if (!cleanInput || !password) {
    return { success: false, error: 'Vui lòng nhập đầy đủ Email/Số điện thoại và Mật khẩu.' };
  }

  // 2. Find user in server database by email OR phone (supports both local 09... and +84... formats)
  const user = serverUsers.find((u) => {
    const emailMatches = Boolean(u.email && u.email.toLowerCase() === cleanLower);
    const userRawPhone = u.phone ? u.phone.replace(/\D/g, '') : '';
    const userNormalizedPhone = userRawPhone.startsWith('84') && userRawPhone.length >= 10
      ? '0' + userRawPhone.slice(2)
      : userRawPhone;
    const phoneMatches = Boolean(cleanPhone.length >= 8 && userNormalizedPhone === cleanPhone);
    return emailMatches || phoneMatches;
  });

  // If account does not exist, return generic error (prevents account enumeration)
  if (!user) {
    recordLoginFailure(rateLimitKey);
    return { success: false, error: 'Email/Số điện thoại hoặc mật khẩu không chính xác.' };
  }

  // 3. Verify role if explicitly requested (optional safeguard)
  if (expectedRole && user.role !== expectedRole) {
    recordLoginFailure(rateLimitKey);
    return { success: false, error: 'Email/Số điện thoại hoặc mật khẩu không chính xác.' };
  }

  // 4. Check account status
  if (user.status === 'blocked') {
    return { success: false, error: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ ban quản lý spa.' };
  }

  // 5. Verify password via PBKDF2 timing-safe comparison
  const isValid = verifyPassword(password, user.passwordHash, user.salt);
  if (!isValid) {
    recordLoginFailure(rateLimitKey);
    return { success: false, error: 'Email/Số điện thoại hoặc mật khẩu không chính xác.' };
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
