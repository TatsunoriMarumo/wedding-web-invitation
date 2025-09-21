// app/rsvp/actions.ts
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { AllergenCategory, AttendanceStatus } from "@prisma/client";

/* ===========================
 * 設定
 * =========================== */

// 再送信（上書き）を許可：開発中は true、本番で一度きりにしたい時は false
const ALLOW_RESUBMIT = true;

/* ===========================
 * Zod Schemas
 * =========================== */

const allergyItemSchema = z.object({
  id: z.string(), // クライアント側一意ID（DBには保存しない）
  type: z.enum(["dog", "food"]),
  allergen: z.string().trim().min(1, "アレルギー名は必須です"),
});

// YYYY-MM-DD または YYYY/MM/DD を Date(UTC 00:00) に変換
const parseYMD = (s: string) => {
  const m = /^(\d{4})[-/](\d{2})[-/](\d{2})$/.exec(s);
  if (!m) throw new Error("日付の形式は YYYY/MM/DD で入力してください");
  const y = Number(m[1]), mo = Number(m[2]), d = Number(m[3]);
  // 妥当性チェック（存在する日付か）
  const dt = new Date(Date.UTC(y, mo - 1, d));
  const valid =
    dt.getUTCFullYear() === y &&
    dt.getUTCMonth() + 1 === mo &&
    dt.getUTCDate() === d;
  if (!valid) throw new Error("日付が正しくありません");
  return dt;
};

const todayUTC = new Date(new Date().toISOString().slice(0, 10));

const personSchema = z.object({
  firstName: z.string().trim().min(1, "名は必須です"),
  lastName:  z.string().trim().min(1, "姓は必須です"),
  email:     z.string().email("無効なメールアドレスです").optional().or(z.literal("")),
  phone:     z.string().trim().optional().or(z.literal("")),

  // ★ 必須：生年月日（YYYY-MM-DD）
  birthDate: z
    .string()
    .min(1, "生年月日は必須です")
    .regex(/^\d{4}-\d{2}-\d{2}$/, "日付の形式は YYYY-MM-DD で入力してください")
    .transform(parseYMD)
    .refine((d) => d.getTime() <= todayUTC.getTime(), "生年月日が未来日です"),

  allergies: z.array(allergyItemSchema),
});

const payloadSchema = z
  .object({
    token: z.string().min(1, "招待トークンは必須です"),
    attendance: z.enum(["attend", "decline"]),
    // guests[0] が代表者。decline の場合は代表者のみを保存。
    guests: z.array(personSchema).min(1, "最低1名のゲスト情報が必要です"),
  })
  .refine(
    (data) => {
      const m = data.guests[0];
      return !!(m?.email && m.phone && m.phone.length > 0);
    },
    { message: "代表者には有効なメールアドレスと電話番号が必須です", path: ["guests", "0"] },
  );

/* ===========================
 * Helpers
 * =========================== */

const norm = (s?: string | null) => (s && s.trim() ? s.trim() : null);

const toAttendance = (v: "attend" | "decline"): AttendanceStatus =>
  v === "attend" ? AttendanceStatus.ATTEND : AttendanceStatus.DECLINE;

const toCategory = (v: "dog" | "food"): AllergenCategory =>
  v === "dog" ? AllergenCategory.DOG : AllergenCategory.FOOD;

/* ===========================
 * Action
 * =========================== */

export async function submitRsvp(formData: FormData) {
  try {
    // 1) 取り出し & Zod検証
    const payloadJson = formData.get("payload");
    if (typeof payloadJson !== "string") throw new Error("フォームの送信データが見つかりません。");

    const { token, attendance, guests: guestData } = payloadSchema.parse(JSON.parse(payloadJson));
    const attendanceStatus = toAttendance(attendance);

    // 2) トランザクション
    await prisma.$transaction(async (tx) => {
      // 2.1) トークン検証
      const invitationToken = await tx.invitationToken.findUnique({ where: { token } });
      if (!invitationToken) throw new Error("無効な招待トークンです。URLを確認してください。");
      if (!ALLOW_RESUBMIT && invitationToken.isUsed)
        throw new Error("この招待は既に使用されています。");

      const guestsToProcess =
        attendanceStatus === AttendanceStatus.DECLINE ? [guestData[0]] : guestData;

      // 2.2) 再送信許可時は既存ゲストを削除して上書き
      if (ALLOW_RESUBMIT && invitationToken.isUsed) {
        await tx.guest.deleteMany({ where: { invitationTokenId: invitationToken.id } });
      }

      // 2.3) 出席者のみ：アレルゲンを（カテゴリ＋名称）で upsert してIDをキャッシュ
      const allergenIdByKey = new Map<string, number>(); // `${category}:${name}`
      if (attendanceStatus === AttendanceStatus.ATTEND) {
        const pairs = new Set<string>();
        for (const g of guestsToProcess) {
          for (const a of g.allergies) {
            const cat = toCategory(a.type);
            const name = a.allergen.trim();
            if (!name) continue;
            pairs.add(`${cat}:${name}`);
          }
        }
        for (const key of pairs) {
          const [catStr, name] = key.split(":");
          const cat = catStr as keyof typeof AllergenCategory;
          const upserted = await tx.allergen.upsert({
            where: {
              category_name_unique: {
                category: AllergenCategory[cat],
                name,
              },
            },
            update: {},
            create: { category: AllergenCategory[cat], name },
            select: { id: true },
          });
          allergenIdByKey.set(key, upserted.id);
        }
      }

      // 2.4) ゲスト登録（代表者→同伴者の順）
      for (const g of guestsToProcess) {
        const created = await tx.guest.create({
          data: {
            firstName: g.firstName,
            lastName:  g.lastName,
            email:     norm(g.email),
            phone:     norm(g.phone),

            // ★ 必須
            birthDate: g.birthDate,

            attendance:        attendanceStatus,
            invitationTokenId: invitationToken.id,
          },
          select: { id: true },
        });

        // 出席者のみアレルギー付与
        if (attendanceStatus === AttendanceStatus.ATTEND && g.allergies.length) {
          const linkPairs = new Set<string>(); // `${guestId}:${allergenId}`
          for (const a of g.allergies) {
            const cat = toCategory(a.type);
            const name = a.allergen.trim();
            if (!name) continue;
            const key = `${cat}:${name}`;
            const allergenId = allergenIdByKey.get(key);
            if (allergenId) linkPairs.add(`${created.id}:${allergenId}`);
          }
          if (linkPairs.size) {
            await tx.guestAllergy.createMany({
              data: Array.from(linkPairs).map((k) => {
                const [guestIdStr, allergenIdStr] = k.split(":");
                return { guestId: Number(guestIdStr), allergenId: Number(allergenIdStr) };
              }),
              skipDuplicates: true,
            });
          }
        }
      }

      // 2.5) トークンを使用済みに（再送信可でも毎回更新）
      await tx.invitationToken.update({
        where: { id: invitationToken.id },
        data: { isUsed: true, usedAt: new Date() },
      });
    });

    // 3) 成功：キャッシュ無効化 & リダイレクト
    revalidatePath("/admin/guests");
    redirect("/thank-you");
  } catch (error) {
    console.error("RSVP Submission Failed:", error);
    const message =
      error instanceof z.ZodError
        ? error.issues.map((e) => e.message).join(", ")
        : error instanceof Error
        ? error.message
        : "予期しないエラーが発生しました。";
    throw new Error(message);
  }
}
