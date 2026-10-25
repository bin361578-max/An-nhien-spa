import crypto from 'crypto';

export interface AdminTokenPayload {
  email: string;
  role: 'admin';
  iat: number;
  exp: number; // Expiration timestamp
}

// Server-side secret key for signing admin session tokens
const JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'annhien_spa_secure_server_secret_key_2026_x89f2a';

// Configurable Admin Credentials (from server environment, NEVER exposed to client)
const DEFAULT_ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@annhienspa.vn').toLowerCase().trim();
const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'AnNhien@Admin2026Secure!';

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

// In-memory server credentials initialized securely on server startup
const initialCredentials = hashPassword(DEFAULT_ADMIN_PASSWORD);
const serverAdminRecord = {
  email: DEFAULT_ADMIN_EMAIL,
  passwordHash: initialCredentials.hash,
  salt: initialCredentials.salt,
};

/**
 * Updates admin credentials securely on the server
 */
export function updateAdminCredentials(newEmail: string, newPassword?: string) {
  serverAdminRecord.email = newEmail.toLowerCase().trim();
  if (newPassword && newPassword.length >= 8) {
    const { hash, salt } = hashPassword(newPassword);
    serverAdminRecord.passwordHash = hash;
    serverAdminRecord.salt = salt;
  }
}

/**
 * Generates a signed tamper-proof session token for the authenticated admin.
 * Valid for 12 hours.
 */
export function createAdminToken(email: string): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const payload: AdminTokenPayload = {
    email: email.toLowerCase(),
    role: 'admin',
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
 * Verifies the validity, signature, and expiration of an admin session token.
 */
export function verifyAdminToken(token: string): AdminTokenPayload | null {
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

    const decodedPayload: AdminTokenPayload = JSON.parse(
      Buffer.from(payload, 'base64url').toString('utf8')
    );

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (decodedPayload.exp < now) {
      return null;
    }

    if (decodedPayload.role !== 'admin') {
      return null;
    }

    return decodedPayload;
  } catch {
    return null;
  }
}

/**
 * Authenticates admin login attempt against server-stored credentials
 */
export function authenticateAdmin(email: string, password: string): { success: boolean; token?: string; error?: string } {
  const cleanEmail = (email || '').trim().toLowerCase();
  
  // Verify email matches configured admin email
  if (cleanEmail !== serverAdminRecord.email) {
    return { success: false, error: 'Tài khoản quản trị hoặc mật khẩu không chính xác.' };
  }

  // Verify password using PBKDF2
  const isValid = verifyPassword(password, serverAdminRecord.passwordHash, serverAdminRecord.salt);
  if (!isValid) {
    return { success: false, error: 'Tài khoản quản trị hoặc mật khẩu không chính xác.' };
  }

  // Issue token
  const token = createAdminToken(cleanEmail);
  return { success: true, token };
}
