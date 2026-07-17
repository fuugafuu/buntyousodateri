import "server-only";

import type { GameState } from "@/lib/game/types";
import { getGameState, importGameState } from "@/lib/game/store";
import { getSupabaseServiceClient, hasSupabaseConfig } from "@/lib/supabase/server";

export async function prepareGameState(userId: string) {
  if (!hasSupabaseConfig()) {
    return getGameState(userId);
  }

  const client = getSupabaseServiceClient();
  const { data, error } = await client
    .from("game_saves")
    .select("state")
    .eq("user_key", userId)
    .maybeSingle();

  if (error) {
    throw new Error(`クラウド保存の読み込みに失敗しました: ${error.message}`);
  }

  if (data?.state) {
    return importGameState(userId, data.state as GameState);
  }

  const initial = getGameState(userId);
  await persistGameState(userId, initial);
  return initial;
}

export async function persistGameState(userId: string, state = getGameState(userId)) {
  if (!hasSupabaseConfig()) {
    return state;
  }

  const { error } = await getSupabaseServiceClient()
    .from("game_saves")
    .upsert({ user_key: userId, state, updated_at: new Date().toISOString() }, { onConflict: "user_key" });

  if (error) {
    throw new Error(`クラウド保存に失敗しました: ${error.message}`);
  }

  return state;
}
