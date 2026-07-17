import type { NextRequest } from "next/server";
import { z } from "zod";
import { fail, getRequestKey, ok, requireGameUserId } from "@/lib/api";
import { useItem as consumeItem } from "@/lib/game/store";
import { persistGameState, prepareGameState } from "@/lib/game/persistence";
import { enforceRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const useItemSchema = z.object({
  itemCode: z.string().min(1).max(64),
  birdId: z.string().uuid().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const userId = await requireGameUserId();
    await enforceRateLimit("item", getRequestKey(request, userId));
    const body = useItemSchema.parse(await request.json());
    await prepareGameState(userId);
    const state = consumeItem(userId, body.itemCode, body.birdId);
    await persistGameState(userId, state);
    return ok(state);
  } catch (error) {
    return fail(error);
  }
}
