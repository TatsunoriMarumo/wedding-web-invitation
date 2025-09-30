// app/admin/actions.ts
"use server";

import { z } from "zod";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";
import prisma from "@/lib/prisma";
import type { Guest, InviteToken } from "@/lib/types";
import { requireAdmin } from "@/lib/requireAdmin";
import { canonicalizeEmail } from "@/lib/email";
import type { AdminActionState } from "./actions.shared";
import { signOut } from "@/auth";
import crypto from "node:crypto";

/* =========================================================
 * 共通: DTO 変換ユーティリティ（Date→ISO、birthDate→YYYY-MM-DD）
 * ========================================================= */

type RowAllergen = {
  id: number;
  name: string;
  category: "DOG" | "FOOD";
  createdAt?: Date;
  updatedAt?: Date;
};

type RowGuestAllergy = {
  guestId: number;
  allergenId: number;
  notedAt?: Date;
  allergen: RowAllergen;
};

type RowGuest = {
  id: number;
  firstName: string;
  lastName: string;
  birthDate: Date | string | null;
  email: string | null;
  phone: string | null;
  attendance: "ATTEND" | "DECLINE";
  createdAt: Date;
  updatedAt: Date;
  allergies: RowGuestAllergy[];
};

const toISO = (d: Date | string): string => new Date(d).toISOString();
const toISO10 = (d: Date | string | null): string =>
  d ? new Date(d).toISOString().slice(0, 10) : "";

const toGuestDTO = (row: RowGuest): Guest => ({
  id: row.id,
  firstName: row.firstName,
  lastName: row.lastName,
  birthDate: toISO10(row.birthDate), // YYYY-MM-DD
  email: row.email,
  phone: row.phone,
  attendance: row.attendance,
  createdAt: toISO(row.createdAt),
  updatedAt: toISO(row.updatedAt),
  allergies: (row.allergies ?? []).map((ga) => ({
    allergen: {
      category: ga.allergen.category,
      name: ga.allergen.name,
    },
  })),
});

const toTokenDTO = (t: {
  id: number;
  token: string;
  inviteeName: string;
  isUsed: boolean;
  usedAt: Date | null;
  createdAt: Date;
}): InviteToken => ({
  id: t.id,
  token: t.token,
  inviteeName: t.inviteeName,
  isUsed: t.isUsed,
  usedAt: t.usedAt ? toISO(t.usedAt) : null,
  createdAt: toISO(t.createdAt),
});

/* ======================
 * Admin 初期データ取得
 * ====================== */

export async function getAdminData(): Promise<{
  tokens: InviteToken[];
  guests: Guest[];
  admins: { id: number; email: string; canonical: string }[];
}> {
  await requireAdmin();
  noStore();

  const [rawTokens, rawGuests, rawAdmins] = await Promise.all([
    prisma.invitationToken.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.guest.findMany({
      orderBy: { createdAt: "desc" },
      include: { allergies: { include: { allergen: true } } },
    }),
    prisma.admin.findMany({ orderBy: { email: "asc" } }),
  ]);

  return {
    tokens: rawTokens.map(toTokenDTO),
    guests: rawGuests.map((g) => toGuestDTO(g as unknown as RowGuest)),
    admins: rawAdmins.map((a) => ({
      id: a.id,
      email: a.email,
      canonical: a.canonical,
    })),
  };
}

/* ==========================
 * 招待トークンの作成・削除
 * ========================== */

export type TokenActionState = {
  message: string | null;
  token: InviteToken | null;
};

const genToken = (): string => {
  // 小文字英数字ベースの見やすいトークン（例: inv_voz613avmfuy5qlw）
  const buf = crypto.randomBytes(12).toString("hex"); // 24 hex chars
  return `inv_${BigInt("0x" + buf).toString(36)}`;
};

export async function createInvitationToken(
  prevState: TokenActionState,
  formData: FormData
): Promise<TokenActionState> {
  await requireAdmin();

  const schema = z.object({
    inviteeName: z.string().trim().min(1, "招待者名は必須です"),
  });

  const parsed = schema.safeParse({
    inviteeName: formData.get("inviteeName"),
  });

  if (!parsed.success) {
    return {
      message:
        parsed.error.flatten().fieldErrors.inviteeName?.[0] ?? "入力エラー",
      token: null,
    };
  }

  try {
    const tokenStr = genToken();
    const created = await prisma.invitationToken.create({
      data: { token: tokenStr, inviteeName: parsed.data.inviteeName },
    });

    const dto = toTokenDTO(created);
    revalidatePath("/admin");
    return { message: "success", token: dto };
  } catch {
    return { message: "トークンの作成に失敗しました。", token: null };
  }
}

export async function deleteInvitationToken(
  tokenId: number
): Promise<{ success: boolean; message: string }> {
  await requireAdmin();

  try {
    const token = await prisma.invitationToken.findUnique({
      where: { id: tokenId },
      include: { guests: true },
    });

    if (!token) {
      return { success: false, message: "トークンが見つかりません。" };
    }
    if (token.isUsed || (token.guests?.length ?? 0) > 0) {
      return {
        success: false,
        message: "使用済みのトークンは削除できません。",
      };
    }

    await prisma.invitationToken.delete({ where: { id: tokenId } });
    revalidatePath("/admin");
    return { success: true, message: "トークンを削除しました。" };
  } catch {
    return { success: false, message: "削除に失敗しました。" };
  }
}

