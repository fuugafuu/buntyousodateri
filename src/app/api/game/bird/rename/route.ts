import type { NextRequest } from "next/server";
import { z } from "zod";
import { fail, getRequestKey, ok, requireGameUserId } from "@/lib/api";
import { renameBird } from "@/lib/game/store";
import { enforceRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const renameSchema = z.object({
  birdId: z.string().uuid(),
  nickname: z.string().min(1).max(16),
});

export async function POST(request: NextRequest) {
  try {
    const userId = await requireGameUserId();
    await enforceRateLimit("care", getRequestKey(request, userId));
    const body = renameSchema.parse(await request.json());
    return ok(renameBird(userId, body.birdId, body.nickname));
  } catch (error) {
    return fail(error);
  }
}

