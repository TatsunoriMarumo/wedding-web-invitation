// app/admin/layout.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";

/** user が isAdmin:boolean を持つか安全に確認する型ガード */
function hasAdminFlag(user: unknown): user is { isAdmin: boolean } {
  return typeof (user as { isAdmin?: unknown } | null)?.isAdmin === "boolean";
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect(`/signin?callbackUrl=/admin`);
  }

  const isAdmin = hasAdminFlag(session.user) && session.user.isAdmin === true;
  if (!isAdmin) {
    redirect("/forbidden");
  }

  return <>{children}</>;
}
