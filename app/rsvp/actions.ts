// app/rsvp/actions.ts
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { AllergenCategory, AttendanceStatus } from "@prisma/client";

/* ===========================
 * Zod schemas (payload from <RsvpForm />)
 * =========================== */
const allergyItemSchema = z.object({
  type: z.enum(["dog", "food"]),
  allergen: z.string().trim().min(1),
});

const personSchema = z.object({
  lastName: z.string().trim().min(1),
  firstName: z.string().trim().min(1),
  email: z
    .string()
    .trim()
    .email()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : null)),
  phone: z
    .string()
    .trim()
    .optional()
    .or(z.literal(""))
    .transform((v) => (v ? v : null)),
  birthDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD (UTCで保存)
  allergies: z.array(allergyItemSchema),
});

const payloadSchema = z.object({
  token: z.string().min(1),
  attendance: z.enum(["attend", "decline"]),
  guests: z.array(personSchema).min(1),
});

/* ===========================
 * Helpers
 * =========================== */
const toUTCDate = (isoYYYYMMDD: string) =>
  new Date(isoYYYYMMDD + "T00:00:00.000Z");

async function findOrCreateAllergen(
  category: AllergenCategory,
  nameRaw: string
) {
  const name = nameRaw.trim();
  const found = await prisma.allergen.findFirst({
    where: { category, name },
    select: { id: true },
  });
  if (found) return found.id;

  const created = await prisma.allergen.create({
    data: { category, name },
    select: { id: true },
  });
  return created.id;
}

/* ===========================
 * Main Server Action
 * =========================== */
export async function submitRsvp(formData: FormData) {
  // 1) Parse + validate payload
  const raw = formData.get("payload");
  if (typeof raw !== "string") {
    throw new Error("Invalid form payload.");
  }
  const parsed = payloadSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) {
    // フロントに詳細を返したい場合はここで整形して返す
    throw new Error("Validation failed.");
  }
  const { token, attendance, guests } = parsed.data;

  // 2) Token checks (RESUBMIT不可)
  const tok = await prisma.invitationToken.findUnique({
    where: { token },
    select: { id: true, isUsed: true }, // schema に usedAt がある場合は適宜 select 追加可
  });
  if (!tok) {
    throw new Error("Invalid invitation token.");
  }
  if (tok.isUsed) {
    throw new Error("This invitation link has already been used.");
  }

  // 3) Persist (single transaction)
  await prisma.$transaction(async (tx) => {
    // 3-1) Mark token used first (single-use guarantee)
    await tx.invitationToken.update({
      where: { id: tok.id },
      data: { isUsed: true },
    });

    // 3-2) Create guests
    const isAttend = attendance === "attend";

    for (const p of guests) {
      const g = await tx.guest.create({
        data: {
          lastName: p.lastName,
          firstName: p.firstName,
          email: p.email,
          phone: p.phone,
          birthDate: toUTCDate(p.birthDate),
          attendance: isAttend
            ? AttendanceStatus.ATTEND
            : AttendanceStatus.DECLINE,
          invitationToken: { connect: { id: tok.id } },
        },
        select: { id: true },
      });

      // 3-3) Allergies only when attending (フォーム仕様的にも出席時のみ入力)
      if (isAttend && p.allergies.length > 0) {
        // split dog / food
        const dog = p.allergies.find((a) => a.type === "dog");
        const foods = p.allergies.filter((a) => a.type === "food");

        // dog allergy
        if (dog) {
          const allergenId = await findOrCreateAllergen(
            AllergenCategory.DOG,
            dog.allergen || "犬"
          );
          await tx.guestAllergy.create({
            data: { guestId: g.id, allergenId },
          });
        }

        // food allergies (dedup by name)
        const uniqueFoodNames = Array.from(
          new Set(foods.map((f) => f.allergen.trim()).filter(Boolean))
        );
        if (uniqueFoodNames.length > 0) {
          for (const name of uniqueFoodNames) {
            const allergenId = await findOrCreateAllergen(
              AllergenCategory.FOOD,
              name
            );
            await tx.guestAllergy.create({
              data: { guestId: g.id, allergenId },
            });
          }
        }
      }
    }
  });

  // 4) Revalidate only (no redirect)
  revalidatePath("/");      // トップ
  revalidatePath("/admin"); // 管理画面

  // 5) (任意) 成功オブジェクトを返す — フロントでトースト等に利用可
  return { success: true };
}
