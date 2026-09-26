import { cookies, headers } from "next/headers";
import { db } from "@/db";
import { preferences, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { regionFromCountry, type RegionId } from "@/lib/regions";

const COOKIE = "innersound_uid";

export async function getUserId(): Promise<string | null> {
  const store = await cookies();
  const value = store.get(COOKIE)?.value;
  return value ?? null;
}

/** Returns the current anonymous user, creating one (and its cookie) if needed. */
export async function requireUser(): Promise<{ id: string }> {
  const store = await cookies();
  const existing = store.get(COOKIE)?.value;

  if (existing) {
    const rows = await db.select().from(users).where(eq(users.id, existing)).limit(1);
    if (rows.length) return { id: existing };
  }

  const [created] = await db.insert(users).values({}).returning();
  store.set(COOKIE, created.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    // Keep the anonymous session for 2 years so likes / playlists never vanish.
    maxAge: 60 * 60 * 24 * 365 * 2,
  });
  return { id: created.id };
}

export async function getPreferences(userId: string) {
  const rows = await db.select().from(preferences).where(eq(preferences.userId, userId)).limit(1);
  if (rows.length) return rows[0];
  const [created] = await db.insert(preferences).values({ userId }).returning();
  return created;
}

/** Best-effort geo lookup from request IP. */
export async function detectGeo(): Promise<{ country: string; region: RegionId; source: string }> {
  const h = await headers();
  const headerCountry =
    h.get("x-vercel-ip-country") ??
    h.get("cf-ipcountry") ??
    h.get("x-country-code") ??
    h.get("fly-client-country");

  if (headerCountry && headerCountry.length === 2) {
    const country = headerCountry.toUpperCase();
    return { country, region: regionFromCountry(country), source: "header" };
  }

  const forwarded = h.get("x-forwarded-for") ?? h.get("x-real-ip") ?? "";
  const ip = forwarded.split(",")[0].trim();
  const isPrivate =
    !ip ||
    ip.startsWith("10.") ||
    ip.startsWith("192.168.") ||
    ip.startsWith("127.") ||
    ip.startsWith("::1") ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(ip);

  const lookupUrl = isPrivate ? "https://ipapi.co/json/" : `https://ipapi.co/${ip}/json/`;
  try {
    const res = await fetch(lookupUrl, {
      headers: { "User-Agent": "innersound/1.0" },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      signal: AbortSignal.timeout(4000) as any,
      cache: "no-store",
    });
    if (res.ok) {
      const data = (await res.json()) as { country_code?: string; country?: string };
      const country = (data.country_code ?? data.country ?? "").toUpperCase();
      if (country.length === 2) {
        return { country, region: regionFromCountry(country), source: "ipapi" };
      }
    }
  } catch {
    /* offline / blocked */
  }

  return { country: "US", region: "GLOBAL", source: "fallback" };
}
