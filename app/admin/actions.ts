// app/admin/actions.ts
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { unstable_noStore as noStore } from "next/cache";

// 招待トークンとゲスト情報を取得するAction
export async function getAdminData() {
  noStore(); // 動的なデータ取得のためキャッシュを無効化
  try {
    const tokens = await prisma.invitationToken.findMany({
      orderBy: { createdAt: "desc" },
    });
    const guests = await prisma.guest.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        allergies: {
          include: {
            allergen: true,
          },
        },
      },
    });
    return { tokens, guests };
  } catch (error) {
    console.error("データの取得に失敗しました:", error);
    return { error: "データの取得に失敗しました。" };
  }
}

// 招待トークンを作成するAction
export async function createInvitationToken(
  prevState: any,
  formData: FormData
) {
  const schema = z.object({
    inviteeName: z.string().min(1, "招待者名は必須です"),
  });

  const validatedFields = schema.safeParse({
    inviteeName: formData.get("inviteeName"),
  });

  if (!validatedFields.success) {
    return {
      message: validatedFields.error.flatten().fieldErrors.inviteeName?.[0],
    };
  }

  try {
    const { inviteeName } = validatedFields.data;
    const token = `inv_${Math.random().toString(36).substring(2, 15)}`;

    const newToken = await prisma.invitationToken.create({
      data: {
        token,
        inviteeName,
      },
    });

    revalidatePath("/admin"); // 管理者ページのキャッシュをクリア
    return { token: newToken.token, message: "success" };
  } catch (error) {
    return { message: "トークンの作成に失敗しました。" };
  }
}