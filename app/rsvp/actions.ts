// app/rsvp/actions.ts
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { AllergenCategory, AttendanceStatus } from "@prisma/client";

/* ===========================
 * Zod Schemas
 * =========================== */
const isoDateRegex = /^\d{4}-\d{2}-\d{2}$/;

const allergyItemSchema = z.object({
  type: z.enum(["dog", "food"]),
  allergen: z.string().trim().min(1, "アレルギー名は必須です"),
});

const personSchema = z.object({
  firstName: z.string().trim().min(1, "姓は必須です"),
  lastName: z.string().trim().min(1, "名は必須です"),
  // `YYYY-MM-DD` を受け取り Date に正規化（DBは @db.Date）
  birthDate: z
    .union([z.string(), z.date()])
    .transform((v) => {
      if (v instanceof Date) return new Date(Date.UTC(v.getUTCFullYear(), v.getUTCMonth(), v.getUTCDate()));
      if (!isoDateRegex.test(v)) throw new Error("生年月日は YYYY-MM-DD 形式で入力してください。");
      const [y, m, d] = v.split("-").map(Number);
      return new Date(Date.UTC(y, m - 1, d));
    }),
  email: z.string().email("無効なメールアドレスです").optional().or(z.literal("")),
  phone: z.string().trim().optional().or(z.literal("")),
  allergies: z.array(allergyItemSchema).default([]),
});

const formSchema = z.object({
  token: z.string().trim().min(1, "招待トークンがありません"),
  attendanceStatus: z.enum(["ATTEND", "DECLINE"]),
  guests: z.array(personSchema).min(1, "参加者は最低1名必要です"),
});

/* ===========================
 * Helpers
 * =========================== */
function toNullable(val?: string | null) {
  if (val === undefined || val === null) return null;
  const s = String(val).trim();
  return s.length === 0 ? null : s;
}

function toAttendanceStatusEnum(s: "ATTEND" | "DECLINE"): AttendanceStatus {
  return s === "ATTEND" ? AttendanceStatus.ATTEND : AttendanceStatus.DECLINE;
}

function toAllergenCategoryEnum(s: "dog" | "food"): AllergenCategory {
  return s === "dog" ? AllergenCategory.DOG : AllergenCategory.FOOD;
}

/* ===========================
 * Server Action（Resubmit禁止）
 * =========================== */
/**
 * フォーム側では、以下のように JSON を FormData で送ってください:
 * const payload = { token, attendanceStatus, guests };
 * const fd = new FormData();
 * fd.set("payload", JSON.stringify(payload));
 */
export async function submitRsvp(_prevState: unknown, formData: FormData) {
  try {
    const raw = formData.get("payload");
    if (typeof raw !== "string") {
      throw new Error("フォームデータが不正です。もう一度お試しください。");
    }

    const parsed = formSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      const msg = parsed.error.issues.map((i) => i.message).join("\n");
      throw new Error(msg || "入力内容に誤りがあります。");
    }

    const { token, attendanceStatus, guests } = parsed.data;
    const attendanceStatusEnum = toAttendanceStatusEnum(attendanceStatus);

    await prisma.$transaction(async (tx) => {
      // 1) 同時二重送信対策: 招待トークンの行をロック
      await tx.$queryRaw`SELECT id, "isUsed" FROM "InvitationToken" WHERE token = ${token} FOR UPDATE`;

      // 2) トークン検証（Resubmitは無条件で禁止）
      const invitationToken = await tx.invitationToken.findUnique({
        where: { token },
        select: { id: true, isUsed: true },
      });
      if (!invitationToken) {
        throw new Error("無効な招待トークンです。URLを確認してください。");
      }
      if (invitationToken.isUsed) {
        throw new Error("この招待は既に使用されています。");
      }

      // 3) 処理対象のゲスト（欠席は代表者のみ受付）
      const guestsToProcess =
        attendanceStatusEnum === AttendanceStatus.DECLINE ? [guests[0]] : guests;

      // 4) 出席時のみ: アレルゲン ID 取得（複合一意が型に出ていない環境でも動くよう find→create に変更）
      const allergenIdByKey = new Map<string, number>();
      const getAllergenId = async (type: "dog" | "food", name: string) => {
        const category = toAllergenCategoryEnum(type);
        const key = `${category}:${name.toLowerCase()}`;
        const cached = allergenIdByKey.get(key);
        if (cached) return cached;

        // 4.1) 既存検索
        const found = await tx.allergen.findFirst({
          where: { category, name },
          select: { id: true },
        });
        if (found) {
          allergenIdByKey.set(key, found.id);
          return found.id;
        }
        // 4.2) 未登録なら作成
        const created = await tx.allergen.create({
          data: { category, name },
          select: { id: true },
        });
        allergenIdByKey.set(key, created.id);
        return created.id;
      };

      // 5) ゲスト作成（出欠別の分岐あり）
      for (const g of guestsToProcess) {
        const created = await tx.guest.create({
          data: {
            firstName: g.firstName,
            lastName: g.lastName,
            birthDate: g.birthDate, // 必須フィールド
            email: toNullable(g.email),
            phone: toNullable(g.phone),
            attendance: attendanceStatusEnum,
            invitationToken: { connect: { id: invitationToken.id } },
          },
          select: { id: true },
        });

        if (attendanceStatusEnum === AttendanceStatus.ATTEND && g.allergies.length > 0) {
          const links = [];
          for (const a of g.allergies) {
            const allergenId = await getAllergenId(a.type, a.allergen.trim());
            links.push(
              tx.guestAllergy.create({
                data: {
                  guestId: created.id,
                  allergenId,
                },
              }),
            );
          }
          if (links.length) await Promise.all(links);
        }
      }

      // 6) 最後にトークンを使用済みに更新（Resubmit禁止の肝）
      await tx.invitationToken.update({
        where: { id: invitationToken.id },
        data: { isUsed: true, usedAt: new Date() },
      });
    });

    // キャッシュの無効化（必要に応じてパスを調整）
    revalidatePath("/admin");
    revalidatePath("/");

  } catch (err: unknown) {
    console.error("[submitRsvp] error:", err);
    const message =
      err instanceof Error ? err.message : "送信に失敗しました。時間をおいて再試行してください。";
    // ページ遷移ではなくフォームのエラー表示に使う場合は return で返す
    return { error: message };
  }
}
