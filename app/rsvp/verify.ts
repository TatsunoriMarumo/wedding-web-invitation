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

  // InvitationToken の実カラムに合わせて select を定義する
  // ※ スキーマが isUsed(boolean) と usedAt(Date | null) の構成を想定
  const row = await prisma.invitationToken.findUnique({
    where: { token },
    select: {
      id: true,
      token: true,
      inviteeName: true,
      // どちらか片方しか無いプロジェクトでも安全に動くよう両方選択
      isUsed: true,
      usedAt: true,
    },
  });

  if (!row) return { ok: false, reason: "NOT_FOUND" };

  // boolean運用/日時運用の両対応
  const usedByFlag = typeof (row as any).isUsed === "boolean" && (row as any).isUsed === true;
  const usedByDate = !!(row as any).usedAt;
  const isUsed = usedByFlag || usedByDate;

  if (isUsed) {
    return { ok: false, reason: "USED", inviteeName: (row as any).inviteeName ?? null };
  }

  return { ok: true, inviteeName: (row as any).inviteeName ?? null };
}
