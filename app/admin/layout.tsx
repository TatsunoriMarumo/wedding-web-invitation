// app/admin/layout.tsx
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) {
    redirect(`/signin?callbackUrl=/admin`);
  }
  if (!(session.user as any)?.isAdmin) {
    redirect("/forbidden");
  }
  return <>{children}</>;
}
