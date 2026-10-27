// src/server/app.ts
import express from "express";

// src/server/auth.ts
import crypto from "crypto";
var JWT_SECRET = process.env.ADMIN_JWT_SECRET || process.env.AUTH_SECRET || "annhien_spa_secure_server_secret_key_2026_x89f2a";
var DEFAULT_ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "admin@annhienspa.vn").toLowerCase().trim();
var DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "AnNhien@Admin2026Secure!";
var DEFAULT_STAFF_EMAIL = (process.env.STAFF_EMAIL || "nhanvien@annhienspa.vn").toLowerCase().trim();
var DEFAULT_STAFF_PASSWORD = process.env.STAFF_PASSWORD || "NhanVien@AnNhien2026!";
var DEFAULT_CUSTOMER_PASSWORD = process.env.CUSTOMER_PASSWORD || "KhachHang@2026!";
function hashPassword(password, providedSalt) {
  const salt = providedSalt || crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1e4, 64, "sha512").toString("hex");
  return { hash, salt };
}
function verifyPassword(password, storedHash, salt) {
  try {
    const hashToVerify = crypto.pbkdf2Sync(password, salt, 1e4, 64, "sha512").toString("hex");
    const hashBuffer = Buffer.from(storedHash, "hex");
    const verifyBuffer = Buffer.from(hashToVerify, "hex");
    if (hashBuffer.length !== verifyBuffer.length) {
      return false;
    }
    return crypto.timingSafeEqual(hashBuffer, verifyBuffer);
  } catch {
    return false;
  }
}
var initialAdminCreds = hashPassword(DEFAULT_ADMIN_PASSWORD);
var initialStaffCreds = hashPassword(DEFAULT_STAFF_PASSWORD);
var initialCustCreds = hashPassword(DEFAULT_CUSTOMER_PASSWORD);
var serverUsers = [
  // Primary Administrator
  {
    id: "USR-ADMIN-01",
    name: "Qu\u1EA3n Tr\u1ECB Vi\xEAn An Nhi\xEAn",
    email: DEFAULT_ADMIN_EMAIL,
    phone: "0901234567",
    role: "admin",
    passwordHash: initialAdminCreds.hash,
    salt: initialAdminCreds.salt,
    status: "active",
    createdAt: "2026-01-01T08:00:00Z",
    notes: "T\xE0i kho\u1EA3n qu\u1EA3n tr\u1ECB h\u1EC7 th\u1ED1ng"
  },
  // Initial Staff Member
  {
    id: "USR-STAFF-01",
    name: "Nguy\u1EC5n Mai Lan (K\u1EF9 thu\u1EADt vi\xEAn)",
    email: DEFAULT_STAFF_EMAIL,
    phone: "0933221100",
    role: "staff",
    passwordHash: initialStaffCreds.hash,
    salt: initialStaffCreds.salt,
    status: "active",
    createdAt: "2026-02-01T09:00:00Z",
    notes: "K\u1EF9 thu\u1EADt vi\xEAn ch\xEDnh - Ch\u0103m s\xF3c da m\u1EB7t v\xE0 tr\u1ECB li\u1EC7u th\u1EA3o m\u1ED9c"
  },
  // Initial Customer Member
  {
    id: "USR-CUST-01",
    name: "Nguy\u1EC5n Thu Trang",
    email: "khachhang@gmail.com",
    phone: "0912345678",
    role: "customer",
    passwordHash: initialCustCreds.hash,
    salt: initialCustCreds.salt,
    status: "active",
    createdAt: "2026-02-15T10:30:00Z"
  },
  {
    id: "USR-CUST-02",
    name: "Tr\u1EA7n Lan Anh",
    email: "lananh@gmail.com",
    phone: "0987654321",
    role: "customer",
    passwordHash: initialCustCreds.hash,
    salt: initialCustCreds.salt,
    status: "active",
    createdAt: "2026-03-01T14:20:00Z"
  }
];
if (DEFAULT_ADMIN_EMAIL !== "admin@annhienspa.vn") {
  const fallbackAdminCreds = hashPassword("AnNhien@Admin2026Secure!");
  serverUsers.push({
    id: "USR-ADMIN-02",
    name: "Qu\u1EA3n Tr\u1ECB Vi\xEAn (D\u1EF1 ph\xF2ng)",
    email: "admin@annhienspa.vn",
    phone: "0901234567",
    role: "admin",
    passwordHash: fallbackAdminCreds.hash,
    salt: fallbackAdminCreds.salt,
    status: "active",
    createdAt: "2026-01-01T08:00:00Z",
    notes: "T\xE0i kho\u1EA3n qu\u1EA3n tr\u1ECB vi\xEAn m\u1EB7c \u0111\u1ECBnh"
  });
}
if (DEFAULT_STAFF_EMAIL !== "nhanvien@annhienspa.vn") {
  const fallbackStaffCreds = hashPassword("NhanVien@AnNhien2026!");
  serverUsers.push({
    id: "USR-STAFF-02",
    name: "Nh\xE2n Vi\xEAn K\u1EF9 Thu\u1EADt (D\u1EF1 ph\xF2ng)",
    email: "nhanvien@annhienspa.vn",
    phone: "0933221199",
    role: "staff",
    passwordHash: fallbackStaffCreds.hash,
    salt: fallbackStaffCreds.salt,
    status: "active",
    createdAt: "2026-02-01T09:00:00Z",
    notes: "T\xE0i kho\u1EA3n nh\xE2n vi\xEAn m\u1EB7c \u0111\u1ECBnh"
  });
}
var loginRateLimits = /* @__PURE__ */ new Map();
function checkRateLimit(identifier) {
  const record = loginRateLimits.get(identifier);
  if (!record) return { allowed: true };
  const now = Date.now();
  if (record.lockedUntil > now) {
    const remainingMinutes = Math.ceil((record.lockedUntil - now) / 6e4);
    return { allowed: false, remainingLockMinutes: remainingMinutes };
  }
  if (record.lockedUntil > 0 && record.lockedUntil <= now) {
    loginRateLimits.delete(identifier);
  }
  return { allowed: true };
}
function recordLoginFailure(identifier) {
  const now = Date.now();
  const record = loginRateLimits.get(identifier) || { failedAttempts: 0, lockedUntil: 0 };
  record.failedAttempts += 1;
  if (record.failedAttempts >= 5) {
    record.lockedUntil = now + 15 * 60 * 1e3;
  }
  loginRateLimits.set(identifier, record);
}
function clearLoginFailure(identifier) {
  loginRateLimits.delete(identifier);
}
function createAuthToken(user) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const now = Math.floor(Date.now() / 1e3);
  const payload = {
    userId: user.id,
    email: user.email.toLowerCase(),
    name: user.name,
    role: user.role,
    iat: now,
    exp: now + 12 * 3600
    // 12 hours validity
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${encodedPayload}`).digest("base64url");
  return `${header}.${encodedPayload}.${signature}`;
}
function verifyAuthToken(token) {
  try {
    if (!token || typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, payload, signature] = parts;
    const expectedSignature = crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${payload}`).digest("base64url");
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null;
    }
    const decodedPayload = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    );
    const now = Math.floor(Date.now() / 1e3);
    if (decodedPayload.exp < now) {
      return null;
    }
    return decodedPayload;
  } catch {
    return null;
  }
}
function authenticateUser(identifier, password, expectedRole, clientIp) {
  const cleanInput = (identifier || "").trim();
  const cleanLower = cleanInput.toLowerCase();
  const cleanDigits = cleanInput.replace(/[\s.-]/g, "");
  const rateLimitKey = `${clientIp || "client"}_${cleanLower || cleanDigits || "anonymous"}`;
  const rateLimitStatus = checkRateLimit(rateLimitKey);
  if (!rateLimitStatus.allowed) {
    return {
      success: false,
      error: `T\xE0i kho\u1EA3n ho\u1EB7c thi\u1EBFt b\u1ECB \u0111\xE3 b\u1ECB t\u1EA1m kh\xF3a do nh\u1EADp sai nhi\u1EC1u l\u1EA7n. Vui l\xF2ng th\u1EED l\u1EA1i sau ${rateLimitStatus.remainingLockMinutes} ph\xFAt.`
    };
  }
  if (!cleanInput || !password) {
    return { success: false, error: "Vui l\xF2ng nh\u1EADp \u0111\u1EA7y \u0111\u1EE7 Email/S\u1ED1 \u0111i\u1EC7n tho\u1EA1i v\xE0 M\u1EADt kh\u1EA9u." };
  }
  const user = serverUsers.find((u) => {
    const emailMatches = u.email && u.email.toLowerCase() === cleanLower;
    const phoneMatches = u.phone && cleanDigits.length >= 8 && u.phone.replace(/[\s.-]/g, "") === cleanDigits;
    return emailMatches || phoneMatches;
  });
  if (!user) {
    recordLoginFailure(rateLimitKey);
    return { success: false, error: "Email/S\u1ED1 \u0111i\u1EC7n tho\u1EA1i ho\u1EB7c m\u1EADt kh\u1EA9u kh\xF4ng ch\xEDnh x\xE1c." };
  }
  if (expectedRole && user.role !== expectedRole) {
    recordLoginFailure(rateLimitKey);
    return { success: false, error: "Email/S\u1ED1 \u0111i\u1EC7n tho\u1EA1i ho\u1EB7c m\u1EADt kh\u1EA9u kh\xF4ng ch\xEDnh x\xE1c." };
  }
  if (user.status === "blocked") {
    return { success: false, error: "T\xE0i kho\u1EA3n c\u1EE7a b\u1EA1n \u0111\xE3 b\u1ECB kh\xF3a. Vui l\xF2ng li\xEAn h\u1EC7 ban qu\u1EA3n l\xFD spa." };
  }
  const isValid = verifyPassword(password, user.passwordHash, user.salt);
  if (!isValid) {
    recordLoginFailure(rateLimitKey);
    return { success: false, error: "Email/S\u1ED1 \u0111i\u1EC7n tho\u1EA1i ho\u1EB7c m\u1EADt kh\u1EA9u kh\xF4ng ch\xEDnh x\xE1c." };
  }
  clearLoginFailure(rateLimitKey);
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
function registerCustomer(data) {
  const cleanName = (data.name || "").trim();
  const cleanEmail = (data.email || "").trim().toLowerCase();
  const cleanPhone = (data.phone || "").trim();
  const password = data.password || "";
  if (!cleanName || cleanName.length < 2) {
    return { success: false, error: "Vui l\xF2ng nh\u1EADp h\u1ECD t\xEAn h\u1EE3p l\u1EC7 (\xEDt nh\u1EA5t 2 k\xFD t\u1EF1)." };
  }
  if (!cleanEmail || !cleanEmail.includes("@") || !cleanEmail.includes(".")) {
    return { success: false, error: "\u0110\u1ECBa ch\u1EC9 email kh\xF4ng \u0111\xFAng \u0111\u1ECBnh d\u1EA1ng." };
  }
  if (!cleanPhone || cleanPhone.length < 9) {
    return { success: false, error: "S\u1ED1 \u0111i\u1EC7n tho\u1EA1i kh\xF4ng h\u1EE3p l\u1EC7 (\xEDt nh\u1EA5t 9 ch\u1EEF s\u1ED1)." };
  }
  if (!password || password.length < 6) {
    return { success: false, error: "M\u1EADt kh\u1EA9u ph\u1EA3i c\xF3 \u0111\u1ED9 d\xE0i t\u1ED1i thi\u1EC3u 6 k\xFD t\u1EF1 \u0111\u1EC3 \u0111\u1EA3m b\u1EA3o an to\xE0n." };
  }
  const existing = serverUsers.find((u) => u.email === cleanEmail);
  if (existing) {
    return { success: false, error: "Email n\xE0y \u0111\xE3 \u0111\u01B0\u1EE3c s\u1EED d\u1EE5ng. Vui l\xF2ng \u0111\u0103ng nh\u1EADp ho\u1EB7c d\xF9ng email kh\xE1c." };
  }
  const { hash, salt } = hashPassword(password);
  const newUserId = `USR-CUST-${Date.now().toString().slice(-6)}`;
  const newCustomer = {
    id: newUserId,
    name: cleanName,
    email: cleanEmail,
    phone: cleanPhone,
    role: "customer",
    // Strictly customer
    passwordHash: hash,
    salt,
    status: "active",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  serverUsers.push(newCustomer);
  const token = createAuthToken({
    id: newCustomer.id,
    email: newCustomer.email,
    name: newCustomer.name,
    role: "customer"
  });
  return {
    success: true,
    token,
    user: {
      id: newCustomer.id,
      name: newCustomer.name,
      email: newCustomer.email,
      phone: newCustomer.phone,
      role: "customer",
      status: "active"
    }
  };
}
function getStaffListAdmin() {
  return serverUsers.filter((u) => u.role === "staff").map(({ passwordHash, salt, ...safeUser }) => safeUser);
}
function createStaffAccountByAdmin(data) {
  const cleanEmail = (data.email || "").trim().toLowerCase();
  const cleanName = (data.name || "").trim();
  const cleanPhone = (data.phone || "").trim();
  const password = data.password || "";
  if (!cleanName || !cleanEmail || !password) {
    return { success: false, error: "Vui l\xF2ng cung c\u1EA5p \u0111\u1EA7y \u0111\u1EE7 h\u1ECD t\xEAn, email c\xF4ng vi\u1EC7c v\xE0 m\u1EADt kh\u1EA9u ban \u0111\u1EA7u." };
  }
  if (password.length < 8) {
    return { success: false, error: "M\u1EADt kh\u1EA9u nh\xE2n vi\xEAn ph\u1EA3i c\xF3 \xEDt nh\u1EA5t 8 k\xFD t\u1EF1 \u0111\u1EC3 \u0111\u1EA3m b\u1EA3o an to\xE0n." };
  }
  const existing = serverUsers.find((u) => u.email === cleanEmail);
  if (existing) {
    return { success: false, error: "Email n\xE0y \u0111\xE3 t\u1ED3n t\u1EA1i trong h\u1EC7 th\u1ED1ng." };
  }
  const { hash, salt } = hashPassword(password);
  const newStaffId = `USR-STAFF-${Date.now().toString().slice(-4)}`;
  const newStaff = {
    id: newStaffId,
    name: cleanName,
    email: cleanEmail,
    phone: cleanPhone,
    role: "staff",
    passwordHash: hash,
    salt,
    status: "active",
    createdAt: (/* @__PURE__ */ new Date()).toISOString(),
    notes: data.notes || "Nh\xE2n vi\xEAn k\u1EF9 thu\u1EADt spa"
  };
  serverUsers.push(newStaff);
  const { passwordHash: _, salt: __, ...safeStaff } = newStaff;
  return { success: true, staff: safeStaff };
}
function updateStaffStatusByAdmin(staffId, status) {
  const staff = serverUsers.find((u) => u.id === staffId && u.role === "staff");
  if (!staff) return false;
  staff.status = status;
  return true;
}
function updateStaffPasswordByAdmin(staffId, newPassword) {
  const staff = serverUsers.find((u) => u.id === staffId && u.role === "staff");
  if (!staff || !newPassword || newPassword.length < 8) return false;
  const { hash, salt } = hashPassword(newPassword);
  staff.passwordHash = hash;
  staff.salt = salt;
  return true;
}
function deleteStaffAccountByAdmin(staffId) {
  const idx = serverUsers.findIndex((u) => u.id === staffId && u.role === "staff");
  if (idx === -1) return false;
  serverUsers.splice(idx, 1);
  return true;
}

// src/assets/images/index.ts
var IMAGES = {
  heroSpaAmbiance: "/assets/images/hero_spa_ambiance_1792632796767.jpg",
  productHerbalSerum: "/assets/images/product_herbal_serum_1792632798964.jpg",
  serviceBodyScrub: "/assets/images/service_body_scrub_1792632798359.jpg",
  serviceFacialTreatment: "/assets/images/service_facial_treatment_1792632797197.jpg",
  serviceMassageTherapy: "/assets/images/service_massage_therapy_1792632798168.jpg"
};

// src/data/seedData.ts
var SEED_USERS = [
  {
    id: "USR-CUST-01",
    name: "Nguy\u1EC5n Thu Trang",
    email: "khachhang@gmail.com",
    phone: "0912345678",
    role: "customer",
    createdAt: "2026-02-15T10:30:00Z",
    status: "active"
  },
  {
    id: "USR-CUST-02",
    name: "Tr\u1EA7n Lan Anh",
    email: "lananh@gmail.com",
    phone: "0987654321",
    role: "customer",
    createdAt: "2026-03-01T14:20:00Z",
    status: "active"
  }
];
var SEED_SERVICES = [
  {
    id: "SRV-01",
    name: "Ch\u0103m S\xF3c Da M\u1EB7t Th\u1EA3o M\u1ED9c Chuy\xEAn S\xE2u",
    category: "facial",
    categoryName: "Ch\u0103m s\xF3c da m\u1EB7t",
    description: "L\xE0m s\u1EA1ch s\xE2u \u0111a t\u1EA7ng, t\u1EA9y da ch\u1EBFt d\u1ECBu nh\u1EB9 v\xE0 cung c\u1EA5p d\u01B0\u1EE1ng ch\u1EA5t t\u1EEB th\u1EA3o m\u1ED9c thi\xEAn nhi\xEAn gi\xFAp da s\xE1ng h\u1ED3ng c\u0103ng m\u1ECBn.",
    fullDescription: "Li\u1EC7u tr\xECnh ch\u0103m s\xF3c da m\u1EB7t chuy\xEAn s\xE2u k\u1EBFt h\u1EE3p ph\u01B0\u01A1ng ph\xE1p x\xF4ng h\u01A1i th\u1EA3o d\u01B0\u1EE3c cung \u0111\xECnh, h\xFAt d\u1EA7u b\xE3 nh\u1EDDn d\u1ECBu \xEAm, massage k\xEDch ho\u1EA1t l\u01B0u th\xF4ng m\xE1u v\xE0 \u0111\u1EAFp m\u1EB7t n\u1EA1 ng\u1ECDc trai thi\xEAn nhi\xEAn. Ph\xF9 h\u1EE3p cho m\u1ECDi lo\u1EA1i da, \u0111\u1EB7c bi\u1EC7t l\xE0 da x\u1EC9n m\xE0u, m\u1EC7t m\u1ECFi.",
    price: 45e4,
    durationMinutes: 75,
    imageUrl: IMAGES.serviceFacialTreatment,
    steps: [
      "T\u1EA9y trang sinh h\u1ECDc & R\u1EEDa m\u1EB7t t\u1EA1o b\u1ECDt th\u1EA3o m\u1ED9c",
      "T\u1EA9y t\u1EBF b\xE0o ch\u1EBFt enzyme hoa qu\u1EA3 d\u1ECBu nh\u1EB9",
      "X\xF4ng h\u01A1i tinh d\u1EA7u tr\xE0m s\u1EA3 & H\xFAt d\u1EA7u m\u1EE5n c\xE1m ch\xE2n kh\xF4ng",
      "Massage b\u1EA5m huy\u1EC7t n\xE2ng c\u01A1 m\u1EB7t b\u1EB1ng tinh d\u1EA7u jojoba",
      "\u0110\u1EAFp m\u1EB7t n\u1EA1 ng\u1ECDc trai th\u1EA3o d\u01B0\u1EE3c d\u01B0\u1EE1ng \u1EA9m s\xE2u",
      "\u0110i\u1EC7n di ion l\u1EA1nh kh\xF3a \u1EA9m v\xE0 thoa kem ch\u1ED1ng n\u1EAFng b\u1EA3o v\u1EC7"
    ],
    benefits: [
      "Lo\u1EA1i b\u1ECF b\u1EE5i b\u1EA9n v\xE0 b\xE3 nh\u1EDDn s\xE2u trong l\u1ED7 ch\xE2n l\xF4ng",
      "Ph\u1EE5c h\u1ED3i \u0111\u1ED9 \u1EA9m c\xE2n b\u1EB1ng t\u1EF1 nhi\xEAn cho l\xE0n da",
      "T\u0103ng sinh tu\u1EA7n ho\xE0n m\xE1u, gi\xFAp da h\u1ED3ng h\xE0o r\u1EA1ng r\u1EE1",
      "Th\u01B0 gi\xE3n c\u01A1 m\u1EB7t, gi\u1EA3m n\u1EBFp nh\u0103n li ti"
    ],
    notes: "Kh\xF4ng trang \u0111i\u1EC3m \u0111\u1EADm trong 6 gi\u1EDD sau khi th\u1EF1c hi\u1EC7n li\u1EC7u tr\xECnh \u0111\u1EC3 d\u01B0\u1EE1ng ch\u1EA5t th\u1EA9m th\u1EA5u t\u1ED1i \u0111a.",
    status: "active"
  },
  {
    id: "SRV-02",
    name: "Massage \u0110\xE1 N\xF3ng Himalaya Tr\u1ECB Li\u1EC7u Th\u01B0 Gi\xE3n",
    category: "massage",
    categoryName: "Massage th\u01B0 gi\xE3n",
    description: "S\u1EED d\u1EE5ng c\xE1c phi\u1EBFn \u0111\xE1 n\xFAi l\u1EEDa basalt gi\u1EEF nhi\u1EC7t k\u1EBFt h\u1EE3p mu\u1ED1i kho\xE1ng h\u1ED3ng Himalaya gi\xFAp \u0111\u1EA3 th\xF4ng kinh l\u1EA1c v\xE0 gi\u1EA3m \u0111au m\u1ECFi.",
    fullDescription: "Li\u1EC7u ph\xE1p \u1EE9ng d\u1EE5ng nhi\u1EC7t n\u0103ng t\u1EEB \u0111\xE1 nham th\u1EA1ch t\u1EF1 nhi\xEAn v\xE0 mu\u1ED1i kho\xE1ng c\u1ED5 Himalaya t\xE1c \u0111\u1ED9ng l\xEAn c\xE1c lu\xE2n xa d\u1ECDc s\u1ED1ng l\u01B0ng. Tinh d\u1EA7u o\u1EA3i h\u01B0\u01A1ng c\xF9ng b\xE0n tay k\u1EF9 thu\u1EADt vi\xEAn \u0111i\xEAu luy\u1EC7n gi\xFAp xua tan \xE1p l\u1EF1c th\u1EA7n kinh v\xE0 k\xEDch th\xEDch gi\u1EA5c ng\u1EE7 s\xE2u.",
    price: 55e4,
    durationMinutes: 90,
    imageUrl: IMAGES.serviceMassageTherapy,
    steps: [
      "Ng\xE2m ch\xE2n th\u1EA3o d\u01B0\u1EE3c n\u01B0\u1EDBc \u1EA5m v\u1EDBi g\u1EEBng t\u01B0\u01A1i v\xE0 mu\u1ED1i kho\xE1ng",
      "Kh\u1EDFi \u0111\u1ED9ng \u1EA5n huy\u1EC7t kh\xF4 to\xE0n th\xE2n khai th\xF4ng kinh m\u1EA1ch",
      "Thoa tinh d\u1EA7u th\u1EA3o m\u1ED9c \u1EA5m & Massage mi\u1EBFt c\u01A1 s\xE2u",
      "Ch\u01B0\u1EDDm v\xE0 tr\u01B0\u1EE3t \u0111\xE1 n\xF3ng basalt tr\xEAn c\xE1c v\xF9ng l\u01B0ng, vai g\xE1y",
      "Xoa b\xF3p gi\u1EA3m c\u0103ng th\u1EB3ng v\xF9ng \u0111\u1EA7u, c\u1ED5 v\xE0 b\u1EAFp ch\xE2n",
      "Lau \u1EA5m kh\u0103n th\u1EA3o d\u01B0\u1EE3c v\xE0 th\u01B0\u1EDFng th\u1EE9c tr\xE0 hoa c\xFAc m\u1EADt ong"
    ],
    benefits: [
      "Gi\u1EA3i t\u1ECFa t\xECnh tr\u1EA1ng c\u0103ng c\u1EE9ng c\u01A1 b\u1EAFp v\xE0 \u0111au m\u1ECFi vai g\xE1y",
      "K\xEDch th\xEDch l\u01B0u th\xF4ng m\xE1u v\xE0 th\u1EA3i \u0111\u1ED9c c\u01A1 th\u1EC3",
      "C\u1EA3i thi\u1EC7n ch\u1EA5t l\u01B0\u1EE3ng gi\u1EA5c ng\u1EE7 r\xF5 r\u1EC7t",
      "C\xE2n b\u1EB1ng n\u0103ng l\u01B0\u1EE3ng tinh th\u1EA7n, gi\u1EA3m stress"
    ],
    notes: "B\xE1o tr\u01B0\u1EDBc v\u1EDBi k\u1EF9 thu\u1EADt vi\xEAn n\u1EBFu qu\xFD kh\xE1ch \u0111ang mang thai ho\u1EB7c c\xF3 ti\u1EC1n s\u1EED tim m\u1EA1ch/huy\u1EBFt \xE1p cao.",
    status: "active"
  },
  {
    id: "SRV-03",
    name: "T\u1EA9y T\u1EBF B\xE0o Ch\u1EBFt To\xE0n Th\xE2n Mu\u1ED1i H\u1ED3ng & S\u1EEFa Non",
    category: "body",
    categoryName: "Ch\u0103m s\xF3c c\u01A1 th\u1EC3",
    description: "T\u1EA9y s\u1EA1ch l\u1EDBp s\u1EEBng gi\xE0 c\u1ED7i, nu\xF4i d\u01B0\u1EE1ng l\xE0n da m\u1ECBn m\xE0ng m\u01B0\u1EE3t m\xE0 v\u1EDBi tinh th\u1EC3 mu\u1ED1i h\u1ED3ng v\xE0 s\u1EEFa non c\xF4 \u0111\u1EB7c nguy\xEAn ch\u1EA5t.",
    fullDescription: "Li\u1EC7u tr\xECnh t\xE1i t\u1EA1o b\u1EC1 m\u1EB7t da body nh\u1EB9 nh\xE0ng m\xE0 hi\u1EC7u qu\u1EA3. C\xE1c h\u1EA1t mu\u1ED1i h\u1ED3ng Himalaya xay m\u1ECBn k\u1EBFt h\u1EE3p v\u1EDBi tinh d\u1EA7u h\u1EA1nh nh\xE2n v\xE0 s\u1EEFa non gi\xFAp lo\u1EA1i b\u1ECF ho\xE0n to\xE0n c\xE1c t\u1EBF b\xE0o ch\u1EBFt s\u1EA7n s\xF9i \u1EDF khu\u1EF7u tay, \u0111\u1EA7u g\u1ED1i, l\u01B0ng, mang l\u1EA1i l\xE0n da tr\u1EAFng s\xE1ng m\u1EC1m m\u01B0\u1EE3t.",
    price: 42e4,
    durationMinutes: 60,
    imageUrl: IMAGES.serviceBodyScrub,
    steps: [
      "T\u1EAFm tr\xE1ng \u1EA5m k\xEDch n\u1EDF l\u1ED7 ch\xE2n l\xF4ng",
      "Thoa h\u1ED7n h\u1EE3p mu\u1ED1i kho\xE1ng Himalaya k\u1EBFt h\u1EE3p s\u1EEFa non to\xE0n th\xE2n",
      "Massage xoa tr\xF2n nh\u1EB9 nh\xE0ng l\u1EA5y \u0111i l\u1EDBp t\u1EBF b\xE0o s\u1EA7n s\xF9i",
      "\u1EE6 \u1EA5m th\u01B0 gi\xE3n trong 15 ph\xFAt v\u1EDBi m\xE0ng sinh h\u1ECDc th\u1EA3o m\u1ED9c",
      "T\u1EAFm s\u1EA1ch d\u01B0\u1EDBi v\xF2i sen m\u01B0a hoa sen \u1EA5m",
      "Thoa kem d\u01B0\u1EE1ng \u1EA9m body chi\u1EBFt xu\u1EA5t b\u01A1 h\u1EA1t m\u1EE1 h\u1EEFu c\u01A1"
    ],
    benefits: [
      "L\xE0m s\xE1ng \u0111\u1EC1u m\xE0u da body, gi\u1EA3m vi\xEAm l\u1ED7 ch\xE2n l\xF4ng",
      "Cung c\u1EA5p \u0111\u1ED9 \u1EA9m m\u1ECBn m\xE0ng t\u1EE9c th\xEC cho l\xE0n da",
      "H\u1ED7 tr\u1EE3 th\u1EA9m th\u1EA5u d\u01B0\u1EE1ng ch\u1EA5t d\u01B0\u1EE1ng th\u1EC3 g\u1EA5p 3 l\u1EA7n"
    ],
    notes: "Tr\xE1nh t\u1EAFm n\u01B0\u1EDBc qu\xE1 n\xF3ng trong v\xF2ng 24 gi\u1EDD sau li\u1EC7u tr\xECnh.",
    status: "active"
  },
  {
    id: "SRV-04",
    name: "C\u1EA5y Tinh Ch\u1EA5t Hoa H\u1ED3ng H\u1EEFu C\u01A1 C\u1EA5p \u1EA8m Glowing",
    category: "skincare_treatment",
    categoryName: "Li\u1EC7u tr\xECnh d\u01B0\u1EE1ng da",
    description: "Li\u1EC7u ph\xE1p \u0111\u01B0a nano tinh ch\u1EA5t hoa h\u1ED3ng h\u1EEFu c\u01A1 v\xE0 Hyaluronic Acid \u0111a ph\xE2n t\u1EED v\xE0o t\u1EA7ng bi\u1EC3u b\xEC, t\xE1i sinh l\xE0n da c\u0103ng b\xF3ng ng\u1EADm n\u01B0\u1EDBc.",
    fullDescription: "C\xF4ng ngh\u1EC7 \u0111i\u1EC7n di nano kh\xF4ng x\xE2m l\u1EA5n \u0111\u01B0a tr\u1EF1c ti\u1EBFp d\u01B0\u1EE1ng ch\u1EA5t hoa h\u1ED3ng Damask h\u1EEFu c\u01A1 v\xE0 HA \u0111a t\u1EA7ng s\xE2u v\xE0o h\u1EA1 b\xEC, gi\xFAp gi\u1EA3i quy\u1EBFt tri\u1EC7t \u0111\u1EC3 t\xECnh tr\u1EA1ng da kh\xF4 r\xE1p, bong tr\xF3c ho\u1EB7c \u0111\u1ED5 d\u1EA7u do thi\u1EBFu n\u01B0\u1EDBc.",
    price: 68e4,
    durationMinutes: 80,
    imageUrl: IMAGES.serviceFacialTreatment,
    steps: [
      "L\xE0m s\u1EA1ch s\xE2u 3 b\u01B0\u1EDBc v\xE0 t\u1EA9y da ch\u1EBFt sinh h\u1ECDc",
      "X\xF4ng h\u01A1i c\u1EA5p \u1EA9m v\u1EDBi s\u01B0\u01A1ng hoa h\u1ED3ng h\u1EEFu c\u01A1",
      "\u0110i\u1EC7n di l\u1EA1nh tinh ch\u1EA5t hoa h\u1ED3ng Damask v\xE0 HA 3 t\u1EA7ng",
      "\u0110\u1EAFp m\u1EB7t n\u1EA1 sinh h\u1ECDc th\u1EA1ch d\u1EEBa l\xEAn men t\u1EF1 nhi\xEAn",
      "Chi\u1EBFu \xE1nh s\xE1ng sinh h\u1ECDc v\xE0ng k\xEDch th\xEDch collagen",
      "Kh\xF3a \u1EA9m b\u1EB1ng tinh d\u1EA7u squalane th\u1EF1c v\u1EADt"
    ],
    benefits: [
      "C\u0103ng b\xF3ng m\u1ECBn m\xE0ng, ng\u1EADm n\u01B0\u1EDBc su\u1ED1t 72 gi\u1EDD",
      "Thu nh\u1ECF l\u1ED7 ch\xE2n l\xF4ng v\xE0 l\xE0m d\u1ECBu k\xEDch \u1EE9ng",
      "T\u0103ng \u0111\u1ED9 \u0111\xE0n h\u1ED3i, ng\u0103n ng\u1EEBa l\xE3o h\xF3a s\u1EDBm"
    ],
    notes: "U\u1ED1ng nhi\u1EC1u n\u01B0\u1EDBc \u1EA5m sau li\u1EC7u tr\xECnh \u0111\u1EC3 t\u1ED1i \u01B0u hi\u1EC7u qu\u1EA3 c\u1EA5p \u1EA9m.",
    status: "active"
  },
  {
    id: "SRV-05",
    name: "Tr\u1ECB Li\u1EC7u C\u1ED5 Vai G\xE1y & \u0110\u1EA3 Th\xF4ng Kinh L\u1EA1c \u0110\xF4ng Y",
    category: "massage",
    categoryName: "Massage th\u01B0 gi\xE3n",
    description: "Li\u1EC7u tr\xECnh \u0111\u1EB7c tr\u1ECB h\u1ED9i ch\u1EE9ng m\u1ECFi vai g\xE1y cho d\xE2n v\u0103n ph\xF2ng b\u1EB1ng k\u1EF9 thu\u1EADt \u1EA5n huy\u1EC7t s\xE2u k\u1EBFt h\u1EE3p r\u01B0\u1EE3u thu\u1ED1c c\u1ED5 truy\u1EC1n.",
    fullDescription: "Ph\u01B0\u01A1ng ph\xE1p xoa b\xF3p tr\u1ECB li\u1EC7u chuy\xEAn s\xE2u k\u1EBFt h\u1EE3p b\u1EA5m c\xE1c huy\u1EC7t Phong Tr\xEC, Ki\xEAn T\u1EC9nh, \u0110\u1EA1i Ch\xF9y k\u1EBFt h\u1EE3p \u0111\u1EAFp cao th\u1EA3o d\u01B0\u1EE3c gi\u1EEF \u1EA5m v\xF9ng g\xE1y l\u01B0ng. Gi\xFAp \u0111\xE1nh tan c\xE1c c\u1EE5c u x\u01A1 c\u01A1 b\u1EAFp, h\u1ED7 tr\u1EE3 gi\u1EA3m h\u1EB3n ch\u1EE9ng \u0111au \u0111\u1EA7u hoa m\u1EAFt do thi\u1EBFu m\xE1u n\xE3o.",
    price: 39e4,
    durationMinutes: 60,
    imageUrl: IMAGES.serviceMassageTherapy,
    steps: [
      "Th\u0103m kh\xE1m t\xECnh tr\u1EA1ng co c\u1EE9ng c\u01A1 v\xF9ng vai g\xE1y",
      "\u0110\u1EAFp t\xFAi th\u1EA3o d\u01B0\u1EE3c ng\u1EA3i c\u1EE9u n\xF3ng v\xF9ng g\xE1y",
      "Xoa b\xF3p b\u1EA5m huy\u1EC7t th\xF4ng kinh l\u1EA1c vai g\xE1y l\u01B0ng tr\xEAn",
      "C\u1EA1o gi\xF3 ng\u1ECDc b\xEDch ho\u1EB7c gi\xE1c h\u01A1i ch\xE2n kh\xF4ng (t\xF9y ch\u1ECDn)",
      "Thoa cao th\u1EA3o m\u1ED9c g\u1EEBng qu\u1EBF \u1EA5m n\xF3ng",
      "H\u01B0\u1EDBng d\u1EABn c\xE1c \u0111\u1ED9ng t\xE1c k\xE9o gi\xE3n c\u1ED9t s\u1ED1ng c\u1ED5 t\u1EA1i nh\xE0"
    ],
    benefits: [
      "Gi\u1EA3m \u0111au nh\u1EE9c m\u1ECFi c\u1ED5 vai g\xE1y t\u1EE9c th\xEC",
      "T\u0103ng c\u01B0\u1EDDng tu\u1EA7n ho\xE0n m\xE1u l\xEAn n\xE3o, gi\u1EA3m \u0111au \u0111\u1EA7u ch\xF3ng m\u1EB7t",
      "Gi\u1EA3i t\u1ECFa co r\xFAt c\xE1c d\u1EA3i c\u01A1 b\u1EAFp do ng\u1ED3i m\xE1y t\xEDnh l\xE2u"
    ],
    notes: "Kh\xE1ch h\xE0ng n\xEAn gi\u1EEF \u1EA5m v\xF9ng c\u1ED5 sau khi l\xE0m li\u1EC7u tr\xECnh.",
    status: "active"
  },
  {
    id: "SRV-06",
    name: "Thanh L\u1ECDc Da M\u1EB7t Than Ho\u1EA1t T\xEDnh & Oxy T\u01B0\u01A1i Detox",
    category: "facial",
    categoryName: "Ch\u0103m s\xF3c da m\u1EB7t",
    description: "Thanh l\u1ECDc \u0111\u1ED9c t\u1ED1 kim lo\u1EA1i n\u1EB7ng, kh\xF3i b\u1EE5i \u0111\xF4 th\u1ECB b\u1EB1ng m\u1EB7t n\u1EA1 than ho\u1EA1t t\xEDnh v\xE0 phun oxy t\u01B0\u01A1i \xE1p l\u1EF1c cao tinh khi\u1EBFt 98%.",
    fullDescription: "L\xE0n da s\u1ED1ng gi\u1EEFa m\xF4i tr\u01B0\u1EDDng kh\xF3i b\u1EE5i \u0111\xF4 th\u1ECB d\u1EC5 t\xEDch t\u1EE5 \u0111\u1ED9c t\u1ED1 v\xE0 b\xEDt t\u1EAFc. Li\u1EC7u tr\xECnh k\u1EBFt h\u1EE3p than tre ho\u1EA1t t\xEDnh h\u1EEFu c\u01A1 v\xE0 c\xF4ng ngh\u1EC7 oxy jet th\u1ED5i bay b\u1EE5i b\u1EA9n vi m\xF4, k\xEDch ho\u1EA1t h\xF4 h\u1EA5p t\u1EBF b\xE0o da kh\u1ECFe m\u1EA1nh.",
    price: 49e4,
    durationMinutes: 70,
    imageUrl: IMAGES.serviceFacialTreatment,
    steps: [
      "T\u1EA9y trang v\xE0 r\u1EEDa m\u1EB7t b\u1EB1ng gel tr\xE0m tr\xE0 t\u1EA1o b\u1ECDt m\u1ECBn",
      "T\u1EA9y da ch\u1EBFt enzym b\xED ng\xF4 sinh h\u1ECDc",
      "H\xFAt ch\xE2n kh\xF4ng b\xE3 nh\u1EDDn v\xE0 s\u1EE3i b\xE3 nh\u1EDDn c\xE1nh m\u0169i",
      "\u0110\u1EAFp m\u1EB7t n\u1EA1 than tre ho\u1EA1t t\xEDnh h\xFAt ch\xEC v\xE0 \u0111\u1ED9c t\u1ED1",
      "Phun oxy t\u01B0\u01A1i tinh khi\u1EBFt \xE1p su\u1EA5t th\u1EA9m th\u1EA5u",
      "Thoa kem d\u01B0\u1EE1ng d\u1ECBu da chi\u1EBFt xu\u1EA5t rau m\xE1"
    ],
    benefits: [
      "Th\u1EA3i \u0111\u1ED9c t\u1ED1, l\xE0m s\u1EA1ch th\xF4ng tho\xE1ng t\u1EEBng l\u1ED7 ch\xE2n l\xF4ng",
      "Ng\u0103n ng\u1EEBa m\u1EE5n \u1EA9n, m\u1EE5n \u0111\u1EA7u \u0111en t\xE1i ph\xE1t",
      "Cung c\u1EA5p oxy t\u01B0\u01A1i cho t\u1EBF b\xE0o t\xE1i sinh r\u1EA1ng ng\u1EDDi"
    ],
    notes: "Th\xEDch h\u1EE3p cho c\u1EA3 nam v\xE0 n\u1EEF ti\u1EBFp x\xFAc th\u01B0\u1EDDng xuy\xEAn v\u1EDBi b\u1EE5i b\u1EA9n ho\u1EB7c m\xE0n h\xECnh m\xE1y t\xEDnh.",
    status: "active"
  },
  {
    id: "SRV-07",
    name: "Li\u1EC7u Tr\xECnh \u1EE6 Tr\u1EAFng To\xE0n Th\xE2n Tinh Ch\u1EA5t Ng\u1ECDc Trai & S\u1EEFa D\xEA",
    category: "intensive",
    categoryName: "Ch\u0103m s\xF3c chuy\xEAn s\xE2u",
    description: "\u1EE6 d\u01B0\u1EE1ng to\xE0n th\xE2n trong l\u1ED3ng \xE1nh s\xE1ng h\u1ED3ng ngo\u1EA1i c\xF9ng b\u1ED9t ng\u1ECDc trai Ph\xFA Qu\u1ED1c v\xE0 s\u1EEFa d\xEA t\u01B0\u01A1i gi\xE0u vitamin A, E.",
    fullDescription: "Li\u1EC7u ph\xE1p d\u01B0\u1EE1ng tr\u1EAFng body t\u1EF1 nhi\xEAn kh\xF4ng l\u1ED9t t\u1EA9y. D\u01B0\u1EE1ng ch\u1EA5t t\u1EEB ng\u1ECDc trai t\u1EF1 nhi\xEAn k\u1EBFt h\u1EE3p s\u1EEFa d\xEA t\u01B0\u01A1i nguy\xEAn ch\u1EA5t th\u1EA9m th\u1EA5u s\xE2u nh\u1EDD nhi\u1EC7t l\u01B0\u1EE3ng m\xE1y phi thuy\u1EC1n quang ph\u1ED5, t\xE1i t\u1EA1o s\u1EAFc t\u1ED1 da \u0111\u1EC1u m\xE0u, b\u1EADt t\xF4ng an to\xE0n.",
    price: 85e4,
    durationMinutes: 90,
    imageUrl: IMAGES.serviceBodyScrub,
    steps: [
      "T\u1EA9y t\u1EBF b\xE0o ch\u1EBFt to\xE0n th\xE2n v\u1EDBi c\xE1m g\u1EA1o s\u1EEFa non",
      "Thoa h\u1ED7n h\u1EE3p \u1EE7 b\u1ED9t ng\u1ECDc trai xay m\u1ECBn v\xE0 s\u1EEFa d\xEA t\u01B0\u01A1i",
      "N\u1EB1m l\u1ED3ng \u1EE7 \xE1nh s\xE1ng sinh h\u1ECDc h\u1ED3ng ngo\u1EA1i 25 ph\xFAt",
      "T\u1EAFm tr\xE1ng s\u1EA1ch b\u1EB1ng s\u1EEFa t\u1EAFm th\u1EA3o m\u1ED9c",
      "Thoa kem d\u01B0\u1EE1ng kh\xF3a tr\u1EAFng chi\u1EBFt xu\u1EA5t cam th\u1EA3o h\u1EEFu c\u01A1"
    ],
    benefits: [
      "B\u1EADt t\xF4ng da t\u1EF1 nhi\xEAn, l\xE0m m\u1EDD th\xE2m s\u1EA1m c\xE1c v\xF9ng da t\u1ED1i",
      "Nu\xF4i d\u01B0\u1EE1ng l\xE0n da c\u0103ng m\u01B0\u1EDBt, \u0111\xE0n h\u1ED3i v\xE0 m\u1ECDng n\u01B0\u1EDBc",
      "Kh\xF4ng g\xE2y b\xE0o m\xF2n hay ch\xE2m ch\xEDch kh\xF3 ch\u1ECBu"
    ],
    notes: "C\u1EA7n thoa kem ch\u1ED1ng n\u1EAFng to\xE0n th\xE2n v\xE0 che ch\u1EAFn khi ra n\u1EAFng sau li\u1EC7u tr\xECnh.",
    status: "active"
  },
  {
    id: "SRV-08",
    name: "Tr\u1ECB Li\u1EC7u Th\u01B0 Gi\xE3n Chu\xF4ng Xoay T\xE2y T\u1EA1ng & Th\u1EA3o D\u01B0\u1EE3c",
    category: "massage",
    categoryName: "Massage th\u01B0 gi\xE3n",
    description: "Ph\u01B0\u01A1ng ph\xE1p tr\u1ECB li\u1EC7u b\u1EB1ng s\xF3ng \xE2m chu\xF4ng xoay k\u1EBFt h\u1EE3p k\u1EF9 thu\u1EADt vu\u1ED1t nh\u1EB9 n\u0103ng l\u01B0\u1EE3ng, ch\u1EEFa l\xE0nh s\xE2u t\xE2m tr\xED v\xE0 th\xE2n th\u1EC3.",
    fullDescription: "T\u1EADn h\u01B0\u1EDFng \xE2m vang tr\u1EA7m b\u1ED5ng t\u1EEB b\u1ED9 chu\xF4ng xoay T\xE2y T\u1EA1ng h\u1EE3p kim 7 kim lo\u1EA1i. T\u1EA7n s\u1ED1 rung \u0111\u1ED9ng vi m\xF4 c\u1EE7a chu\xF4ng lan t\u1ECFa qua t\u1EEBng t\u1EBF b\xE0o n\u01B0\u1EDBc trong c\u01A1 th\u1EC3, gi\u1EA3i ph\xF3ng m\u1ECDi b\u1EE9c b\u1ED1i lo \xE2u v\xE0 \u0111\u01B0a t\xE2m tr\xED v\xE0o tr\u1EA1ng th\xE1i an y\xEAn tuy\u1EC7t \u0111\u1ED1i.",
    price: 6e5,
    durationMinutes: 75,
    imageUrl: IMAGES.heroSpaAmbiance,
    steps: [
      "L\u1EAFng \u0111\u1ECDng t\xE2m tr\xED v\u1EDBi tr\xE0 th\u1EA3o m\u1ED9c hoa sen",
      "Kh\u1EDFi chu\xF4ng \u0111\u1ECBnh t\xE2m 3 h\u1ED3i",
      "\u0110\u1EB7t chu\xF4ng xoay l\xEAn c\xE1c lu\xE2n xa l\u01B0ng v\xE0 rung chu\xF4ng truy\u1EC1n s\xF3ng \xE2m",
      "Massage nh\u1EB9 nh\xE0ng \u0111\u1EA7u, tr\xE1n v\u1EDBi tinh d\u1EA7u tr\u1EA7m h\u01B0\u01A1ng",
      "H\xEDt th\u1EDF ph\u1EE5c h\u1ED3i n\u0103ng l\u01B0\u1EE3ng v\xE0 k\u1EBFt th\xFAc nghi th\u1EE9c"
    ],
    benefits: [
      "Gi\u1EA3m b\u1EDBt suy ngh\u0129 c\u0103ng th\u1EB3ng, lo \xE2u m\u1EA1n t\xEDnh",
      "\u0110\u01B0a s\xF3ng n\xE3o v\u1EC1 tr\u1EA1ng th\xE1i Alpha v\xE0 Theta s\xE2u l\u1EAFng",
      "Ph\u1EE5c h\u1ED3i n\u0103ng l\u01B0\u1EE3ng tinh th\u1EA7n t\xEDch c\u1EF1c v\xE0 s\xE1ng t\u1EA1o"
    ],
    notes: "Kh\xF4ng s\u1EED d\u1EE5ng \u0111i\u1EC7n tho\u1EA1i tr\u01B0\u1EDBc v\xE0 trong bu\u1ED5i tr\u1ECB li\u1EC7u \u0111\u1EC3 \u0111\u1EA1t hi\u1EC7u qu\u1EA3 an tr\xFA t\u1ED1t nh\u1EA5t.",
    status: "active"
  }
];
var SEED_PRODUCTS = [
  {
    id: "PRD-01",
    code: "AN-SRM-01",
    name: "Tinh Ch\u1EA5t Ph\u1EE5c H\u1ED3i Da An Nhi\xEAn Herbal Rejuvenation Serum",
    category: "serum",
    categoryName: "Serum & Tinh ch\u1EA5t",
    description: "Chi\u1EBFt xu\u1EA5t t\u1EEB hoa c\xFAc la m\xE3, rau m\xE1 h\u1EEFu c\u01A1 v\xE0 Hyaluronic Acid gi\xFAp l\xE0m d\u1ECBu, ph\u1EE5c h\u1ED3i h\xE0ng r\xE0o \u1EA9m t\u1EF1 nhi\xEAn c\u1EE7a da.",
    fullDescription: "S\u1EA3n ph\u1EA9m serum ph\u1EE5c h\u1ED3i chuy\xEAn s\xE2u ch\u1EE9a 85% chi\u1EBFt xu\u1EA5t th\u1EA3o m\u1ED9c h\u1EEFu c\u01A1. K\u1EBFt c\u1EA5u l\u1ECFng nh\u1EB9, th\u1EA9m th\u1EA5u nhanh trong 10 gi\xE2y m\xE0 kh\xF4ng b\u1EBFt d\xEDnh. H\u1ED7 tr\u1EE3 ph\u1EE5c h\u1ED3i da sau n\u1EB7n m\u1EE5n, treatment ho\u1EB7c da nh\u1EA1y c\u1EA3m d\u1EC5 k\xEDch \u1EE9ng.",
    price: 38e4,
    stock: 24,
    imageUrl: IMAGES.productHerbalSerum,
    volumeOrWeight: "30ml",
    status: "active"
  },
  {
    id: "PRD-02",
    code: "AN-CRM-02",
    name: "Kem D\u01B0\u1EE1ng \u1EA8m Chuy\xEAn S\xE2u Hoa C\xFAc Calendula Organic",
    category: "cream",
    categoryName: "Kem d\u01B0\u1EE1ng \u1EA9m",
    description: "C\u1EA5p \u1EA9m s\xE2u 48h, l\xE0m m\u1EC1m da kh\xF4 n\u1EBB v\xE0 b\u1EA3o v\u1EC7 l\xE0n da kh\u1ECFi t\xE1c \u0111\u1ED9ng c\u1EE7a kh\xF4ng kh\xED \u0111i\u1EC1u h\xF2a v\xE0 th\u1EDDi ti\u1EBFt kh\xF4 hanh.",
    fullDescription: "Kem d\u01B0\u1EE1ng \u1EA9m d\u1ECBu nh\u1EB9 b\xE0o ch\u1EBF t\u1EEB c\xE1nh hoa c\xFAc xu xi (Calendula) thu ho\u1EA1ch th\u1EE7 c\xF4ng k\u1EBFt h\u1EE3p b\u01A1 h\u1EA1t m\u1EE1 organic. Cung c\u1EA5p \u0111\u1ED9 \u1EA9m d\u1ED3i d\xE0o, t\xE1i t\u1EA1o m\xE0ng lipid b\u1EA3o v\u1EC7 da m\xE0 kh\xF4ng g\xE2y b\xEDt t\u1EAFc l\u1ED7 ch\xE2n l\xF4ng.",
    price: 32e4,
    stock: 18,
    imageUrl: IMAGES.productHerbalSerum,
    volumeOrWeight: "50ml",
    status: "active"
  },
  {
    id: "PRD-03",
    code: "AN-CLN-03",
    name: "S\u1EEFa R\u1EEDa M\u1EB7t T\u1EA1o B\u1ECDt D\u1ECBu Nh\u1EB9 Tr\xE0m Tr\xE0 & Tr\xE0 Xanh",
    category: "cleanser",
    categoryName: "S\u1EEFa r\u1EEDa m\u1EB7t",
    description: "\u0110\u1ED9 pH 5.5 c\xE2n b\u1EB1ng sinh h\u1ECDc, kh\xE1ng khu\u1EA9n ng\u1EEBa m\u1EE5n hi\u1EC7u qu\u1EA3 v\xE0 gi\u1EEF nguy\xEAn \u0111\u1ED9 \u1EA9m t\u1EF1 nhi\xEAn cho l\xE0n da.",
    fullDescription: "D\u1EA1ng gel t\u1EA1o b\u1ECDt m\u1ECBn t\u01A1i nh\u01B0 b\xF4ng g\xF2n, r\u1EEDa s\u1EA1ch b\u1EE5i m\u1ECBn PM2.5 v\xE0 d\u1EA7u th\u1EEBa m\xE0 kh\xF4ng l\xE0m da c\u0103ng r\xE1t. Chi\u1EBFt xu\u1EA5t tinh d\u1EA7u tr\xE0m tr\xE0 \xDAc ki\u1EC3m so\xE1t m\u1EE5n vi\xEAm k\u1EBFt h\u1EE3p polyphenol trong tr\xE0 xanh ch\u1ED1ng oxy h\xF3a m\u1EA1nh m\u1EBD.",
    price: 24e4,
    stock: 35,
    imageUrl: IMAGES.productHerbalSerum,
    volumeOrWeight: "150ml",
    status: "active"
  },
  {
    id: "PRD-04",
    code: "AN-MSK-04",
    name: "M\u1EB7t N\u1EA1 B\xF9n Kho\xE1ng N\xFAi L\u1EEDa & Tr\xE0m Tr\xE0 Thanh L\u1ECDc L\u1ED7 Ch\xE2n L\xF4ng",
    category: "mask",
    categoryName: "M\u1EB7t n\u1EA1 d\u01B0\u1EE1ng da",
    description: "H\xFAt s\u1EA1ch b\xE3 nh\u1EDDn c\u1EE9ng \u0111\u1EA7u, l\xE0m d\u1ECBu c\xE1c n\u1ED1t m\u1EE5n s\u01B0ng \u0111\u1ECF v\xE0 se kh\xEDt l\u1ED7 ch\xE2n l\xF4ng ch\u1EC9 sau 15 ph\xFAt \u0111\u1EAFp.",
    fullDescription: "H\u1ED7n h\u1EE3p b\xF9n kho\xE1ng thi\xEAn nhi\xEAn gi\xE0u nguy\xEAn t\u1ED1 vi l\u01B0\u1EE3ng k\u1EBFt h\u1EE3p v\u1EDBi b\u1ED9t tr\xE0m tr\xE0 v\xE0 than tre ho\u1EA1t t\xEDnh. C\xF3 kh\u1EA3 n\u0103ng h\u1EA5p ph\u1EE5 b\xE3 nh\u1EDDn g\u1EA5p 5 l\u1EA7n \u0111\u1EA5t s\xE9t th\xF4ng th\u01B0\u1EDDng, mang l\u1EA1i c\u1EA3m gi\xE1c the m\xE1t s\u1EA3ng kho\xE1i.",
    price: 26e4,
    stock: 15,
    imageUrl: IMAGES.productHerbalSerum,
    volumeOrWeight: "100g",
    status: "active"
  },
  {
    id: "PRD-05",
    code: "AN-OIL-05",
    name: "Tinh D\u1EA7u Massage G\u1EEBng C\u1ED5 Truy\u1EC1n & S\u1EA3 Chanh Th\u01B0 Gi\xE3n",
    category: "essential_oil",
    categoryName: "Tinh d\u1EA7u tr\u1ECB li\u1EC7u",
    description: "D\u1EA7u massage nguy\xEAn ch\u1EA5t t\u1EEB g\u1EEBng gi\xE0 v\xE0 s\u1EA3 chanh, gi\xFAp l\xE0m \u1EA5m c\u01A1 th\u1EC3, th\xF4ng kinh l\u1EA1c v\xE0 gi\u1EA3m \u0111au m\u1ECFi g\xE2n c\u1ED1t.",
    fullDescription: "Chi\u1EBFt xu\u1EA5t t\u1EEB g\u1EEBng c\u1EE7 gi\xE0 tr\u1ED3ng t\u1EF1 nhi\xEAn h\xF2a quy\u1EC7n v\u1EDBi tinh d\u1EA7u s\u1EA3 chanh thanh khi\u1EBFt tr\xEAn n\u1EC1n d\u1EA7u h\u1EA1nh nh\xE2n \xE9p l\u1EA1nh. M\xF9i h\u01B0\u01A1ng \u1EA5m \xE1p gi\u1EA3i t\u1ECFa m\u1ECDi m\u1EC7t m\u1ECFi, h\u1ED7 tr\u1EE3 k\xEDch th\xEDch l\u01B0u th\xF4ng m\xE1u v\xE0 ng\u1EE7 ngon.",
    price: 21e4,
    stock: 40,
    imageUrl: IMAGES.serviceBodyScrub,
    volumeOrWeight: "100ml",
    status: "active"
  },
  {
    id: "PRD-06",
    code: "AN-MIS-06",
    name: "X\u1ECBt Kho\xE1ng Tinh Khi\u1EBFt N\u01B0\u1EDBc C\u1EA5t Hoa H\u1ED3ng Damask",
    category: "serum",
    categoryName: "Serum & Tinh ch\u1EA5t",
    description: "Ch\u01B0ng c\u1EA5t l\xF4i cu\u1ED1n h\u01A1i n\u01B0\u1EDBc 100% t\u1EEB hoa h\u1ED3ng t\u01B0\u01A1i Damask, c\u1EA5p \u1EA9m t\u1EE9c th\xEC v\xE0 c\u1ED1 \u0111\u1ECBnh l\u1EDBp trang \u0111i\u1EC3m t\u1EF1 nhi\xEAn.",
    fullDescription: "N\u01B0\u1EDBc c\u1EA5t hoa h\u1ED3ng h\u1EEFu c\u01A1 tinh khi\u1EBFt kh\xF4ng c\u1ED3n, kh\xF4ng h\u01B0\u01A1ng li\u1EC7u t\u1ED5ng h\u1EE3p. Tia x\u1ECBt si\xEAu m\u1ECBn bao ph\u1EE7 l\xE0n da nh\u01B0 l\xE0n s\u01B0\u01A1ng m\u1ECFng, l\xE0m d\u1ECBu da ch\xE1y n\u1EAFng v\xE0 duy tr\xEC \u0111\u1ED9 m\u1EC1m m\u1EA1i su\u1ED1t ng\xE0y d\xE0i n\u0103ng \u0111\u1ED9ng.",
    price: 195e3,
    stock: 28,
    imageUrl: IMAGES.productHerbalSerum,
    volumeOrWeight: "120ml",
    status: "active"
  },
  {
    id: "PRD-07",
    code: "AN-SUN-07",
    name: "Kem Ch\u1ED1ng N\u1EAFng V\u1EADt L\xFD Th\u1EA3o M\u1ED9c SPF50+ PA++++",
    category: "cream",
    categoryName: "Kem d\u01B0\u1EE1ng \u1EA9m",
    description: "Ch\u1ED1ng tia UVA/UVB to\xE0n di\u1EC7n, n\xE2ng t\xF4ng nh\u1EB9 t\u1EF1 nhi\xEAn, kh\xF4ng v\xF3n c\u1EE5c v\xE0 ki\u1EC3m so\xE1t d\u1EA7u su\u1ED1t 8 gi\u1EDD.",
    fullDescription: "Kem ch\u1ED1ng n\u1EAFng thu\u1EA7n v\u1EADt l\xFD v\u1EDBi Zinc Oxide si\xEAu vi h\u1EA1t, k\u1EBFt h\u1EE3p chi\u1EBFt xu\u1EA5t rau m\xE1 v\xE0 tr\xE0 xanh. Kh\xE1ng n\u01B0\u1EDBc t\u1ED1t, t\u1EA1o hi\u1EC7u \u1EE9ng da tr\u1EAFng h\u1ED3ng r\u1EA1ng r\u1EE1 kh\xF4ng b\xF3ng nh\u1EDDn.",
    price: 36e4,
    stock: 22,
    imageUrl: IMAGES.productHerbalSerum,
    volumeOrWeight: "50ml",
    status: "active"
  },
  {
    id: "PRD-08",
    code: "AN-SLT-08",
    name: "Mu\u1ED1i Ng\xE2m B\u1ED3n Th\u1EA3o D\u01B0\u1EE3c C\u1ED5 Truy\u1EC1n Ng\u1EA3i C\u1EE9u & Qu\u1EBF Chi",
    category: "body",
    categoryName: "Ch\u0103m s\xF3c c\u01A1 th\u1EC3",
    description: "Mu\u1ED1i kho\xE1ng bi\u1EC3n th\xF4 k\u1EBFt h\u1EE3p 7 v\u1ECB thu\u1ED1c b\u1EAFc gi\xFAp xua tan h\xE0n kh\xED, h\u1ED7 tr\u1EE3 gi\u1EA5c ng\u1EE7 s\xE2u v\xE0 l\xE0m \u1EA5m b\xE0n ch\xE2n.",
    fullDescription: "C\xF4ng th\u1EE9c ng\xE2m b\u1ED3n th\u01B0 gi\xE3n chu\u1EA9n \u0111\xF4ng y v\u1EDBi mu\u1ED1i bi\u1EC3n h\u1EA7m, ng\u1EA3i c\u1EE9u kh\xF4, qu\u1EBF chi, hoa h\u1ED3i v\xE0 tinh d\u1EA7u tr\xE0m gi\xF3. Gi\xFAp th\u01B0 gi\xE3n g\xE2n c\u1ED1t, kh\u1EED m\xF9i h\xF4i ch\xE2n v\xE0 mang l\u1EA1i tr\u1EA1ng th\xE1i th\u01B0 th\xE1i cho to\xE0n th\xE2n.",
    price: 18e4,
    stock: 30,
    imageUrl: IMAGES.serviceBodyScrub,
    volumeOrWeight: "350g",
    status: "active"
  }
];
var SEED_BOOKINGS = [
  {
    id: "AN-BK-7319",
    userId: "USR-CUST-01",
    customerName: "Nguy\u1EC5n Thu Trang",
    customerPhone: "0912345678",
    customerEmail: "khachhang@gmail.com",
    serviceId: "SRV-01",
    serviceName: "Ch\u0103m S\xF3c Da M\u1EB7t Th\u1EA3o M\u1ED9c Chuy\xEAn S\xE2u",
    servicePrice: 45e4,
    date: "2026-10-25",
    // > 24 hours away
    timeSlot: "14:00",
    notes: "T\xF4i c\xF3 ti\u1EC1n s\u1EED da nh\u1EA1y c\u1EA3m nh\u1EB9 quanh kh\xF3e m\u0169i.",
    totalAmount: 45e4,
    depositAmount: 135e3,
    // 30%
    remainingAmount: 315e3,
    depositPaid: true,
    paymentStatus: "deposit_paid",
    status: "confirmed",
    createdAt: "2026-10-21T09:15:00Z",
    rescheduleHistory: []
  },
  {
    id: "AN-BK-6821",
    userId: "USR-CUST-02",
    customerName: "Tr\u1EA7n Lan Anh",
    customerPhone: "0987654321",
    customerEmail: "lananh@gmail.com",
    serviceId: "SRV-02",
    serviceName: "Massage \u0110\xE1 N\xF3ng Himalaya Tr\u1ECB Li\u1EC7u Th\u01B0 Gi\xE3n",
    servicePrice: 55e4,
    date: "2026-10-22",
    // close by
    timeSlot: "16:30",
    notes: "Mu\u1ED1n t\u1EADp trung xoa b\xF3p v\xF9ng th\u1EAFt l\u01B0ng v\xE0 vai g\xE1y.",
    totalAmount: 55e4,
    depositAmount: 165e3,
    remainingAmount: 385e3,
    depositPaid: true,
    paymentStatus: "deposit_paid",
    status: "pending",
    createdAt: "2026-10-21T11:00:00Z"
  },
  {
    id: "AN-BK-5192",
    userId: "USR-CUST-01",
    customerName: "Nguy\u1EC5n Thu Trang",
    customerPhone: "0912345678",
    customerEmail: "khachhang@gmail.com",
    serviceId: "SRV-05",
    serviceName: "Tr\u1ECB Li\u1EC7u C\u1ED5 Vai G\xE1y & \u0110\u1EA3 Th\xF4ng Kinh L\u1EA1c \u0110\xF4ng Y",
    servicePrice: 39e4,
    date: "2026-10-18",
    // Past
    timeSlot: "10:00",
    notes: "K\u1EF9 thu\u1EADt vi\xEAn ph\u1EE5c v\u1EE5 r\u1EA5t chu \u0111\xE1o.",
    totalAmount: 39e4,
    depositAmount: 117e3,
    remainingAmount: 273e3,
    depositPaid: true,
    paymentStatus: "deposit_paid",
    status: "completed",
    createdAt: "2026-10-15T08:20:00Z"
  },
  {
    id: "AN-BK-4081",
    userId: "USR-CUST-02",
    customerName: "Tr\u1EA7n Lan Anh",
    customerPhone: "0987654321",
    customerEmail: "lananh@gmail.com",
    serviceId: "SRV-03",
    serviceName: "T\u1EA9y T\u1EBF B\xE0o Ch\u1EBFt To\xE0n Th\xE2n Mu\u1ED1i H\u1ED3ng & S\u1EEFa Non",
    servicePrice: 42e4,
    date: "2026-10-19",
    timeSlot: "15:00",
    notes: "B\u1EADn vi\u1EC7c \u0111\u1ED9t xu\u1EA5t n\xEAn \u0111\xE3 h\u1EE7y tr\u01B0\u1EDBc 3 ng\xE0y.",
    totalAmount: 42e4,
    depositAmount: 126e3,
    remainingAmount: 294e3,
    depositPaid: true,
    paymentStatus: "refunded_full",
    status: "cancelled",
    cancelledAt: "2026-10-16T12:00:00Z",
    refundAmount: 126e3,
    retainedAmount: 0,
    createdAt: "2026-10-14T10:00:00Z"
  }
];
var SEED_ORDERS = [
  {
    id: "AN-ORD-2091",
    userId: "USR-CUST-01",
    customerName: "Nguy\u1EC5n Thu Trang",
    customerPhone: "0912345678",
    customerEmail: "khachhang@gmail.com",
    shippingAddress: "T\xF2a Landmark 4, Vinhomes Central Park, B\xECnh Th\u1EA1nh, TP.HCM",
    items: [
      {
        productId: "PRD-01",
        code: "AN-SRM-01",
        name: "Tinh Ch\u1EA5t Ph\u1EE5c H\u1ED3i Da An Nhi\xEAn Herbal Rejuvenation Serum",
        price: 38e4,
        quantity: 1,
        imageUrl: IMAGES.productHerbalSerum
      },
      {
        productId: "PRD-03",
        code: "AN-CLN-03",
        name: "S\u1EEFa R\u1EEDa M\u1EB7t T\u1EA1o B\u1ECDt D\u1ECBu Nh\u1EB9 Tr\xE0m Tr\xE0 & Tr\xE0 Xanh",
        price: 24e4,
        quantity: 1,
        imageUrl: IMAGES.productHerbalSerum
      }
    ],
    subtotal: 62e4,
    discountAmount: 62e3,
    couponCode: "ANNHIEN10",
    totalAmount: 558e3,
    paymentMethod: "card_simulation",
    paymentStatus: "paid",
    status: "shipping",
    createdAt: "2026-10-20T14:30:00Z",
    notes: "Giao trong gi\u1EDD h\xE0nh ch\xEDnh gi\xFAp m\xECnh nh\xE9."
  },
  {
    id: "AN-ORD-1845",
    userId: "USR-CUST-02",
    customerName: "Tr\u1EA7n Lan Anh",
    customerPhone: "0987654321",
    customerEmail: "lananh@gmail.com",
    shippingAddress: "45 \u0110\u01B0\u1EDDng s\u1ED1 12, P. Th\u1EA3o \u0110i\u1EC1n, TP. Th\u1EE7 \u0110\u1EE9c, TP.HCM",
    items: [
      {
        productId: "PRD-05",
        code: "AN-OIL-05",
        name: "Tinh D\u1EA7u Massage G\u1EEBng C\u1ED5 Truy\u1EC1n & S\u1EA3 Chanh Th\u01B0 Gi\xE3n",
        price: 21e4,
        quantity: 2,
        imageUrl: IMAGES.serviceBodyScrub
      }
    ],
    subtotal: 42e4,
    discountAmount: 0,
    totalAmount: 42e4,
    paymentMethod: "cod",
    paymentStatus: "pending",
    status: "completed",
    createdAt: "2026-10-17T09:10:00Z"
  }
];
var SEED_COUPONS = [
  {
    id: "CP-01",
    code: "ANNHIEN10",
    description: "Gi\u1EA3m 10% t\u1ED5ng h\xF3a \u0111\u01A1n cho kh\xE1ch h\xE0ng th\xE0nh vi\xEAn",
    discountType: "percent",
    discountValue: 10,
    minOrderValue: 3e5,
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    usageLimit: 100,
    usedCount: 14,
    applicableTo: "all",
    status: "active"
  },
  {
    id: "CP-02",
    code: "ANNHIEN15",
    description: "Gi\u1EA3m 15% khi mua m\u1EF9 ph\u1EA9m d\u01B0\u1EE1ng da ch\u0103m s\xF3c",
    discountType: "percent",
    discountValue: 15,
    minOrderValue: 5e5,
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    usageLimit: 50,
    usedCount: 8,
    applicableTo: "products",
    status: "active"
  },
  {
    id: "CP-03",
    code: "GIAM20K",
    description: "Gi\u1EA3m ngay 20.000\u0111 t\u1EEB v\xF2ng quay may m\u1EAFn may m\u1EAFn",
    discountType: "fixed",
    discountValue: 2e4,
    minOrderValue: 2e5,
    startDate: "2026-01-01",
    endDate: "2026-12-31",
    usageLimit: 200,
    usedCount: 31,
    applicableTo: "all",
    status: "active"
  },
  {
    id: "CP-04",
    code: "SPAHE2026",
    description: "\u01AFu \u0111\xE3i h\xE8 - Gi\u1EA3m 50.000\u0111 cho \u0111\u01A1n t\u1EEB 600.000\u0111",
    discountType: "fixed",
    discountValue: 5e4,
    minOrderValue: 6e5,
    startDate: "2026-05-01",
    endDate: "2026-08-31",
    usageLimit: 50,
    usedCount: 50,
    applicableTo: "all",
    status: "inactive"
    // Expired / limit reached
  }
];
var SEED_MESSAGES = [
  {
    id: "MSG-01",
    name: "V\xF5 Ho\xE0ng Y\u1EBFn",
    email: "hoangyen.vo@gmail.com",
    phone: "0933112233",
    subject: "T\u01B0 v\u1EA5n g\xF3i tr\u1ECB li\u1EC7u d\xE0nh cho c\xF4 d\xE2u tr\u01B0\u1EDBc ng\xE0y c\u01B0\u1EDBi",
    message: "Ch\xE0o An Nhi\xEAn, m\xECnh s\u1EAFp c\u01B0\u1EDBi v\xE0o th\xE1ng t\u1EDBi v\xE0 mu\u1ED1n \u0111\u0103ng k\xFD g\xF3i ch\u0103m s\xF3c da m\u1EB7t v\xE0 \u1EE7 tr\u1EAFng ng\u1ECDc trai to\xE0n th\xE2n cho 2 ng\u01B0\u1EDDi (m\xECnh v\xE0 m\u1EB9). Xin t\u01B0 v\u1EA5n li\u1EC7u tr\xECnh ph\xF9 h\u1EE3p.",
    createdAt: "2026-10-21T08:45:00Z",
    status: "unread"
  },
  {
    id: "MSG-02",
    name: "\u0110\u1EB7ng Tu\u1EA5n Ki\u1EC7t",
    email: "tuankiet@outlook.com",
    phone: "0977889900",
    subject: "\u0110\u1EB7t l\u1ECBch massage \u0111\xE1 n\xF3ng cho nh\xF3m 3 ng\u01B0\u1EDDi",
    message: "Spa cho h\u1ECFi ch\u1EE7 nh\u1EADt n\xE0y l\xFAc 15:00 c\xF3 \u0111\u1EE7 3 gi\u01B0\u1EDDng \u0111\u01A1n cho nh\xF3m b\u1EA1n m\xECnh tr\u1EA3i nghi\u1EC7m d\u1ECBch v\u1EE5 massage \u0111\xE1 n\xF3ng c\xF9ng l\xFAc kh\xF4ng \u1EA1?",
    createdAt: "2026-10-20T16:20:00Z",
    status: "read"
  }
];
var SEED_SETTINGS = {
  spaName: "An Nhi\xEAn Spa",
  hotline: "0908 123 456",
  email: "contact@annhienspa.vn",
  address: "124/8 \u0110\u01B0\u1EDDng Th\u1EA3o \u0110i\u1EC1n, Ph\u01B0\u1EDDng Th\u1EA3o \u0110i\u1EC1n, TP. Th\u1EE7 \u0110\u1EE9c, TP. H\u1ED3 Ch\xED Minh",
  openingHours: "09:00 - 20:30 (T\u1EA5t c\u1EA3 c\xE1c ng\xE0y trong tu\u1EA7n)",
  depositRate: 0.3,
  // 30% cọc
  footerBio: "An Nhi\xEAn Spa - N\u01A1i t\xECm v\u1EC1 s\u1EF1 an y\xEAn nguy\xEAn b\u1EA3n, k\u1EBFt h\u1EE3p tinh hoa th\u1EA3o m\u1ED9c \xC1 \u0110\xF4ng v\xE0 k\u1EF9 thu\u1EADt ch\u0103m s\xF3c s\u1EE9c kh\u1ECFe, s\u1EAFc \u0111\u1EB9p chu\u1EA9n m\u1EF1c."
};

// src/utils/formatters.ts
function getHoursUntilBooking(dateStr, timeSlot) {
  try {
    const [hours, minutes] = timeSlot.split(":").map(Number);
    const appointmentDate = /* @__PURE__ */ new Date(`${dateStr}T00:00:00`);
    appointmentDate.setHours(hours || 0, minutes || 0, 0, 0);
    const now = /* @__PURE__ */ new Date();
    const diffMs = appointmentDate.getTime() - now.getTime();
    return diffMs / (1e3 * 60 * 60);
  } catch {
    return 0;
  }
}
function canRescheduleBooking(booking) {
  if (booking.status === "cancelled") {
    return { allowed: false, reason: "L\u1ECBch h\u1EB9n n\xE0y \u0111\xE3 b\u1ECB h\u1EE7y, kh\xF4ng th\u1EC3 d\u1EDDi ng\xE0y.", hoursLeft: 0 };
  }
  if (booking.status === "completed") {
    return { allowed: false, reason: "L\u1ECBch h\u1EB9n \u0111\xE3 ho\xE0n th\xE0nh.", hoursLeft: 0 };
  }
  const hoursLeft = getHoursUntilBooking(booking.date, booking.timeSlot);
  if (hoursLeft < 0) {
    return { allowed: false, reason: "Gi\u1EDD h\u1EB9n \u0111\xE3 tr\xF4i qua trong qu\xE1 kh\u1EE9.", hoursLeft };
  }
  if (hoursLeft < 24) {
    return {
      allowed: false,
      reason: `Th\u1EDDi gian \u0111\u1EBFn l\u1ECBch h\u1EB9n c\xF2n ${hoursLeft.toFixed(1)} gi\u1EDD (< 24 gi\u1EDD). Theo quy \u0111\u1ECBnh, kh\xF4ng th\u1EC3 t\u1EF1 \u0111\u1ED5i l\u1ECBch tr\u1EF1c tuy\u1EBFn. Vui l\xF2ng li\xEAn h\u1EC7 tr\u1EF1c ti\u1EBFp hotline spa.`,
      hoursLeft
    };
  }
  return { allowed: true, hoursLeft };
}
function calculateCancellationRefund(booking) {
  const deposit = booking.depositAmount || 0;
  const hoursLeft = getHoursUntilBooking(booking.date, booking.timeSlot);
  if (hoursLeft >= 24) {
    return {
      refundAmount: deposit,
      retainedAmount: 0,
      isFullRefund: true,
      hoursLeft
    };
  } else {
    const half = Math.round(deposit / 2);
    return {
      refundAmount: half,
      retainedAmount: deposit - half,
      isFullRefund: false,
      hoursLeft: Math.max(0, hoursLeft)
    };
  }
}
function generateBookingId() {
  const randomNum = Math.floor(1e3 + Math.random() * 9e3);
  return `AN-BK-${randomNum}`;
}
function generateOrderId() {
  const randomNum = Math.floor(1e3 + Math.random() * 9e3);
  return `AN-ORD-${randomNum}`;
}

// src/server/dataStore.ts
var ServerDataStore = class {
  constructor() {
    this.services = JSON.parse(JSON.stringify(SEED_SERVICES));
    this.products = JSON.parse(JSON.stringify(SEED_PRODUCTS));
    this.coupons = JSON.parse(JSON.stringify(SEED_COUPONS));
    this.settings = JSON.parse(JSON.stringify(SEED_SETTINGS));
    // Private Data (Requires Admin Authorization)
    this.bookings = JSON.parse(JSON.stringify(SEED_BOOKINGS));
    this.orders = JSON.parse(JSON.stringify(SEED_ORDERS));
    this.messages = JSON.parse(JSON.stringify(SEED_MESSAGES));
    this.users = JSON.parse(JSON.stringify(SEED_USERS));
  }
  // Reset to initial demo records
  reset() {
    this.services = JSON.parse(JSON.stringify(SEED_SERVICES));
    this.products = JSON.parse(JSON.stringify(SEED_PRODUCTS));
    this.coupons = JSON.parse(JSON.stringify(SEED_COUPONS));
    this.settings = JSON.parse(JSON.stringify(SEED_SETTINGS));
    this.bookings = JSON.parse(JSON.stringify(SEED_BOOKINGS));
    this.orders = JSON.parse(JSON.stringify(SEED_ORDERS));
    this.messages = JSON.parse(JSON.stringify(SEED_MESSAGES));
    this.users = JSON.parse(JSON.stringify(SEED_USERS));
  }
  // --- PUBLIC CATALOG ACCESS ---
  getPublicServices() {
    return this.services.filter((s) => s.status === "active");
  }
  getPublicProducts() {
    return this.products.filter((p) => p.status === "active");
  }
  getPublicCoupons() {
    return this.coupons.filter((c) => c.status === "active");
  }
  getPublicSettings() {
    return this.settings;
  }
  // --- PUBLIC CUSTOMER ACTIONS (No Leaks) ---
  createPublicBooking(data) {
    const depositAmount = Math.round(data.servicePrice * (this.settings.depositRate || 0.3));
    const remainingAmount = data.servicePrice - depositAmount;
    const newId = generateBookingId();
    const newBooking = {
      id: newId,
      userId: `USR-${Date.now().toString().slice(-5)}`,
      customerName: data.customerName.trim(),
      customerPhone: data.customerPhone.trim(),
      customerEmail: data.customerEmail.trim().toLowerCase(),
      serviceId: data.serviceId,
      serviceName: data.serviceName,
      servicePrice: data.servicePrice,
      date: data.date,
      timeSlot: data.timeSlot,
      notes: data.notes?.trim() || "",
      totalAmount: data.servicePrice,
      depositAmount,
      remainingAmount,
      depositPaid: true,
      paymentStatus: "deposit_paid",
      status: "pending",
      createdAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    this.bookings.unshift(newBooking);
    this.ensureCustomerUser(newBooking.customerEmail, newBooking.customerName, newBooking.customerPhone);
    return { success: true, bookingId: newId, message: "\u0110\u1EB7t l\u1ECBch th\xE0nh c\xF4ng!" };
  }
  createPublicOrder(data) {
    if (!data.items || data.items.length === 0) {
      return { success: false, message: "Gi\u1ECF h\xE0ng \u0111ang tr\u1ED1ng." };
    }
    let subtotal = 0;
    const orderItems = [];
    for (const cartItem of data.items) {
      const prod = this.products.find((p) => p.id === cartItem.productId);
      if (!prod) {
        return { success: false, message: `S\u1EA3n ph\u1EA9m ${cartItem.productId} kh\xF4ng t\u1ED3n t\u1EA1i.` };
      }
      if (prod.stock < cartItem.quantity) {
        return { success: false, message: `S\u1EA3n ph\u1EA9m "${prod.name}" ch\u1EC9 c\xF2n ${prod.stock} trong kho.` };
      }
      subtotal += prod.price * cartItem.quantity;
      orderItems.push({
        productId: prod.id,
        code: prod.code,
        name: prod.name,
        price: prod.price,
        quantity: cartItem.quantity,
        imageUrl: prod.imageUrl
      });
    }
    let discountAmount = 0;
    if (data.couponCode) {
      const coupon = this.coupons.find(
        (c) => c.code.toUpperCase() === data.couponCode?.toUpperCase() && c.status === "active"
      );
      if (coupon && subtotal >= coupon.minOrderValue) {
        if (coupon.discountType === "percent") {
          discountAmount = Math.round(subtotal * coupon.discountValue / 100);
        } else {
          discountAmount = coupon.discountValue;
        }
        coupon.usedCount += 1;
      }
    }
    const totalAmount = Math.max(0, subtotal - discountAmount);
    const orderId = generateOrderId();
    for (const item of orderItems) {
      const p = this.products.find((x) => x.id === item.productId);
      if (p) {
        p.stock = Math.max(0, p.stock - item.quantity);
      }
    }
    const newOrder = {
      id: orderId,
      userId: `USR-${Date.now().toString().slice(-5)}`,
      customerName: data.customerName.trim(),
      customerPhone: data.customerPhone.trim(),
      customerEmail: data.customerEmail.trim().toLowerCase(),
      shippingAddress: data.shippingAddress.trim(),
      items: orderItems,
      subtotal,
      discountAmount,
      couponCode: data.couponCode?.trim(),
      totalAmount,
      paymentMethod: data.paymentMethod,
      paymentStatus: data.paymentMethod === "card_simulation" ? "paid" : "pending",
      status: "pending",
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      notes: data.notes?.trim()
    };
    this.orders.unshift(newOrder);
    this.ensureCustomerUser(newOrder.customerEmail, newOrder.customerName, newOrder.customerPhone);
    return { success: true, orderId, message: "\u0110\u1EB7t h\xE0ng th\xE0nh c\xF4ng!" };
  }
  createPublicContactMessage(data) {
    const newMsg = {
      id: `MSG-${Date.now().toString().slice(-4)}`,
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      phone: data.phone.trim(),
      subject: data.subject.trim(),
      message: data.message.trim(),
      createdAt: (/* @__PURE__ */ new Date()).toISOString(),
      status: "unread"
    };
    this.messages.unshift(newMsg);
    return { success: true, message: "\u0110\xE3 g\u1EEDi l\u1EDDi nh\u1EAFn th\xE0nh c\xF4ng!" };
  }
  // Scoped Customer self-inquiry (no dumping of other customers' data)
  getCustomerBookings(email) {
    const clean = (email || "").trim().toLowerCase();
    if (!clean) return [];
    return this.bookings.filter((b) => b.customerEmail.toLowerCase() === clean);
  }
  getCustomerOrders(email) {
    const clean = (email || "").trim().toLowerCase();
    if (!clean) return [];
    return this.orders.filter((o) => o.customerEmail.toLowerCase() === clean);
  }
  rescheduleCustomerBooking(bookingId, newDate, newTime, customerEmail) {
    const b = this.bookings.find((item) => item.id === bookingId);
    if (!b) return { success: false, message: "Kh\xF4ng t\xECm th\u1EA5y l\u1ECBch h\u1EB9n." };
    if (customerEmail && b.customerEmail.toLowerCase() !== customerEmail.toLowerCase()) {
      return { success: false, message: "B\u1EA1n kh\xF4ng c\xF3 quy\u1EC1n thao t\xE1c tr\xEAn l\u1ECBch h\u1EB9n n\xE0y." };
    }
    const check = canRescheduleBooking(b);
    if (!check.allowed) {
      return { success: false, message: check.reason || "Kh\xF4ng th\u1EC3 \u0111\u1ED5i l\u1ECBch." };
    }
    b.date = newDate;
    b.timeSlot = newTime;
    return { success: true, message: "\u0110\u1ED5i l\u1ECBch h\u1EB9n th\xE0nh c\xF4ng." };
  }
  cancelCustomerBooking(bookingId, customerEmail) {
    const b = this.bookings.find((item) => item.id === bookingId);
    if (!b) return { success: false, message: "Kh\xF4ng t\xECm th\u1EA5y l\u1ECBch h\u1EB9n." };
    if (customerEmail && b.customerEmail.toLowerCase() !== customerEmail.toLowerCase()) {
      return { success: false, message: "B\u1EA1n kh\xF4ng c\xF3 quy\u1EC1n thao t\xE1c tr\xEAn l\u1ECBch h\u1EB9n n\xE0y." };
    }
    if (b.status === "cancelled") {
      return { success: false, message: "L\u1ECBch h\u1EB9n n\xE0y \u0111\xE3 \u0111\u01B0\u1EE3c h\u1EE7y tr\u01B0\u1EDBc \u0111\xF3." };
    }
    const calc = calculateCancellationRefund(b);
    b.status = "cancelled";
    b.cancelledAt = (/* @__PURE__ */ new Date()).toISOString();
    b.refundAmount = calc.refundAmount;
    b.retainedAmount = calc.retainedAmount;
    b.paymentStatus = calc.isFullRefund ? "refunded_full" : "refunded_partial";
    const msg = calc.isFullRefund ? `H\u1EE7y l\u1ECBch h\u1EB9n th\xE0nh c\xF4ng (tr\u01B0\u1EDBc ${calc.hoursLeft.toFixed(1)}h). \u0110\xE3 m\xF4 ph\u1ECFng ho\xE0n 100% c\u1ECDc: ${calc.refundAmount.toLocaleString("vi-VN")}\u0111.` : `H\u1EE7y l\u1ECBch h\u1EB9n th\xE0nh c\xF4ng. Ho\xE0n 50% c\u1ECDc: ${calc.refundAmount.toLocaleString("vi-VN")}\u0111, ph\xED chu\u1EA9n b\u1ECB: ${calc.retainedAmount.toLocaleString("vi-VN")}\u0111.`;
    return {
      success: true,
      message: msg,
      refundAmount: calc.refundAmount
    };
  }
  // --- PROTECTED ADMIN OPERATIONS (Requires Admin Token) ---
  getAllBookings() {
    return this.bookings;
  }
  updateBookingStatusAdmin(id, status, paymentStatus) {
    const b = this.bookings.find((item) => item.id === id);
    if (!b) return false;
    b.status = status;
    if (paymentStatus) b.paymentStatus = paymentStatus;
    return true;
  }
  getAllOrders() {
    return this.orders;
  }
  updateOrderStatusAdmin(id, status, paymentStatus) {
    const o = this.orders.find((item) => item.id === id);
    if (!o) return false;
    o.status = status;
    if (paymentStatus) o.paymentStatus = paymentStatus;
    return true;
  }
  getAllCustomers() {
    return this.users.filter((u) => u.role === "customer");
  }
  getAllMessages() {
    return this.messages;
  }
  updateMessageStatusAdmin(id, status) {
    const m = this.messages.find((item) => item.id === id);
    if (!m) return false;
    m.status = status;
    return true;
  }
  deleteMessageAdmin(id) {
    const idx = this.messages.findIndex((item) => item.id === id);
    if (idx === -1) return false;
    this.messages.splice(idx, 1);
    return true;
  }
  getAllServicesAdmin() {
    return this.services;
  }
  saveServiceAdmin(service) {
    const idx = this.services.findIndex((s) => s.id === service.id);
    if (idx >= 0) {
      this.services[idx] = service;
    } else {
      this.services.unshift(service);
    }
  }
  toggleServiceStatusAdmin(id) {
    const s = this.services.find((item) => item.id === id);
    if (!s) return false;
    s.status = s.status === "active" ? "inactive" : "active";
    return true;
  }
  getAllProductsAdmin() {
    return this.products;
  }
  saveProductAdmin(product) {
    const idx = this.products.findIndex((p) => p.id === product.id);
    if (idx >= 0) {
      this.products[idx] = product;
    } else {
      this.products.unshift(product);
    }
  }
  updateProductStockAdmin(productId, newStock) {
    const p = this.products.find((item) => item.id === productId);
    if (!p) return false;
    p.stock = Math.max(0, newStock);
    return true;
  }
  getAllCouponsAdmin() {
    return this.coupons;
  }
  saveCouponAdmin(coupon) {
    const idx = this.coupons.findIndex((c) => c.id === coupon.id);
    if (idx >= 0) {
      this.coupons[idx] = coupon;
    } else {
      this.coupons.unshift(coupon);
    }
  }
  deleteCouponAdmin(id) {
    const idx = this.coupons.findIndex((c) => c.id === id);
    if (idx === -1) return false;
    this.coupons.splice(idx, 1);
    return true;
  }
  saveSettingsAdmin(settings) {
    this.settings = settings;
  }
  getAdminDashboardStats() {
    const todayStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const totalBookings = this.bookings.length;
    const todayBookings = this.bookings.filter((b) => b.date === todayStr && b.status !== "cancelled").length;
    const pendingBookings = this.bookings.filter((b) => b.status === "pending").length;
    const completedBookings = this.bookings.filter((b) => b.status === "completed").length;
    const cancelledBookings = this.bookings.filter((b) => b.status === "cancelled").length;
    const totalDepositRecorded = this.bookings.reduce((sum, b) => {
      if (b.status === "cancelled") {
        return sum + (b.retainedAmount || 0);
      }
      return sum + (b.depositPaid ? b.depositAmount : 0);
    }, 0);
    const totalOrders = this.orders.length;
    const pendingOrders = this.orders.filter((o) => o.status === "pending" || o.status === "processing").length;
    const totalOrderRevenue = this.orders.filter((o) => o.status !== "cancelled").reduce((sum, o) => sum + o.totalAmount, 0);
    const customersCount = this.users.filter((u) => u.role === "customer").length;
    const activeServicesCount = this.services.filter((s) => s.status === "active").length;
    const activeProductsCount = this.products.filter((p) => p.status === "active").length;
    return {
      totalBookings,
      todayBookings,
      pendingBookings,
      completedBookings,
      cancelledBookings,
      totalDepositRecorded,
      totalOrders,
      pendingOrders,
      totalOrderRevenue,
      customersCount,
      activeServicesCount,
      activeProductsCount
    };
  }
  // --- STAFF WORKSPACE METHODS ---
  getStaffBookings() {
    return [...this.bookings].sort((a, b) => (/* @__PURE__ */ new Date(`${b.date}T${b.timeSlot}`)).getTime() - (/* @__PURE__ */ new Date(`${a.date}T${a.timeSlot}`)).getTime());
  }
  updateBookingStatusStaff(bookingId, status, staffNotes) {
    const booking = this.bookings.find((b) => b.id === bookingId);
    if (!booking) return false;
    booking.status = status;
    if (staffNotes !== void 0) {
      booking.staffNotes = staffNotes;
    }
    return true;
  }
  ensureCustomerUser(email, name, phone) {
    const existing = this.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!existing) {
      this.users.push({
        id: `USR-${Date.now().toString().slice(-6)}`,
        name,
        email,
        phone,
        role: "customer",
        createdAt: (/* @__PURE__ */ new Date()).toISOString(),
        status: "active"
      });
    }
  }
};
var serverDataStore = new ServerDataStore();

// src/server/app.ts
var app = express();
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }
  next();
});
app.use((req, res, next) => {
  const matchedPath = req.headers["x-matched-path"];
  if ((req.url === "/api/index" || req.url === "/api") && matchedPath && matchedPath.startsWith("/api")) {
    req.url = matchedPath;
  }
  next();
});
app.use(express.json());
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: (/* @__PURE__ */ new Date()).toISOString(),
    service: "An Nhien Spa Backend API"
  });
});
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      error: "Y\xEAu c\u1EA7u \u0111\u0103ng nh\u1EADp. Vui l\xF2ng \u0111\u0103ng nh\u1EADp t\u1EA1i /login."
    });
    return;
  }
  const token = authHeader.substring(7).trim();
  const verified = verifyAuthToken(token);
  if (!verified) {
    res.status(401).json({
      success: false,
      error: "Phi\xEAn l\xE0m vi\u1EC7c \u0111\xE3 h\u1EBFt h\u1EA1n ho\u1EB7c kh\xF4ng h\u1EE3p l\u1EC7. Vui l\xF2ng \u0111\u0103ng nh\u1EADp l\u1EA1i."
    });
    return;
  }
  req.user = verified;
  if (verified.role === "admin") {
    req.admin = verified;
  }
  next();
}
function requireStaffOrAdminAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      error: "Y\xEAu c\u1EA7u \u0111\u0103ng nh\u1EADp v\u1EDBi t\xE0i kho\u1EA3n nh\xE2n vi\xEAn ho\u1EB7c qu\u1EA3n tr\u1ECB vi\xEAn."
    });
    return;
  }
  const token = authHeader.substring(7).trim();
  const verified = verifyAuthToken(token);
  if (!verified) {
    res.status(401).json({
      success: false,
      error: "Phi\xEAn l\xE0m vi\u1EC7c \u0111\xE3 h\u1EBFt h\u1EA1n. Vui l\xF2ng \u0111\u0103ng nh\u1EADp l\u1EA1i."
    });
    return;
  }
  if (verified.role !== "staff" && verified.role !== "admin") {
    res.status(403).json({
      success: false,
      error: "Truy c\u1EADp b\u1ECB t\u1EEB ch\u1ED1i. B\u1EA1n kh\xF4ng c\xF3 quy\u1EC1n truy c\u1EADp v\xE0o ph\xE2n h\u1EC7 nh\xE2n vi\xEAn."
    });
    return;
  }
  req.user = verified;
  if (verified.role === "admin") {
    req.admin = verified;
  }
  next();
}
function requireAdminAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      error: "Y\xEAu c\u1EA7u quy\u1EC1n qu\u1EA3n tr\u1ECB vi\xEAn. Vui l\xF2ng \u0111\u0103ng nh\u1EADp t\u1EA1i /login ho\u1EB7c /admin/login."
    });
    return;
  }
  const token = authHeader.substring(7).trim();
  const verified = verifyAuthToken(token);
  if (!verified || verified.role !== "admin") {
    res.status(403).json({
      success: false,
      error: "Truy c\u1EADp b\u1ECB t\u1EEB ch\u1ED1i. Khu v\u1EF1c n\xE0y ch\u1EC9 d\xE0nh ri\xEAng cho Qu\u1EA3n tr\u1ECB vi\xEAn An Nhi\xEAn Spa."
    });
    return;
  }
  req.user = verified;
  req.admin = verified;
  next();
}
app.post("/api/auth/login", (req, res) => {
  const { identifier, email, phone, password, role } = req.body;
  const loginIdentifier = identifier || email || phone || "";
  const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";
  const result = authenticateUser(loginIdentifier, password, role, clientIp);
  if (!result.success) {
    res.status(401).json(result);
    return;
  }
  res.json(result);
});
app.post("/api/auth/forgot-password", (req, res) => {
  const { identifier } = req.body;
  res.json({
    success: true,
    message: "Y\xEAu c\u1EA7u h\u1ED7 tr\u1EE3 kh\xF4i ph\u1EE5c m\u1EADt kh\u1EA9u \u0111\xE3 \u0111\u01B0\u1EE3c ti\u1EBFp nh\u1EADn. B\u1ED9 ph\u1EADn ch\u0103m s\xF3c kh\xE1ch h\xE0ng An Nhi\xEAn Spa s\u1EBD li\xEAn h\u1EC7 h\u1ED7 tr\u1EE3 b\u1EA1n qua email ho\u1EB7c s\u1ED1 \u0111i\u1EC7n tho\u1EA1i."
  });
});
app.post("/api/auth/register", (req, res) => {
  const result = registerCustomer(req.body);
  if (!result.success) {
    res.status(400).json(result);
    return;
  }
  res.json(result);
});
app.get("/api/auth/me", requireAuth, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});
app.post("/api/auth/logout", (_req, res) => {
  res.json({ success: true, message: "\u0110\u0103ng xu\u1EA5t th\xE0nh c\xF4ng." });
});
app.post("/api/admin/login", (req, res) => {
  const { email, password } = req.body;
  const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";
  const result = authenticateUser(email, password, "admin", clientIp);
  if (!result.success) {
    res.status(401).json(result);
    return;
  }
  res.json(result);
});
app.get("/api/admin/me", requireAdminAuth, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});
app.post("/api/admin/logout", requireAdminAuth, (_req, res) => {
  res.json({ success: true, message: "\u0110\xE3 \u0111\u0103ng xu\u1EA5t phi\xEAn l\xE0m vi\u1EC7c qu\u1EA3n tr\u1ECB an to\xE0n." });
});
app.get(["/api/public/services", "/api/services"], (_req, res) => {
  res.json({ success: true, data: serverDataStore.getPublicServices() });
});
app.get(["/api/public/products", "/api/products"], (_req, res) => {
  res.json({ success: true, data: serverDataStore.getPublicProducts() });
});
app.get(["/api/public/coupons", "/api/coupons"], (_req, res) => {
  res.json({ success: true, data: serverDataStore.getPublicCoupons() });
});
app.get(["/api/public/settings", "/api/settings"], (_req, res) => {
  res.json({ success: true, data: serverDataStore.getPublicSettings() });
});
app.post("/api/public/bookings", (req, res) => {
  try {
    const result = serverDataStore.createPublicBooking(req.body);
    if (!result.success) {
      res.status(400).json(result);
      return;
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err?.message || "L\u1ED7i x\u1EED l\xFD \u0111\u1EB7t l\u1ECBch." });
  }
});
app.post("/api/public/orders", (req, res) => {
  try {
    const result = serverDataStore.createPublicOrder(req.body);
    if (!result.success) {
      res.status(400).json(result);
      return;
    }
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err?.message || "L\u1ED7i x\u1EED l\xFD \u0111\u1EB7t h\xE0ng." });
  }
});
app.post("/api/public/contact", (req, res) => {
  try {
    const result = serverDataStore.createPublicContactMessage(req.body);
    res.json(result);
  } catch (err) {
    res.status(500).json({ success: false, error: err?.message || "L\u1ED7i g\u1EEDi tin nh\u1EAFn li\xEAn h\u1EC7." });
  }
});
app.post("/api/public/my-bookings", (req, res) => {
  const { email } = req.body;
  if (!email || typeof email !== "string") {
    res.json({ success: true, data: [] });
    return;
  }
  const myBookings = serverDataStore.getCustomerBookings(email);
  res.json({ success: true, data: myBookings });
});
app.post("/api/public/my-orders", (req, res) => {
  const { email } = req.body;
  if (!email || typeof email !== "string") {
    res.json({ success: true, data: [] });
    return;
  }
  const myOrders = serverDataStore.getCustomerOrders(email);
  res.json({ success: true, data: myOrders });
});
app.post("/api/public/booking-reschedule", (req, res) => {
  const { bookingId, newDate, newTime, customerEmail } = req.body;
  const result = serverDataStore.rescheduleCustomerBooking(bookingId, newDate, newTime, customerEmail);
  if (!result.success) {
    res.status(400).json(result);
    return;
  }
  res.json(result);
});
app.post("/api/public/booking-cancel", (req, res) => {
  const { bookingId, customerEmail } = req.body;
  const result = serverDataStore.cancelCustomerBooking(bookingId, customerEmail);
  if (!result.success) {
    res.status(400).json(result);
    return;
  }
  res.json(result);
});
app.get("/api/staff/bookings", requireStaffOrAdminAuth, (_req, res) => {
  res.json({ success: true, data: serverDataStore.getStaffBookings() });
});
app.patch("/api/staff/bookings/:id", requireStaffOrAdminAuth, (req, res) => {
  const { id } = req.params;
  const { status, staffNotes } = req.body;
  const ok = serverDataStore.updateBookingStatusStaff(id, status, staffNotes);
  if (!ok) {
    res.status(404).json({ success: false, error: "Kh\xF4ng t\xECm th\u1EA5y l\u1ECBch h\u1EB9n." });
    return;
  }
  res.json({ success: true, message: "C\u1EADp nh\u1EADt ti\u1EBFn tr\xECnh ph\u1EE5c v\u1EE5 th\xE0nh c\xF4ng." });
});
app.get("/api/staff/services", requireStaffOrAdminAuth, (_req, res) => {
  res.json({ success: true, data: serverDataStore.getAllServicesAdmin() });
});
app.get("/api/staff/products", requireStaffOrAdminAuth, (_req, res) => {
  res.json({ success: true, data: serverDataStore.getAllProductsAdmin() });
});
app.get("/api/admin/staff", requireAdminAuth, (_req, res) => {
  res.json({ success: true, data: getStaffListAdmin() });
});
app.post("/api/admin/staff", requireAdminAuth, (req, res) => {
  const result = createStaffAccountByAdmin(req.body);
  if (!result.success) {
    res.status(400).json(result);
    return;
  }
  res.json(result);
});
app.patch("/api/admin/staff/:id/status", requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const ok = updateStaffStatusByAdmin(id, status);
  if (!ok) {
    res.status(404).json({ success: false, error: "Kh\xF4ng t\xECm th\u1EA5y t\xE0i kho\u1EA3n nh\xE2n vi\xEAn." });
    return;
  }
  res.json({ success: true, message: "C\u1EADp nh\u1EADt tr\u1EA1ng th\xE1i nh\xE2n vi\xEAn th\xE0nh c\xF4ng." });
});
app.patch("/api/admin/staff/:id/password", requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const { password } = req.body;
  const ok = updateStaffPasswordByAdmin(id, password);
  if (!ok) {
    res.status(400).json({ success: false, error: "Kh\xF4ng th\u1EC3 \u0111\u1ED5i m\u1EADt kh\u1EA9u. M\u1EADt kh\u1EA9u ph\u1EA3i c\xF3 \xEDt nh\u1EA5t 8 k\xFD t\u1EF1." });
    return;
  }
  res.json({ success: true, message: "C\u1EADp nh\u1EADt m\u1EADt kh\u1EA9u nh\xE2n vi\xEAn th\xE0nh c\xF4ng." });
});
app.delete("/api/admin/staff/:id", requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const ok = deleteStaffAccountByAdmin(id);
  if (!ok) {
    res.status(404).json({ success: false, error: "Kh\xF4ng t\xECm th\u1EA5y t\xE0i kho\u1EA3n nh\xE2n vi\xEAn." });
    return;
  }
  res.json({ success: true, message: "\u0110\xE3 x\xF3a t\xE0i kho\u1EA3n nh\xE2n vi\xEAn th\xE0nh c\xF4ng." });
});
app.get("/api/admin/stats", requireAdminAuth, (_req, res) => {
  res.json({ success: true, data: serverDataStore.getAdminDashboardStats() });
});
app.get("/api/admin/bookings", requireAdminAuth, (_req, res) => {
  res.json({ success: true, data: serverDataStore.getAllBookings() });
});
app.patch("/api/admin/bookings/:id", requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const { status, paymentStatus } = req.body;
  const ok = serverDataStore.updateBookingStatusAdmin(id, status, paymentStatus);
  if (!ok) {
    res.status(404).json({ success: false, error: "Kh\xF4ng t\xECm th\u1EA5y l\u1ECBch h\u1EB9n." });
    return;
  }
  res.json({ success: true, message: "C\u1EADp nh\u1EADt tr\u1EA1ng th\xE1i l\u1ECBch h\u1EB9n th\xE0nh c\xF4ng." });
});
app.get("/api/admin/orders", requireAdminAuth, (_req, res) => {
  res.json({ success: true, data: serverDataStore.getAllOrders() });
});
app.patch("/api/admin/orders/:id", requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const { status, paymentStatus } = req.body;
  const ok = serverDataStore.updateOrderStatusAdmin(id, status, paymentStatus);
  if (!ok) {
    res.status(404).json({ success: false, error: "Kh\xF4ng t\xECm th\u1EA5y \u0111\u01A1n h\xE0ng." });
    return;
  }
  res.json({ success: true, message: "C\u1EADp nh\u1EADt tr\u1EA1ng th\xE1i \u0111\u01A1n h\xE0ng th\xE0nh c\xF4ng." });
});
app.get("/api/admin/customers", requireAdminAuth, (_req, res) => {
  res.json({ success: true, data: serverDataStore.getAllCustomers() });
});
app.get("/api/admin/messages", requireAdminAuth, (_req, res) => {
  res.json({ success: true, data: serverDataStore.getAllMessages() });
});
app.patch("/api/admin/messages/:id", requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const ok = serverDataStore.updateMessageStatusAdmin(id, status);
  if (!ok) {
    res.status(404).json({ success: false, error: "Kh\xF4ng t\xECm th\u1EA5y tin nh\u1EAFn." });
    return;
  }
  res.json({ success: true, message: "C\u1EADp nh\u1EADt tin nh\u1EAFn th\xE0nh c\xF4ng." });
});
app.delete("/api/admin/messages/:id", requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const ok = serverDataStore.deleteMessageAdmin(id);
  if (!ok) {
    res.status(404).json({ success: false, error: "Kh\xF4ng t\xECm th\u1EA5y tin nh\u1EAFn." });
    return;
  }
  res.json({ success: true, message: "X\xF3a tin nh\u1EAFn th\xE0nh c\xF4ng." });
});
app.get("/api/admin/services", requireAdminAuth, (_req, res) => {
  res.json({ success: true, data: serverDataStore.getAllServicesAdmin() });
});
app.post("/api/admin/services", requireAdminAuth, (req, res) => {
  serverDataStore.saveServiceAdmin(req.body);
  res.json({ success: true, message: "L\u01B0u d\u1ECBch v\u1EE5 th\xE0nh c\xF4ng." });
});
app.patch("/api/admin/services/:id/toggle", requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const ok = serverDataStore.toggleServiceStatusAdmin(id);
  if (!ok) {
    res.status(404).json({ success: false, error: "Kh\xF4ng t\xECm th\u1EA5y d\u1ECBch v\u1EE5." });
    return;
  }
  res.json({ success: true, message: "\u0110\u1ED5i tr\u1EA1ng th\xE1i d\u1ECBch v\u1EE5 th\xE0nh c\xF4ng." });
});
app.get("/api/admin/products", requireAdminAuth, (_req, res) => {
  res.json({ success: true, data: serverDataStore.getAllProductsAdmin() });
});
app.post("/api/admin/products", requireAdminAuth, (req, res) => {
  serverDataStore.saveProductAdmin(req.body);
  res.json({ success: true, message: "L\u01B0u s\u1EA3n ph\u1EA9m th\xE0nh c\xF4ng." });
});
app.patch("/api/admin/products/:id/stock", requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const { stock } = req.body;
  const ok = serverDataStore.updateProductStockAdmin(id, Number(stock));
  if (!ok) {
    res.status(404).json({ success: false, error: "Kh\xF4ng t\xECm th\u1EA5y s\u1EA3n ph\u1EA9m." });
    return;
  }
  res.json({ success: true, message: "C\u1EADp nh\u1EADt s\u1ED1 l\u01B0\u1EE3ng t\u1ED3n kho th\xE0nh c\xF4ng." });
});
app.get("/api/admin/coupons", requireAdminAuth, (_req, res) => {
  res.json({ success: true, data: serverDataStore.getAllCouponsAdmin() });
});
app.post("/api/admin/coupons", requireAdminAuth, (req, res) => {
  serverDataStore.saveCouponAdmin(req.body);
  res.json({ success: true, message: "L\u01B0u m\xE3 gi\u1EA3m gi\xE1 th\xE0nh c\xF4ng." });
});
app.delete("/api/admin/coupons/:id", requireAdminAuth, (req, res) => {
  const { id } = req.params;
  const ok = serverDataStore.deleteCouponAdmin(id);
  if (!ok) {
    res.status(404).json({ success: false, error: "Kh\xF4ng t\xECm th\u1EA5y m\xE3 gi\u1EA3m gi\xE1." });
    return;
  }
  res.json({ success: true, message: "X\xF3a m\xE3 gi\u1EA3m gi\xE1 th\xE0nh c\xF4ng." });
});
app.get("/api/admin/settings", requireAdminAuth, (_req, res) => {
  res.json({ success: true, data: serverDataStore.getPublicSettings() });
});
app.post("/api/admin/settings", requireAdminAuth, (req, res) => {
  serverDataStore.saveSettingsAdmin(req.body);
  res.json({ success: true, message: "C\u1EADp nh\u1EADt c\xE0i \u0111\u1EB7t spa th\xE0nh c\xF4ng." });
});
app.post("/api/admin/reset-demo", requireAdminAuth, (_req, res) => {
  serverDataStore.reset();
  res.json({ success: true, message: "\u0110\xE3 kh\xF4i ph\u1EE5c d\u1EEF li\u1EC7u m\xF4 ph\u1ECFng th\xE0nh c\xF4ng." });
});

// src/server/vercelEntry.ts
function handler(req, res) {
  const matchedPath = req.headers["x-matched-path"];
  if (typeof matchedPath === "string" && matchedPath.startsWith("/api")) {
    req.url = matchedPath;
  }
  return app(req, res);
}
export {
  handler as default
};
