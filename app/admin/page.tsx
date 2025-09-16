// app/admin/page.tsx
import { Suspense } from "react";
import { getAdminData } from "./actions";
import { AdminDashboard } from "./components/AdminDashboard";
import { AdminPageSkeleton } from "./components/AdminPageSkeleton";
import { ErrorBoundary } from "react-error-boundary";
import { AdminPageHeader } from "./components/AdminPageHeader";

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-orange-50">
      <div className="container mx-auto px-4 py-12 sm:py-16">
        <AdminPageHeader />
        <ErrorBoundary fallback={<p>🚨 データ取得中にエラーが発生しました。</p>}>
          <Suspense fallback={<AdminPageSkeleton />}>
            <AdminDataResolver />
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
}

// Async Server Component
async function AdminDataResolver() {
  const res = await getAdminData();

  // 失敗オブジェクト: { error: string }
  if ("error" in res) {
    throw new Error(res.error ?? "Failed to load admin data");
  }

  // 成功オブジェクト: { tokens: InviteToken[]; guests: Guest[] }
  // "in" でナローイング済みなので tokens/guests は確実に配列
  const { tokens, guests } = res;

  return (
    <AdminDashboard
      initialTokens={tokens}
      initialGuests={guests}
    />
  );
}
