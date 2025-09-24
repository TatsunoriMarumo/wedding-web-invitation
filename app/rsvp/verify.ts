// app/rsvp/verify.ts
"use server";

import prisma from "@/lib/prisma";

export type VerifyResult =
  | { ok: true; inviteeName?: string | null }
  | { ok: false; reason: "NOT_PROVIDED" | "NOT_FOUND" | "USED"; inviteeName?: string | null };

export async function verifyInviteToken(token: string | null | undefined): Promise<VerifyResult> {
  if (!token || typeof token !== "string" || token.trim() === "") {
    return { ok: false, reason: "NOT_PROVIDED" };
  }

  // InvitationToken の実カラムに合わせて select を定義
  // isUsed: boolean, usedAt: Date | null, inviteeName: string | null を想定
  const row = await prisma.invitationToken.findUnique({
    where: { token },
    select: {
      id: true,
      token: true,
      inviteeName: true,
      isUsed: true,
      usedAt: true,
    },
  });

  if (!row) return { ok: false, reason: "NOT_FOUND" };

  // boolean と日時のどちらでも「使用済み」と判断
  const isUsed = row.isUsed === true || row.usedAt !== null;

  if (isUsed) {
    return { ok: false, reason: "USED", inviteeName: row.inviteeName ?? null };
  }

  return { ok: true, inviteeName: row.inviteeName ?? null };
}
