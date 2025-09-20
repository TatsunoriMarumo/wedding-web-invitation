// lib/types.ts
export interface InviteToken {
  id: number;
  token: string;
  inviteeName: string;
  isUsed: boolean;
  usedAt?: string | null;
  createdAt: string;
}

export interface Guest {
  id: number;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  attendance: "ATTEND" | "DECLINE";
  invitationTokenId?: number | null;
  createdAt: string;
  allergies: Array<{
    allergen: {
      category: "DOG" | "FOOD";
      name: string;
    };
  }>;
}