import crypto from "crypto";
import { cookies } from "next/headers";
import { AFFILIATE_SESSION_COOKIE } from "./cookie";

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 dias

function sessionSecret(): string {
  return (
    process.env.AFFILIATE_SESSION_SECRET ??
    process.env.TRAFFIC_INTERNAL_SECRET ??
    "dev-affiliate-secret-change-me"
  );
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const test = crypto.scryptSync(password, salt, 64).toString("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(test));
  } catch {
    return false;
  }
}

export function createSessionToken(affiliateId: string): string {
  const exp = Date.now() + SESSION_TTL_MS;
  const payload = `${affiliateId}:${exp}`;
  const sig = crypto
    .createHmac("sha256", sessionSecret())
    .update(payload)
    .digest("hex");
  return Buffer.from(`${payload}:${sig}`).toString("base64url");
}

export function parseSessionToken(
  token: string | undefined
): { affiliateId: string } | null {
  if (!token) return null;
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const parts = decoded.split(":");
    if (parts.length !== 3) return null;
    const [affiliateId, expStr, sig] = parts;
    const exp = Number(expStr);
    if (!affiliateId || !Number.isFinite(exp) || exp < Date.now()) return null;
    const payload = `${affiliateId}:${exp}`;
    const expected = crypto
      .createHmac("sha256", sessionSecret())
      .update(payload)
      .digest("hex");
    if (sig !== expected) return null;
    return { affiliateId };
  } catch {
    return null;
  }
}

export async function getAffiliateIdFromSession(): Promise<string | null> {
  const jar = await cookies();
  const token = jar.get(AFFILIATE_SESSION_COOKIE)?.value;
  const parsed = parseSessionToken(token);
  return parsed?.affiliateId ?? null;
}

export function generateUniqueCode(name: string): string {
  const base = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "")
    .toUpperCase()
    .slice(0, 8);
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${base || "AFF"}${suffix}`;
}

export function generateTempPassword(): string {
  return crypto.randomBytes(6).toString("base64url").slice(0, 10);
}
