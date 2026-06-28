import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { ApiError } from "@/lib/api";

type PolicyName = "state" | "care" | "gacha" | "item" | "battleJoin" | "battleTap";

const policies: Record<PolicyName, { limit: number; window: `${number} ${"s" | "m"}` }> = {
  state: { limit: 90, window: "60 s" },
  care: { limit: 30, window: "60 s" },
  gacha: { limit: 12, window: "60 s" },
  item: { limit: 24, window: "60 s" },
  battleJoin: { limit: 8, window: "60 s" },
  battleTap: { limit: 90, window: "60 s" },
};

let redis: Redis | null = null;
const upstashLimiters = new Map<PolicyName, Ratelimit>();
const memoryBuckets = new Map<string, { count: number; resetAt: number }>();

function hasUpstashConfig() {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

function getRedis() {
  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }

  return redis;
}

function getUpstashLimiter(policy: PolicyName) {
  const existing = upstashLimiters.get(policy);
  if (existing) {
    return existing;
  }

  const spec = policies[policy];
  const limiter = new Ratelimit({
    redis: getRedis(),
    limiter: Ratelimit.slidingWindow(spec.limit, spec.window),
    analytics: true,
    prefix: `buncho:${policy}`,
  });

  upstashLimiters.set(policy, limiter);
  return limiter;
}

function windowToMs(window: `${number} ${"s" | "m"}`) {
  const [amount, unit] = window.split(" ");
  return Number(amount) * (unit === "m" ? 60_000 : 1_000);
}

function takeMemoryToken(policy: PolicyName, key: string) {
  const spec = policies[policy];
  const bucketKey = `${policy}:${key}`;
  const now = Date.now();
  const bucket = memoryBuckets.get(bucketKey);

  if (!bucket || bucket.resetAt <= now) {
    memoryBuckets.set(bucketKey, { count: 1, resetAt: now + windowToMs(spec.window) });
    return true;
  }

  if (bucket.count >= spec.limit) {
    return false;
  }

  bucket.count += 1;
  return true;
}

export async function enforceRateLimit(policy: PolicyName, key: string) {
  if (hasUpstashConfig()) {
    const result = await getUpstashLimiter(policy).limit(key);
    if (!result.success) {
      throw new ApiError(429, "アクセスが多すぎます。少し待ってからもう一度試してください。");
    }

    return;
  }

  if (!takeMemoryToken(policy, key)) {
    throw new ApiError(429, "アクセスが多すぎます。少し待ってからもう一度試してください。");
  }
}

