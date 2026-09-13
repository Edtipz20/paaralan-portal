import type { NextAuthConfig } from "next-auth";

// This file must stay Edge-compatible: no Prisma, no bcrypt, no Node-only APIs.
// It's imported by proxy.ts, which runs on the Edge runtime.
export default {
  secret: process.env.AUTH_SECRET,

  pages: {
    signIn: "/sign-in",
  },
  session: {
    strategy: "jwt",
  },
  callbacks: {
    authorized({ request, auth }) {
      const protectedPaths = [/\/admin(\/.*)?/];
      const { pathname } = request.nextUrl;
      const isProtected = protectedPaths.some((p) => p.test(pathname));
      if (isProtected) return !!auth;
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
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
  providers: [], // real providers (with Prisma/bcrypt) live in auth.ts
} satisfies NextAuthConfig;