/* ==================
 * ゲスト情報の更新
 * ================== */

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
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
  email: z.string().trim().email().nullable().optional(),
  phone: z.string().trim().nullable().optional(),
  attendance: z.enum(["ATTEND", "DECLINE"]),
  dogAllergy: z.boolean(),
  foodAllergies: z.array(z.string().trim().min(1)).default([]),
});

const toNullIfEmpty = (s: string | null | undefined): string | null => {
  const v = (s ?? "").trim();
  return v.length ? v : null;
};

type UpdateGuestResult =
  | { ok: true; updated: Guest }
  | { ok: false; error: string };

export async function updateGuestAction(
  fd: FormData
): Promise<UpdateGuestResult> {
  await requireAdmin();

  const raw = fd.get("payload");
  if (!raw || typeof raw !== "string") {
    return { ok: false, error: "no payload" };
  }

  const parsed = GuestUpdateSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) {
    return { ok: false, error: "invalid payload" };
  }
  const p = parsed.data;

  const email = toNullIfEmpty(p.email);
  const phone = toNullIfEmpty(p.phone);
  if (phone) {
    // 任意だが入っていれば形式チェック
    PhoneSchema.parse(phone);
  }

  // 目標アレルゲンID群を作る（DOG 1つ + FOOD 複数）
  const targetAllergenIds: number[] = [];

  // DOG
  if (p.dogAllergy) {
    const dog = await prisma.allergen.findFirst({
      where: { category: "DOG" },
      select: { id: true },
    });
    if (dog) {
      targetAllergenIds.push(dog.id);
    } else {
      const createdDog = await prisma.allergen.create({
        data: { category: "DOG", name: "DOG" },
        select: { id: true },
      });
      targetAllergenIds.push(createdDog.id);
    }
  }

  // FOOD（重複除去）
  const uniqueFoods = Array.from(new Set(p.foodAllergies.map((s) => s.trim()).filter(Boolean)));
  for (const name of uniqueFoods) {
    const found = await prisma.allergen.findFirst({
      where: { category: "FOOD", name },
      select: { id: true },
    });
    if (found) {
      targetAllergenIds.push(found.id);
    } else {
      const created = await prisma.allergen.create({
        data: { category: "FOOD", name },
        select: { id: true },
      });
      targetAllergenIds.push(created.id);
    }
  }

  // 既存リンク（DOG/FOOD のみ）を取得
  const existing = await prisma.guest.findUnique({
    where: { id: p.id },
    include: { allergies: { include: { allergen: true } } },
  });
  if (!existing) return { ok: false, error: "guest not found" };

  const existingLinks = (existing.allergies ?? []).filter(
    (ga) => ga.allergen.category === "DOG" || ga.allergen.category === "FOOD"
  );
  const existingIds = new Set<number>(existingLinks.map((ga) => ga.allergenId));
  const targetIds = new Set<number>(targetAllergenIds);

  const toAdd: number[] = [];
  for (const id of targetIds) if (!existingIds.has(id)) toAdd.push(id);

  const toRemove: number[] = [];
  for (const id of existingIds) if (!targetIds.has(id)) toRemove.push(id);

  // まとめて更新
  await prisma.$transaction(async (tx) => {
    await tx.guest.update({
      where: { id: p.id },
      data: {
        lastName: p.lastName,
        firstName: p.firstName,
        birthDate: new Date(`${p.birthDate}T00:00:00.000Z`),
        email,
        phone,
        attendance: p.attendance,
      },
    });

    if (toRemove.length) {
      await tx.guestAllergy.deleteMany({
        where: { guestId: p.id, allergenId: { in: toRemove } },
      });
    }
    if (toAdd.length) {
      await tx.guestAllergy.createMany({
        data: toAdd.map((aid) => ({
          guestId: p.id,
          allergenId: aid,
        })),
        skipDuplicates: true,
      });
    }
  });

  // 更新後を取得して DTO 化
  const refreshed = await prisma.guest.findUnique({
    where: { id: p.id },
    include: { allergies: { include: { allergen: true } } },
  });
  if (!refreshed) return { ok: false, error: "failed to reload updated guest" };

  const dto = toGuestDTO(refreshed as unknown as RowGuest);

  // revalidate（redirect しない）
  revalidatePath("/");
  revalidatePath("/admin");

  return { ok: true, updated: dto };
}

/* ===========================
 * Admin メールの追加・削除
 * =========================== */

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
    return { error: "Failed to add admin." };
  }
}

export async function removeAdminEmail(
  _prev: AdminActionState,
  fd: FormData
): Promise<AdminActionState> {
  await requireAdmin();

  const parsed = EmailSchema.safeParse({ email: fd.get("email") });
  if (!parsed.success) return { error: "Invalid email." };

  const email = parsed.data.email.toLowerCase();
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

/* ========
 * Signout
 * ======== */

export async function signOutToSignin() {
  await signOut({ redirectTo: "/signin" });
}
