import { createHash } from "crypto";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export type MetaAdvancedMatching = {
  em?: string;
  ph?: string;
};

/** Meta Advanced Matching: trim → lowercase → SHA-256 hex. */
export function hashMetaAdvancedMatchingValue(value: string): string | undefined {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return undefined;
  return createHash("sha256").update(normalized).digest("hex");
}

/**
 * Phone: trim → lowercase → digits only (Meta matching format) → SHA-256.
 * Digits-only follows Meta's phone normalization so hashes can match.
 */
export function hashMetaPhone(value: string): string | undefined {
  const digits = value.trim().toLowerCase().replace(/\D/g, "");
  if (!digits) return undefined;
  return createHash("sha256").update(digits).digest("hex");
}

/**
 * Logged-in user PII for Pixel Advanced Matching.
 * Source: NextAuth session id → `User.email` / `User.phone` in Prisma
 * (same pattern as `getAuthUser` / `getCheckoutPrefill` in checkout actions).
 * Guests / missing fields → empty object (no throw).
 */
export async function getMetaPixelAdvancedMatching(): Promise<MetaAdvancedMatching> {
  try {
    const session = await getSession();
    if (!session?.user?.id) return {};

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { email: true, phone: true },
    });
    if (!user) return {};

    const matching: MetaAdvancedMatching = {};
    const em = hashMetaAdvancedMatchingValue(user.email);
    if (em) matching.em = em;

    if (user.phone) {
      const ph = hashMetaPhone(user.phone);
      if (ph) matching.ph = ph;
    }

    return matching;
  } catch {
    return {};
  }
}
