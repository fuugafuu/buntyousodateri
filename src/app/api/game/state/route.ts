import type { NextRequest } from "next/server";
import { fail, getRequestKey, ok, requireGameUserId } from "@/lib/api";
import { getGameState } from "@/lib/game/store";
import { enforceRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const userId = await requireGameUserId();
    await enforceRateLimit("state", getRequestKey(request, userId));
    return ok(getGameState(userId));
  } catch (error) {
    return fail(error);
  }
}

