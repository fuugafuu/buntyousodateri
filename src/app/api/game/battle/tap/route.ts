import type { NextRequest } from "next/server";
import { z } from "zod";
import { fail, getRequestKey, ok, requireGameUserId } from "@/lib/api";
import { submitBattleTaps } from "@/lib/game/store";
import { persistGameState, prepareGameState } from "@/lib/game/persistence";
import { enforceRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const tapSchema = z.object({
  roomId: z.string().uuid(),
  delta: z.number().int().min(0).max(40),
  seq: z.number().int().min(1).max(100_000),
});

export async function POST(request: NextRequest) {
  try {
    const userId = await requireGameUserId();
    await enforceRateLimit("battleTap", getRequestKey(request, userId));
    const body = tapSchema.parse(await request.json());
    await prepareGameState(userId);
    const result = submitBattleTaps(userId, body.roomId, body.delta, body.seq);
    await persistGameState(userId, result.state);
    return ok(result);
  } catch (error) {
    return fail(error);
  }
}

