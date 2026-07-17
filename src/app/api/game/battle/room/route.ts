import type { NextRequest } from "next/server";
import { z } from "zod";
import { fail, getRequestKey, ok, requireGameUserId } from "@/lib/api";
import { createBattleRoom } from "@/lib/game/store";
import { persistGameState, prepareGameState } from "@/lib/game/persistence";
import { enforceRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const roomSchema = z.object({
  mode: z.enum(["online", "offline"]),
});

export async function POST(request: NextRequest) {
  try {
    const userId = await requireGameUserId();
    await enforceRateLimit("battleJoin", getRequestKey(request, userId));
    const body = roomSchema.parse(await request.json());
    await prepareGameState(userId);
    const result = createBattleRoom(userId, body.mode);
    await persistGameState(userId, result.state);
    return ok(result);
  } catch (error) {
    return fail(error);
  }
}

