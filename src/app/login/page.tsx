import Link from "next/link";
import Image from "next/image";

const appleEnabled = process.env.NEXT_PUBLIC_ENABLE_APPLE === "true";
const googleEnabled = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);
const lineEnabled = Boolean(process.env.AUTH_LINE_ID && process.env.AUTH_LINE_SECRET);

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[var(--background)] px-4 py-6 text-[var(--foreground)]">
      <section className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-[460px] flex-col overflow-hidden border border-[var(--line)] bg-[var(--panel)] shadow-sm">
        <div className="relative min-h-[260px] border-b border-[var(--line)]">
          <Image
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
            fill
            priority
            sizes="(max-width: 520px) 100vw, 460px"
            src="/images/ui/home-room.svg"
            unoptimized
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#17211c]/72 via-[#17211c]/22 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <p className="text-sm font-semibold">小松菜高速食べバトル</p>
            <h1 className="mt-1 text-4xl font-bold leading-tight">文鳥育成シュミレーター</h1>
          </div>
        </div>

        <div className="flex flex-1 flex-col gap-4 p-6">
          {googleEnabled ? (
            <Link
              href="/api/auth/signin/google"
              className="flex h-12 items-center justify-center gap-3 border border-[#dadce0] bg-white px-4 text-sm font-semibold text-[#3c4043] transition hover:bg-[#f8fafd]"
            >
              <span className="grid h-5 w-5 place-items-center rounded-full border border-[#dadce0] text-xs font-bold">
                G
              </span>
              Googleでログイン
            </Link>
          ) : (
            <DisabledLoginButton label="Googleログイン未設定" mark="G" />
          )}
          {lineEnabled ? (
            <Link
              href="/api/auth/signin/line"
              className="flex h-12 items-center justify-center gap-3 bg-[#06c755] px-4 text-sm font-semibold text-white transition hover:bg-[#05b64d]"
            >
              <span className="grid h-5 w-5 place-items-center rounded-sm bg-white text-xs font-bold text-[#06c755]">
                L
              </span>
              LINEでログイン
            </Link>
          ) : (
            <DisabledLoginButton label="LINEログイン未設定" mark="L" />
          )}
          {appleEnabled ? (
            <Link
              href="/api/auth/signin/apple"
              className="flex h-12 items-center justify-center gap-3 bg-black px-4 text-sm font-semibold text-white transition hover:bg-[#202020]"
            >
              <span className="text-base">Apple</span>
              Appleでログイン
            </Link>
          ) : null}
          <Link
            href="/"
            className="mt-2 flex h-12 items-center justify-center border border-[var(--leaf)] bg-[var(--leaf)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--leaf-dark)]"
          >
            デモで始める
          </Link>
          <p className="text-sm leading-6 text-[var(--muted)]">
            ローカルでは外部認証なしのデモで遊べます。本番ではAuth.jsのセッションを使ってAPI更新を保護します。
          </p>
        </div>
      </section>
    </main>
  );
}

function DisabledLoginButton({ label, mark }: { label: string; mark: string }) {
  return (
    <button
      className="flex h-12 cursor-not-allowed items-center justify-center gap-3 border border-[var(--line)] bg-[#f1f5f2] px-4 text-sm font-semibold text-[var(--muted)]"
      disabled
      type="button"
    >
      <span className="grid h-5 w-5 place-items-center border border-[var(--line)] bg-white text-xs font-bold">
        {mark}
      </span>
      {label}
    </button>
  );
}
