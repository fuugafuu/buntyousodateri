import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { GOOGLE_SESSION_COOKIE } from "@/lib/auth/google-config";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.set(GOOGLE_SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return response;
}
