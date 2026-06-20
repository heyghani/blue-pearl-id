import NextAuth from "next-auth";
import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";

import { authConfig } from "@/lib/auth.config";
import {
  clearSessionCookies,
  hasSessionCookie,
} from "@/lib/auth-session-cookies";

const { auth } = NextAuth(authConfig);

export default auth(async (req) => {
  if (hasSessionCookie(req)) {
    const token = await getToken({
      req,
      secret: process.env.AUTH_SECRET,
    }).catch(() => null);

    if (!token) {
      const response = NextResponse.next();
      clearSessionCookies(req, response);
      return response;
    }
  }
});

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)",
  ],
};
