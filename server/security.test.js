import { beforeEach, describe, expect, it } from "vitest";
import { createHash } from "crypto";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const {
  ENCRYPTION_PREFIX,
  encrypt,
  decrypt,
  hashPassword,
  verifyPassword,
  resolveRequestedRole,
} = require("./security.cjs");

describe("server security helpers", () => {
  beforeEach(() => {
    process.env.JWT_SECRET = "test-jwt-secret-that-is-long-enough";
    delete process.env.DATA_ENCRYPTION_KEY;
  });

  it("encrypts with a versioned payload and decrypts back to the original text", () => {
    const plaintext = "Sensitive billing note";
    const encrypted = encrypt(plaintext);

    expect(encrypted).toMatch(new RegExp(`^${ENCRYPTION_PREFIX}`));
    expect(encrypted).not.toBe(plaintext);
    expect(decrypt(encrypted)).toBe(plaintext);
  });

  it("preserves backward compatibility with legacy base64-obfuscated values", () => {
    const legacy = Buffer.from("legacy message", "utf8").toString("base64");
    expect(decrypt(legacy)).toBe("legacy message");
  });

  it("validates legacy sha256 hashes and flags them for rehashing", async () => {
    const password = "CorrectHorseBatteryStaple";
    const legacyHash = createHash("sha256").update(password).digest("hex");

    const result = await verifyPassword(password, legacyHash);

    expect(result).toEqual({ valid: true, needsRehash: true });
  });

  it("validates bcrypt hashes without requesting a rehash", async () => {
    const password = "BetterPassword123!";
    const storedHash = await hashPassword(password);

    const result = await verifyPassword(password, storedHash);

    expect(result.valid).toBe(true);
    expect(result.needsRehash).toBe(false);
  });

  it("prevents non-admin requests from creating elevated roles", () => {
    expect(resolveRequestedRole("admin", false)).toBe("client");
    expect(resolveRequestedRole("super_admin", false)).toBe("client");
    expect(resolveRequestedRole("finance", true)).toBe("finance");
  });
});
