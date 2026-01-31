/**
 * Health Check Endpoint
 *
 * Provides health status for all critical services.
 * Use for monitoring, alerting, and deployment validation.
 *
 * GET /api/health - Returns health status of all services
 * GET /api/health?service=firebase - Check specific service
 */

import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebaseAdmin";
import { getSpendStats } from "@/lib/spendLimiter";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// ============================================================================
// Types
// ============================================================================

interface ServiceHealth {
  status: "healthy" | "degraded" | "unhealthy";
  latency_ms?: number;
  message?: string;
  details?: Record<string, unknown>;
}

interface HealthResponse {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  version: string;
  environment: string;
  services: {
    firebase: ServiceHealth;
    redis: ServiceHealth;
    gemini: ServiceHealth;
  };
  spend?: {
    daily: { spend: number; limit: number; remaining: number };
    hourly: { spend: number; limit: number; remaining: number };
  };
}

// ============================================================================
// Health Check Functions
// ============================================================================

async function checkFirebase(): Promise<ServiceHealth> {
  const start = Date.now();
  try {
    const db = getDb();
    // Simple read to verify connection
    const testRef = db.collection("_health_check").doc("ping");
    await testRef.set({ timestamp: new Date().toISOString() }, { merge: true });
    const doc = await testRef.get();

    if (!doc.exists) {
      return {
        status: "degraded",
        latency_ms: Date.now() - start,
        message: "Write succeeded but read returned empty",
      };
    }

    return {
      status: "healthy",
      latency_ms: Date.now() - start,
    };
  } catch (error) {
    return {
      status: "unhealthy",
      latency_ms: Date.now() - start,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function checkRedis(): Promise<ServiceHealth> {
  const start = Date.now();

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return {
      status: "unhealthy",
      message: "Redis credentials not configured",
    };
  }

  try {
    // Simple PING command via REST API
    const response = await fetch(`${url}/ping`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return {
        status: "unhealthy",
        latency_ms: Date.now() - start,
        message: `Redis returned ${response.status}`,
      };
    }

    const data = await response.json();
    
    if (data.result !== "PONG") {
      return {
        status: "degraded",
        latency_ms: Date.now() - start,
        message: `Unexpected response: ${JSON.stringify(data)}`,
      };
    }

    return {
      status: "healthy",
      latency_ms: Date.now() - start,
    };
  } catch (error) {
    return {
      status: "unhealthy",
      latency_ms: Date.now() - start,
      message: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

async function checkGemini(): Promise<ServiceHealth> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return {
      status: "unhealthy",
      message: "GEMINI_API_KEY not configured",
    };
  }

  // Don't actually call Gemini API (costs money)
  // Just verify the key format and check spend limits
  try {
    const spendStats = await getSpendStats();

    const dailyUtilization = (spendStats.daily.spend / spendStats.daily.limit) * 100;
    const hourlyUtilization = (spendStats.hourly.spend / spendStats.hourly.limit) * 100;

    // Warn if approaching limits
    if (spendStats.daily.spend < 0 || spendStats.hourly.spend < 0) {
      return {
        status: "degraded",
        message: "Spend stats unavailable",
      };
    }

    if (dailyUtilization > 90 || hourlyUtilization > 90) {
      return {
        status: "degraded",
        message: "Approaching spend limits",
        details: {
          dailyUtilization: `${dailyUtilization.toFixed(1)}%`,
          hourlyUtilization: `${hourlyUtilization.toFixed(1)}%`,
        },
      };
    }

    return {
      status: "healthy",
      message: "API key configured",
      details: {
        dailySpend: `$${spendStats.daily.spend.toFixed(2)}`,
        dailyRemaining: `$${spendStats.daily.remaining.toFixed(2)}`,
      },
    };
  } catch (error) {
    return {
      status: "degraded",
      message: "Could not check spend stats",
    };
  }
}

// ============================================================================
// Route Handler
// ============================================================================

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const service = searchParams.get("service");

  // Check specific service if requested
  if (service) {
    let health: ServiceHealth;

    switch (service.toLowerCase()) {
      case "firebase":
        health = await checkFirebase();
        break;
      case "redis":
        health = await checkRedis();
        break;
      case "gemini":
        health = await checkGemini();
        break;
      default:
        return NextResponse.json({ error: `Unknown service: ${service}` }, { status: 400 });
    }

    return NextResponse.json({
      service,
      ...health,
      timestamp: new Date().toISOString(),
    });
  }

  // Check all services
  const [firebase, redis, gemini] = await Promise.all([
    checkFirebase(),
    checkRedis(),
    checkGemini(),
  ]);

  // Determine overall status
  const statuses = [firebase.status, redis.status, gemini.status];
  let overallStatus: "healthy" | "degraded" | "unhealthy" = "healthy";

  if (statuses.includes("unhealthy")) {
    overallStatus = "unhealthy";
  } else if (statuses.includes("degraded")) {
    overallStatus = "degraded";
  }

  // Get spend stats for response
  let spend;
  try {
    const stats = await getSpendStats();
    spend = {
      daily: {
        spend: stats.daily.spend,
        limit: stats.daily.limit,
        remaining: stats.daily.remaining,
      },
      hourly: {
        spend: stats.hourly.spend,
        limit: stats.hourly.limit,
        remaining: stats.hourly.remaining,
      },
    };
  } catch {
    // Spend stats are optional
  }

  const response: HealthResponse = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "unknown",
    environment: process.env.NODE_ENV || "development",
    services: {
      firebase,
      redis,
      gemini,
    },
    spend,
  };

  // Return appropriate status code
  const statusCode = overallStatus === "healthy" ? 200 : overallStatus === "degraded" ? 207 : 503;

  return NextResponse.json(response, { status: statusCode });
}
