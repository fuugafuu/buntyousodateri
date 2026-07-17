import "server-only";

import { cookies } from "next/headers";
import { OAuth2Client } from "google-auth-library";
import { GOOGLE_CLIENT_ID, GOOGLE_SESSION_COOKIE } from "@/lib/auth/google-config";

const client = new OAuth2Client(GOOGLE_CLIENT_ID);
const verifiedTokens = new Map<string, { id: string; email?: string; name?: string; expiresAt: number }>();

export async function verifyGoogleCredential(credential: string) {
  const cached = verifiedTokens.get(credential);
  if (cached && cached.expiresAt > Date.now() + 30_000) return cached;

  const ticket = await client.verifyIdToken({ idToken: credential, audience: GOOGLE_CLIENT_ID });
  const payload = ticket.getPayload();
  if (!payload?.sub || !payload.exp) throw new Error("Googleログイン情報を確認できませんでした。");
  const user = {
    id: payload.sub,
    email: payload.email,
    name: payload.name,
    expiresAt: payload.exp * 1000,
  };
  verifiedTokens.set(credential, user);
  return user;
}

export async function getGoogleSessionUser() {
  const credential = (await cookies()).get(GOOGLE_SESSION_COOKIE)?.value;
  if (!credential) return null;
  try {
    return await verifyGoogleCredential(credential);
  } catch {
    return null;
  }
}
