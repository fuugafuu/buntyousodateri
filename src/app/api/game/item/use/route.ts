import type { NextRequest } from "next/server";
import { z } from "zod";
import { fail, getRequestKey, ok, requireGameUserId } from "@/lib/api";
import { useItem as consumeItem } from "@/lib/game/store";
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
    return ok(consumeItem(userId, body.itemCode, body.birdId));
  } catch (error) {
    return fail(error);
  }
}
