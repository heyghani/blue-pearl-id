import type { NextRequest, NextResponse } from "next/server";

/** Auth.js session cookie names (including chunked variants). */
export function forEachSessionCookie(
  request: NextRequest,
  onCookie: (name: string) => void,
) {
  for (const { name } of request.cookies.getAll()) {
    if (
      name.startsWith("authjs.session-token") ||
      name.startsWith("__Secure-authjs.session-token") ||
      name.startsWith("__Host-authjs.session-token")
    ) {
      onCookie(name);
    }
  }
}

export function hasSessionCookie(request: NextRequest) {
  let found = false;
  forEachSessionCookie(request, () => {
    found = true;
  });
  return found;
}

export function clearSessionCookies(request: NextRequest, response: NextResponse) {
  forEachSessionCookie(request, (name) => {
    response.cookies.delete(name);
  });
}
