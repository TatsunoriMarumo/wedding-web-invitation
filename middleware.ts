// app/middleware.ts
export { auth as middleware } from "@/auth";

export const config = {
  matcher: ["/admin/:path*", "/signin"], // /admin配下だけ保護
};
