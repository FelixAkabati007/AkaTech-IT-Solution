const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const ENCRYPTION_PREFIX = "enc:v1:";
const BCRYPT_ROUNDS = 12;

const getEncryptionSecret = () => {
  const secret = process.env.DATA_ENCRYPTION_KEY || process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      "DATA_ENCRYPTION_KEY or JWT_SECRET must be configured for data encryption",
    );
  }
  return secret;
};

const getEncryptionKey = () =>
  crypto.createHash("sha256").update(getEncryptionSecret()).digest();

const looksLikeBase64 = (value) => {
  if (!value || typeof value !== "string" || value.length % 4 !== 0) {
    return false;
  }
  return /^[A-Za-z0-9+/]+={0,2}$/.test(value);
};

const encrypt = (plainText) => {
  if (plainText === null || plainText === undefined || plainText === "") {
    return plainText;
  }

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const ciphertext = Buffer.concat([
    cipher.update(String(plainText), "utf8"),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();

  return `${ENCRYPTION_PREFIX}${iv.toString("base64")}.${ciphertext.toString(
    "base64",
  )}.${authTag.toString("base64")}`;
};

const decrypt = (value) => {
  if (value === null || value === undefined || value === "") {
    return value;
  }

  if (typeof value !== "string") {
    return value;
  }

  if (value.startsWith(ENCRYPTION_PREFIX)) {
    const payload = value.slice(ENCRYPTION_PREFIX.length);
    const [ivB64, encryptedB64, authTagB64] = payload.split(".");

    if (!ivB64 || !encryptedB64 || !authTagB64) {
      throw new Error("Invalid encrypted payload format");
    }

    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      getEncryptionKey(),
      Buffer.from(ivB64, "base64"),
    );
    decipher.setAuthTag(Buffer.from(authTagB64, "base64"));

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptedB64, "base64")),
      decipher.final(),
    ]);

    return decrypted.toString("utf8");
  }

  // Backward compatibility for legacy Base64-obfuscated values.
  if (looksLikeBase64(value)) {
    try {
      const decoded = Buffer.from(value, "base64").toString("utf8");
      const normalizedDecoded = Buffer.from(decoded, "utf8")
        .toString("base64")
        .replace(/=+$/g, "");
      const normalizedOriginal = value.replace(/=+$/g, "");

      if (normalizedDecoded === normalizedOriginal) {
        // Ensure decoded string is valid printable text and does not contain non-printable control chars
        const isPrintable = !/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/.test(decoded);
        if (isPrintable) {
          return decoded;
        }
      }
    } catch (error) {
      // Fall through and return the original value.
    }
  }

  return value;
};

const hashPassword = async (password) => bcrypt.hash(password, BCRYPT_ROUNDS);

const verifyPassword = async (password, storedHash) => {
  if (!storedHash) {
    return { valid: false, needsRehash: false };
  }

  if (storedHash.startsWith("$2")) {
    const valid = await bcrypt.compare(password, storedHash);
    let needsRehash = false;

    if (valid) {
      try {
        needsRehash = bcrypt.getRounds(storedHash) < BCRYPT_ROUNDS;
      } catch (error) {
        needsRehash = false;
      }
    }

    return { valid, needsRehash };
  }

  const legacyHash = crypto.createHash("sha256").update(password).digest("hex");
  const valid = legacyHash === storedHash;

  return {
    valid,
    needsRehash: valid,
  };
};

const setAuthCookie = (res, token) => {
  res.cookie("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
    maxAge: 24 * 60 * 60 * 1000,
  });
};

const clearAuthCookie = (res) => {
  res.clearCookie("auth_token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  });
};

const resolveRequestedRole = (requestedRole, isAdminRequest) => {
  if (!isAdminRequest) {
    return "client";
  }

  const allowedRoles = new Set([
    "client",
    "admin",
    "project_manager",
    "finance",
    "super_admin",
  ]);

  if (requestedRole && allowedRoles.has(requestedRole)) {
    return requestedRole;
  }

  return "client";
};

module.exports = {
  ENCRYPTION_PREFIX,
  encrypt,
  decrypt,
  hashPassword,
  verifyPassword,
  setAuthCookie,
  clearAuthCookie,
  resolveRequestedRole,
};
