import type { NextAuthConfig } from "next-auth";
import { JWTSessionError } from "@auth/core/errors";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  logger: {
    error(error) {
      // Stale cookies after AUTH_SECRET rotation — cleared in middleware.
      if (error instanceof JWTSessionError) return;
      console.error(error);
    },
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = auth?.user?.role;
      const pathname = nextUrl.pathname;
      const isAdminRoute = pathname.startsWith("/admin");
      const isAccountRoute = pathname.startsWith("/account");

      if (!isAdminRoute && !isAccountRoute) {
        return true;
      }

      if (!isLoggedIn) {
        const loginUrl = new URL("/login", nextUrl.origin);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return Response.redirect(loginUrl);
      }

      if (isAdminRoute && role !== "ADMIN") {
        return Response.redirect(new URL("/", nextUrl.origin));
      }

      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
