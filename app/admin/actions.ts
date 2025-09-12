// app/admin/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import { Guest } from "@prisma/client";

/**
 * 新しい招待トークンを作成します。
 * @param inviteeName 招待者の名前
 */
export async function createInvitationToken(inviteeName: string) {
  if (!inviteeName.trim()) {
    throw new Error("招待者名は必須です。");
  }

  try {
    // ユニークなトークンを生成（例：ランダムな文字列）
    const token =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);

    const newInvitation = await prisma.invitationToken.create({
      data: {
        token,
        inviteeName: inviteeName.trim(),
      },
    });

    revalidatePath("/admin"); // 管理者ページのキャッシュを再検証
    return { success: true, invitation: newInvitation };
  } catch (error) {
    console.error("招待トークンの作成に失敗しました:", error);
    return { success: false, message: "トークンの作成に失敗しました。" };
  }
}

/**
 * すべてのゲスト情報を取得します。
 */
export async function getGuests() {
  try {
    const guests = await prisma.guest.findMany({
      include: {
        allergies: {
          include: {
            allergen: true,
          },
        },
        invitationToken: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return guests;
  } catch (error) {
    console.error("ゲスト情報の取得に失敗しました:", error);
    return [];
  }
}

/**
 * ゲストリストをCSV形式でエクスポートします。
 */
export async function exportGuestsToCsv() {
  const guests = await getGuests();

  // CSVヘッダー
  const headers = [
    "姓",
    "名",
    "メールアドレス",
    "電話番号",
    "出欠",
    "招待者名",
    "アレルギー",
    "登録日時",
  ];

  // CSVボディ
  const body = guests
    .map((guest) => {
      const allergies = guest.allergies
        .map((a) => a.allergen.name)
        .join(", ");
      const row = [
        guest.lastName,
        guest.firstName,
        guest.email,
        guest.phone,
        guest.attendance === "ATTEND" ? "出席" : "欠席",
        guest.invitationToken?.inviteeName || "",
        allergies,
        guest.createdAt.toLocaleString("ja-JP"),
      ];
      return row.map((value) => `"${value || ""}"`).join(",");
    })
    .join("\n");

  const csvContent = `${headers.join(",")}\n${body}`;

  return csvContent;
}