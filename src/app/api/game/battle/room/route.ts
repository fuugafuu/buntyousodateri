import type { NextRequest } from "next/server";
import { z } from "zod";
import { fail, getRequestKey, ok, requireGameUserId } from "@/lib/api";
import { createBattleRoom } from "@/lib/game/store";
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
    return ok(createBattleRoom(userId, body.mode));
  } catch (error) {
    return fail(error);
  }
}

