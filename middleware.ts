import NextAuth from "next-auth";
import { NextResponse } from "next/server";

import { authConfig } from "@/lib/auth.config";
import {
  clearSessionCookies,
  hasSessionCookie,
} from "@/lib/auth-session-cookies";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  if (hasSessionCookie(req) && !req.auth) {
    const response = NextResponse.next();
    clearSessionCookies(req, response);
    return response;
  }
});

/** Auth only where needed — public shop skips JWT work per request. */
export const config = {
  matcher: ["/admin/:path*", "/account/:path*", "/login", "/register"],
};
