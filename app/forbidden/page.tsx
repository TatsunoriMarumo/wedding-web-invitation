// app/forbidden/page.tsx
import { auth } from "@/auth";
import { signOutToSignin } from "../admin/actions";

export default async function ForbiddenPage() {
  const session = await auth();
  const email = session?.user?.email ?? null;

  return (
    <main
      className="min-h-svh grid place-items-center p-6 bg-background
                 [background:radial-gradient(900px_420px_at_50%_-160px,theme(colors.accent/0.18),transparent_70%)]
                 [background-position:center_top]"
    >
      <div className="w-full max-w-md bg-card text-card-foreground rounded-2xl border border-border shadow-xl p-8 animate-fade-in-up">
        {/* ヘッダー */}
        <div className="flex items-start gap-3">
          <div className="flex-1">
            <h1 className="text-xl font-semibold leading-tight">アクセスが拒否されました</h1>
            <p className="text-sm text-muted-foreground mt-1">
              管理者に許可されたアカウントでのみ閲覧できます。
            </p>
          </div>
        </div>

        {/* 現在のログインアカウント */}
        {email && (
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">現在のアカウント</p>
            <div className="mt-1 inline-flex items-center rounded-lg border border-input bg-secondary px-3 py-1.5 font-mono text-[13px]">
              {email}
            </div>
          </div>
        )}

        {/* アクション（サインアウトのみ） */}
        <form action={signOutToSignin} className="mt-6">
          <button
            type="submit"
            className="w-full h-11 inline-flex items-center justify-center rounded-xl 
                       bg-primary text-primary-foreground hover:opacity-95 transition-opacity focus-ring"
          >
            サインアウトしてサインイン画面へ
          </button>
        </form>
      </div>
    </main>
  );
}
