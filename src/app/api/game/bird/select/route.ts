import type { NextRequest } from "next/server";
import { z } from "zod";
import { fail, getRequestKey, ok, requireGameUserId } from "@/lib/api";
import { selectBird } from "@/lib/game/store";
import { persistGameState, prepareGameState } from "@/lib/game/persistence";
import { enforceRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const selectSchema = z.object({
  birdId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  try {
    const userId = await requireGameUserId();
    await enforceRateLimit("care", getRequestKey(request, userId));
    const body = selectSchema.parse(await request.json());
    await prepareGameState(userId);
    const state = selectBird(userId, body.birdId);
    await persistGameState(userId, state);
    return ok(state);
  } catch (error) {
    return fail(error);
  }
}

