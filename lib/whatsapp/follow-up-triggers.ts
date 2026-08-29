export type FollowUpPageType = "home" | "product" | "cart" | "browse" | "other";

const BROWSE_PATHS = new Set(["/products", "/lookbook", "/halloween"]);

export type FollowUpTrigger = "time" | "exit_intent";

export type FollowUpContext = {
  pageType: FollowUpPageType;
  delayMs: number;
  enableExitIntent: boolean;
};

export const WA_POPUP_DISMISS_KEY = "bp-wa-popup-dismissed";
export const WA_POPUP_SESSION_KEY = "bp-wa-popup-shown";
export const WA_POPUP_DISMISS_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const EXCLUDED_PREFIXES = ["/checkout", "/account", "/admin", "/auth"];

export function getPageType(pathname: string): FollowUpPageType {
  if (pathname === "/") return "home";
  if (/^\/products\/[^/]+$/.test(pathname)) return "product";
  if (pathname === "/cart") return "cart";
  if (BROWSE_PATHS.has(pathname)) return "browse";
  return "other";
}

export function isPopupEligiblePath(pathname: string): boolean {
  return !EXCLUDED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function getFollowUpContext(
  pathname: string,
  hasCartItems: boolean,
): FollowUpContext | null {
  if (!isPopupEligiblePath(pathname)) return null;

  if (hasCartItems) {
    return { pageType: "cart", delayMs: 10_000, enableExitIntent: true };
  }

  const pageType = getPageType(pathname);

  switch (pageType) {
    case "home":
      return { pageType, delayMs: 15_000, enableExitIntent: true };
    case "product":
      return { pageType, delayMs: 30_000, enableExitIntent: true };
    case "cart":
      return { pageType, delayMs: 10_000, enableExitIntent: true };
    case "browse":
      return { pageType, delayMs: 20_000, enableExitIntent: true };
    default:
      return null;
  }
}

export function isPopupDismissed(now = Date.now()): boolean {
  if (typeof window === "undefined") return true;

  try {
    const raw = localStorage.getItem(WA_POPUP_DISMISS_KEY);
    if (!raw) return false;
    const dismissedAt = Number.parseInt(raw, 10);
    if (Number.isNaN(dismissedAt)) return false;
    return now - dismissedAt < WA_POPUP_DISMISS_TTL_MS;
  } catch {
    return false;
  }
}

export function markPopupDismissed(now = Date.now()): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(WA_POPUP_DISMISS_KEY, String(now));
  } catch {
    // Ignore storage failures (private browsing, quota, etc.)
  }
}

export function wasPopupShownThisSession(): boolean {
  if (typeof window === "undefined") return true;

  try {
    return sessionStorage.getItem(WA_POPUP_SESSION_KEY) === "1";
  } catch {
    return false;
  }
}

export function markPopupShownThisSession(): void {
  if (typeof window === "undefined") return;

  try {
    sessionStorage.setItem(WA_POPUP_SESSION_KEY, "1");
  } catch {
    // Ignore storage failures
  }
}

export function readProductNameFromPage(): string | undefined {
  if (typeof document === "undefined") return undefined;

  const fromData = document.querySelector("[data-product-name]")?.textContent?.trim();
  if (fromData) return fromData;

  const h1 = document.querySelector("main h1")?.textContent?.trim();
  return h1 || undefined;
}

export function interpolate(template: string, values: Record<string, string>): string {
  return Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, value),
    template,
  );
}
