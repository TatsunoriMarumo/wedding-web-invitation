// lib/requireAdmin.ts
import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { canonicalizeEmail } from "@/lib/email";

export async function requireAdmin() {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) throw new Error("Unauthorized");

  const canonical = canonicalizeEmail(email);
  const hit = await prisma.admin.findUnique({ where: { canonical } });
  if (!hit) throw new Error("Forbidden");
  return { email, canonical };
}
