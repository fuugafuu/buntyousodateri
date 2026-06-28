import type { NextRequest } from "next/server";
import { z } from "zod";
import { fail, getRequestKey, ok, requireGameUserId } from "@/lib/api";
import { selectBird } from "@/lib/game/store";
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
    return ok(selectBird(userId, body.birdId));
  } catch (error) {
    return fail(error);
  }
}

