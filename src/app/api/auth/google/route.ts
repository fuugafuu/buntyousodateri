import type { NextRequest } from "next/server";
import { z } from "zod";
import { fail, ok } from "@/lib/api";
import { GOOGLE_SESSION_COOKIE } from "@/lib/auth/google-config";
import { verifyGoogleCredential } from "@/lib/auth/google-session";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const schema = z.object({ credential: z.string().min(100).max(10_000) });

export async function POST(request: NextRequest) {
  try {
    const body = schema.parse(await request.json());
    const user = await verifyGoogleCredential(body.credential);
    const response = ok({ name: user.name ?? user.email ?? "Googleユーザー" });
    response.cookies.set(GOOGLE_SESSION_COOKIE, body.credential, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: new Date(user.expiresAt),
    });
    return response;
  } catch (error) {
    return fail(error);
  }
}
