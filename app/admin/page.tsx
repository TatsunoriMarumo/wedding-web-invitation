// app/admin/page.tsx
import { Suspense } from "react";
import { getAdminData } from "./actions";
import { AdminDashboard } from "./components/AdminDashboard";
import { AdminPageSkeleton } from "./components/AdminPageSkeleton";
import { ErrorBoundary } from "react-error-boundary";
import { AdminPageHeader } from "./components/AdminPageHeader"; // 🔽 インポート

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-orange-50">
      <div className="container mx-auto px-4 py-12 sm:py-16">
        <AdminPageHeader /> {/* 🔽 ここにヘッダーコンポーネントを配置 */}
        <ErrorBoundary fallback={<p>🚨 データ取得中にエラーが発生しました。</p>}>
          <Suspense fallback={<AdminPageSkeleton />}>
            <AdminDataResolver />
          </Suspense>
        </ErrorBoundary>
      </div>
    </div>
  );
}

async function AdminDataResolver() {
  const { tokens, guests, error } = await getAdminData();

  if (error) {
    throw new Error(error);
  }

  return <AdminDashboard initialTokens={tokens} initialGuests={guests} />;
}