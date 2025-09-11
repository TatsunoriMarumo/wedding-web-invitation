// app/rsvp/actions.ts
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { AllergenCategory, AttendanceStatus } from "@prisma/client";

// 再送信（上書き）を許可：開発時は true、本番で一度きりなら false
const ALLOW_RESUBMIT = true;

/* ===========================
 * Zod Schemas
 * =========================== */
const allergyItemSchema = z.object({
  type: z.enum(["dog", "food"]),
  allergen: z.string().trim().min(1, "アレルギー名は必須です"),
});

const personSchema = z.object({
  firstName: z.string().trim().min(1, "姓は必須です"),
  lastName: z.string().trim().min(1, "名は必須です"),
  email: z.string().email("無効なメールアドレスです").optional().or(z.literal("")),
  phone: z.string().trim().optional().or(z.literal("")),
  allergies: z.array(allergyItemSchema),
});

const payloadSchema = z
  .object({
    token: z.string().min(1, "招待トークンは必須です"),
    attendance: z.enum(["attend", "decline"]),
    guests: z.array(personSchema).min(1, "最低1名のゲスト情報が必要です"),
  })
  .refine(
    (data) => {
      const mainGuest = data.guests[0];
      return !!(mainGuest?.email && mainGuest.phone && mainGuest.phone.length > 0);
    },
    { message: "代表者には有効なメールアドレスと電話番号が必須です", path: ["guests", "0"] }
  );

/* ===========================
 * Helpers
 * =========================== */
const norm = (s?: string | null) => (s && s.trim() ? s.trim() : null);
const toAttendance = (v: "attend" | "decline"): AttendanceStatus =>
  v === "attend" ? AttendanceStatus.ATTEND : AttendanceStatus.DECLINE;
const toCategory = (t: "dog" | "food"): AllergenCategory =>
  t === "dog" ? AllergenCategory.DOG : AllergenCategory.FOOD;

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
      if (!ALLOW_RESUBMIT && invitationToken.isUsed) throw new Error("この招待は既に使用されています。");

      // decline のときは代表者のみ登録
      const guestsToProcess = attendance === "decline" ? [guestData[0]] : guestData;

      // 2.2) 再送信可なら既存ゲストを削除（上書き）
      if (ALLOW_RESUBMIT && invitationToken.isUsed) {
        await tx.guest.deleteMany({ where: { invitationTokenId: invitationToken.id } });
      }

      // 2.3) 出席者のみアレルゲンを事前 upsert（カテゴリ＋名前で一意）
      const allergenIdByKey = new Map<string, number>(); // key = `${category}:${name}`
      if (attendanceStatus === AttendanceStatus.ATTEND) {
        const unique = new Map<string, { category: AllergenCategory; name: string }>();
        for (const g of guestsToProcess) {
          for (const a of g.allergies) {
            const category = toCategory(a.type);
            const name = a.allergen.trim();
            if (!name) continue;
            const key = `${category}:${name}`;
            if (!unique.has(key)) unique.set(key, { category, name });
          }
        }

        for (const { category, name } of unique.values()) {
          const rec = await tx.allergen.upsert({
            // ※ Allergen に @@unique([category, name], name: "category_name") が必要
            where: { category_name: { category, name } },
            update: {},
            create: { category, name },
            select: { id: true },
          });
          allergenIdByKey.set(`${category}:${name}`, rec.id);
        }
      }

      // 2.4) ゲスト作成 & アレルギー紐付け（重複耐性あり）
      for (const guest of guestsToProcess) {
        const created = await tx.guest.create({
          data: {
            firstName: guest.firstName,
            lastName: guest.lastName,
            email: norm(guest.email),
            phone: norm(guest.phone),
            attendance: attendanceStatus,
            invitationTokenId: invitationToken.id,
          },
          select: { id: true },
        });

        if (attendanceStatus === AttendanceStatus.ATTEND && guest.allergies.length) {
          // ゲスト内の重複を除去 → createMany + skipDuplicates
          const pairs = new Set<string>(); // `${guestId}:${allergenId}`
          for (const a of guest.allergies) {
            const category = toCategory(a.type);
            const name = a.allergen.trim();
            if (!name) continue;
            const key = `${category}:${name}`;
            const allergenId = allergenIdByKey.get(key);
            if (allergenId) pairs.add(`${created.id}:${allergenId}`);
          }

          if (pairs.size) {
            await tx.guestAllergy.createMany({
              data: Array.from(pairs).map((k) => {
                const [guestIdStr, allergenIdStr] = k.split(":");
                return { guestId: Number(guestIdStr), allergenId: Number(allergenIdStr) };
              }),
              // GuestAllergy に @@id([guestId, allergenId]) or @@unique([guestId, allergenId]) があるとさらに安全
              skipDuplicates: true,
            });
          }
        }
      }

      // 2.5) トークンを使用済みに更新（競合耐性）
      const upd = await tx.invitationToken.updateMany({
        where: { id: invitationToken.id, isUsed: false },
        data: { isUsed: true, usedAt: new Date() },
      });

      // 再送信不可モードでは競合検知
      if (!ALLOW_RESUBMIT && upd.count === 0) {
        throw new Error("この招待は直前に他の処理で使用されました。ページを更新して再度お試しください。");
      }

      // 再送信可で既に使用済みなら usedAt のみ更新
      if (ALLOW_RESUBMIT && invitationToken.isUsed) {
        await tx.invitationToken.update({
          where: { id: invitationToken.id },
          data: { usedAt: new Date() },
        });
      }
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
