import type { NextRequest } from "next/server";
import { z } from "zod";
import { fail, getRequestKey, ok, requireGameUserId } from "@/lib/api";
import { finalizeBattle } from "@/lib/game/store";
import { enforceRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const finalizeSchema = z.object({
  roomId: z.string().uuid(),
});

export async function POST(request: NextRequest) {
  try {
    const userId = await requireGameUserId();
    await enforceRateLimit("battleJoin", getRequestKey(request, userId));
    const body = finalizeSchema.parse(await request.json());
    return ok(finalizeBattle(userId, body.roomId));
  } catch (error) {
    return fail(error);
  }
}

