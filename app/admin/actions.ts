// app/admin/actions.ts
"use server";

import { z } from "zod";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";
import prisma from "@/lib/prisma";
import type { Guest, InviteToken } from "@/lib/types";

// ---- 追加：useActionState用の固定状態型（null許容） ----
export type TokenActionState = {
  message: string | null;
  token: InviteToken | null;
};

// 既存: 管理画面データ取得（あなたの最新版のままでOK）
export async function getAdminData() {
  noStore();
  try {
    const [rawTokens, rawGuests] = await Promise.all([
      prisma.invitationToken.findMany({ orderBy: { createdAt: "desc" } }),
      prisma.guest.findMany({
        orderBy: { createdAt: "desc" },
        include: { allergies: { include: { allergen: true } } },
      }),
    ]);

    const tokens: InviteToken[] = rawTokens.map((t) => ({
      id: t.id,
      token: t.token,
      inviteeName: t.inviteeName,
      isUsed: t.isUsed,
      usedAt: t.usedAt ? t.usedAt.toISOString() : null,
      createdAt: t.createdAt.toISOString(),
    }));

    const guests: Guest[] = rawGuests.map((g) => ({
      id: g.id,
      firstName: g.firstName,
      lastName: g.lastName,
      email: g.email ?? null,
      phone: g.phone ?? null,
      attendance: g.attendance as "ATTEND" | "DECLINE",
      invitationTokenId: g.invitationTokenId ?? null,
      createdAt: g.createdAt.toISOString(),
      allergies: (g.allergies ?? []).map((a) => ({
        allergen: {
          category: a.allergen.category as "DOG" | "FOOD",
          name: a.allergen.name,
        },
      })),
    }));

    return { tokens, guests };
  } catch (error) {
    console.error("データの取得に失敗しました:", error);
    return { error: "データの取得に失敗しました。" };
  }
}

// 既存: 招待トークン作成を「固定状態型」で返すように変更
export async function createInvitationToken(
  prevState: TokenActionState,
  formData: FormData
): Promise<TokenActionState> {
  const schema = z.object({
    inviteeName: z.string().min(1, "招待者名は必須です"),
  });

  const validated = schema.safeParse({
    inviteeName: formData.get("inviteeName"),
  });

  if (!validated.success) {
    return {
      message: validated.error.flatten().fieldErrors.inviteeName?.[0] ?? "入力エラー",
      token: null,
    };
  }

  try {
    const { inviteeName } = validated.data;
    const tokenStr = `inv_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;

    const created = await prisma.invitationToken.create({
      data: { token: tokenStr, inviteeName },
    });

    const dto: InviteToken = {
      id: created.id,
      token: created.token,
      inviteeName: created.inviteeName,
      isUsed: created.isUsed,
      usedAt: created.usedAt ? created.usedAt.toISOString() : null,
      createdAt: created.createdAt.toISOString(),
    };

    revalidatePath("/admin");
    return { message: "success", token: dto };
  } catch (e) {
    console.error("createInvitationToken failed:", e);
    return { message: "トークンの作成に失敗しました。", token: null };
  }
}
