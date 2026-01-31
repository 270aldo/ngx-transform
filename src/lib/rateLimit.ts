/**
 * Rate Limiting with Upstash Redis
 *
 * Provides distributed rate limiting that works across serverless instances.
 * Falls back to allowing requests if Redis is not configured (dev mode).
 */

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Lazy initialization to avoid errors when env vars are not set
let redis: Redis | null = null;
let rateLimiters: Map<string, Ratelimit> | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.warn("[RateLimit] UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not set");
    return null;
  }

  redis = new Redis({ url, token });
  return redis;
}

function getRateLimiters(): Map<string, Ratelimit> | null {
  if (rateLimiters) return rateLimiters;

  const redisClient = getRedis();
  if (!redisClient) return null;

  rateLimiters = new Map();

  // API endpoint rate limits
  rateLimiters.set("api:sessions", new Ratelimit({
    redis: redisClient,
    limiter: Ratelimit.slidingWindow(3, "1 d"), // 3 sessions per IP per day
    prefix: "rl:sessions",
  }));

  rateLimiters.set("api:email", new Ratelimit({
    redis: redisClient,
    limiter: Ratelimit.slidingWindow(5, "1 h"), // 5 emails per hour
    prefix: "rl:email",
  }));

  rateLimiters.set("api:remarketing", new Ratelimit({
    redis: redisClient,
    limiter: Ratelimit.slidingWindow(3, "1 m"), // 3 requests per minute
    prefix: "rl:remarketing",
  }));

  rateLimiters.set("api:generate-plan", new Ratelimit({
    redis: redisClient,
    limiter: Ratelimit.slidingWindow(5, "1 h"), // 5 plan generations per hour
    prefix: "rl:plan",
  }));

  rateLimiters.set("api:plan", new Ratelimit({
    redis: redisClient,
    limiter: Ratelimit.slidingWindow(5, "1 h"), // 5 plan generations per hour
    prefix: "rl:plan-api",
  }));

  rateLimiters.set("api:analyze", new Ratelimit({
    redis: redisClient,
    limiter: Ratelimit.slidingWindow(10, "1 h"), // 10 analyses per hour
    prefix: "rl:analyze",
  }));

  rateLimiters.set("api:generate-images", new Ratelimit({
    redis: redisClient,
    limiter: Ratelimit.slidingWindow(5, "1 h"), // 5 image generations per hour
    prefix: "rl:images",
  }));

  rateLimiters.set("api:genesis-demo", new Ratelimit({
    redis: redisClient,
    limiter: Ratelimit.slidingWindow(10, "1 m"), // 10 demo requests per minute
    prefix: "rl:genesis-demo",
  }));

  // General API rate limit (fallback)
  rateLimiters.set("api:general", new Ratelimit({
    redis: redisClient,
    limiter: Ratelimit.slidingWindow(60, "1 m"), // 60 requests per minute
    prefix: "rl:general",
  }));

  return rateLimiters;
}

// In-memory fallback rate limiter for when Redis is unavailable
const inMemoryStore = new Map<string, { count: number; resetAt: number }>();
let lastPruneAt = 0;
const IN_MEMORY_LIMITS: Record<string, { max: number; windowMs: number }> = {
  "api:sessions": { max: 3, windowMs: 86400000 },    // 3/day
  "api:email": { max: 5, windowMs: 3600000 },         // 5/hour
  "api:analyze": { max: 10, windowMs: 3600000 },      // 10/hour
  "api:generate-images": { max: 5, windowMs: 3600000 },// 5/hour
  "api:generate-plan": { max: 5, windowMs: 3600000 },  // 5/hour
  "api:plan": { max: 5, windowMs: 3600000 },           // 5/hour
  "api:genesis-demo": { max: 10, windowMs: 60000 },    // 10/min
  "api:general": { max: 60, windowMs: 60000 },        // 60/min
};

const CRITICAL_ENDPOINTS = new Set([
  "api:analyze",
  "api:generate-images",
  "api:plan",
  "api:generate-plan",
]);

