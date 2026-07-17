import type { NextRequest } from "next/server";
import { z } from "zod";
import { fail, getRequestKey, ok, requireGameUserId } from "@/lib/api";
import { enforceRateLimit } from "@/lib/rate-limit";
import { sendGift } from "@/lib/social/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const schema = z.object({
  friendPlayerId: z.string().min(6).max(24),
  itemCode: z.string().min(1).max(64),
  quantity: z.number().int().min(1).max(9),
});

export async function POST(request: NextRequest) {
  try {
    const userId = await requireGameUserId();
    await enforceRateLimit("item", getRequestKey(request, userId));
    const body = schema.parse(await request.json());
    return ok(await sendGift(userId, body.friendPlayerId, body.itemCode, body.quantity));
  } catch (error) {
    return fail(error);
  }
}
