import type { NextRequest } from "next/server";
import { z } from "zod";
import { fail, getRequestKey, ok, requireGameUserId } from "@/lib/api";
import { purchaseItem } from "@/lib/game/store";
import { enforceRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const purchaseSchema = z.object({
  itemCode: z.string().min(1).max(64),
});

export async function POST(request: NextRequest) {
  try {
    const userId = await requireGameUserId();
    await enforceRateLimit("item", getRequestKey(request, userId));
    const body = purchaseSchema.parse(await request.json());
    return ok(purchaseItem(userId, body.itemCode));
  } catch (error) {
    return fail(error);
  }
}

