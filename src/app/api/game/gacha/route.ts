import type { NextRequest } from "next/server";
import { z } from "zod";
import { fail, getRequestKey, ok, requireGameUserId } from "@/lib/api";
import { performGacha } from "@/lib/game/store";
import { enforceRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const gachaSchema = z.object({
  pulls: z.union([z.literal(1), z.literal(10)]),
});

export async function POST(request: NextRequest) {
  try {
    const userId = await requireGameUserId();
    await enforceRateLimit("gacha", getRequestKey(request, userId));
    const body = gachaSchema.parse(await request.json());
    return ok(performGacha(userId, body.pulls));
  } catch (error) {
    return fail(error);
  }
}

