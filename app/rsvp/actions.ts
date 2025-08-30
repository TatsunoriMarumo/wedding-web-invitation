"use server";

// 必要なら DB クライアントをここで import
// import { prisma } from "@/lib/prisma";

type AllergyItem = { id: string; type: "dog" | "food"; allergen: string };
type Person = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  allergies: AllergyItem[];
  isMainGuest?: boolean;
};
type RsvpPayload = {
  token: string;
  attendance: "attend" | "decline" | "";
  guests: Person[];
};

export async function submitRsvp(formData: FormData): Promise<void> {
  const raw = formData.get("payload");
  if (typeof raw !== "string") {
    console.error("RSVP: Missing payload");
    return;
  }

  let data: RsvpPayload;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    console.error("RSVP: Invalid JSON payload", e);
    return;
  }

  // --- minimum validation ---
  if (!data.token) throw new Error("RSVP: token is required");
  if (!["attend", "decline"].includes(data.attendance))
    throw new Error("RSVP: invalid attendance");
  if (!data.guests?.length) throw new Error("RSVP: guests required");

  const mainGuest = data.guests.find((g) => g.isMainGuest);
  if (!mainGuest) throw new Error("RSVP: main guest missing");

  // --- persist to DB (例) ---
  // await prisma.rsvp.create({ data: { ... } });

  console.log("RSVP received:", {
    token: data.token,
    attendance: data.attendance,
    mainGuest,
    companions: data.guests.filter((g) => !g.isMainGuest),
  });

  // 必要に応じて revalidate / redirect など
  // revalidatePath("/rsvp/success");
  // redirect("/thank-you");
}
