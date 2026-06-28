import { NextResponse, type NextRequest } from "next/server";
import { ZodError } from "zod";
import { auth, shouldUseDemoAuthFallback } from "@/auth";

type GameSession = {
  user?: {
    id?: string | null;
    email?: string | null;
  };
} | null;

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function requireGameUserId() {
  if (shouldUseDemoAuthFallback()) {
    return "demo-user";
  }

  let session: GameSession;
  try {
    session = await auth();
  } catch {
    throw new ApiError(500, "認証設定が未完了です。AUTH_SECRET とログインプロバイダー設定を確認してください。");
  }

  const sessionId = session?.user?.id ?? session?.user?.email;

  if (sessionId) {
    return `auth:${sessionId}`;
  }

  if (process.env.NODE_ENV !== "production" && process.env.ALLOW_DEMO_AUTH !== "false") {
    return "demo-user";
  }

  throw new ApiError(401, "ログインが必要です。");
}

export function getRequestKey(request: NextRequest, userId: string) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = request.headers.get("x-real-ip")?.trim();
  return `${userId}:${forwarded ?? realIp ?? "local"}`;
}

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json({ ok: true, data }, init);
}

export function fail(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json({ ok: false, message: error.message }, { status: error.status });
  }

  if (error instanceof ZodError) {
    return NextResponse.json({ ok: false, message: "入力値が不正です。" }, { status: 400 });
  }

  if (error instanceof Error) {
    return NextResponse.json({ ok: false, message: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: false, message: "処理に失敗しました。" }, { status: 500 });
}
