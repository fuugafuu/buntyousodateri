import type { NextRequest } from "next/server";
import { z } from "zod";
import { fail, getRequestKey, ok, requireGameUserId } from "@/lib/api";
import { applyCare } from "@/lib/game/store";
import { enforceRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const careSchema = z.object({
  action: z.enum(["feed", "water", "rest", "pet"]),
});

export async function POST(request: NextRequest) {
  try {
    const userId = await requireGameUserId();
    await enforceRateLimit("care", getRequestKey(request, userId));
    const body = careSchema.parse(await request.json());
    return ok(applyCare(userId, body.action));
  } catch (error) {
    return fail(error);
  }
}

