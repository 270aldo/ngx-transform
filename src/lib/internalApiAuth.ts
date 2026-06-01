import { secureCompare } from "@/lib/crypto";

function bearerToken(request: Request): string | null {
  return request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || null;
}

export function hasWorkerApiKey(request: Request): boolean {
  const workerToken = process.env.AI_WORKER_TOKEN;
  if (!workerToken) return false;
  const provided = [
    request.headers.get("x-worker-token"),
    bearerToken(request),
  ];

  return provided.some((candidate) => secureCompare(candidate, workerToken));
}

export function hasCronApiKey(request: Request): boolean {
  const cronKey = process.env.CRON_API_KEY;
  if (!cronKey) return false;
  const provided = [
    request.headers.get("x-api-key"),
    request.headers.get("x-cron-key"),
  ];

  return provided.some((candidate) => secureCompare(candidate, cronKey));
}

export function hasInternalApiKey(request: Request): boolean {
  return hasWorkerApiKey(request) || hasCronApiKey(request);
}

export function getInternalApiHeaders(): Record<string, string> | null {
  if (process.env.AI_WORKER_TOKEN) {
    return { "x-worker-token": process.env.AI_WORKER_TOKEN };
  }
  return null;
}
