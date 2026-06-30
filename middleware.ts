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

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|google-site-verification|.*\\..*).*)",
  ],
};
