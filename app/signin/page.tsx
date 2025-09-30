// app/(auth)/signin/page.tsx
import { auth, signIn } from "@/auth";
import { redirect } from "next/navigation";

export default async function SignInPage() {
  // 既にログイン済みなら /admin or /forbidden に即リダイレクト
  const session = await auth();
  if (session) {
    const isAdmin = (session.user as any)?.isAdmin === true;
    redirect(isAdmin ? "/admin" : "/forbidden");
  }

  return (
    <main className="min-h-svh grid place-items-center p-6 bg-background 
      [background:radial-gradient(1200px_600px_at_50%_-200px,theme(colors.primary/0.08),transparent_70%)]
      [background-position:center_top]">
      <div className="w-full max-w-md bg-card text-card-foreground rounded-2xl border border-border shadow-xl p-8 animate-fade-in-up">
        {/* ヘッダー */}
        <div className="flex items-center gap-3 mb-6">
          <div>
            <h1 className="text-xl font-semibold leading-tight">Google でログイン</h1>
            <p className="text-sm text-muted-foreground">管理画面にアクセスするには Google アカウントでサインインしてください。</p>
          </div>
        </div>

        {/* サインイン フォーム */}
        <form
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: "/admin" });
          }}
          className="space-y-4"
        >
          <button
            type="submit"
            className="w-full h-11 inline-flex items-center justify-center gap-3 rounded-xl border border-input bg-card 
                       hover:bg-muted transition-shadow shadow-sm hover:shadow-md focus-ring"
            aria-label="Sign in with Google"
          >
            {/* 小さめのGアイコン（白背景でも視認性OK） */}
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.6 29.3 36 24 36c-6.6 0-12-5.4-12-12S17.4 12 24 12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c10 0 19-7.3 19-20 0-1.2-.1-2.3-.4-3.5z"/>
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.8 16.1 19 12 24 12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.2 6.1 29.4 4 24 4 16 4 9 8.6 6.3 14.7z"/>
              <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.5-5.2l-6.2-5.2C29.3 36 26.8 37 24 37c-5.2 0-9.6-3.4-11.2-8.1l-6.5 5C8.9 39.4 15.9 44 24 44z"/>
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.1-3.6 5.5-6.9 6.6l6.2 5.2C37 37.7 40 32.6 40 26c0-1.9-.3-3.7-.9-5.5z"/>
            </svg>
            <span className="text-sm font-medium">Sign in with Google</span>
          </button>
          <p className="text-xs text-muted-foreground text-center">
            続行すると、サービスの利用規約とプライバシーポリシーに同意したものとみなされます。
          </p>
        </form>
      </div>
    </main>
  );
}
