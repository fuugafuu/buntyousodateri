import type { NextRequest } from "next/server";
import { z } from "zod";
import { fail, getRequestKey, ok, requireGameUserId } from "@/lib/api";
import { enforceRateLimit } from "@/lib/rate-limit";
import { claimGift } from "@/lib/social/store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const schema = z.object({ giftId: z.string().uuid() });

export async function POST(request: NextRequest) {
  try {
    const userId = await requireGameUserId();
    await enforceRateLimit("item", getRequestKey(request, userId));
    const body = schema.parse(await request.json());
    return ok(await claimGift(userId, body.giftId));
  } catch (error) {
    return fail(error);
  }
}
