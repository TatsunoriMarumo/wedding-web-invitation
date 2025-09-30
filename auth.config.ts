// auth.config.ts
import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { canonicalizeEmail } from "@/lib/email";

export const authConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
      allowDangerousEmailAccountLinking: true,
      authorization: { params: { prompt: "select_account" } },
    }),
  ],
  pages: {
    signIn: "/signin",
  },
  session: { strategy: "jwt" },
  callbacks: {
    /**
     * JWT 作成時に isAdmin を埋め込む
     */
    async jwt({ token, trigger }) {
      // email があれば Admin テーブルを照会
      if ((trigger === "signIn" || token.isAdmin === undefined) && token.email) {
        const canonical = canonicalizeEmail(token.email);
        const admin = await prisma.admin.findUnique({ where: { canonical } });
        token.isAdmin = !!admin;
      }
      return token;
    },
    /**
     * Session にも isAdmin を載せる（middleware でも参照できる形に）
     */
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).isAdmin = !!(token as any).isAdmin;
      }
      return session;
    },
    /**
     * /admin でのアクセス制御
     * - 未ログイン: false（= 自動で /signin にリダイレクト）
     * - ログイン済み & 非管理者: /forbidden へリダイレクト
     */
    authorized({ request, auth }) {
      const pathname = request.nextUrl.pathname;
      const isLoggedIn = !!auth?.user;
      const isAdminRoute = pathname.startsWith("/admin");

      // 既ログインで /signin に来たら、権限で振り分け
      if (pathname === "/signin" && isLoggedIn) {
        const isAdmin = (auth!.user as any)?.isAdmin === true;
        const url = new URL(isAdmin ? "/admin" : "/forbidden", request.nextUrl.origin);
        return NextResponse.redirect(url);
      }

      // /admin 保護：未ログイン→false（= /signin へ）、非管理者→/forbidden
      if (isAdminRoute) {
        if (!isLoggedIn) {
          const url = new URL("/signin", request.nextUrl.origin);
          return NextResponse.redirect(url);
        }
        const isAdmin = (auth!.user as any)?.isAdmin === true;
        if (!isAdmin) {
          const url = new URL("/forbidden", request.nextUrl.origin);
          return NextResponse.redirect(url);
        }
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
