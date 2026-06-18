import { cookies } from "next/headers";

export const CART_SESSION_COOKIE = "cart_session_id";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export async function getCartSessionId(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(CART_SESSION_COOKIE)?.value;
}

export async function setCartSessionId(sessionId: string) {
  const cookieStore = await cookies();
  cookieStore.set(CART_SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: MAX_AGE,
    path: "/",
  });
}

export async function clearCartSessionId() {
  const cookieStore = await cookies();
  cookieStore.delete(CART_SESSION_COOKIE);
}