function allowFallbackInProd(endpoint: string): boolean {
  if (process.env.ALLOW_RATE_LIMIT_FALLBACK === "true") {
    return true;
  }
  return !CRITICAL_ENDPOINTS.has(endpoint);
}

function pruneInMemoryStore(now: number) {
  if (now - lastPruneAt < 60000 && inMemoryStore.size < 5000) return;
  lastPruneAt = now;
  let scanned = 0;
  for (const [key, entry] of inMemoryStore) {
    if (now >= entry.resetAt) {
      inMemoryStore.delete(key);
    }
    if (++scanned >= 1000) break;
  }
}

function checkInMemoryRateLimit(endpoint: string, identifier: string): RateLimitResult {
  const config = IN_MEMORY_LIMITS[endpoint] || IN_MEMORY_LIMITS["api:general"];
  const key = `${endpoint}:${identifier}`;
  const now = Date.now();
  pruneInMemoryStore(now);
  const entry = inMemoryStore.get(key);

  if (!entry || now >= entry.resetAt) {
    inMemoryStore.set(key, { count: 1, resetAt: now + config.windowMs });
    return { success: true, limit: config.max, remaining: config.max - 1, reset: now + config.windowMs };
  }

  entry.count++;
  const remaining = Math.max(0, config.max - entry.count);
  return {
    success: entry.count <= config.max,
    limit: config.max,
    remaining,
    reset: entry.resetAt,
  };
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Check rate limit for a specific endpoint and identifier
 *
 * @param endpoint - The endpoint name (e.g., "api:sessions", "api:email")
 * @param identifier - Unique identifier (IP, email, userId, etc.)
 * @returns RateLimitResult with success status and headers info
 */
export async function checkRateLimit(
  endpoint: string,
  identifier: string
): Promise<RateLimitResult> {
  const limiters = getRateLimiters();

  // If Redis is not configured, use in-memory fallback
  if (!limiters) {
    if (process.env.NODE_ENV === "production") {
      if (!allowFallbackInProd(endpoint)) {
        console.error(`[RateLimit] CRITICAL: Redis not configured in production! Blocking ${endpoint}.`);
        return {
          success: false,
          limit: 0,
          remaining: 0,
          reset: Date.now() + 60000,
        };
      }
      console.error("[RateLimit] CRITICAL: Redis not configured in production! Using in-memory fallback.");
      return checkInMemoryRateLimit(endpoint, identifier);
    }
    // Dev mode: allow all requests
    console.warn("[RateLimit] Redis not configured - allowing request (dev mode)");
    return {
      success: true,
      limit: 999,
      remaining: 999,
      reset: Date.now() + 60000,
    };
  }

  // Get specific limiter or fall back to general
  const limiter = limiters.get(endpoint) || limiters.get("api:general")!;

  try {
    const result = await limiter.limit(identifier);

    return {
      success: result.success,
      limit: result.limit,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (error) {
    console.error("[RateLimit] Redis runtime error:", error);
    if (process.env.NODE_ENV === "production") {
      if (!allowFallbackInProd(endpoint)) {
        return {
          success: false,
          limit: 0,
          remaining: 0,
          reset: Date.now() + 60000,
        };
      }
      return checkInMemoryRateLimit(endpoint, identifier);
    }
    // Dev mode: allow request
    return {
      success: true,
      limit: 999,
      remaining: 999,
      reset: Date.now() + 60000,
    };
  }
}

/**
 * Get rate limit headers for response
 */
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": String(result.remaining),
    "X-RateLimit-Reset": String(result.reset),
  };
}

/**
 * Extract client IP from request
 */
export function getClientIP(request: Request): string {
  // Check common headers for real IP (behind proxies/load balancers)
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    // Take the first IP in the chain
    return forwardedFor.split(",")[0].trim();
  }

  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  // Vercel-specific header
  const vercelIP = request.headers.get("x-vercel-forwarded-for");
  if (vercelIP) {
    return vercelIP.split(",")[0].trim();
  }

  return "unknown";
}
