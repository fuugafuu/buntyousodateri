"use client";

import { useEffect, useRef, useState } from "react";
import { GOOGLE_CLIENT_ID } from "@/lib/auth/google-config";

type GoogleCredentialResponse = { credential?: string };
type GoogleAccounts = {
  id: {
    initialize: (config: { client_id: string; callback: (response: GoogleCredentialResponse) => void; auto_select?: boolean; cancel_on_tap_outside?: boolean }) => void;
    renderButton: (element: HTMLElement, config: { theme: string; size: string; shape: string; text: string; width: number }) => void;
  };
};

export function GoogleIdentityButton() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const setup = () => {
      const google = (window as typeof window & { google?: { accounts: GoogleAccounts } }).google;
      if (cancelled || !google || !mountRef.current) return;
      mountRef.current.replaceChildren();
      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        auto_select: false,
        cancel_on_tap_outside: true,
        callback: (response) => {
          if (!response.credential) {
            setError("Googleからログイン情報を受け取れませんでした。");
            return;
          }
          setLoading(true);
          setError(null);
          void fetch("/api/auth/google", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ credential: response.credential }),
          }).then(async (result) => {
            const payload = await result.json() as { ok: boolean; message?: string };
            if (!result.ok || !payload.ok) throw new Error(payload.message ?? "Googleログインに失敗しました。");
            window.location.assign("/");
          }).catch((caught) => {
            setError(caught instanceof Error ? caught.message : "Googleログインに失敗しました。");
            setLoading(false);
          });
        },
      });
      google.accounts.id.renderButton(mountRef.current, { theme: "outline", size: "large", shape: "rectangular", text: "signin_with", width: 360 });
    };

    const existing = document.querySelector<HTMLScriptElement>('script[src="https://accounts.google.com/gsi/client"]');
    if (existing) {
      if ((window as typeof window & { google?: unknown }).google) setup();
      else existing.addEventListener("load", setup, { once: true });
    } else {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = setup;
      script.onerror = () => setError("Googleログインを読み込めませんでした。通信状態を確認してください。");
      document.head.appendChild(script);
    }
    return () => { cancelled = true; };
  }, []);

  return (
    <div>
      <div className={loading ? "pointer-events-none opacity-50" : "flex min-h-11 justify-center"} ref={mountRef} />
      {loading ? <p className="mt-2 text-center text-xs font-bold text-[var(--leaf)]">安全にログインしています…</p> : null}
      {error ? <p className="mt-2 text-center text-xs font-bold leading-5 text-[var(--danger)]">{error}</p> : null}
    </div>
  );
}
