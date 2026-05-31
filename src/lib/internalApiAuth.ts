import { secureCompare } from "@/lib/crypto";

function bearerToken(request: Request): string | null {
  return request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || null;
}

export function hasInternalApiKey(request: Request): boolean {
  const workerToken = process.env.AI_WORKER_TOKEN;
  const cronKey = process.env.CRON_API_KEY;
  const provided = [
    request.headers.get("x-worker-token"),
    request.headers.get("x-api-key"),
    request.headers.get("x-cron-key"),
    bearerToken(request),
  ];

  return provided.some((candidate) =>
    (workerToken ? secureCompare(candidate, workerToken) : false) ||
    (cronKey ? secureCompare(candidate, cronKey) : false)
  );
}

export function getInternalApiHeaders(): Record<string, string> | null {
  if (process.env.AI_WORKER_TOKEN) {
    return { "x-worker-token": process.env.AI_WORKER_TOKEN };
  }
  if (process.env.CRON_API_KEY) {
    return { "x-api-key": process.env.CRON_API_KEY };
  }
  return null;
}
