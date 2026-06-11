/**
 * Pure decision for the loading screen, extracted so the recovery behavior
 * (fix-20) is unit-testable without rendering the client component.
 *
 * A session with status "partial" (1 of 3 images failed after retries) is a
 * completed-enough result: the results page already renders it and keeps
 * refreshing via RefreshClient. Treat it like "ready" so the user is never
 * stuck at ~75%. After `timeoutMs` with no terminal state, surface the
 * recovery block instead of polling forever.
 */
export type LoadingAction = "redirect" | "recover" | "failed" | "wait";

export function nextLoadingAction(params: {
  status: string;
  imageCount: number;
  elapsedMs: number;
  timeoutMs: number;
}): LoadingAction {
  const { status, imageCount, elapsedMs, timeoutMs } = params;

  if (status === "ready" || status === "partial" || imageCount >= 3) {
    return "redirect";
  }
  if (status === "failed") return "failed";
  if (elapsedMs >= timeoutMs) return "recover";
  return "wait";
}

/** Max time on the loading screen before offering the recovery block (4 min). */
export const LOADING_TIMEOUT_MS = 240_000;
