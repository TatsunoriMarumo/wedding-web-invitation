// app/rsvp/actions.ts
'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import { AttendanceStatus, AllergenCategory } from '@prisma/client';

// 再送信（上書き）を許可するか：開発時は true が便利。本番で一度きりにしたいなら false。
const ALLOW_RESUBMIT = true;

/* ===========================
 * Zod Schemas
 * =========================== */
const allergyItemSchema = z.object({
  type: z.enum(['dog', 'food']),
  allergen: z.string().trim().min(1, 'Allergen name cannot be empty.'),
});

const personSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required.'),
  lastName: z.string().trim().min(1, 'Last name is required.'),
  email: z.string().email('Invalid email address.').optional().or(z.literal('')),
  phone: z.string().trim().optional().or(z.literal('')),
  allergies: z.array(allergyItemSchema),
});

const payloadSchema = z
  .object({
    token: z.string().min(1, 'Invitation token is missing.'),
    attendance: z.enum(['attend', 'decline']),
    guests: z.array(personSchema).min(1, 'At least one guest is required.'),
  })
  .refine(
    (data) => {
      const main = data.guests[0];
      return !!(main?.email && main?.phone && main.phone.length > 0);
    },
    {
      message: 'A valid email and phone number are required for the main guest.',
      path: ['guests', '0'],
    }
  );

/* ===========================
 * Helpers
 * =========================== */
const norm = (s?: string | null) => (s && s.trim() ? s.trim() : null);

/* ===========================
 * Action
 * =========================== */
export async function submitRsvp(formData: FormData) {
  try {
    // 1) 取り出し & Zod検証
    const payloadJson = formData.get('payload');
    if (typeof payloadJson !== 'string') {
      throw new Error('Invalid form submission: Payload is missing.');
    }
    const { token, attendance, guests: guestData } = payloadSchema.parse(JSON.parse(payloadJson));

    // 2) Transaction（原子性）
    await prisma.$transaction(async (tx) => {
      // 2.1) トークン検証
      const tokenRow = await tx.invitationToken.findUnique({ where: { token } });
      if (!tokenRow) throw new Error('This invitation is not valid. Please check your URL.');

      if (!ALLOW_RESUBMIT && tokenRow.isUsed) {
        throw new Error('This invitation has already been used to RSVP.');
      }

      const guestsToProcess = attendance === 'decline' ? [guestData[0]] : guestData;
      const attendanceStatus =
        attendance === 'attend' ? AttendanceStatus.ATTEND : AttendanceStatus.DECLINE;

      // 2.2) 再送信OKなら既存ゲストを削除（上書き運用）
      if (ALLOW_RESUBMIT) {
        await tx.guest.deleteMany({ where: { invitationTokenId: tokenRow.id } });
      }

      // 2.3) アレルゲンの事前用意（出席者のみ）
      const allergenIdByKey = new Map<string, number>();
      if (attendanceStatus === AttendanceStatus.ATTEND) {
        // KEY を "CATEGORY:NAME" にしてカテゴリ違いの同名も区別
        const uniqueAllergens = new Map<string, { category: AllergenCategory; name: string }>();
        for (const g of guestsToProcess) {
          for (const a of g.allergies) {
            const category = a.type === 'dog' ? AllergenCategory.DOG : AllergenCategory.FOOD;
            const name = a.allergen.trim();
            if (!name) continue;
            const key = `${category}:${name}`;
            if (!uniqueAllergens.has(key)) uniqueAllergens.set(key, { category, name });
          }
        }

        // upsert で競合に強く（Allergen に @@unique([category, name], name: "category_name") が必要）
        for (const { category, name } of uniqueAllergens.values()) {
          const rec = await tx.allergen.upsert({
            where: { category_name: { category, name } },
            update: {},
            create: { category, name },
            select: { id: true },
          });
          allergenIdByKey.set(`${category}:${name}`, rec.id);
        }
      }

      // 2.4) ゲスト作成 & アレルギー紐づけ
      for (const g of guestsToProcess) {
        const created = await tx.guest.create({
          data: {
            firstName: g.firstName,
            lastName: g.lastName,
            email: norm(g.email),
            phone: norm(g.phone),
            attendance: attendanceStatus,
            invitationTokenId: tokenRow.id,
          },
          select: { id: true },
        });

        // 出席者のみアレルギー付与
        if (attendanceStatus === AttendanceStatus.ATTEND && g.allergies.length) {
          // 1ゲスト内の重複を排除
          const pairs = new Set<string>();
          for (const a of g.allergies) {
            const category = a.type === 'dog' ? AllergenCategory.DOG : AllergenCategory.FOOD;
            const name = a.allergen.trim();
            if (!name) continue;
            const key = `${category}:${name}`;
            const allergenId = allergenIdByKey.get(key);
            if (!allergenId) continue;
            pairs.add(`${created.id}:${allergenId}`);
          }

          if (pairs.size) {
            await tx.guestAllergy.createMany({
              data: Array.from(pairs).map((k) => {
                const [guestIdStr, allergenIdStr] = k.split(':');
                return { guestId: Number(guestIdStr), allergenId: Number(allergenIdStr) };
              }),
              // GuestAllergy に @@id([guestId, allergenId]) or @@unique([guestId, allergenId]) があると更に安全
              skipDuplicates: true,
            });
          }
        }
      }

      // 2.5) トークンを使用済みに（再送時は usedAt を更新）
      await tx.invitationToken.update({
        where: { id: tokenRow.id },
        data: { isUsed: true, usedAt: new Date() },
      });
    });

    // 3) 成功：キャッシュ無効化 & リダイレクト
    revalidatePath('/admin/guests');
    redirect('/thank-you');
  } catch (error) {
    console.error('RSVP Submission Failed:', error);
    const message =
      error instanceof Error ? error.message : 'An unexpected error occurred. Please try again later.';
    // Next.js のエラーページへ
    throw new Error(message);
  }
}
