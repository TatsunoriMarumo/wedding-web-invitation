// app/components/RsvpGate.tsx
import { verifyInviteToken } from "@/app/rsvp/verify";
import RsvpSection from "./RsvpSection"; // ← クライアント側フォームラッパ
import ThankYouCard from "./ThankYouCard"; // ← 使用済み表示
import RsvpInvalidCard from "./RsvpInvalidCard"; // ← 無効/未指定表示

export default async function RsvpGate({ token }: { token?: string | null }) {
  const result = await verifyInviteToken(token ?? null);

  if (!result.ok) {
    if (result.reason === "USED") {
      return <ThankYouCard inviteeName={result.inviteeName ?? undefined} />;
    }
    // NOT_FOUND / NOT_PROVIDED
    return <RsvpInvalidCard variant={result.reason === "NOT_FOUND" ? "notFound" : "missing"} />;
  }

  return <RsvpSection token={token as string} inviteeName={result.inviteeName ?? undefined} />;
}
