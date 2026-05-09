export async function sendN8NWebhook(
  event: string,
  payload: Record<string, unknown>
): Promise<void> {
  const baseUrl = process.env.N8N_WEBHOOK_BASE_URL;
  const legacyUrl = process.env.N8N_WEBHOOK_URL;
  const target = baseUrl ? `${baseUrl.replace(/\/$/, "")}/${event}` : legacyUrl;

  if (!target) {
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(target, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        ...payload,
        event,
        timestamp: new Date().toISOString(),
      }),
    });
    if (!res.ok) {
      console.warn(`[N8N] webhook returned ${res.status}: ${event}`);
    }
  } catch (error) {
    console.error(`[N8N] webhook failed: ${event}`, error);
  } finally {
    clearTimeout(timeout);
  }
}
