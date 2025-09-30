// app/admin/actions.ts
"use server";

import { z } from "zod";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";
import prisma from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type { Guest, InviteToken } from "@/lib/types";
import { requireAdmin } from "@/lib/requireAdmin";
import { canonicalizeEmail } from "@/lib/email";
import type { AdminActionState } from "./actions.shared";
import { signOut } from "@/auth";

// ---- 追加：useActionState用の固定状態型（null許容） ----
export type TokenActionState = {
  message: string | null;
  token: InviteToken | null;
};
  
// 既存: 管理画面データ取得
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
      birthDate: g.birthDate,
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

// 既存: 招待トークン作成
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

// 新規追加: 招待トークン削除
export async function deleteInvitationToken(tokenId: number): Promise<{ success: boolean; message: string }> {
  try {
    // トークンが使用済みかチェック
    const token = await prisma.invitationToken.findUnique({
      where: { id: tokenId },
      include: { guests: true }
    });

    if (!token) {
      return { success: false, message: "トークンが見つかりません。" };
    }

    if (token.isUsed || token.guests.length > 0) {
      return { 
        success: false, 
        message: "使用済みのトークンは削除できません。" 
      };
    }

    // トークンを削除
    await prisma.invitationToken.delete({
      where: { id: tokenId }
    });

    revalidatePath("/admin");
    return { success: true, message: "トークンを削除しました。" };
  } catch (error) {
    console.error("deleteInvitationToken failed:", error);
    return { 
      success: false, 
      message: "トークンの削除に失敗しました。" 
    };
  }
}

const PhoneSchema = z
  .string()
  .trim()
  .refine((v) => /^\+?[0-9\s\-()]+$/.test(v), "invalid phone")
  .refine((v) => {
    const digits = v.replace(/\D/g, "");
    return digits.length >= 8 && digits.length <= 15;
  }, "invalid phone");

const GuestUpdateSchema = z.object({
  id: z.number(),
  lastName: z.string().trim().min(1),
  firstName: z.string().trim().min(1),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  email: z.string().trim().email().nullable().optional(),
  phone: z.string().trim().nullable().optional(),
  attendance: z.enum(["ATTEND", "DECLINE"]),
  dogAllergy: z.boolean(),
  foodAllergies: z.array(z.string().trim().min(1)).max(50),
});

function toNullIfEmpty(v: unknown) {
  if (v == null) return null;
  const s = String(v).trim();
  return s.length ? s : null;
}

type GuestWithAllergies = Prisma.GuestGetPayload<{
  include: { allergies: { include: { allergen: true } } };
}>;

export type UpdateGuestResult =
  | { ok: true; updated: GuestWithAllergies | null }
  | { ok: false; error: string };

export async function updateGuestAction(fd: FormData): Promise<UpdateGuestResult> {
  try {
    const raw = fd.get("payload");
    if (!raw || typeof raw !== "string") {
      return { ok: false, error: "no payload" };
    }
    const parsed = GuestUpdateSchema.parse(JSON.parse(raw));

    const email = toNullIfEmpty(parsed.email);
    const phoneRaw = toNullIfEmpty(parsed.phone);
    if (phoneRaw) {
      // phone 形式チェック（任意だが入っていれば検証）
      PhoneSchema.parse(phoneRaw);
    }

    // アレルゲンのIDを確定
    const allergenIds: number[] = [];

    if (parsed.dogAllergy) {
      const dog = await prisma.allergen.findFirst({
        where: { category: "DOG" },
        select: { id: true },
      });
      if (dog) {
        allergenIds.push(dog.id);
      } else {
        const created = await prisma.allergen.create({
          data: { category: "DOG", name: "DOG" },
          select: { id: true },
        });
        allergenIds.push(created.id);
      }
    }

    // 食品アレルギー（重複除去）
    const uniqueFoods = Array.from(new Set(parsed.foodAllergies.map((s) => s.trim()).filter(Boolean)));
    if (uniqueFoods.length) {
      const foods = await Promise.all(
        uniqueFoods.map(async (name) => {
          const found = await prisma.allergen.findFirst({
            where: { category: "FOOD", name },
            select: { id: true },
          });
          if (found) return found.id;
          const created = await prisma.allergen.create({
            data: { category: "FOOD", name },
            select: { id: true },
          });
          return created.id;
        })
      );
      allergenIds.push(...foods);
    }

    // まとめて更新
    const updated = await prisma.$transaction(async (tx) => {
      await tx.guest.update({
        where: { id: parsed.id },
        data: {
          lastName: parsed.lastName,
          firstName: parsed.firstName,
          birthDate: new Date(parsed.birthDate),
          email,
          phone: phoneRaw,
          attendance: parsed.attendance,
        },
      });

      // 中間テーブルを張り替え
      await tx.guestAllergy.deleteMany({ where: { guestId: parsed.id } });
      if (allergenIds.length) {
        await tx.guestAllergy.createMany({
          data: allergenIds.map((aid) => ({ guestId: parsed.id, allergenId: aid })),
          skipDuplicates: true,
        });
      }

      // 最新を取得（画面反映用）
      return tx.guest.findUnique({
        where: { id: parsed.id },
        include: {
          allergies: { include: { allergen: true } },
        },
      });
    });

    revalidatePath("/");
    revalidatePath("/admin");

    return { ok: true, updated };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "update failed";
    return { ok: false, error: message };
  }
}

const EmailSchema = z.object({ email: z.string().email() });

export async function addAdminEmail(
  _prev: AdminActionState,
  fd: FormData
): Promise<AdminActionState> {
  await requireAdmin();

  const parsed = EmailSchema.safeParse({ email: fd.get("email") });
  if (!parsed.success) return { error: "Invalid email." };

  const email = parsed.data.email.toLowerCase();
  const canonical = canonicalizeEmail(email);

  try {
    await prisma.admin.upsert({
      where: { canonical },
      update: { email },
      create: { email, canonical },
    });
    revalidatePath("/admin");
    return { ok: true };
  } catch {
    return { error: "Failed to add (maybe already exists)." };
  }
}

export async function removeAdminEmail(
  _prev: AdminActionState,
  fd: FormData
): Promise<AdminActionState> {
  await requireAdmin();

  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const canonical = canonicalizeEmail(email);

  const total = await prisma.admin.count();
  if (total <= 1) return { error: "At least one admin must remain." };

  try {
    await prisma.admin.delete({ where: { canonical } });
    revalidatePath("/admin");
    return { ok: true };
  } catch {
    return { error: "Not found or cannot delete." };
  }
}

export async function signOutToSignin() {
  await signOut({ redirectTo: "/signin" });
}
